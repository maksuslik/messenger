package me.maksuslik.service

import me.maksuslik.entity.UserData
import me.maksuslik.repository.UserRepo
import org.springframework.stereotype.Service
import java.util.*

@Service
class AuthService(val userRepo: UserRepo) {
    fun initSession(): UserData {
        val uuid = UUID.randomUUID().toString().substring(0, 8)
        val login = "@id$uuid"

        val token = UUID.randomUUID().toString()

        val user = UserData(login, token)
        return userRepo.save<UserData>(user)
    }

    fun validateToken(token: String): UserData? {
        return userRepo.findByAuthToken(token).orElse(null)
    }
}