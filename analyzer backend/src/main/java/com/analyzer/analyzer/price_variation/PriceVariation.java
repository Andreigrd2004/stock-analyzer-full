package com.analyzer.analyzer.price_variation;

import com.analyzer.analyzer.stock.Stock;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "price_variations")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PriceVariation {

    @Id
    @Column(name = "id", nullable = false)
    private Integer id;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "stock_id", referencedColumnName = "id")
    private Stock stock;

    @Column(name = "price_before_1_day")
    private double priceBefore1Day;

    @Column(name = "price_before_5_days")
    private double priceBefore2Days;

    @Column(name = "price_before_1_month")
    private double priceBefore5Days;

    @Column(name = "price_before_3_months")
    private double priceBefore1Month;

    @Column(name = "price_before_6_months")
    private double priceBefore3Months;

    @Column(name = "price_ytd")
    private double priceYTD;

    @Column(name = "price_before_1_year")
    private double priceBefore1Year;

    @Column(name = "price_before_3_years")
    private double priceBefore3Years;

    @Column(name = "price_before_5_years")
    private double priceBefore5Years;

    @Column(name = "price_before_10_years")
    private double priceBefore10Years;

}
