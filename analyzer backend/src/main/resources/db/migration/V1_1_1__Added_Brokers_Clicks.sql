CREATE TABLE IF NOT EXISTS broker_clicks
(
    id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    broker_id     INTEGER        NOT NULL,
    user_id       INTEGER,
    clicked_at    TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cost_at_click DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_click_broker FOREIGN KEY (broker_id) REFERENCES brokers (id),
    CONSTRAINT fk_click_user FOREIGN KEY (user_id) REFERENCES users (id)
    );
