
CREATE TABLE stocks
(
    id     INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name   VARCHAR(100) NOT NULL,
    symbol VARCHAR(10)  NOT NULL UNIQUE
);

CREATE TABLE predictions
(
    id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    stock_id      INTEGER NOT NULL,
    summary       TEXT,
    action        VARCHAR(20),
    current_price DOUBLE PRECISION,
    created_at    TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valid_until   TIMESTAMP WITHOUT TIME ZONE,

    CONSTRAINT fk_stock FOREIGN KEY (stock_id) REFERENCES stocks (id)
);

CREATE TABLE prediction_accuracy
(
    id                 INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    prediction_id      INTEGER NOT NULL,
    price_after_5_days DOUBLE PRECISION,
    is_accurate        BOOLEAN,

    CONSTRAINT fk_prediction FOREIGN KEY (prediction_id) REFERENCES predictions (id)
);

CREATE TABLE users
(
    id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL,
    created_at    TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_stock_interest
(
    user_id  INTEGER NOT NULL,
    stock_id INTEGER NOT NULL,
    added_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, stock_id),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_stock_interest FOREIGN KEY (stock_id) REFERENCES stocks (id)
);