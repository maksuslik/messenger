package me.maksuslik.controller

import me.maksuslik.service.AuthService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(val authService: AuthService) {
    @PostMapping("/init")
    fun initSession(): ResponseEntity<Any> {
        val user = authService.initSession()
        val response = mapOf(
            "login" to user.login,
            "token" to user.authToken,
        )

        return ResponseEntity.ok(response)
    }

    @GetMapping("/me")
    fun getMe(@RequestHeader("X-Auth-Token") token: String): ResponseEntity<Map<String, String>> {
        val user = authService.validateToken(token) ?: return ResponseEntity.status(401).build()

        val response = mapOf(
            "login" to user.login,
            "id" to user.id.toString()
        )

        return ResponseEntity.ok(response)
    }
}