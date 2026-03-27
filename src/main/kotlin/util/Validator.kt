package me.maksuslik.util

import me.maksuslik.exception.StatusCodeException

object Validator {
    val passwordPattern = Regex("""^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,60}$""")

    fun isValidPassword(password: String) = password.matches(passwordPattern) && password.length in 8..50

    fun validateRequest(condition: Boolean) {
        if (condition) throw StatusCodeException(400, Message.RESPONSE_ERROR)
    }
}