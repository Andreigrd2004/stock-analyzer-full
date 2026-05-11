CREATE TABLE stock_history
(
    date   DATE          NOT NULL,
    ticker VARCHAR(10)   NOT NULL,
    open   DOUBLE PRECISION NOT NULL,
    high   DOUBLE PRECISION NOT NULL,
    low    DOUBLE PRECISION NOT NULL,
    close  DOUBLE PRECISION NOT NULL,

    PRIMARY KEY (date, ticker),
    CONSTRAINT chk_stock_history_prices
        CHECK (high >= low AND open BETWEEN low AND high AND close BETWEEN low AND high)
    );

CREATE INDEX idx_stock_history_ticker_date ON stock_history (ticker, date DESC);

