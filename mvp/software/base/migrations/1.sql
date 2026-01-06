
-- Barbershops table
CREATE TABLE barbershops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Barbers table (links users to barbershops)
CREATE TABLE barbers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  barbershop_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_barbers_user_id ON barbers(user_id);
CREATE INDEX idx_barbers_barbershop_id ON barbers(barbershop_id);

-- Clients table
CREATE TABLE clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  name TEXT NOT NULL,
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clients_user_id ON clients(user_id);

-- Queues table (one active queue per barbershop)
CREATE TABLE queues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barbershop_id INTEGER NOT NULL,
  barber_id INTEGER NOT NULL,
  is_open BOOLEAN DEFAULT 1,
  max_capacity INTEGER DEFAULT 10,
  closing_time TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_queues_barbershop_id ON queues(barbershop_id);
CREATE INDEX idx_queues_barber_id ON queues(barber_id);

-- Queue entries (people in line)
CREATE TABLE queue_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  queue_id INTEGER NOT NULL,
  client_id INTEGER NOT NULL,
  position INTEGER NOT NULL,
  status TEXT DEFAULT 'waiting',
  estimated_wait_minutes INTEGER,
  called_at DATETIME,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_queue_entries_queue_id ON queue_entries(queue_id);
CREATE INDEX idx_queue_entries_client_id ON queue_entries(client_id);
CREATE INDEX idx_queue_entries_status ON queue_entries(status);

-- Queue requests (when queue is full)
CREATE TABLE queue_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  queue_id INTEGER NOT NULL,
  client_id INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  responded_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_queue_requests_queue_id ON queue_requests(queue_id);
CREATE INDEX idx_queue_requests_status ON queue_requests(status);
