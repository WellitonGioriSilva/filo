import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import type { MochaUser } from "@getmocha/users-service/shared";

const app = new Hono<{ Bindings: Env }>();

// ============================================================================
// Authentication Endpoints
// ============================================================================

app.get("/api/oauth/google/redirect_url", async (c) => {
  const redirectUrl = await getOAuthRedirectUrl("google", {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 days
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  return c.json(c.get("user"));
});

app.get("/api/logout", async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === "string") {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// ============================================================================
// Profile Setup Endpoints
// ============================================================================

app.get("/api/profile", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;

  // Check if user is a barber
  const barber = await c.env.DB.prepare(
    "SELECT b.*, bs.name as barbershop_name, bs.unique_code, bs.cut_duration_minutes FROM barbers b LEFT JOIN barbershops bs ON b.barbershop_id = bs.id WHERE b.user_id = ?"
  )
    .bind(user.id)
    .first();

  // Check if user is a client
  const client = await c.env.DB.prepare("SELECT * FROM clients WHERE user_id = ?")
    .bind(user.id)
    .first();

  return c.json({
    user,
    barber,
    client,
    role: barber ? "barber" : client ? "client" : null,
  });
});

app.post("/api/profile/setup-barber", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  const body = await c.req.json();

  // Check if user is already a barber
  const existingBarber = await c.env.DB.prepare("SELECT * FROM barbers WHERE user_id = ?")
    .bind(user.id)
    .first();

  if (existingBarber) {
    return c.json({ error: "User is already a barber" }, 400);
  }

  let barbershopId: number;

  if (body.barbershopCode) {
    // Join existing barbershop
    const barbershop = await c.env.DB.prepare(
      "SELECT * FROM barbershops WHERE unique_code = ?"
    )
      .bind(body.barbershopCode.toLowerCase())
      .first() as any;

    if (!barbershop) {
      return c.json({ error: "Código de barbearia inválido" }, 400);
    }

    barbershopId = barbershop.id;
  } else {
    // Create new barbershop
    const uniqueCode = Math.random().toString(36).substring(2, 10).toLowerCase();
    
    const barbershopResult = await c.env.DB.prepare(
      "INSERT INTO barbershops (name, address, phone, unique_code, cut_duration_minutes) VALUES (?, ?, ?, ?, ?)"
    )
      .bind(
        body.barbershopName, 
        body.address || null, 
        body.phone || null,
        uniqueCode,
        body.cutDuration || 30
      )
      .run();

    barbershopId = barbershopResult.meta.last_row_id as number;
  }

  // Create barber
  await c.env.DB.prepare(
    "INSERT INTO barbers (user_id, barbershop_id, name) VALUES (?, ?, ?)"
  )
    .bind(user.id, barbershopId, body.barberName || user.google_user_data.name)
    .run();

  return c.json({ success: true });
});

app.post("/api/profile/setup-client", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  const body = await c.req.json();

  // Check if user is already a client
  const existingClient = await c.env.DB.prepare("SELECT * FROM clients WHERE user_id = ?")
    .bind(user.id)
    .first();

  if (existingClient) {
    return c.json({ error: "User is already a client" }, 400);
  }

  // Create client
  await c.env.DB.prepare(
    "INSERT INTO clients (user_id, name, phone) VALUES (?, ?, ?)"
  )
    .bind(user.id, body.name || user.google_user_data.name, body.phone || null)
    .run();

  return c.json({ success: true });
});

// ============================================================================
// Barbershop Endpoints
// ============================================================================

app.get("/api/barbershops", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  
  const { results } = await c.env.DB.prepare(
    `SELECT b.*, 
     CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite
     FROM barbershops b
     LEFT JOIN clients c ON c.user_id = ?
     LEFT JOIN favorites f ON f.barbershop_id = b.id AND f.client_id = c.id
     ORDER BY is_favorite DESC, b.name`
  )
    .bind(user.id)
    .all();
  
  return c.json(results);
});

app.get("/api/barbershops/:id", async (c) => {
  const id = c.req.param("id");
  const barbershop = await c.env.DB.prepare("SELECT * FROM barbershops WHERE id = ?")
    .bind(id)
    .first();

  if (!barbershop) {
    return c.json({ error: "Barbershop not found" }, 404);
  }

  return c.json(barbershop);
});

// ============================================================================
// Favorites Endpoints
// ============================================================================

