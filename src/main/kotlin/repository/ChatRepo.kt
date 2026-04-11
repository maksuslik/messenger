package me.maksuslik.repository

import me.maksuslik.entity.Chat
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import org.springframework.data.repository.query.Param
import java.util.Optional
import java.util.UUID

interface ChatRepo : JpaRepository<Chat, UUID> {
    @Query("""
        SELECT c FROM chats c
        JOIN ChatParticipant cp ON c.id = cp.id.chatId
        WHERE cp.id.userId = :userId
        ORDER BY c.lastMessageAt DESC NULLS LAST
    """)
    fun findChatsByUserId(@Param("userId") userId: UUID): List<Chat>

    fun findByMatrixChatId(id: String): Optional<Chat>
}