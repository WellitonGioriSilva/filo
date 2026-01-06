
DROP INDEX idx_queue_requests_status;
DROP INDEX idx_queue_requests_queue_id;
DROP TABLE queue_requests;

DROP INDEX idx_queue_entries_status;
DROP INDEX idx_queue_entries_client_id;
DROP INDEX idx_queue_entries_queue_id;
DROP TABLE queue_entries;

DROP INDEX idx_queues_barber_id;
DROP INDEX idx_queues_barbershop_id;
DROP TABLE queues;

DROP INDEX idx_clients_user_id;
DROP TABLE clients;

DROP INDEX idx_barbers_barbershop_id;
DROP INDEX idx_barbers_user_id;
DROP TABLE barbers;

DROP TABLE barbershops;
