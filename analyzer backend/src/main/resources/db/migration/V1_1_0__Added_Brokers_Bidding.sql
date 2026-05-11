CREATE TABLE brokers
(
    id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id      INTEGER      NOT NULL UNIQUE,
    company_name VARCHAR(100) NOT NULL,
    redirect_url VARCHAR(255) NOT NULL,
    bid_amount   DECIMAL(10, 2) DEFAULT 0.00,
    daily_budget DECIMAL(10, 2) DEFAULT 0.00,
    is_active    BOOLEAN        DEFAULT FALSE,

    CONSTRAINT fk_broker_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE broker_clicks
(
    id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    broker_id     INTEGER        NOT NULL,
    user_id       INTEGER,
    clicked_at    TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cost_at_click DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_click_broker FOREIGN KEY (broker_id) REFERENCES brokers (id),
    CONSTRAINT fk_click_user FOREIGN KEY (user_id) REFERENCES users (id)
);