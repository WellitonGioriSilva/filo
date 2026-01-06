
-- Add unique code and cut duration to barbershops
ALTER TABLE barbershops ADD COLUMN unique_code TEXT;
ALTER TABLE barbershops ADD COLUMN cut_duration_minutes INTEGER DEFAULT 30;

-- Create unique index for code
CREATE UNIQUE INDEX idx_barbershops_unique_code ON barbershops(unique_code);

-- Create favorites table
CREATE TABLE favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  barbershop_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_favorites_client_id ON favorites(client_id);
CREATE INDEX idx_favorites_barbershop_id ON favorites(barbershop_id);
CREATE UNIQUE INDEX idx_favorites_unique ON favorites(client_id, barbershop_id);