app.post("/api/barbershops/:id/favorite", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  const barbershopId = c.req.param("id");

  // Get client
  const client = await c.env.DB.prepare("SELECT * FROM clients WHERE user_id = ?")
    .bind(user.id)
    .first() as any;

  if (!client) {
    return c.json({ error: "Client not found" }, 404);
  }

  // Check if already favorited
  const existing = await c.env.DB.prepare(
    "SELECT * FROM favorites WHERE client_id = ? AND barbershop_id = ?"
  )
    .bind(client.id, barbershopId)
    .first();

  if (existing) {
    // Unfavorite
    await c.env.DB.prepare(
      "DELETE FROM favorites WHERE client_id = ? AND barbershop_id = ?"
    )
      .bind(client.id, barbershopId)
      .run();
    return c.json({ is_favorite: false });
  } else {
    // Favorite
    await c.env.DB.prepare(
      "INSERT INTO favorites (client_id, barbershop_id) VALUES (?, ?)"
    )
      .bind(client.id, barbershopId)
      .run();
    return c.json({ is_favorite: true });
  }
});

// ============================================================================
// Queue Management Endpoints (Barber)
// ============================================================================

app.post("/api/queues/open", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  const body = await c.req.json();

  // Get barber info
  const barber = await c.env.DB.prepare("SELECT * FROM barbers WHERE user_id = ?")
    .bind(user.id)
    .first() as any;

  if (!barber) {
    return c.json({ error: "User is not a barber" }, 403);
  }

  // Check if there's already an open queue for this barber
  const existingQueue = await c.env.DB.prepare(
    "SELECT * FROM queues WHERE barber_id = ? AND is_open = 1"
  )
    .bind(barber.id)
    .first();

  if (existingQueue) {
    return c.json({ error: "Queue already open" }, 400);
  }

  // Create new queue
  const result = await c.env.DB.prepare(
    "INSERT INTO queues (barbershop_id, barber_id, closing_time, max_capacity) VALUES (?, ?, ?, ?)"
  )
    .bind(barber.barbershop_id, barber.id, body.closingTime, body.maxCapacity || 10)
    .run();

  return c.json({ queueId: result.meta.last_row_id });
});

app.post("/api/queues/:id/close", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  const queueId = c.req.param("id");

  // Verify barber owns this queue
  const queue = await c.env.DB.prepare(
    `SELECT q.* FROM queues q 
     JOIN barbers b ON q.barber_id = b.id 
     WHERE q.id = ? AND b.user_id = ?`
  )
    .bind(queueId, user.id)
    .first();

  if (!queue) {
    return c.json({ error: "Queue not found or unauthorized" }, 404);
  }

  await c.env.DB.prepare("UPDATE queues SET is_open = 0 WHERE id = ?")
    .bind(queueId)
    .run();

  return c.json({ success: true });
});

app.get("/api/queues/my-queue", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;

  // Get barber's active queue
  const queue = await c.env.DB.prepare(
    `SELECT q.*, b.name as barber_name, bs.name as barbershop_name, bs.unique_code, bs.cut_duration_minutes
     FROM queues q
     JOIN barbers b ON q.barber_id = b.id
     JOIN barbershops bs ON q.barbershop_id = bs.id
     WHERE b.user_id = ? AND q.is_open = 1`
  )
    .bind(user.id)
    .first();

  if (!queue) {
    return c.json({ queue: null });
  }

  // Get queue entries
  const { results: entries } = await c.env.DB.prepare(
    `SELECT qe.*, c.name as client_name
     FROM queue_entries qe
     LEFT JOIN clients c ON qe.client_id = c.id
     WHERE qe.queue_id = ? AND qe.status = 'waiting'
     ORDER BY qe.position`
  )
    .bind(queue.id)
    .all();

  // Get currently being served
  const currentEntry = await c.env.DB.prepare(
    `SELECT qe.*, c.name as client_name
     FROM queue_entries qe
     LEFT JOIN clients c ON qe.client_id = c.id
     WHERE qe.queue_id = ? AND qe.status = 'called'
     LIMIT 1`
  )
    .bind(queue.id)
    .first();

  // Get pending requests
  const { results: requests } = await c.env.DB.prepare(
    `SELECT qr.*, c.name as client_name
     FROM queue_requests qr
     JOIN clients c ON qr.client_id = c.id
     WHERE qr.queue_id = ? AND qr.status = 'pending'
     ORDER BY qr.created_at`
  )
    .bind(queue.id)
    .all();

  return c.json({ queue, entries, currentEntry, requests });
});

