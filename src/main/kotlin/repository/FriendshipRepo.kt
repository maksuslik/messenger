package me.maksuslik.repository

import me.maksuslik.entity.Friendship
import me.maksuslik.entity.FriendshipStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.Optional
import java.util.UUID

interface FriendshipRepo : JpaRepository<Friendship, UUID> {
    @Query("""
        SELECT f FROM Friendship f
        WHERE (f.id.userId = :userId OR f.id.friendId = :userId)
        AND f.status = :status
    """)
    fun findFriends(
        @Param("userId") userId: UUID,
        @Param("status") status: FriendshipStatus = FriendshipStatus.ACCEPTED
    ): List<Friendship>

    fun findByChatId(chatId: UUID): Optional<Friendship>
}