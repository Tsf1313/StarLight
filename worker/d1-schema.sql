-- EventFlow D1 Schema Migration
-- Copy-paste this entire contents into Cloudflare D1 console or use wrangler d1 execute

-- 1. Core Event Table
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date_range VARCHAR(100),
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customization & Feedback Configuration (1-to-1 with Event)
CREATE TABLE IF NOT EXISTS event_settings (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50) REFERENCES events(id) ON DELETE CASCADE,
    primary_color VARCHAR(20) DEFAULT '#3b82f6',
    theme_name VARCHAR(50) DEFAULT 'light',
    feedback_heading VARCHAR(255) DEFAULT 'How was your experience?',
    feedback_description TEXT,
    feedback_link TEXT,
    feedback_button_text VARCHAR(100) DEFAULT 'Open Feedback Form',
    feedback_note TEXT,
    logo_url TEXT,
    background_url TEXT
);

-- 3. Attendees (Many-to-1 with Event)
CREATE TABLE IF NOT EXISTS attendees (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50) REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Absent',
    ticket_type VARCHAR(50),
    registration_source VARCHAR(100),
    check_in_time TIMESTAMP
);

-- 4. Tournaments (Many-to-1 with Event)
CREATE TABLE IF NOT EXISTS tournaments (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50) REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Upcoming',
    preview_type VARCHAR(50) DEFAULT 'bracket',
    external_url TEXT,
    format VARCHAR(50) DEFAULT 'bracket',
    bracket_data TEXT
);

-- 5. Brochures / Digital Files (Many-to-1 with Event)
CREATE TABLE IF NOT EXISTS brochures (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50) REFERENCES events(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_url TEXT NOT NULL,
    description TEXT,
    size_bytes INTEGER
);

-- 6. Venue Maps (Many-to-1 with Event)
CREATE TABLE IF NOT EXISTS venue_maps (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50) REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255),
    image_url TEXT NOT NULL,
    zones TEXT
);

-- 7. Event Schedule (Many-to-1 with Event)
CREATE TABLE IF NOT EXISTS schedules (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50) REFERENCES events(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    session_time TIMESTAMP,
    status VARCHAR(50) DEFAULT 'upcoming'
);

-- 8. Live Announcements (Many-to-1 with Event)
CREATE TABLE IF NOT EXISTS announcements (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50) REFERENCES events(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_urgent BOOLEAN DEFAULT 0,
    posted_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Internal Feedback Submissions (Many-to-1 with Event)
CREATE TABLE IF NOT EXISTS feedback_submissions (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50) REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255),
    role VARCHAR(50),
    description TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Dashboard Activity Logs (Many-to-1 with Event)
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50) REFERENCES events(id) ON DELETE CASCADE,
    action_text TEXT NOT NULL,
    icon_type VARCHAR(50),
    color_theme VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Host Authentication
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default event settings if not exist
-- Note: This requires an event with id 'e_001' to exist first
-- INSERT OR IGNORE INTO event_settings (id, event_id) VALUES ('set_001', 'e_001');