app.post("/api/queues/:id/add-anonymous", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  const queueId = c.req.param("id");
  const body = await c.req.json();

  // Verify barber owns this queue
  const queue = await c.env.DB.prepare(
    `SELECT q.* FROM queues q 
     JOIN barbers b ON q.barber_id = b.id 
     WHERE q.id = ? AND b.user_id = ?`
  )
    .bind(queueId, user.id)
    .first();

  if (!queue) {
    return c.json({ error: "Queue not found or unauthorized" }, 404);
  }

  // Create anonymous client
  const clientResult = await c.env.DB.prepare(
    "INSERT INTO clients (name, phone) VALUES (?, ?)"
  )
    .bind(body.name || "Anônimo", body.phone || null)
    .run();

  // Get current queue size
  const { count } = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM queue_entries WHERE queue_id = ? AND status = 'waiting'"
  )
    .bind(queueId)
    .first() as any;

  // Add to queue
  await c.env.DB.prepare(
    "INSERT INTO queue_entries (queue_id, client_id, position) VALUES (?, ?, ?)"
  )
    .bind(queueId, clientResult.meta.last_row_id, count + 1)
    .run();

  return c.json({ success: true });
});

app.post("/api/queues/:id/call-next", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  const queueId = c.req.param("id");

  // Verify barber owns this queue
  const queue = await c.env.DB.prepare(
    `SELECT q.* FROM queues q 
     JOIN barbers b ON q.barber_id = b.id 
     WHERE q.id = ? AND b.user_id = ?`
  )
    .bind(queueId, user.id)
    .first();

  if (!queue) {
    return c.json({ error: "Queue not found or unauthorized" }, 404);
  }

  // Get next person in queue
  const nextEntry = await c.env.DB.prepare(
    "SELECT * FROM queue_entries WHERE queue_id = ? AND status = 'waiting' ORDER BY position LIMIT 1"
  )
    .bind(queueId)
    .first();

  if (!nextEntry) {
    return c.json({ error: "No one in queue" }, 400);
  }

  // Mark as called
  await c.env.DB.prepare(
    "UPDATE queue_entries SET status = 'called', called_at = CURRENT_TIMESTAMP WHERE id = ?"
  )
    .bind(nextEntry.id)
    .run();

  // Remove from waiting positions
  await c.env.DB.prepare(
    "UPDATE queue_entries SET position = position - 1 WHERE queue_id = ? AND status = 'waiting' AND position > ?"
  )
    .bind(queueId, nextEntry.position)
    .run();

  return c.json({ success: true, entry: nextEntry });
});

app.post("/api/queues/:id/complete-current", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  const queueId = c.req.param("id");

  // Verify barber owns this queue
  const queue = await c.env.DB.prepare(
    `SELECT q.* FROM queues q 
     JOIN barbers b ON q.barber_id = b.id 
     WHERE q.id = ? AND b.user_id = ?`
  )
    .bind(queueId, user.id)
    .first();

  if (!queue) {
    return c.json({ error: "Queue not found or unauthorized" }, 404);
  }

  // Get currently called entry
  const currentEntry = await c.env.DB.prepare(
    "SELECT * FROM queue_entries WHERE queue_id = ? AND status = 'called' LIMIT 1"
  )
    .bind(queueId)
    .first();

  if (!currentEntry) {
    return c.json({ error: "No one currently being served" }, 400);
  }

  // Mark as completed
  await c.env.DB.prepare(
    "UPDATE queue_entries SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?"
  )
    .bind(currentEntry.id)
    .run();

  return c.json({ success: true });
});

app.post("/api/queues/requests/:id/approve", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  const requestId = c.req.param("id");

  // Get request and verify ownership
  const request = await c.env.DB.prepare(
    `SELECT qr.*, q.barber_id FROM queue_requests qr
     JOIN queues q ON qr.queue_id = q.id
     JOIN barbers b ON q.barber_id = b.id
     WHERE qr.id = ? AND b.user_id = ?`
  )
    .bind(requestId, user.id)
    .first() as any;

  if (!request) {
    return c.json({ error: "Request not found or unauthorized" }, 404);
  }

  // Get current queue size
  const { count } = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM queue_entries WHERE queue_id = ? AND status = 'waiting'"
  )
    .bind(request.queue_id)
    .first() as any;

  // Add to queue
  await c.env.DB.prepare(
    "INSERT INTO queue_entries (queue_id, client_id, position) VALUES (?, ?, ?)"
  )
    .bind(request.queue_id, request.client_id, count + 1)
    .run();

  // Mark request as approved
  await c.env.DB.prepare(
    "UPDATE queue_requests SET status = 'approved', responded_at = CURRENT_TIMESTAMP WHERE id = ?"
  )
    .bind(requestId)
    .run();

  return c.json({ success: true });
});

