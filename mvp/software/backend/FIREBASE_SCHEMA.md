# Firebase Firestore Schema (Filo)

## Collections

- barbershops: name, address, phone, unique_code, cut_duration_minutes, created_at, updated_at
- barbers: user_id, barbershop_id (ref), name, is_active, created_at, updated_at
- clients: user_id (optional), name, phone, created_at, updated_at
- queues: barbershop_id (ref), barber_id (ref), is_open, max_capacity, closing_time, created_at, updated_at
- queue_entries: queue_id (ref), client_id (ref), position, status(waiting|called|completed|cancelled), estimated_wait_minutes, called_at, completed_at, created_at, updated_at
- queue_requests: queue_id (ref), client_id (ref), status(pending|approved|rejected), responded_at, created_at, updated_at
- favorites: client_id (ref), barbershop_id (ref), created_at, updated_at

## Notes

- Use document IDs to replace integer PKs from SQL.
- Keep `unique_code` unique using a dedicated collection or Cloud Function to enforce uniqueness.
- For performance, consider subcollections: `barbershops/{id}/queues` and `queues/{id}/entries`.
- Add composite indexes for common queries: favorites by (client_id, barbershop_id), queue_entries by (queue_id, status), queues by (barbershop_id, is_open).
