package me.maksuslik.service

import me.maksuslik.data.UserSignInRequest
import me.maksuslik.data.UserSignUpRequest
import me.maksuslik.entity.User
import me.maksuslik.exception.StatusCodeException
import me.maksuslik.repository.UserRepo
import me.maksuslik.util.Message
import me.maksuslik.util.Validator
import org.springframework.stereotype.Service
import java.util.*

@Service
class AuthService(val userRepo: UserRepo) {
    fun initSession(): User {
        val uuid = UUID.randomUUID().toString().substring(0, 8)
        val login = "@id$uuid"

        val token = UUID.randomUUID().toString()

        val user = User(login, token)
        return userRepo.save<User>(user)
    }

    fun signUp(body: UserSignUpRequest): User {
        if(!Validator.isValidPassword(body.password))
            throw StatusCodeException(401, Message.INCORRECT_DATA)

        if(userRepo.findAll().any { it.login == body.username })
            throw StatusCodeException(409, Message.LOGIN_EXISTS)

        Validator.validateRequest(body.username.length !in 1..50)

        val user = User(body.username, UUID.randomUUID().toString(), body.password)
        return userRepo.save<User>(user)
    }

    fun signIn(body: UserSignInRequest): Any {
        val user = userRepo.findByLogin(body.username)
            .orElseThrow { StatusCodeException(401, Message.INCORRECT_DATA) }

        // TODO: сравнивать хеш
        if(user.password != body.password)
            throw StatusCodeException(401, Message.INCORRECT_DATA)

        return mapOf("token" to UUID.randomUUID().toString())
    }

    fun validateToken(token: String): User? {
        return userRepo.findByAuthToken(token).orElse(null)
    }

    fun getByTokenOrThrow(token: String): User {
        return userRepo.findByAuthToken(token)
            .orElseThrow { StatusCodeException(401, Message.UNAUTHORIZED) }
    }
}