app.post("/api/queues/requests/:id/reject", authMiddleware, async (c) => {
  const user = c.get("user") as MochaUser;
  const requestId = c.req.param("id");

  // Get request and verify ownership
  const request = await c.env.DB.prepare(
    `SELECT qr.* FROM queue_requests qr
     JOIN queues q ON qr.queue_id = q.id
     JOIN barbers b ON q.barber_id = b.id
     WHERE qr.id = ? AND b.user_id = ?`
  )
    .bind(requestId, user.id)
    .first();

  if (!request) {
    return c.json({ error: "Request not found or unauthorized" }, 404);
  }

  // Mark request as rejected
  await c.env.DB.prepare(
    "UPDATE queue_requests SET status = 'rejected', responded_at = CURRENT_TIMESTAMP WHERE id = ?"
  )
    .bind(requestId)
    .run();

  return c.json({ success: true });
});

// ============================================================================
// Queue Endpoints (Client)
// ============================================================================

app.get("/api/barbershops/:id/queue", authMiddleware, async (c) => {
  const barbershopId = c.req.param("id");
  const user = c.get("user") as MochaUser;

  // Get client info for favorites
  const client = await c.env.DB.prepare("SELECT * FROM clients WHERE user_id = ?")
    .bind(user.id)
    .first() as any;

  // Get barbershop info with favorite status
  let barbershop;
  if (client) {
    barbershop = await c.env.DB.prepare(
      `SELECT b.*, 
       CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite
       FROM barbershops b
       LEFT JOIN favorites f ON f.barbershop_id = b.id AND f.client_id = ?
       WHERE b.id = ?`
    )
      .bind(client.id, barbershopId)
      .first();
  } else {
    barbershop = await c.env.DB.prepare(
      "SELECT *, 0 as is_favorite FROM barbershops WHERE id = ?"
    )
      .bind(barbershopId)
      .first();
  }

  if (!barbershop) {
    return c.json({ error: "Barbershop not found" }, 404);
  }

  // Get all active barbers for this barbershop
  const { results: activeBarbers } = await c.env.DB.prepare(
    `SELECT DISTINCT b.name 
     FROM queues q
     JOIN barbers b ON q.barber_id = b.id
     WHERE q.barbershop_id = ? AND q.is_open = 1`
  )
    .bind(barbershopId)
    .all();

  console.log(`Active barbers for barbershop ${barbershopId}:`, activeBarbers);

  // Get active queue for barbershop (pick first one for queue data)
  const queue = await c.env.DB.prepare(
    `SELECT q.*, b.name as barber_name
     FROM queues q
     JOIN barbers b ON q.barber_id = b.id
     WHERE q.barbershop_id = ? AND q.is_open = 1
     LIMIT 1`
  )
    .bind(barbershopId)
    .first();

  if (!queue) {
    return c.json({ queue: null, barbershop });
  }

  // Format barber names
  let barberDisplay = queue.barber_name as string; // Default to the single barber's name
  if (activeBarbers.length > 1) {
    barberDisplay = `${activeBarbers.length} barbeiros`;
  }

  console.log(`Barber display: ${barberDisplay} (active count: ${activeBarbers.length})`);

  // Update queue object with formatted barber display
  const queueWithBarbers = {
    ...queue,
    barber_name: barberDisplay,
  };

  // Get total queue size across all barbers in this barbershop
  const { count } = await c.env.DB.prepare(
    `SELECT COUNT(*) as count 
     FROM queue_entries qe
     JOIN queues q ON qe.queue_id = q.id
     WHERE q.barbershop_id = ? AND q.is_open = 1 AND qe.status = 'waiting'`
  )
    .bind(barbershopId)
    .first() as any;

  let myPosition = null;
  let myRequest = null;

  if (client) {
    // Check if user is in any queue for this barbershop
    const myEntry = await c.env.DB.prepare(
      `SELECT qe.* 
       FROM queue_entries qe
       JOIN queues q ON qe.queue_id = q.id
       WHERE q.barbershop_id = ? AND qe.client_id = ? AND qe.status = 'waiting'`
    )
      .bind(barbershopId, client.id)
      .first() as any;

    if (myEntry) {
      myPosition = myEntry.position;
    } else {
      // Check for pending request
      myRequest = await c.env.DB.prepare(
        `SELECT qr.*
         FROM queue_requests qr
         JOIN queues q ON qr.queue_id = q.id
         WHERE q.barbershop_id = ? AND qr.client_id = ? AND qr.status = 'pending'`
      )
        .bind(barbershopId, client.id)
        .first();
    }
  }

  return c.json({
    queue: queueWithBarbers,
    barbershop,
    queueSize: count,
    myPosition,
    myRequest,
  });
});

