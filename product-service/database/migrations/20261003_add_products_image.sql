SET @image_column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'products'
      AND COLUMN_NAME = 'image'
);

SET @add_image_column = IF(
    @image_column_exists = 0,
    'ALTER TABLE products ADD COLUMN image MEDIUMTEXT NULL AFTER stock',
    'SELECT 1'
);

PREPARE add_image_column_statement FROM @add_image_column;
EXECUTE add_image_column_statement;
DEALLOCATE PREPARE add_image_column_statement;

UPDATE products
SET image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
WHERE image IS NULL OR image = '';

ALTER TABLE products
MODIFY COLUMN image MEDIUMTEXT NOT NULL AFTER stock;