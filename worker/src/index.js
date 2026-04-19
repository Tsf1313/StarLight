/**
 * EventFlow Cloudflare Worker API
 * Migrated from Express + SQLite to Workers + D1 + R2
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;

    // CORS Preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    try {
      // Route matching
      if (pathname === '/api/auth/login') return handleAuthLogin(request, env);
      if (pathname === '/api/auth/register') return handleAuthRegister(request, env);
      if (pathname === '/api/events' && method === 'GET') return handleGetEvents(request, env);
      if (pathname === '/api/events' && method === 'POST') return handleCreateEvent(request, env);
      if (pathname.match(/^\/api\/events\/[^/]+$/) && method === 'PUT') return handleUpdateEvent(request, env, pathname);
      if (pathname.match(/^\/api\/events\/[^/]+$/) && method === 'DELETE') return handleDeleteEvent(request, env, pathname);
      if (pathname === '/api/dashboard/customize' && method === 'GET') return handleGetCustomize(request, env);
      if (pathname === '/api/dashboard/customize' && method === 'PUT') return handlePutCustomize(request, env);
      if (pathname === '/api/dashboard/feedback-form') return handleGetFeedbackForm(request, env);
      if (pathname === '/api/dashboard/attendance' && method === 'GET') return handleGetAttendance(request, env);
      if (pathname === '/api/dashboard/attendance' && method === 'POST') return handleCreateAttendee(request, env);
      if (pathname.match(/^\/api\/dashboard\/attendance\/[^/]+$/) && method === 'PATCH') return handlePatchAttendee(request, env, pathname);
      if (pathname.match(/^\/api\/dashboard\/attendance\/[^/]+$/) && method === 'PUT') return handleUpdateAttendee(request, env, pathname);
      if (pathname === '/api/dashboard/tournaments' && method === 'GET') return handleGetTournaments(request, env);
      if (pathname === '/api/dashboard/tournaments' && method === 'POST') return handleCreateTournament(request, env);
      if (pathname.match(/^\/api\/dashboard\/tournaments\/[^/]+$/) && method === 'PUT') return handleUpdateTournament(request, env, pathname);
      if (pathname === '/api/dashboard/schedules' && method === 'GET') return handleGetSchedules(request, env);
      if (pathname === '/api/dashboard/schedules' && method === 'POST') return handleCreateSchedule(request, env);
      if (pathname.match(/^\/api\/dashboard\/schedules\/[^/]+$/) && method === 'PUT') return handleUpdateSchedule(request, env, pathname);
      if (pathname.match(/^\/api\/dashboard\/schedules\/[^/]+$/) && method === 'DELETE') return handleDeleteSchedule(request, env, pathname);
      if (pathname === '/api/dashboard/brochure' && method === 'GET') return handleGetBrochures(request, env);
      if (pathname === '/api/dashboard/brochure/replace' && method === 'PUT') return handleReplaceBrochures(request, env);
      if (pathname === '/api/dashboard/venue-maps' && method === 'GET') return handleGetVenueMaps(request, env);
      if (pathname === '/api/dashboard/venue-maps/replace' && method === 'PUT') return handleReplaceVenueMaps(request, env);
      if (pathname === '/api/dashboard/announcements' && method === 'GET') return handleGetAnnouncements(request, env);
      if (pathname === '/api/dashboard/announcements/replace' && method === 'PUT') return handleReplaceAnnouncements(request, env);
      if (pathname === '/api/guest/schedule') return handleGuestGetSchedule(request, env);
      if (pathname === '/api/guest/announcements') return handleGuestGetAnnouncements(request, env);
      if (pathname === '/api/guest/brochure') return handleGuestGetBrochures(request, env);
      if (pathname === '/api/guest/venue-maps') return handleGuestGetVenueMaps(request, env);
      if (pathname === '/api/guest/tournaments') return handleGuestGetTournaments(request, env);
      if (pathname === '/api/guest/feedback' && method === 'POST') return handleGuestFeedback(request, env);
      if (pathname === '/api/dashboard/activity') return handleGetActivity(request, env);
      if (pathname === '/api/events/current-for-guests' && method === 'GET') return handleGetCurrentEventForGuests(request, env);
      if (pathname === '/api/events/current-for-guests' && method === 'PUT') return handleSetCurrentEventForGuests(request, env);
      if (pathname === '/api/upload' && method === 'POST') return handleFileUpload(request, env);

      return jsonResponse({ error: 'Not Found' }, 404);
    } catch (error) {
      console.error('Worker error:', error);
      return jsonResponse({ error: error.message }, 500);
    }
  },
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

async function parseJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function getQueryParam(url, param) {
  return new URL(url).searchParams.get(param) || 'e_001';
}

// D1 query helpers
async function dbQuery(db, query, params = []) {
  try {
    const stmt = db.prepare(query);
    if (params.length > 0) {
      return await stmt.bind(...params).all();
    }
    return await stmt.all();
  } catch (error) {
    console.error('DB Query Error:', error, 'Query:', query);
    throw error;
  }
}

async function dbRun(db, query, params = []) {
  try {
    const stmt = db.prepare(query);
    if (params.length > 0) {
      return await stmt.bind(...params).run();
    }
    return await stmt.run();
  } catch (error) {
    console.error('DB Run Error:', error, 'Query:', query);
    throw error;
  }
}

async function dbFirst(db, query, params = []) {
  const result = await dbQuery(db, query, params);
  return result.results ? result.results[0] : null;
}

// ==========================================
// AUTH HANDLERS
// ==========================================

async function handleAuthLogin(request, env) {
  const data = await parseJson(request);
  const { email, password } = data || {};

  if (!email || !password) return jsonResponse({ error: 'Missing email or password' }, 400);

  const user = await dbFirst(env.DB, 'SELECT id, name, email FROM users WHERE email = ? AND password = ?', [email, password]);

  if (!user) return jsonResponse({ message: 'Invalid email or password' }, 401);

  return jsonResponse({ message: 'Login successful', user });
}

async function handleAuthRegister(request, env) {
  const data = await parseJson(request);
  const { name, email, password } = data || {};

  if (!name || !email || !password) return jsonResponse({ error: 'Missing name, email, or password' }, 400);

  const existing = await dbFirst(env.DB, 'SELECT id FROM users WHERE email = ?', [email]);
  if (existing) return jsonResponse({ message: 'Email is already registered' }, 400);

  const id = 'u_' + Date.now();
  await dbRun(env.DB, 'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)', [id, name, email, password]);

  return jsonResponse({ message: 'Registration successful', user: { id, name, email } });
}

// ==========================================
// EVENT HANDLERS
// ==========================================

async function handleGetEvents(request, env) {
  const events = await dbQuery(env.DB, 'SELECT * FROM events');
  return jsonResponse(events.results || []);
}

async function handleCreateEvent(request, env) {
  const data = await parseJson(request);
  const { id, title, date_range, location, status } = data || {};

  if (!id || !title) return jsonResponse({ error: 'Missing id or title' }, 400);

  await dbRun(env.DB, 'INSERT INTO events (id, title, date_range, location, status) VALUES (?, ?, ?, ?, ?)', [
    id,
    title,
    date_range,
    location,
    status || 'Upcoming',
  ]);

  return jsonResponse({ success: true, id });
}

async function handleUpdateEvent(request, env, pathname) {
  const eventId = pathname.split('/').pop();
  const data = await parseJson(request);
  const { title, date_range, location, status } = data || {};

  const existing = await dbFirst(env.DB, 'SELECT * FROM events WHERE id = ?', [eventId]);
  if (!existing) return jsonResponse({ error: 'Event not found' }, 404);

  const nextTitle = title ?? existing.title;
  const nextDateRange = date_range ?? existing.date_range;
  const nextLocation = location ?? existing.location;
  const nextStatus = status ?? existing.status;

  await dbRun(
    env.DB,
    'UPDATE events SET title = ?, date_range = ?, location = ?, status = ? WHERE id = ?',
    [nextTitle, nextDateRange, nextLocation, nextStatus, eventId]
  );

  return jsonResponse({ success: true });
}

async function handleDeleteEvent(request, env, pathname) {
  const eventId = pathname.split('/').pop();

  // Use a transaction-like approach: delete cascade
  const deletes = [
    ['DELETE FROM attendees WHERE event_id = ?', [eventId]],
    ['DELETE FROM tournaments WHERE event_id = ?', [eventId]],
    ['DELETE FROM brochures WHERE event_id = ?', [eventId]],
    ['DELETE FROM venue_maps WHERE event_id = ?', [eventId]],
    ['DELETE FROM schedules WHERE event_id = ?', [eventId]],
    ['DELETE FROM announcements WHERE event_id = ?', [eventId]],
    ['DELETE FROM feedback_submissions WHERE event_id = ?', [eventId]],
    ['DELETE FROM activity_logs WHERE event_id = ?', [eventId]],
    ['DELETE FROM events WHERE id = ?', [eventId]],
  ];

  for (const [sql, params] of deletes) {
    await dbRun(env.DB, sql, params);
  }

  return jsonResponse({ success: true, deleted: eventId });
}

// ==========================================
// ATTENDANCE HANDLERS
// ==========================================

async function handleGetAttendance(request, env) {
  const eventId = getQueryParam(request.url, 'event_id');
  const attendees = await dbQuery(env.DB, 'SELECT * FROM attendees WHERE event_id = ?', [eventId]);
  return jsonResponse(attendees.results || []);
}

async function handleCreateAttendee(request, env) {
  const data = await parseJson(request);
  const { id, event_id, name, email, status, ticket_type, registration_source, check_in_time } = data || {};

  if (!id || !name) return jsonResponse({ error: 'Missing id or name' }, 400);

  await dbRun(
    env.DB,
    'INSERT INTO attendees (id, event_id, name, email, status, ticket_type, registration_source, check_in_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, event_id || 'e_001', name, email, status, ticket_type, registration_source, check_in_time]
  );

  return jsonResponse({ success: true, id });
}

async function handlePatchAttendee(request, env, pathname) {
  const attendeeId = pathname.split('/').pop();
  const data = await parseJson(request);
  const { status, event_id } = data || {};
  const eventId = event_id || 'e_001';

  const time = status === 'Checked In' ? new Date().toISOString() : null;

  await dbRun(env.DB, 'UPDATE attendees SET status = ?, check_in_time = ? WHERE id = ? AND event_id = ?', [
    status,
    time,
    attendeeId,
    eventId,
  ]);

  return jsonResponse({ updated: 1 });
}

async function handleUpdateAttendee(request, env, pathname) {
  const attendeeId = pathname.split('/').pop();
  const data = await parseJson(request);
  const { name, email, ticket_type, registration_source, status, check_in_time, event_id } = data || {};
  const eventId = event_id || 'e_001';

  await dbRun(
    env.DB,
    'UPDATE attendees SET name = ?, email = ?, ticket_type = ?, registration_source = ?, status = ?, check_in_time = ? WHERE id = ? AND event_id = ?',
    [name, email, ticket_type, registration_source, status, check_in_time, attendeeId, eventId]
  );

  return jsonResponse({ updated: 1 });
}

// ==========================================
// TOURNAMENT HANDLERS
// ==========================================

async function handleGetTournaments(request, env) {
  const eventId = getQueryParam(request.url, 'event_id');
  const tournaments = await dbQuery(env.DB, 'SELECT * FROM tournaments WHERE event_id = ?', [eventId]);

  const parsed = (tournaments.results || []).map((row) => {
    if (row.bracket_data && typeof row.bracket_data === 'string') {
      row.bracket_data = JSON.parse(row.bracket_data);
    }
    return row;
  });

  return jsonResponse(parsed);
}

async function handleCreateTournament(request, env) {
  const data = await parseJson(request);
  const { id, event_id, name, status, preview_type, external_url, format, bracket_data } = data || {};

  if (!id || !name) return jsonResponse({ error: 'Missing id or name' }, 400);

  await dbRun(
    env.DB,
    'INSERT INTO tournaments (id, event_id, name, status, preview_type, external_url, format, bracket_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, event_id || 'e_001', name, status, preview_type, external_url, format, JSON.stringify(bracket_data)]
  );

  return jsonResponse({ success: true, id });
}

async function handleUpdateTournament(request, env, pathname) {
  const tournamentId = pathname.split('/').pop();
  const data = await parseJson(request);
  const { name, status, preview_type, external_url, format, bracket_data, event_id } = data || {};
  const eventId = event_id || 'e_001';

  await dbRun(
    env.DB,
    'UPDATE tournaments SET name = ?, status = ?, preview_type = ?, external_url = ?, format = ?, bracket_data = ? WHERE id = ? AND event_id = ?',
    [name, status, preview_type, external_url, format, JSON.stringify(bracket_data), tournamentId, eventId]
  );

  return jsonResponse({ updated: 1 });
}

// ==========================================
// SCHEDULE HANDLERS
// ==========================================

async function handleGetSchedules(request, env) {
  const eventId = getQueryParam(request.url, 'event_id');
  const schedules = await dbQuery(env.DB, 'SELECT * FROM schedules WHERE event_id = ? ORDER BY session_time ASC', [eventId]);
  return jsonResponse(schedules.results || []);
}

async function handleCreateSchedule(request, env) {
  const data = await parseJson(request);
  const { id, event_id, title, location, session_time, status } = data || {};

  if (!id || !title) return jsonResponse({ error: 'Missing id or title' }, 400);

  await dbRun(
    env.DB,
    'INSERT INTO schedules (id, event_id, title, location, session_time, status) VALUES (?, ?, ?, ?, ?, ?)',
    [id, event_id || 'e_001', title, location, session_time, status || 'upcoming']
  );

  return jsonResponse({ success: true, id });
}

async function handleUpdateSchedule(request, env, pathname) {
  const scheduleId = pathname.split('/').pop();
  const data = await parseJson(request);
  const { title, location, session_time, status, event_id } = data || {};
  const eventId = event_id || 'e_001';

  await dbRun(
    env.DB,
    'UPDATE schedules SET title = ?, location = ?, session_time = ?, status = ? WHERE id = ? AND event_id = ?',
    [title, location, session_time, status || 'upcoming', scheduleId, eventId]
  );

  return jsonResponse({ updated: 1 });
}

async function handleDeleteSchedule(request, env, pathname) {
  const scheduleId = pathname.split('/').pop();
  const eventId = getQueryParam(request.url, 'event_id');

  await dbRun(env.DB, 'DELETE FROM schedules WHERE id = ? AND event_id = ?', [scheduleId, eventId]);

  return jsonResponse({ deleted: 1 });
}

// ==========================================
// BROCHURE HANDLERS
// ==========================================

async function handleGetBrochures(request, env) {
  const eventId = getQueryParam(request.url, 'event_id');
  const brochures = await dbQuery(env.DB, 'SELECT * FROM brochures WHERE event_id = ?', [eventId]);
  return jsonResponse(brochures.results || []);
}

async function handleReplaceBrochures(request, env) {
  const data = await parseJson(request);
  const { event_id = 'e_001', brochures = [] } = data;

  await dbRun(env.DB, 'DELETE FROM brochures WHERE event_id = ?', [event_id]);

  if (brochures.length === 0) {
    return jsonResponse({ success: true, replaced: 0 });
  }

  for (const item of brochures) {
    await dbRun(
      env.DB,
      'INSERT INTO brochures (id, event_id, file_name, file_type, file_url, description, size_bytes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [item.id, event_id, item.file_name, item.file_type, item.file_url, item.description, item.size_bytes]
    );
  }

  return jsonResponse({ success: true, replaced: brochures.length });
}

// ==========================================
// VENUE MAP HANDLERS
// ==========================================

async function handleGetVenueMaps(request, env) {
  const eventId = getQueryParam(request.url, 'event_id');
  const maps = await dbQuery(env.DB, 'SELECT * FROM venue_maps WHERE event_id = ?', [eventId]);

  const parsed = (maps.results || []).map((row) => {
    if (row.zones && typeof row.zones === 'string') {
      row.zones = JSON.parse(row.zones);
    }
    return row;
  });

  return jsonResponse(parsed);
}

async function handleReplaceVenueMaps(request, env) {
  const data = await parseJson(request);
  const { event_id = 'e_001', maps = [] } = data;

  await dbRun(env.DB, 'DELETE FROM venue_maps WHERE event_id = ?', [event_id]);

  if (maps.length === 0) {
    return jsonResponse({ success: true, replaced: 0 });
  }

  for (const item of maps) {
    await dbRun(
      env.DB,
      'INSERT INTO venue_maps (id, event_id, name, image_url, zones) VALUES (?, ?, ?, ?, ?)',
      [item.id, event_id, item.name, item.image_url, JSON.stringify(item.zones || [])]
    );
  }

  return jsonResponse({ success: true, replaced: maps.length });
}

// ==========================================
// ANNOUNCEMENT HANDLERS
// ==========================================

async function handleGetAnnouncements(request, env) {
  const eventId = getQueryParam(request.url, 'event_id');
  const announcements = await dbQuery(env.DB, 'SELECT * FROM announcements WHERE event_id = ? ORDER BY posted_time DESC', [eventId]);
  return jsonResponse(announcements.results || []);
}

async function handleReplaceAnnouncements(request, env) {
  const data = await parseJson(request);
  const { event_id = 'e_001', announcements = [] } = data;

  await dbRun(env.DB, 'DELETE FROM announcements WHERE event_id = ?', [event_id]);

  if (announcements.length === 0) {
    return jsonResponse({ success: true, replaced: 0 });
  }

  for (const item of announcements) {
    await dbRun(
      env.DB,
      'INSERT INTO announcements (id, event_id, message, is_urgent) VALUES (?, ?, ?, ?)',
      [item.id, event_id, item.message, item.is_urgent ? 1 : 0]
    );
  }

  return jsonResponse({ success: true, replaced: announcements.length });
}

// ==========================================
// GUEST HANDLERS
// ==========================================

async function handleGuestGetSchedule(request, env) {
  const eventId = await getCurrentEventForGuests(env);
  const schedules = await dbQuery(env.DB, 'SELECT * FROM schedules WHERE event_id = ? ORDER BY session_time ASC', [eventId]);
  return jsonResponse(schedules.results || []);
}

async function handleGuestGetAnnouncements(request, env) {
  const eventId = await getCurrentEventForGuests(env);
  const announcements = await dbQuery(env.DB, 'SELECT * FROM announcements WHERE event_id = ? ORDER BY posted_time DESC', [eventId]);
  return jsonResponse(announcements.results || []);
}

async function handleGuestGetBrochures(request, env) {
  const eventId = await getCurrentEventForGuests(env);
  const brochures = await dbQuery(env.DB, 'SELECT * FROM brochures WHERE event_id = ?', [eventId]);
  return jsonResponse(brochures.results || []);
}

async function handleGuestGetVenueMaps(request, env) {
  const eventId = await getCurrentEventForGuests(env);
  const maps = await dbQuery(env.DB, 'SELECT * FROM venue_maps WHERE event_id = ?', [eventId]);

  const parsed = (maps.results || []).map((row) => {
    if (row.zones && typeof row.zones === 'string') {
      row.zones = JSON.parse(row.zones);
    }
    return row;
  });

  return jsonResponse(parsed);
}

async function handleGuestGetTournaments(request, env) {
  const eventId = await getCurrentEventForGuests(env);
  const tournaments = await dbQuery(env.DB, 'SELECT * FROM tournaments WHERE event_id = ?', [eventId]);

  const parsed = (tournaments.results || []).map((row) => {
    if (row.bracket_data && typeof row.bracket_data === 'string') {
      row.bracket_data = JSON.parse(row.bracket_data);
    }
    return row;
  });

  return jsonResponse(parsed);
}

async function handleGuestFeedback(request, env) {
  const data = await parseJson(request);
  const { id, event_id, name, role, description } = data || {};

  if (!id || !description) return jsonResponse({ error: 'Missing id or description' }, 400);

  await dbRun(
    env.DB,
    'INSERT INTO feedback_submissions (id, event_id, name, role, description) VALUES (?, ?, ?, ?, ?)',
    [id, event_id, name, role, description]
  );

  return jsonResponse({ success: true, id });
}

// ==========================================
// CUSTOMIZE HANDLERS
// ==========================================

async function handleGetCustomize(request, env) {
  const settings = await dbFirst(env.DB, 'SELECT primary_color, theme_name, logo_url, background_url FROM event_settings LIMIT 1');
  return jsonResponse(settings || {});
}

async function handlePutCustomize(request, env) {
  const data = await parseJson(request);
  const { primary_color, theme_name, logo_url, background_url } = data || {};

  await dbRun(
    env.DB,
    'UPDATE event_settings SET primary_color = ?, theme_name = ?, logo_url = ?, background_url = ? WHERE id = ?',
    [primary_color, theme_name, logo_url, background_url, 'set_001']
  );

  return jsonResponse({ success: true, updated: 1 });
}

async function handleGetFeedbackForm(request, env) {
  const settings = await dbFirst(
    env.DB,
    'SELECT feedback_heading, feedback_description, feedback_link, feedback_button_text, feedback_note FROM event_settings LIMIT 1'
  );
  return jsonResponse(settings || {});
}

// ==========================================
// ACTIVITY & CURRENT EVENT HANDLERS
// ==========================================

async function handleGetActivity(request, env) {
  const eventId = getQueryParam(request.url, 'event_id');

  const logs = await dbQuery(env.DB, 'SELECT * FROM activity_logs WHERE event_id = ? ORDER BY created_at DESC LIMIT 20', [
    eventId,
  ]);

  if (logs.results && logs.results.length > 0) {
    return jsonResponse(
      logs.results.map((row) => ({
        id: row.id,
        text: row.action_text,
        time: row.created_at,
        color: row.color_theme || 'primary',
      }))
    );
  }

  // Generate synthetic activity
  const checkedInResult = await dbFirst(env.DB, "SELECT COUNT(*) AS count FROM attendees WHERE event_id = ? AND status = 'Checked In'", [
    eventId,
  ]);
  const tournamentsResult = await dbFirst(env.DB, 'SELECT COUNT(*) AS count FROM tournaments WHERE event_id = ?', [eventId]);
  const brochuresResult = await dbFirst(env.DB, 'SELECT COUNT(*) AS count FROM brochures WHERE event_id = ?', [eventId]);
  const mapsResult = await dbFirst(env.DB, 'SELECT COUNT(*) AS count FROM venue_maps WHERE event_id = ?', [eventId]);
  const schedulesResult = await dbFirst(env.DB, 'SELECT COUNT(*) AS count FROM schedules WHERE event_id = ?', [eventId]);
  const announcementsResult = await dbFirst(env.DB, 'SELECT COUNT(*) AS count FROM announcements WHERE event_id = ?', [eventId]);

  const counts = {
    checkedIn: checkedInResult?.count || 0,
    tournaments: tournamentsResult?.count || 0,
    brochures: brochuresResult?.count || 0,
    maps: mapsResult?.count || 0,
    schedules: schedulesResult?.count || 0,
    announcements: announcementsResult?.count || 0,
  };

  const generated = [
    {
      id: `${eventId}_activity_checkedin`,
      text: `${counts.checkedIn} participants successfully checked in`,
      time: 'Current event',
      color: 'success',
    },
    {
      id: `${eventId}_activity_tournaments`,
      text: `${counts.tournaments} tournaments scheduled`,
      time: 'Current event',
      color: 'warning',
    },
    {
      id: `${eventId}_activity_schedules`,
      text: `${counts.schedules} schedule items configured`,
      time: 'Current event',
      color: 'primary',
    },
    {
      id: `${eventId}_activity_assets`,
      text: `${counts.brochures} brochures and ${counts.maps} maps currently live`,
      time: 'Current event',
      color: 'primary',
    },
  ];

  return jsonResponse(generated);
}

async function handleGetCurrentEventForGuests(request, env) {
  const eventId = await getCurrentEventForGuests(env);
  const event = await dbFirst(env.DB, 'SELECT * FROM events WHERE id = ?', [eventId]);

  return jsonResponse({
    event_id: eventId,
    event: event || null,
  });
}

async function handleSetCurrentEventForGuests(request, env) {
  const data = await parseJson(request);
  const { event_id } = data || {};

  if (event_id) {
    // Store in a KV namespace (if available) or use a simpler approach
    // For now, we'll store this in environment state
    await env.KV.put('current_event_for_guests', event_id);
  }

  const current = await getCurrentEventForGuests(env);
  return jsonResponse({ event_id: current });
}

async function getCurrentEventForGuests(env) {
  if (env.KV) {
    const stored = await env.KV.get('current_event_for_guests');
    if (stored) return stored;
  }
  return 'e_001';
}

// ==========================================
// FILE UPLOAD (R2)
// ==========================================

async function handleFileUpload(request, env) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return jsonResponse({ error: 'No file uploaded' }, 400);
    }

    const buffer = await file.arrayBuffer();
    const filename = `image_${Date.now()}_${file.name}`;

    // Upload to R2
    await env.UPLOADS.put(filename, buffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // Return public URL (you'll need to set up a custom domain for R2)
    const imageUrl = `https://${env.R2_DOMAIN || 'your-r2-domain.com'}/${filename}`;

    return jsonResponse({ url: imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return jsonResponse({ error: error.message }, 500);
  }
}
