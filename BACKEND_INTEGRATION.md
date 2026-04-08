# EventFlow Backend Integration Guide

This document outlines the frontend architecture and provides a smooth integration path for backend developers to replace the frontend mock-data layer with real API endpoints.

## Architecture Overview

The EventFlow front-end uses React (via Vite) with clean separation between:
1. **Landing/Auth (`src/pages/landing`, `src/pages/auth`)**: Public pages and auth flows.
2. **Host Dashboard (`src/pages/host`)**: Desktop-first admin panels.
3. **Guest App (`src/pages/guest`)**: Mobile-first attendee experience.

The current implementation uses a centralized mock-data module at `src/data/mockData.js`. That file is intentionally a blueprint for backend API contracts and database models.

## What Backend Developers Should Do

### 1. Keep UI components intact
No React page files need a full rewrite. The front-end already expects data in a format that maps directly to API responses.

### 2. Add a frontend API service
Create `src/services/api.js` or `src/services/apiClient.js` and expose functions such as:
- `getEvents()`
- `getAttendees()`
- `getTournaments()`
- `getBrochureFiles()`
- `getVenueMaps()`
- `getFeedbackFormConfig()`
- `saveFeedbackFormConfig(config)`
- `login(credentials)`
- `register(data)`

Use `fetch` or `axios` to call backend endpoints and return JSON payloads.

### 3. Replace mock-data imports with API calls
In the pages that currently use `mockData.js`, change the page lifecycle to use `useEffect` and `useState`:
- call the API service on mount
- set state with the response
- preserve the same data shapes as the existing mock object

This means the UI will behave correctly without additional structural changes.

## Suggested API Contracts

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register`

Payloads should return a user object and session token (or set cookie).

### Host Dashboard
- `GET /api/dashboard/events`
- `GET /api/dashboard/attendance`
- `GET /api/dashboard/tournaments`
- `GET /api/dashboard/brochure`
- `GET /api/dashboard/venue-maps`
- `GET /api/dashboard/feedback-form`
- `POST /api/dashboard/feedback-form`
- `GET /api/dashboard/customize`

### Guest App
- `GET /api/guest/home`
- `GET /api/guest/brochure`
- `GET /api/guest/map`
- `GET /api/guest/tournament`
- `GET /api/guest/feedback`

## Data Model Summary

### Event
- `id` (string, UUID)
- `title` (string)
- `dateRange` (string)
- `location` (string)
- `status` (string)

### Attendee
- `id` (string)
- `name` (string)
- `email` (string)
- `status` (string)
- `time` (string)
- `type` (string)
- `source` (string)

### Tournament
- `id` (string)
- `name` (string)
- `status` (string)
- `format` (string)
- `participants` (array of strings)
- `matches` (object)

### Brochure File
- `id` (string)
- `name` (string)
- `size` (number)
- `type` (string)
- `url` (string)
- `info` (string)

### Venue Map
- `id` (string)
- `name` (string)
- `image` (string)
- `zones` (array)
  - `id` (string)
  - `name` (string)
  - `color` (string)
  - `x` (number)
  - `y` (number)

### Feedback Form Configuration
- `heading` (string)
- `description` (string)
- `link` (string)
- `buttonText` (string)
- `note` (string)

## Practical Backend Integration Steps

1. Start by wiring the auth endpoints used by `LoginPage.jsx` and `RegisterPage.jsx`.
2. Replace `mockData` page imports in host/guest pages with API calls.
3. Use a single shared `apiClient` for headers, auth tokens, and response parsing.
4. Keep the original mock shapes while backend integration is in progress.
5. When APIs are stable, remove `src/data/mockData.js` and any direct static imports.

## Backend Developer Checklist
- [ ] Implement auth endpoints and session handling.
- [ ] Create endpoints for event and attendee data.
- [ ] Create endpoints for tournament data and live status.
- [ ] Add brochure file CRUD and file upload support.
- [ ] Add venue map data and zone metadata.
- [ ] Add a feedback form configuration endpoint.
- [ ] Use localStorage or persistent storage for saved host form settings.
- [ ] Keep payloads consistent with the existing mock data shapes.
- [ ] Test pages by swapping one API call at a time.

## Notes for a Smooth Handoff

- The front-end is intentionally decoupled from any backend implementation.
- Backend should return clean JSON that matches the current mock data structure.
- Frontend components expect arrays and objects, not nested wrappers.
- Use the existing `mockData.js` file as the canonical payload reference during integration.

Once these backend endpoints are live, the front-end will switch to real data with minimal UI changes.
