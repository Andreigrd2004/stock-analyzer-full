package com.analyzer.analyzer.user.interest;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@Embeddable
public class UserStockInterestId implements Serializable {
    private static final long serialVersionUID = 3146416339453099069L;
    @NotNull
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @NotNull
    @Column(name = "stock_id", nullable = false)
    private Integer stockId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserStockInterestId entity = (UserStockInterestId) o;
        return Objects.equals(this.stockId, entity.stockId) &&
                Objects.equals(this.userId, entity.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(stockId, userId);
    }

}