app.post("/api/barbershops/:id/join-queue", authMiddleware, async (c) => {
  const barbershopId = c.req.param("id");
  const user = c.get("user") as MochaUser;

  // Get or create client
  let client = await c.env.DB.prepare("SELECT * FROM clients WHERE user_id = ?")
    .bind(user.id)
    .first() as any;

  if (!client) {
    const result = await c.env.DB.prepare(
      "INSERT INTO clients (user_id, name) VALUES (?, ?)"
    )
      .bind(user.id, user.google_user_data.name || "Cliente")
      .run();

    client = await c.env.DB.prepare("SELECT * FROM clients WHERE id = ?")
      .bind(result.meta.last_row_id)
      .first() as any;
  }

  if (!client) {
    return c.json({ error: "Failed to create client" }, 500);
  }

  // Get active queue
  const queue = await c.env.DB.prepare(
    "SELECT * FROM queues WHERE barbershop_id = ? AND is_open = 1 LIMIT 1"
  )
    .bind(barbershopId)
    .first() as any;

  if (!queue) {
    return c.json({ error: "No active queue for this barbershop" }, 400);
  }

  // Check if already in queue
  const existingEntry = await c.env.DB.prepare(
    "SELECT * FROM queue_entries WHERE queue_id = ? AND client_id = ? AND status = 'waiting'"
  )
    .bind(queue.id, client.id)
    .first();

  if (existingEntry) {
    return c.json({ error: "Already in queue" }, 400);
  }

  // Get current queue size
  const { count } = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM queue_entries WHERE queue_id = ? AND status = 'waiting'"
  )
    .bind(queue.id)
    .first() as any;

  // Check if queue is full
  if (count >= (queue.max_capacity as number)) {
    // Create a request instead
    await c.env.DB.prepare(
      "INSERT INTO queue_requests (queue_id, client_id) VALUES (?, ?)"
    )
      .bind(queue.id, client.id)
      .run();

    return c.json({ status: "request_created" });
  }

  // Add to queue
  await c.env.DB.prepare(
    "INSERT INTO queue_entries (queue_id, client_id, position) VALUES (?, ?, ?)"
  )
    .bind(queue.id, client.id, count + 1)
    .run();

  return c.json({ status: "joined", position: count + 1 });
});

app.post("/api/queues/:id/leave", authMiddleware, async (c) => {
  const queueId = c.req.param("id");
  const user = c.get("user") as MochaUser;

  const client = await c.env.DB.prepare("SELECT * FROM clients WHERE user_id = ?")
    .bind(user.id)
    .first() as any;

  if (!client) {
    return c.json({ error: "Client not found" }, 404);
  }

  // Get entry position before deleting
  const entry = await c.env.DB.prepare(
    "SELECT position FROM queue_entries WHERE queue_id = ? AND client_id = ? AND status = 'waiting'"
  )
    .bind(queueId, client.id)
    .first() as any;

  if (!entry) {
    return c.json({ error: "Not in queue" }, 400);
  }

  // Remove from queue
  await c.env.DB.prepare(
    "DELETE FROM queue_entries WHERE queue_id = ? AND client_id = ? AND status = 'waiting'"
  )
    .bind(queueId, client.id)
    .run();

  // Reorder positions
  await c.env.DB.prepare(
    `UPDATE queue_entries 
     SET position = position - 1 
     WHERE queue_id = ? AND status = 'waiting' AND position > ?`
  )
    .bind(queueId, entry.position)
    .run();

  return c.json({ success: true });
});

export default app;
