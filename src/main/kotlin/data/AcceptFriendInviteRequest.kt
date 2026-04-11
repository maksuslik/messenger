package me.maksuslik.data

import com.fasterxml.jackson.annotation.JsonProperty

data class AcceptFriendInviteRequest(
    @JsonProperty("token")
    val token: String,

    @JsonProperty("matrixChatId")
    val matrixChatId: String
)