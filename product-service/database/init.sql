CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

--sample
INSERT INTO products (name, price, description, stock) VALUES
('Product 1', 19.99, 'Description for Product 1', 100),
('Product 2', 29.99, 'Description for Product 2', 50),
('Product 3', 9.99, 'Description for Product 3', 200);