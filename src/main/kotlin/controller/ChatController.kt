package me.maksuslik.controller

import me.maksuslik.data.ChatRequestWithId
import me.maksuslik.data.ChatUpdateRequest
import me.maksuslik.data.CreateChatRequest
import me.maksuslik.data.MessageSendRequest
import me.maksuslik.entity.ChatParticipant
import me.maksuslik.entity.ChatParticipantId
import me.maksuslik.entity.ChatType
import me.maksuslik.entity.ParticipantRole
import me.maksuslik.exception.StatusCodeException
import me.maksuslik.repository.ChatRepo
import me.maksuslik.repository.MessageRepo
import me.maksuslik.service.AuthService
import me.maksuslik.service.ChatService
import me.maksuslik.util.Message
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/chats")
class ChatController(val authService: AuthService, val chatRepo: ChatRepo, val messageRepo: MessageRepo, val chatService: ChatService) {
    @GetMapping("/get")
    fun getChats(@RequestHeader("Authorization") token: String): ResponseEntity<Any> {
        val user = authService.getByTokenOrThrow(token)

        val chats = chatRepo.findChatsByUserId(user.id)
        val list = chats.map {
            println(it.participants.find { it.id.userId == user.id }?.role)
            mapOf(
                "id" to it.id.toString(),
                "title" to (it.title ?: ""),
                "members" to it.members.toString(),
                "type" to it.type.toString(),
                "role" to it.participants.find { it.id.userId == user.id }?.role
            )
        }

        return ResponseEntity.ok(list)
    }

    @PostMapping("/create")
    fun createChat(@RequestHeader("Authorization") token: String, @RequestBody request: CreateChatRequest): ResponseEntity<Map<String, Any>> {
        val user = authService.getByTokenOrThrow(token)
        val chat = chatService.createChat(request.name, ChatType.GROUP, user)

        return ResponseEntity.ok(chat)
    }

    @GetMapping("/{id}/messages")
    fun getMessages(@RequestHeader("Authorization") token: String, @PathVariable id: String): ResponseEntity<Any> {
        val user = authService.getByTokenOrThrow(token)
        val chat = chatRepo.findById(UUID.fromString(id)).orElseThrow { StatusCodeException(404, Message.NOT_FOUND) }

        return ResponseEntity.ok(chat.messages.map { it.toMap() })
    }

    @PostMapping("/{id}/messages")
    fun sendMessage(@RequestHeader("Authorization") token: String, @PathVariable id: String, @RequestBody body: MessageSendRequest): ResponseEntity<Any> {
        val user = authService.getByTokenOrThrow(token)
        val chat = chatRepo.getReferenceById(UUID.fromString(id))

        val message = me.maksuslik.entity.Message(
            chat,
            user,
            body.content,
            false,
            false
        )

        //chat.messages.add(message)
        messageRepo.save(message)

        return ResponseEntity.ok(message.toMap())
    }

    @PostMapping("/invite/get")
    fun getInviteData(@RequestHeader("Authorization") token: String, @RequestBody body: ChatRequestWithId): ResponseEntity<Any> {
        val user = authService.getByTokenOrThrow(token)
        val chat = chatRepo.findById(UUID.fromString(body.id)).orElseThrow { StatusCodeException(404, Message.NOT_FOUND) }

        return ResponseEntity.ok(chat.toMap())
    }

    @PatchMapping("/update")
    fun updateChat(@RequestHeader("Authorization") token: String, @RequestBody body: ChatUpdateRequest): ResponseEntity<Any> {
        val user = authService.getByTokenOrThrow(token)
        val chat = chatRepo.findById(UUID.fromString(body.id)).orElseThrow { StatusCodeException(404, Message.NOT_FOUND) }

        chat.apply {
            title = body.title
        }

        chatRepo.save(chat)

        return ResponseEntity.ok(chat.toMap())
    }

    @PostMapping("/join")
    fun joinChat(@RequestHeader("Authorization") token: String, @RequestBody body: ChatRequestWithId): ResponseEntity<Any> {
        val user = authService.getByTokenOrThrow(token)
        val chat = chatRepo.findById(UUID.fromString(body.id)).orElseThrow { StatusCodeException(404, Message.NOT_FOUND) }

        if(chat.participants.any { it.id.userId == user.id })
            return ResponseEntity.status(409).body("message" to Message.CONFLICT)

        chat.participants.add(ChatParticipant(
            ChatParticipantId(chat.id!!, user.id),
            chat,
            user,
            ParticipantRole.MEMBER
        ))
        chat.members++

        chatRepo.save(chat)

        return ResponseEntity.ok(chat.toMap())
    }

    @PostMapping("/leave")
    fun leaveChat(@RequestHeader("Authorization") token: String, @RequestBody body: ChatRequestWithId): ResponseEntity<Any> {
        val user = authService.getByTokenOrThrow(token)
        val chat = chatRepo.findById(UUID.fromString(body.id)).orElseThrow { StatusCodeException(404, Message.NOT_FOUND) }

        chat.participants.removeIf { it.id.userId == user.id }
        chat.members--

        chatRepo.save(chat)

        return ResponseEntity.ok(chat.toMap())
    }

    @DeleteMapping("/delete")
    fun deleteChat(@RequestHeader("Authorization") token: String, @RequestBody body: ChatRequestWithId) {
        val user = authService.getByTokenOrThrow(token)
        val chat = chatRepo.findById(UUID.fromString(body.id)).orElseThrow { StatusCodeException(404, Message.NOT_FOUND) }
        chatRepo.delete(chat)
    }
}