
package com.klef.soa.exam.service;

import java.util.List;
import java.util.Optional;

import com.klef.soa.exam.entity.Crud;

public interface CrudService {

    Crud add(Crud request);

    List<Crud> displayAll();

    Optional<Crud> displayById(Long id);

    Optional<Crud> update(Long id, Crud request);

    boolean delete(Long id);
}
