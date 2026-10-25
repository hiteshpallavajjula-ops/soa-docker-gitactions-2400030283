
package com.klef.soa.exam.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.klef.soa.exam.entity.Crud;
import com.klef.soa.exam.entity.repository.CrudRepository;

@Service
public class CrudServiceImpl implements CrudService {

    private final CrudRepository repository;

    public CrudServiceImpl(CrudRepository repository) {
        this.repository = repository;
    }

    @Override
    public Crud add(Crud request) {
        request.setId(null);
        return repository.save(request);
    }

    @Override
    public List<Crud> displayAll() {
        return repository.findAll();
    }

    @Override
    public Optional<Crud> displayById(Long id) {
        return repository.findById(id);
    }

    @Override
    public Optional<Crud> update(Long id, Crud request) {
        return repository.findById(id).map(existing -> {
            existing.setHallName(request.getHallName());
            existing.setBuilding(request.getBuilding());
            existing.setSeatingCapacity(
                    request.getSeatingCapacity());
            existing.setRentalFee(request.getRentalFee());

            return repository.save(existing);
        });
    }

    @Override
    public boolean delete(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }

        repository.deleteById(id);
        return true;
    }
}
