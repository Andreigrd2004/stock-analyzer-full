package com.analyzer.analyzer.stock;

import com.analyzer.analyzer.prediction.Prediction;
import com.analyzer.analyzer.user.interest.UserStockInterest;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "stocks")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Stock {

    @Id
    @Column(nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;


    @Size(max = 10)
    @NotNull
    @Column(name = "symbol", nullable = false, length = 10)
    private String symbol;

    @OneToMany(mappedBy = "stock")
    private Set<Prediction> predictions = new LinkedHashSet<>();

    @OneToMany(mappedBy = "stock")
    private Set<UserStockInterest> userStockInterests = new LinkedHashSet<>();

}
