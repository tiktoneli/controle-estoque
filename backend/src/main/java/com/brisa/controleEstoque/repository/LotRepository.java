package com.brisa.controleEstoque.repository;

import com.brisa.controleEstoque.entity.Lot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface LotRepository extends JpaRepository<Lot, UUID>, JpaSpecificationExecutor<Lot> {
    boolean existsByLotNumber(String lotNumber);
}
