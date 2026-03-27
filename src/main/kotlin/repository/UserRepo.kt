package me.maksuslik.repository

import me.maksuslik.entity.User
import org.springframework.data.repository.CrudRepository
import java.util.*

//@Repository
interface UserRepo : CrudRepository<User, UUID> {
    fun findByAuthToken(token: String): Optional<User>

    fun findByLogin(login: String): Optional<User>
}