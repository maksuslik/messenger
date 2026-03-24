package me.maksuslik.entity

import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.util.*

@Table(name = "users")
@Entity(name = "users")
data class UserData(
    var login: String,
    var authToken: String, // TODO: to redis

    @Id
    var id: UUID? = UUID.randomUUID(),
) {
    constructor(): this("", "", UUID.randomUUID())
}
