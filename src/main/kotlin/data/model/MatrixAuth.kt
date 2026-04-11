package me.maksuslik.data.model

data class MatrixAuth(
    val userId: String,
    val accessToken: String,
    val deviceId: String
)