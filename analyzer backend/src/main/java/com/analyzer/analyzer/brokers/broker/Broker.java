package com.analyzer.analyzer.brokers;

import com.analyzer.analyzer.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "brokers")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Broker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Integer id;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Size(max = 100)
    @NotNull
    @Column(name = "company_name", nullable = false, length = 100)
    private String companyName;

    @Size(max = 255)
    @NotNull
    @Column(name = "redirect_url", nullable = false, length = 255)
    private String redirectUrl;

    @ColumnDefault("0.00")
    @Column(name = "bid_amount", precision = 10, scale = 2)
    private BigDecimal bidAmount;

    @ColumnDefault("0.00")
    @Column(name = "daily_budget", precision = 10, scale = 2)
    private BigDecimal dailyBudget;

    @ColumnDefault("false")
    @Column(name = "is_active")
    private Boolean active;

    @OneToMany(mappedBy = "broker")
    private Set<BrokerClick> brokerClicks = new LinkedHashSet<>();
}

