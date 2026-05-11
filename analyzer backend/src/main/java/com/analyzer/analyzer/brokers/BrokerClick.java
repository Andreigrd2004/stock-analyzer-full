package com.analyzer.analyzer.brokers;

import com.analyzer.analyzer.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "broker_clicks")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BrokerClick {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "broker_id", nullable = false)
    private Broker broker;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "clicked_at")
    private Instant clickedAt;

    @Column(name = "cost_at_click", nullable = false, precision = 10, scale = 2)
    private BigDecimal costAtClick;
}

