package me.maksuslik.repository

import me.maksuslik.entity.UserData
import org.springframework.data.repository.CrudRepository
import java.util.*

//@Repository
interface UserRepo : CrudRepository<UserData, UUID> {
    fun findByAuthToken(token: String): Optional<UserData>
}