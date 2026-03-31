package me.maksuslik.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.Index
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "messages", indexes = [
    Index(name = "idx_messages_chat_created", columnList = "chat_id, created_at DESC")
])
data class Message(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", nullable = false)
    val chat: Chat?,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User?,

    @Column(nullable = false, columnDefinition = "TEXT")
    val content: String,

    val isDeleted: Boolean = false,
    val isEdited: Boolean = false,

    val createdAt: Instant = Instant.now(),
    val editedAt: Instant? = null,

    @Id
    val id: UUID? = UUID.randomUUID()
) {
    constructor(): this(null, null, "", false, false, Instant.now(), null, UUID.randomUUID())

    fun toMap(): Map<String, Any> {
        return mapOf(
            "id" to id.toString(),
            "chatId" to chat?.id.toString(),
            "userId" to user?.id.toString(),
            "username" to user!!.login,
            "content" to content,
            "timestamp" to createdAt.toString()
        )
    }
}
