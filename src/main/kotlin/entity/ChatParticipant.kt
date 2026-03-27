package me.maksuslik.entity

import jakarta.persistence.Column
import jakarta.persistence.Embeddable
import jakarta.persistence.EmbeddedId
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.MapsId
import jakarta.persistence.Table
import java.io.Serializable
import java.util.UUID

@Entity
@Table(name = "participants")
data class ChatParticipant(
    @EmbeddedId
    val id: ChatParticipantId,

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("chatId")
    @JoinColumn(name = "chat_id")
    val chat: Chat,

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    val user: User,

    @Enumerated(EnumType.STRING)
    val role: ParticipantRole = ParticipantRole.MEMBER
)

@Embeddable
data class ChatParticipantId(
    @Column(name = "chat_id")
    val chatId: UUID = UUID.randomUUID(),

    @Column(name = "user_id")
    val userId: UUID = UUID.randomUUID()
) : Serializable

enum class ParticipantRole {
    OWNER, ADMIN, MEMBER
}