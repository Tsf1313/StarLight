# EventFlow Backend Integration Guide

This document outlines the frontend architecture and provides a comprehensive guide for backend developers to safely replace the frontend mock-data layer with real API endpoints.

## Architecture Overview

The EventFlow front-end uses React (via Vite) and is cleanly separated into three main areas:
1. **Landing/Auth (`src/pages/landing`, `src/pages/auth`)**: Public facing pages.
2. **Host Dashboard (`src/pages/host`)**: Desktop-first administration panels.
3. **Guest App (`src/pages/guest`)**: Mobile-first progressive experience for event attendees.

To streamline frontend design and UX work, a centralized "mock database" pattern was used. This prevents prop-drilling errors and acts perfectly as a 1:1 blueprint for your future RESTful API endpoints or GraphQL schemas.

## The Mock Data Layer (`src/data/mockData.js`)

All pages across the entire application fetch their initial state from `src/data/mockData.js`. 

**To convert this project to use a live backend:**
1. You do not need to rewrite the UI components.
2. Create frontend API services (e.g., using `axios` or `fetch` in a `src/services/api.js` file).
3. Inside the `useEffect` hooks of the various pages, replace the static imports from `mockData.js` with your API calls, and update the React `useState` hooks using the response payload.

### Required Database Models / Schemas

Based on the structure of `mockData.js`, the backend will need to support the following minimal entity schemas:

#### 1. "Event" Entity
- `id` (String/UUID)
- `title` (String)
- `dateRange` (String or Date range)
- `location` (String)
- `status` (Enum: 'Active', 'Upcoming', 'Completed')

#### 2. "Attendee" Entity
- `id` (String/UUID)
- `name` (String)
- `email` (String)
- `status` (Enum: 'Checked In', 'Absent')
- `time` (String/Timestamp)
- `type` (Enum: 'VIP Pass', 'Standard')
- `source` (String)

#### 3. "Tournament" Entity
- `id` (Number/UUID)
- `name` (String)
- `status` (Enum: 'Live', 'Upcoming', 'Completed')
- `format` (String, e.g., 'bracket')
- `participants` (Array of Strings/IDs)
- `matches` (Object grouping rounds, e.g., `q1`, `s1`, `f1` containing teams and scores)

#### 4. "BrochureFile" Entity
- `id` (Number/UUID)
- `name` (String)
- `size` (Number - bytes)
- `type` (String - MimeType)
- `url` (String - Bucket or CDN URL)
- `info` (String - description)

#### 5. "VenueMap" & "Zone" Entities
- `id` (Number/UUID)
- `name` (String, e.g., "Main Floor")
- `image` (String - URL to floorplan image)
- `zones` (Array of Objects):
  - `id` (Number/UUID)
  - `name` (String)
  - `color` (String - Hex)
  - `x` (Number - percentage)
  - `y` (Number - percentage)

#### 6. "Announcement" & "Schedule"
Both the Guest layout and Host layout read and write to announcements and event schedules. The backend must provide CRUD operations mapping them to individual `Events`.

## Checklist for Backend Developers
- [ ] Connect Authentication (replace placeholder auth in `LoginPage.jsx` and `RegisterPage.jsx`).
- [ ] Implement robust file uploads (replace the simulated `setTimeout` file upload in `BrochurePage.jsx` with real `FormData` POST requests to your server/S3 bucket).
- [ ] Provide WebSocket or Polling endpoints if you wish to keep the `GuestTournamentPage.jsx` "Live Match" score tracking fully real-time.
- [ ] Finally, you can safely delete `src/data/mockData.js` once all UI components derive their `useState` hooks natively via API context.
