package me.maksuslik.controller

import me.maksuslik.exception.StatusCodeException
import me.maksuslik.repository.ChatRepo
import me.maksuslik.repository.MessageRepo
import me.maksuslik.repository.UserRepo
import me.maksuslik.util.Message
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/chats")
class ChatController(val userRepo: UserRepo, val chatRepo: ChatRepo) {
    @GetMapping("/get")
    fun getChats(@RequestHeader("X-Auth-Token") token: String): ResponseEntity<List<Map<String, String>>> {
        val user = userRepo.findByAuthToken(token)
            .orElseThrow { StatusCodeException(401, Message.UNAUTHORIZED) }

        val chats = chatRepo.findChatsByUserId(user.id)
        val list = chats.map {
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
}