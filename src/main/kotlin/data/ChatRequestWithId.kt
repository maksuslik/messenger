package me.maksuslik.data

import com.fasterxml.jackson.annotation.JsonProperty

data class ChatRequestWithId(
    @JsonProperty("id")
    val id: String
)