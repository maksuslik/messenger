package me.maksuslik.entity

import jakarta.persistence.Column
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
@Table(name = "friendship")
data class Friendship(
    @EmbeddedId
    val id: FriendshipId?,

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    val user: User?,

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("friendId")
    @JoinColumn(name = "friend_id")
    val friend: User?,

    val chatId: UUID?,

    @Enumerated(EnumType.STRING)
    val status: FriendshipStatus
) {
    constructor(): this(null, null, null, null, FriendshipStatus.PENDING)

    fun toMap(): Map<String, String?> {
        return mapOf(
            "userId" to id?.userId.toString(),
            "friendId" to id?.friendId.toString(),
            "status" to status.toString()
        )
    }
}

data class FriendshipId(
    @Column(name = "user_id")
    val userId: UUID,

    @Column(name = "friend_id")
    val friendId: UUID,
) : Serializable {
    constructor(): this(UUID.randomUUID(), UUID.randomUUID())
}

enum class FriendshipStatus {
    PENDING, ACCEPTED, DECLINED
}
