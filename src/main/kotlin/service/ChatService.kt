package me.maksuslik.service

import me.maksuslik.data.CreateChatRequest
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
    fun createChat(request: CreateChatRequest, type: ChatType, vararg members: User): Map<String, String> {
        val chatId = UUID.randomUUID()

        val chat = Chat(
            request.name,
            members.size,
            null,
            null,
            type,
            mutableListOf(),
            mutableListOf(),
            request.matrixRoomId,
            chatId
        )

        val role = if(type == ChatType.DM) ParticipantRole.MEMBER else ParticipantRole.OWNER
        members.forEach { user ->
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
            "title" to request.name,
            "members" to members.size.toString(),
            "type" to type.toString(),
            "role" to role.toString(),
            "matrixChatId" to request.matrixRoomId
        )
    }

    fun getChatForUser(user: User, chat: Chat): Map<String, String?> {
        val chatTitle = if(chat.type == ChatType.DM) chat.participants.find { it.id.userId != user.id }?.user?.login ?: "" else chat.title ?: ""
        return mapOf(
            "id" to chat.id.toString(),
            "title" to chatTitle,
            "members" to chat.members.toString(),
            "type" to chat.type.toString(),
            "role" to chat.participants.find { it.id.userId == user.id }?.role?.name,
            "matrixChatId" to chat.matrixChatId
        )
    }
}