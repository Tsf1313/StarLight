# EventFlow Cloudflare Worker API Reference

Complete API endpoint documentation after migration to Cloudflare Workers.

## Base URL
**Production:** `https://api.eventflow.hamstersame.org`  
**Development:** `http://localhost:3000`

All endpoints return JSON. Errors include error message in response body.

---

## Authentication

### POST /api/auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "u_123456789",
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```

**Error (401):**
```json
{
  "message": "Invalid email or password"
}
```

---

### POST /api/auth/register
Register a new user account.

**Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepass123"
}
```

**Response (200):**
```json
{
  "message": "Registration successful",
  "user": {
    "id": "u_987654321",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

---

## Events

### GET /api/events
List all events.

**Response (200):**
```json
[
  {
    "id": "e_001",
    "title": "Summer Tech Conference",
    "date_range": "2024-07-15 to 2024-07-17",
    "location": "San Francisco, CA",
    "status": "Upcoming",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### POST /api/events
Create a new event.

**Request:**
```json
{
  "id": "e_summer2024",
  "title": "Summer Tech Conference",
  "date_range": "2024-07-15 to 2024-07-17",
  "location": "San Francisco, CA",
  "status": "Upcoming"
}
```

**Response (200):**
```json
{
  "success": true,
  "id": "e_summer2024"
}
```

---

### PUT /api/events/:id
Update an event.

**Request:**
```json
{
  "title": "Updated Title",
  "status": "Active"
}
```

**Response (200):**
```json
{
  "success": true
}
```

---

### DELETE /api/events/:id
Delete an event (cascade deletes all related data).

**Response (200):**
```json
{
  "success": true,
  "deleted": "e_summer2024"
}
```

---

## Attendance

### GET /api/dashboard/attendance?event_id=e_001
Get attendees for an event.

**Response (200):**
```json
[
  {
    "id": "att_001",
    "event_id": "e_001",
    "name": "John Attendee",
    "email": "john@example.com",
    "status": "Checked In",
    "ticket_type": "Premium",
    "registration_source": "Website",
    "check_in_time": "2024-07-15T09:30:00Z"
  }
]
```

---

### POST /api/dashboard/attendance
Create a new attendee.

**Request:**
```json
{
  "id": "att_002",
  "event_id": "e_001",
  "name": "Jane Guest",
  "email": "jane@example.com",
  "status": "Registered",
  "ticket_type": "Standard",
  "registration_source": "Email"
}
```

**Response (200):**
```json
{
  "success": true,
  "id": "att_002"
}
```

---

### PATCH /api/dashboard/attendance/:id
Quick status update (primarily for check-in).

**Request:**
```json
{
  "status": "Checked In",
  "event_id": "e_001"
}
```

---

### PUT /api/dashboard/attendance/:id
Full attendee details update.

**Request:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "status": "Checked In",
  "ticket_type": "VIP",
  "registration_source": "Website",
  "check_in_time": "2024-07-15T09:30:00Z",
  "event_id": "e_001"
}
```

---

## Tournaments

### GET /api/dashboard/tournaments?event_id=e_001
Get tournaments for an event.

**Response (200):**
```json
[
  {
    "id": "t_001",
    "event_id": "e_001",
    "name": "Esports Championship",
    "status": "Active",
    "preview_type": "bracket",
    "format": "bracket",
    "bracket_data": { "teams": [...] },
    "external_url": null
  }
]
```

---

### POST /api/dashboard/tournaments
Create a tournament.

**Request:**
```json
{
  "id": "t_002",
  "event_id": "e_001",
  "name": "Gaming Tournament",
  "status": "Upcoming",
  "preview_type": "bracket",
  "format": "bracket",
  "bracket_data": {}
}
```

---

### PUT /api/dashboard/tournaments/:id
Update tournament.

**Request:**
```json
{
  "name": "Updated Tournament",
  "status": "Active",
  "bracket_data": {...},
  "event_id": "e_001"
}
```

---

## Schedules

### GET /api/dashboard/schedules?event_id=e_001
Get event schedule.

**Response (200):**
```json
[
  {
    "id": "sch_001",
    "event_id": "e_001",
    "title": "Opening Keynote",
    "location": "Main Hall",
    "session_time": "2024-07-15T09:00:00Z",
    "status": "upcoming"
  }
]
```

---

### POST /api/dashboard/schedules
Create schedule item.

**Request:**
```json
{
  "id": "sch_002",
  "event_id": "e_001",
  "title": "Lunch Break",
  "location": "Cafeteria",
  "session_time": "2024-07-15T12:00:00Z",
  "status": "upcoming"
}
```

---

### PUT /api/dashboard/schedules/:id
Update schedule item.

---

### DELETE /api/dashboard/schedules/:id?event_id=e_001
Delete schedule item.

---

## Brochures (Digital Files)

### GET /api/dashboard/brochure?event_id=e_001
Get brochures for event.

**Response (200):**
```json
[
  {
    "id": "br_001",
    "event_id": "e_001",
    "file_name": "agenda.pdf",
    "file_type": "pdf",
    "file_url": "https://r2-domain.com/agenda.pdf",
    "description": "Event agenda",
    "size_bytes": 2048000
  }
]
```

---

### PUT /api/dashboard/brochure/replace
Replace all brochures for an event.

**Request:**
```json
{
  "event_id": "e_001",
  "brochures": [
    {
      "id": "br_001",
      "file_name": "agenda.pdf",
      "file_type": "pdf",
      "file_url": "...",
      "description": "Event agenda",
      "size_bytes": 2048000
    }
  ]
}
```

---

## Venue Maps

### GET /api/dashboard/venue-maps?event_id=e_001
Get venue maps for event.

**Response (200):**
```json
[
  {
    "id": "vm_001",
    "event_id": "e_001",
    "name": "Main Floor Map",
    "image_url": "https://r2-domain.com/map.png",
    "zones": [
      { "id": "z1", "name": "Booth A", "coordinates": [...] }
    ]
  }
]
```

---

### PUT /api/dashboard/venue-maps/replace
Replace all venue maps for an event.

---

## Announcements

### GET /api/dashboard/announcements?event_id=e_001
Get announcements for event.

**Response (200):**
```json
[
  {
    "id": "ann_001",
    "event_id": "e_001",
    "message": "Welcome to the event!",
    "is_urgent": false,
    "posted_time": "2024-07-15T08:00:00Z"
  }
]
```

---

### PUT /api/dashboard/announcements/replace
Replace all announcements for an event.

---

## Customization

### GET /api/dashboard/customize
Get dashboard customization settings.

**Response (200):**
```json
{
  "primary_color": "#3b82f6",
  "theme_name": "light",
  "logo_url": "https://...",
  "background_url": "https://..."
}
```

---

### PUT /api/dashboard/customize
Update customization settings.

**Request:**
```json
{
  "primary_color": "#ff0000",
  "theme_name": "dark",
  "logo_url": "https://...",
  "background_url": "https://..."
}
```

---

## Guest Endpoints

All guest endpoints use the currently selected event for guests (set via `/api/events/current-for-guests`).

### GET /api/guest/schedule
Guest view of event schedule.

### GET /api/guest/announcements
Guest view of announcements.

### GET /api/guest/brochure
Guest view of brochures.

### GET /api/guest/venue-maps
Guest view of venue maps.

### GET /api/guest/tournaments
Guest view of tournaments.

### POST /api/guest/feedback
Submit guest feedback.

**Request:**
```json
{
  "id": "fb_001",
  "event_id": "e_001",
  "name": "Guest Name",
  "role": "Attendee",
  "description": "Great event!"
}
```

---

## Current Event for Guests

### GET /api/events/current-for-guests
Get currently selected event for guest view.

**Response (200):**
```json
{
  "event_id": "e_001",
  "event": {
    "id": "e_001",
    "title": "Summer Tech Conference",
    ...
  }
}
```

---

### PUT /api/events/current-for-guests
Set which event is shown to guests.

**Request:**
```json
{
  "event_id": "e_002"
}
```

---

## Dashboard Activity

### GET /api/dashboard/activity?event_id=e_001
Get activity/metrics for event dashboard.

**Response (200):**
```json
[
  {
    "id": "activity_001",
    "text": "24 participants successfully checked in",
    "time": "Current event",
    "color": "success"
  }
]
```

---

## File Upload

### POST /api/upload
Upload file (image, document, etc.).

**Request:**
FormData with `file` field

**Response (200):**
```json
{
  "url": "https://r2-domain.com/image_1234567890_photo.jpg"
}
```

---

## Error Responses

All errors return appropriate HTTP status code with JSON body:

```json
{
  "error": "Error message description"
}
```

Common status codes:
- `200` - Success
- `400` - Bad request (missing fields, invalid input)
- `401` - Unauthorized (invalid credentials)
- `404` - Not found (event/resource doesn't exist)
- `500` - Server error (database, file system, etc.)

---

## Rate Limits

There are no hard rate limits on Cloudflare's free tier, but:
- Worker execution: 100,000 requests/day (free)
- D1: Unlimited (free tier)
- R2: 10GB/month free storage
- KV: 100,000 operations/day (free)

---

## CORS

All endpoints have CORS enabled for cross-origin requests.

Headers included:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Deployment Notes

- All dates/times stored in ISO 8601 format
- IDs are string-based, prefixed with type (e.g., `e_` for events, `att_` for attendees)
- JSON fields (bracket_data, zones) stored as TEXT in D1, parsed on retrieval
- File uploads stored in R2 bucket, URLs returned for frontend use

For more info, see **DEPLOYMENT.md** and **DEPLOYMENT_CHECKLIST.md**.
