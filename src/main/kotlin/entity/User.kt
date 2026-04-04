package me.maksuslik.entity

import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.util.*

@Table(name = "users")
@Entity(name = "users")
data class User(
    var login: String,
    var userId: String,
    var authToken: String, // TODO: to redis
    var password: String? = null,
    var avatar: String? = null,
    var findById: Boolean = true,
    @Id
    var id: UUID = UUID.randomUUID(),
) {
    constructor(): this("", "", "", null, null, true, UUID.randomUUID())

    fun toMap(): Map<String, Any?> {
        return mapOf<String, Any?>(
            "id" to userId.toString(),
            "username" to login,
            "avatar" to avatar,
            "token" to authToken,
            "findById" to findById,
            "isTemporary" to (password == null)
        )
    }
}
