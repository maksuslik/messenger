package me.maksuslik.data

import com.fasterxml.jackson.annotation.JsonProperty

data class CreateChatRequest(
    @JsonProperty("name")
    val name: String
)
