package me.maksuslik.entity

import jakarta.persistence.CascadeType
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Table(name = "chats")
@Entity(name = "chats")
data class Chat(
    val title: String? = null,
    val members: Int,
    val lastMessage: String? = null,
    val lastMessageAt: Instant? = null,

    @Enumerated(EnumType.STRING)
    val type: ChatType,

    @OneToMany(mappedBy = "chat", cascade = [CascadeType.PERSIST, CascadeType.MERGE], orphanRemoval = true)
    val messages: MutableList<Message> = mutableListOf(),

    @OneToMany(mappedBy = "chat", cascade = [CascadeType.ALL], orphanRemoval = true)
    val participants: MutableList<ChatParticipant> = mutableListOf(),

    @Id
    val id: UUID? = UUID.randomUUID(),
) {
    constructor(): this(null, 0, null, null, ChatType.DM, mutableListOf(), mutableListOf(), UUID.randomUUID())
}
