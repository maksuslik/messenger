package me.maksuslik.entity

import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.util.*

@Table(name = "users")
@Entity(name = "users")
data class User(
    var login: String,
    var authToken: String, // TODO: to redis
    var password: String? = null,
    var avatar: String? = null,
    @Id
    var id: UUID = UUID.randomUUID(),
) {
    constructor(): this("", "", null, null, UUID.randomUUID())
}
