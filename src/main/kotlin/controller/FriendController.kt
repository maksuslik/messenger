package me.maksuslik.controller

import me.maksuslik.data.RequestWithId
import me.maksuslik.data.CreateChatRequest
import me.maksuslik.data.AcceptFriendInviteRequest
import me.maksuslik.data.GetFriendInviteRequest
import me.maksuslik.entity.ChatType
import me.maksuslik.entity.Friendship
import me.maksuslik.entity.FriendshipId
import me.maksuslik.entity.FriendshipStatus
import me.maksuslik.exception.StatusCodeException
import me.maksuslik.repository.FriendshipRepo
import me.maksuslik.repository.UserRepo
import me.maksuslik.service.AuthService
import me.maksuslik.service.ChatService
import me.maksuslik.util.Message
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/friends")
class FriendController(val authService: AuthService, val userRepo: UserRepo, val friendshipRepo: FriendshipRepo, val chatService: ChatService) {
    @GetMapping
    fun getFriends(@RequestHeader("Authorization") token: String): ResponseEntity<Any> {
        val user = authService.getByTokenOrThrow(token)
        val friends = friendshipRepo.findFriends(user.id)
        val users = friends.map { friendship ->
            val target = if(friendship.user?.id == user.id) friendship.friend else friendship.user
            mapOf(
                "id" to target?.id.toString(),
                "username" to target?.login,
                "avatar" to target?.avatar,
                "chatId" to friendship.chatId
            )
        }

        return ResponseEntity.ok(users)
    }

    @PostMapping("/remove")
    fun removeFriend(@RequestHeader("Authorization") token: String, @RequestBody body: RequestWithId): ResponseEntity<Any> {
        val user = authService.getByTokenOrThrow(token)
        val friendship = friendshipRepo.findByChatId(UUID.fromString(body.id)).orElseThrow { StatusCodeException(404, Message.NOT_FOUND) }

        val target = if(friendship.user?.id == user.id) friendship.friend else friendship.user

        println("${friendship.id?.friendId} ${friendship.id?.userId} ${target?.id}")
        friendshipRepo.delete(friendship)

        return ResponseEntity.ok(mapOf("id" to target?.id.toString()))
    }

    @PostMapping("/invite-url")
    fun getInviteUrl(@RequestHeader("Authorization") token: String): ResponseEntity<Any> {
        val user = authService.getByTokenOrThrow(token)
        val url = "https://msldev.ru/invite/${user.id}"

        return ResponseEntity.ok(mapOf("url" to url))
    }

    @PostMapping("/invite/get")
    fun getInviteData(@RequestHeader("Authorization") token: String, @RequestBody request: GetFriendInviteRequest): ResponseEntity<Any> {
        val user = authService.getByTokenOrThrow(token)
        val friend = userRepo.findById(UUID.fromString(request.token)).orElseThrow { StatusCodeException(404, Message.NOT_FOUND) }

        if(friend.id == user.id || friendshipRepo.findFriends(user.id).any { it.id?.friendId == friend.id || it.id?.userId == friend.id })
            return ResponseEntity.status(409).body("message" to Message.CONFLICT)

        return ResponseEntity.ok(mapOf(
            "userId" to friend.id,
            "username" to friend.login,
            "avatar" to friend.avatar
        ))
    }

    @PostMapping("/accept")
    fun acceptInvite(@RequestHeader("Authorization") token: String, @RequestBody request: AcceptFriendInviteRequest): ResponseEntity<Any> {
        val user = authService.getByTokenOrThrow(token)
        val friend = userRepo.findById(UUID.fromString(request.token)).orElseThrow { StatusCodeException(401, Message.NOT_FOUND) }

        val response = chatService.createChat(CreateChatRequest("DM", request.matrixChatId), ChatType.DM, user, friend)

        val friendship = Friendship(
            FriendshipId(user.id, friend.id),
            user,
            friend,
            UUID.fromString(response["id"]),
            FriendshipStatus.ACCEPTED
        )

        friendshipRepo.save(friendship)

        return ResponseEntity.ok(friendship)
    }
}