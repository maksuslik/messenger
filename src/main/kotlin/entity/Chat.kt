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
    var title: String? = null,
    var members: Int,
    var lastMessage: String? = null,
    var lastMessageAt: Instant? = null,

    @Enumerated(EnumType.STRING)
    var type: ChatType,

    @OneToMany(mappedBy = "chat", cascade = [CascadeType.PERSIST, CascadeType.MERGE], orphanRemoval = true)
    var messages: MutableList<Message> = mutableListOf(),

    @OneToMany(mappedBy = "chat", cascade = [CascadeType.ALL], orphanRemoval = true)
    var participants: MutableList<ChatParticipant> = mutableListOf(),

    var matrixChatId: String?,

    @Id
    var id: UUID? = UUID.randomUUID(),
) {
    constructor(): this(null, 0, null, null, ChatType.DM, mutableListOf(), mutableListOf(), null, UUID.randomUUID())

    fun toMap(): Map<String, String?> {
        return mapOf(
            "id" to id.toString(),
            "title" to title,
            "type" to type.name,
            "members" to members.toString()
        )
    }
}
