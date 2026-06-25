package com.example.bookapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.bookapp.entity.Member;

public interface MemberRepository extends JpaRepository<Member, Long> {
}