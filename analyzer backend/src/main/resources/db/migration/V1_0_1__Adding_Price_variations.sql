create table price_variations (
    id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    stock_id  INTEGER NOT NULL,
    price_before_1_day DOUBLE PRECISION,
    price_before_5_days DOUBLE PRECISION,
    price_before_1_month DOUBLE PRECISION,
    price_before_3_months DOUBLE PRECISION,
    price_before_6_months DOUBLE PRECISION,
    price_ytd DOUBLE PRECISION,
    price_before_1_year DOUBLE PRECISION,
    price_before_3_years DOUBLE PRECISION,
    price_before_5_years DOUBLE PRECISION,
    price_before_10_years DOUBLE PRECISION,


    CONSTRAINT fk_stock FOREIGN KEY (stock_id) REFERENCES stocks (id)
)