
DROP INDEX idx_favorites_unique;
DROP INDEX idx_favorites_barbershop_id;
DROP INDEX idx_favorites_client_id;
DROP TABLE favorites;

DROP INDEX idx_barbershops_unique_code;
ALTER TABLE barbershops DROP COLUMN cut_duration_minutes;
ALTER TABLE barbershops DROP COLUMN unique_code;
