package me.maksuslik.controller

import me.maksuslik.data.UserSignInRequest
import me.maksuslik.data.UserSignUpRequest
import me.maksuslik.service.AuthService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(val authService: AuthService) {
    @PostMapping("/init")
    fun initSession(): ResponseEntity<Any> {
        val user = authService.initSession()
        /*val response = mapOf(
            "login" to user.login,
            "token" to user.authToken,
        )*/

        return ResponseEntity.ok(user.toMap())
    }

    @PostMapping("/signup")
    fun signUp(@RequestBody body: UserSignUpRequest) = authService.signUp(body)

    @PostMapping("/login")
    fun signIn(@RequestBody body: UserSignInRequest) = authService.signIn(body)

    @GetMapping("/me")
    fun getMe(@RequestHeader("Authorization") token: String): ResponseEntity<Any> {
        val user = authService.validateToken(token) ?: return ResponseEntity.status(401).build()
        println("ME: " + user.toMap())
        return ResponseEntity.ok(user.toMap())
    }
}