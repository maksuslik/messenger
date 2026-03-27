package me.maksuslik.exception

class StatusCodeException(
    val statusCode: Int,
    val reason: String
) : RuntimeException(
    "$statusCode $reason"
) {
    fun toMap(): Map<String, Any> {
        return mapOf(
            "status" to "error",
            "message" to reason
        )
    }
}