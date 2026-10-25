
package com.klef.soa.exam.dto;

public class CrudDTO {

    private Long id;
    private String hallName;
    private String building;
    private Integer seatingCapacity;
    private Double rentalFee;

    public CrudDTO() {
    }

    public CrudDTO(Long id, String hallName, String building,
                   Integer seatingCapacity, Double rentalFee) {
        this.id = id;
        this.hallName = hallName;
        this.building = building;
        this.seatingCapacity = seatingCapacity;
        this.rentalFee = rentalFee;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getHallName() {
        return hallName;
    }

    public void setHallName(String hallName) {
        this.hallName = hallName;
    }

    public String getBuilding() {
        return building;
    }

    public void setBuilding(String building) {
        this.building = building;
    }

    public Integer getSeatingCapacity() {
        return seatingCapacity;
    }

    public void setSeatingCapacity(Integer seatingCapacity) {
        this.seatingCapacity = seatingCapacity;
    }

    public Double getRentalFee() {
        return rentalFee;
    }

    public void setRentalFee(Double rentalFee) {
        this.rentalFee = rentalFee;
    }
}
