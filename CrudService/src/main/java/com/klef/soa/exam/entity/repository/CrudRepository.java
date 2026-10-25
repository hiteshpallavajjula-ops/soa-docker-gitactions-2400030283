package com.klef.soa.exam.entity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.klef.soa.exam.entity.Crud;

public interface CrudRepository extends JpaRepository<Crud, Long> {
}