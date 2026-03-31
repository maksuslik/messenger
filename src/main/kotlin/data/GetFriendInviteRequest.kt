package me.maksuslik.data

import com.fasterxml.jackson.annotation.JsonProperty

data class GetFriendInviteRequest(
    @JsonProperty("token")
    val token: String
)