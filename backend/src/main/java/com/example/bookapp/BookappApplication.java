package com.example.bookapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BookappApplication {
    public static void main(String[] args) {
        SpringApplication.run(BookappApplication.class, args);
    }
}