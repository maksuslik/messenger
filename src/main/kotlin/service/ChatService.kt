package me.maksuslik.service

import me.maksuslik.entity.Chat
import me.maksuslik.entity.ChatParticipant
import me.maksuslik.entity.ChatParticipantId
import me.maksuslik.entity.ChatType
import me.maksuslik.entity.ParticipantRole
import me.maksuslik.entity.User
import me.maksuslik.repository.ChatRepo
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class ChatService(val chatRepo: ChatRepo) {
    fun createChat(name: String, type: ChatType, vararg members: User): Map<String, String> {
        val chatId = UUID.randomUUID()

        val chat = Chat(
            name,
            members.size,
            null,
            null,
            type,
            mutableListOf(),
            mutableListOf(),
            chatId
        )

        members.forEach { user ->
            val role = if(type == ChatType.DM) ParticipantRole.MEMBER else ParticipantRole.OWNER
            val participant = ChatParticipant(
                ChatParticipantId(chatId, user.id),
                chat,
                user,
                role
            )

            chat.participants.add(participant)
        }

        chatRepo.save(chat)

        return mapOf(
            "id" to chatId.toString(),
            "title" to name,
            "members" to members.size.toString()
        )
    }
}