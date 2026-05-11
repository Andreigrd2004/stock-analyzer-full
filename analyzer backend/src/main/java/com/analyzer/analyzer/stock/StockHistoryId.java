package com.analyzer.analyzer.stock;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

@Getter
@Setter
@Embeddable
public class StockHistoryId implements Serializable {
    private static final long serialVersionUID = 3632465156579437902L;
    @NotNull
    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Size(max = 10)
    @NotNull
    @Column(name = "ticker", nullable = false, length = 10)
    private String ticker;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        StockHistoryId entity = (StockHistoryId) o;
        return Objects.equals(this.date, entity.date) &&
                Objects.equals(this.ticker, entity.ticker);
    }

    @Override
    public int hashCode() {
        return Objects.hash(date, ticker);
    }

}