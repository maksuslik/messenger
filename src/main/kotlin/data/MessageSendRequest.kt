package me.maksuslik.data

import com.fasterxml.jackson.annotation.JsonProperty

data class MessageSendRequest(
    @JsonProperty("content")
    val content: String
)
