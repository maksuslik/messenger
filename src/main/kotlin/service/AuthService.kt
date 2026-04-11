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
class AuthService(val userRepo: UserRepo, val matrixService: MatrixService) {
    fun initSession(): User {
        val uuid = UUID.randomUUID().toString().substring(0, 8)
        val login = "id$uuid"

        val token = UUID.randomUUID().toString()

        val user = User(login, login, token)

        val matrixUser = matrixService.registerInMatrix(login, login)

        user.matrixUserId = matrixUser.userId
        user.matrixAccessToken = matrixUser.accessToken
        user.matrixDeviceId = matrixUser.deviceId

        return userRepo.save(user)
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

        val matrixUser = matrixService.registerInMatrix(body.username, body.password)

        user.matrixUserId = matrixUser.userId
        user.matrixAccessToken = matrixUser.accessToken
        userRepo.save(user)

        return ResponseEntity.ok(user.toMap())
    }

    fun signIn(body: UserSignInRequest): ResponseEntity<Any> {
        val user = userRepo.findByUserId(body.username)
            .orElseThrow { StatusCodeException(401, Message.INCORRECT_DATA) }

        // TODO: сравнивать хеш
        if(user.password != body.password)
            return ResponseEntity.status(401).body(mapOf("message" to Message.INCORRECT_DATA))

        val matrixAuth = matrixService.loginToMatrix(body.username, body.password)
        if(user.matrixAccessToken != matrixAuth.accessToken) {
            user.matrixAccessToken = encrypt(matrixAuth.accessToken)
            userRepo.save(user)
        }

        return ResponseEntity.ok(user.toMap())
    }

    fun validateToken(token: String): User? {
        return userRepo.findByAuthToken(token).orElse(null)
    }

    fun getByTokenOrThrow(token: String): User {
        return userRepo.findByAuthToken(token)
            .orElseThrow { StatusCodeException(401, Message.UNAUTHORIZED) }
    }

    // TODO
    private fun hashPassword(password: String): String {
        return password
    }

    private fun verifyPassword(password: String, hash: String): Boolean {
        return password == hash
    }

    private fun encrypt(value: String): String {
        return value
    }
}