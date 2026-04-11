package me.maksuslik.data

import com.fasterxml.jackson.annotation.JsonProperty

data class RequestWithId(
    @JsonProperty("id")
    val id: String
)