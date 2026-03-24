package me.maksuslik

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
open class MessengerApplication

fun main(args: Array<String>) {
    runApplication<MessengerApplication>(*args)
}