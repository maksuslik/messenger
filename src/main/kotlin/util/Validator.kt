package me.maksuslik.util

import me.maksuslik.exception.StatusCodeException

object Validator {
    val loginPattern = Regex("""^[a-zA-Zа-яА-ЯёЁ][a-zA-Zа-яА-ЯёЁ0-9._-]{4,50}$""")
    val passwordPattern = Regex("""^[A-Za-z0-9@$!%*?&]{8,50}$""")

    fun isValidPassword(password: String) = password.trim().isNotEmpty()/* && password.matches(passwordPattern)*/

    fun isValidLogin(login: String) = login.trim().isNotEmpty() && login.matches(loginPattern)

    fun validateRequest(condition: Boolean) {
        if (condition) throw StatusCodeException(400, Message.RESPONSE_ERROR)
    }
}