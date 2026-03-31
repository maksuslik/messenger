package me.maksuslik.controller

import me.maksuslik.data.CreateChatRequest
import me.maksuslik.data.MessageSendRequest
import me.maksuslik.entity.Chat
import me.maksuslik.entity.ChatParticipant
import me.maksuslik.entity.ChatParticipantId
import me.maksuslik.entity.ChatType
import me.maksuslik.entity.ParticipantRole
import me.maksuslik.exception.StatusCodeException
import me.maksuslik.repository.ChatRepo
import me.maksuslik.repository.MessageRepo
import me.maksuslik.repository.UserRepo
import me.maksuslik.service.AuthService
import me.maksuslik.service.ChatService
import me.maksuslik.util.Message
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/chats")
class ChatController(val authService: AuthService, val chatRepo: ChatRepo, val messageRepo: MessageRepo, val chatService: ChatService) {
    @GetMapping("/get")
    fun getChats(@RequestHeader("Authorization") token: String): ResponseEntity<List<Map<String, String>>> {
        val user = authService.getByTokenOrThrow(token)

        val chats = chatRepo.findChatsByUserId(user.id)
        val list = chats.filter { it.type == ChatType.GROUP }.map {
            mapOf(
                "id" to it.id.toString(),
                "title" to (it.title ?: ""),
                "members" to it.members.toString(),
                "type" to it.type.toString(),
            )
        }

        println("list: $list")

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
}