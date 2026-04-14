package me.maksuslik.service

import me.maksuslik.data.model.MatrixAuth
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate

@Service
class MatrixService {
    private val restTemplate = RestTemplate()
    private val matrixHomeserver = "https://msldev.ru"

    fun registerInMatrix(username: String, password: String): MatrixAuth {
        val url = "$matrixHomeserver/_matrix/client/r0/register"

        val headers = HttpHeaders().apply {
            contentType = MediaType.APPLICATION_JSON
        }

        val body = mapOf(
            "username" to username,
            "password" to password,
            "auth" to mapOf("type" to "m.login.dummy")
        )

        val request = HttpEntity(body, headers)
        val response = restTemplate.postForObject(url, request, Map::class.java)
            ?: throw RuntimeException("Matrix registration failed")

        return MatrixAuth(
            userId = response["user_id"] as String,
            accessToken = response["access_token"] as String,
            deviceId = response["device_id"] as String
        )
    }

    fun loginToMatrix(username: String, password: String): MatrixAuth {
        val url = "$matrixHomeserver/_matrix/client/r0/login"

        val headers = HttpHeaders().apply {
            contentType = MediaType.APPLICATION_JSON
        }

        val body = mapOf(
            "type" to "m.login.password",
            "identifier" to mapOf(
                "type" to "m.id.user",
                "user" to username
            ),
            "password" to password
        )

        val request = HttpEntity(body, headers)
        val response = restTemplate.postForObject(url, request, Map::class.java)
            ?: throw RuntimeException("Matrix login failed")

        return MatrixAuth(
            response["user_id"] as String,
            response["access_token"] as String,
            response["device_id"] as String
        )
    }

    fun inviteUser(accessToken: String, roomId: String, userId: String) {
        val url = "$matrixHomeserver/_matrix/client/v3/rooms/$roomId/invite"

        val headers = HttpHeaders().apply {
            contentType = MediaType.APPLICATION_JSON
            setBearerAuth(accessToken)
        }

        val body = mapOf(
            "user_id" to userId
        )

        val request = HttpEntity(body, headers)
        val response = restTemplate.postForObject(url, request, Map::class.java)
            ?: throw RuntimeException("Matrix registration failed")

        println(response)
    }
}