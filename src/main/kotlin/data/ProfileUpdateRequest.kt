package me.maksuslik.data

data class ProfileUpdateRequest(
    val id: String,
    val username: String,
    val findById: Boolean
)