package me.maksuslik.repository

import me.maksuslik.entity.Message
import org.springframework.data.repository.CrudRepository
import java.util.UUID

interface MessageRepo : CrudRepository<Message, UUID> {
}