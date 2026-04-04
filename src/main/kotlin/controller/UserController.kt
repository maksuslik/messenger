package me.maksuslik.controller

import me.maksuslik.data.ProfileUpdateRequest
import me.maksuslik.exception.StatusCodeException
import me.maksuslik.repository.UserRepo
import me.maksuslik.service.AuthService
import me.maksuslik.util.Message
import me.maksuslik.util.Validator
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/profile")
class UserController(val authService: AuthService, val userRepo: UserRepo) {
    @PatchMapping
    fun updateProfile(@RequestHeader("Authorization") token: String, @RequestBody request: ProfileUpdateRequest): ResponseEntity<Any> {
        val user = authService.getByTokenOrThrow(token)

        user.apply {
            /*if (userRepo.findAll().any { it.login == request.username && it.authToken != user.authToken })
                throw StatusCodeException(409, Message.LOGIN_EXISTS)*/

            if(!Validator.isValidLogin(request.username))
                return ResponseEntity.status(401).body(mapOf("message" to Message.INCORRECT_LOGIN))

            login = request.username

            if (userRepo.findAll().any { it.userId == request.id && it.authToken != user.authToken })
                return ResponseEntity.status(409).body(mapOf("message" to Message.LOGIN_EXISTS))

            if(!Validator.isValidLogin(request.id))
                return ResponseEntity.status(401).body(mapOf("message" to Message.INCORRECT_ID))

            userId = request.id
            findById = request.findById
        }

        userRepo.save(user)

        return ResponseEntity.ok(user.toMap())
    }

    @DeleteMapping
    fun deleteProfile(@RequestHeader("Authorization") token: String) {
        val user = authService.getByTokenOrThrow(token)
        userRepo.delete(user)
    }
}