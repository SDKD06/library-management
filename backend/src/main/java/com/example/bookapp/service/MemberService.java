package com.example.bookapp.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.bookapp.entity.Member;
import com.example.bookapp.repository.MemberRepository;

@Service
public class MemberService {

    private final MemberRepository repository;

    public MemberService(MemberRepository repository) {
        this.repository = repository;
    }

    public Member save(Member member) {
        return repository.save(member);
    }

    public List<Member> getAll() {
        return repository.findAll();
    }

    public Member getById(Long id) {
        return repository.findById(id).orElseThrow();
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}