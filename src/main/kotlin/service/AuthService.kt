package me.maksuslik.service

import me.maksuslik.data.UserSignInRequest
import me.maksuslik.data.UserSignUpRequest
import me.maksuslik.entity.User
import me.maksuslik.exception.StatusCodeException
import me.maksuslik.repository.UserRepo
import me.maksuslik.util.Message
import me.maksuslik.util.Validator
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import java.util.*

@Service
class AuthService(val userRepo: UserRepo) {
    fun initSession(): User {
        val uuid = UUID.randomUUID().toString().substring(0, 8)
        val login = "id$uuid"

        val token = UUID.randomUUID().toString()

        val user = User(login, login, token)
        return userRepo.save<User>(user)
    }

    fun signUp(body: UserSignUpRequest): ResponseEntity<Any> {
        if(!Validator.isValidLogin(body.username))
            return ResponseEntity.status(401).body(mapOf("message" to Message.INCORRECT_LOGIN))

        if(!Validator.isValidPassword(body.password))
            return ResponseEntity.status(401).body(mapOf("message" to Message.INCORRECT_PASSWORD))

        if(userRepo.findAll().any { it.login == body.username })
            return ResponseEntity.status(409).body(mapOf("message" to Message.LOGIN_EXISTS))

        Validator.validateRequest(body.username.length !in 1..50)

        val user = User(body.username, body.username, UUID.randomUUID().toString(), body.password)
        userRepo.save(user)

        return ResponseEntity.ok(user.toMap())
    }

    fun signIn(body: UserSignInRequest): ResponseEntity<Any> {
        val user = userRepo.findByUserId(body.username)
            .orElseThrow { StatusCodeException(401, Message.INCORRECT_DATA) }

        // TODO: сравнивать хеш
        if(user.password != body.password)
            return ResponseEntity.status(401).body(mapOf("message" to Message.INCORRECT_DATA))

        return ResponseEntity.ok(mapOf("token" to user.authToken))
    }

    fun validateToken(token: String): User? {
        return userRepo.findByAuthToken(token).orElse(null)
    }

    fun getByTokenOrThrow(token: String): User {
        return userRepo.findByAuthToken(token)
            .orElseThrow { StatusCodeException(401, Message.UNAUTHORIZED) }
    }
}