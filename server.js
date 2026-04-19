import express from 'express';
import sqlite3Pkg from 'sqlite3';
import cors from 'cors';
import multer from 'multer'; // NEW
import path from 'path'; // NEW
import fs from 'fs'; // NEW
import { fileURLToPath } from 'url'; // NEW

// Setup for ES Modules directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize sqlite3 for ES Modules
const sqlite3 = sqlite3Pkg.verbose();
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
// Silence browser favicon requests
app.get('/favicon.ico', (req, res) => res.status(204).end());

// ==========================================
// FILE UPLOAD CONFIGURATION (Multer)
// ==========================================
// Ensure 'uploads' directory exists
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, 'uploads'));
}

// Allow frontend to view images in the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure how Multer saves files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        // Renames file to prevent overwriting (e.g., image_168492019.png)
        cb(null, 'image_' + Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage });

// The File Upload Endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    // Send back the URL where the image can be viewed
    const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
});

// Connect to the SQLite Database
const db = new sqlite3.Database('./eventflow.db', (err) => {
    if (err) console.error('Database connection error:', err.message);
    else console.log('Connected to eventflow.db');
});

// --- In-Memory State for Guests Current Event ---
let currentEventForGuests = { event_id: 'e_001' };

// --- Helper for JSON handling (SQLite stores JSON as text) ---
const parseJsonFields = (row, fields) => {
    fields.forEach(field => {
        if (row[field]) {
            try { row[field] = JSON.parse(row[field]); } 
            catch (e) { console.error(`Error parsing ${field}:`, e); }
        }
    });
    return row;
};

// ==========================================
// 1. AUTHENTICATION (Host Dashboard)
// ==========================================

// --- Authentication: Login ---
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT id, name, email FROM users WHERE email = ? AND password = ?", [email, password], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ message: "Invalid email or password" });
        res.json({ message: "Login successful", user });
    });
});

// --- Authentication: Sign Up (Register) ---
app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    
    // Generate a simple unique ID
    const id = 'u_' + Date.now(); 
    
    const sql = "INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)";
    
    db.run(sql, [id, name, email, password], function(err) {
        if (err) {
            // Error code 19 usually means the email already exists (UNIQUE constraint)
            if (err.message.includes('UNIQUE')) {
                return res.status(400).json({ message: "Email is already registered" });
            }
            return res.status(500).json({ error: err.message });
        }
        
        // Return the new user object (excluding password)
        res.json({ 
            message: "Registration successful", 
            user: { id, name, email } 
        });
    });
});

// ==========================================
// 2. EVENTS & SETTINGS
// ==========================================
app.get('/api/events', (req, res) => {
    db.all("SELECT * FROM events", [], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows);
    });
});

app.post('/api/events', (req, res) => {
    const { id, title, date_range, location, status } = req.body;
    const sql = `INSERT INTO events (id, title, date_range, location, status) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [id, title, date_range, location, status || 'Upcoming'], function(err) {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ success: true, id });
    });
});

app.put('/api/events/:id', (req, res, next) => {
    if (req.params.id === 'current-for-guests') {
        return next();
    }

    const eventId = req.params.id;
    const { title, date_range, location, status } = req.body;
    const sql = `UPDATE events SET title = ?, date_range = ?, location = ?, status = ? WHERE id = ?`;

    db.get('SELECT * FROM events WHERE id = ?', [eventId], (findErr, existing) => {
        if (findErr) return res.status(500).json({ error: findErr.message });
        if (!existing) return res.status(404).json({ error: 'Event not found' });

        const nextTitle = title ?? existing.title;
        const nextDateRange = date_range ?? existing.date_range;
        const nextLocation = location ?? existing.location;
        const nextStatus = status ?? existing.status;

        db.run(sql, [nextTitle, nextDateRange, nextLocation, nextStatus, eventId], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, updated: this.changes });
        });
    });
});

app.delete('/api/events/:id', (req, res) => {
    const eventId = req.params.id;

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

    db.serialize(() => {
        db.run('BEGIN TRANSACTION', (beginErr) => {
            if (beginErr) return res.status(500).json({ error: beginErr.message });

            const runDelete = (index) => {
                if (index >= deletes.length) {
                    return db.run('COMMIT', (commitErr) => {
                        if (commitErr) return res.status(500).json({ error: commitErr.message });

                        if (currentEventForGuests.event_id === eventId) {
                            return db.get('SELECT id FROM events ORDER BY created_at DESC LIMIT 1', [], (pickErr, row) => {
                                if (!pickErr) {
                                    currentEventForGuests.event_id = row?.id || 'e_001';
                                }
                                return res.json({ success: true, deleted: eventId });
                            });
                        }

                        return res.json({ success: true, deleted: eventId });
                    });
                }

                const [sql, params] = deletes[index];
                db.run(sql, params, (deleteErr) => {
                    if (deleteErr) {
                        return db.run('ROLLBACK', () => res.status(500).json({ error: deleteErr.message }));
                    }
                    runDelete(index + 1);
                });
            };

            runDelete(0);
        });
    });
});

// Updated: Now fetches logo and background
app.get('/api/dashboard/customize', (req, res) => {
    db.get("SELECT primary_color, theme_name, logo_url, background_url FROM event_settings LIMIT 1", [], (err, row) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(row || {});
    });
});

// New: Update Settings
app.put('/api/dashboard/customize', (req, res) => {
    const { primary_color, theme_name, logo_url, background_url } = req.body;
    
    const sql = `UPDATE event_settings 
                 SET primary_color = ?, theme_name = ?, logo_url = ?, background_url = ? 
                 WHERE id = 'set_001'`; // Updating our default settings row
                 
    db.run(sql, [primary_color, theme_name, logo_url, background_url], function(err) {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ success: true, updated: this.changes });
    });
});

app.get('/api/dashboard/feedback-form', (req, res) => {
    db.get("SELECT feedback_heading, feedback_description, feedback_link, feedback_button_text, feedback_note FROM event_settings LIMIT 1", [], (err, row) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(row);
    });
});

// ==========================================
// 3. ATTENDANCE MANAGEMENT
// ==========================================
app.get('/api/dashboard/attendance', (req, res) => {
    const eventId = req.query.event_id || 'e_001';
    db.all("SELECT * FROM attendees WHERE event_id = ?", [eventId], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows);
    });
});

// Add new participant
app.post('/api/dashboard/attendance', (req, res) => {
    const { id, event_id, name, email, status, ticket_type, registration_source, check_in_time } = req.body;
    const sql = `INSERT INTO attendees (id, event_id, name, email, status, ticket_type, registration_source, check_in_time) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [id, event_id, name, email, status, ticket_type, registration_source, check_in_time], function(err) {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ success: true, id: this.lastID });
    });
});

// Quick Status Update (Check-in)
app.patch('/api/dashboard/attendance/:id', (req, res) => {
    const { status, event_id } = req.body;
    const eventId = event_id || 'e_001';
    const time = status === 'Checked In' ? new Date().toLocaleString() : null;
    db.run("UPDATE attendees SET status = ?, check_in_time = ? WHERE id = ? AND event_id = ?", [status, time, req.params.id, eventId], function(err) {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ updated: this.changes });
    });
});

// Full Details Update (Edit Modal)
app.put('/api/dashboard/attendance/:id', (req, res) => {
    const { name, email, ticket_type, registration_source, status, check_in_time, event_id } = req.body;
    const eventId = event_id || 'e_001';
    const sql = `UPDATE attendees SET name = ?, email = ?, ticket_type = ?, registration_source = ?, status = ?, check_in_time = ? WHERE id = ? AND event_id = ?`;
    db.run(sql, [name, email, ticket_type, registration_source, status, check_in_time, req.params.id, eventId], function(err) {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ updated: this.changes });
    });
});

// ==========================================
// 4. TOURNAMENT MANAGEMENT
// ==========================================
// MOVE YOUR TOURNAMENT ROUTES DOWN HERE!
app.get('/api/dashboard/tournaments', (req, res) => {
    const eventId = req.query.event_id || 'e_001';
    db.all("SELECT * FROM tournaments WHERE event_id = ?", [eventId], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows.map(row => parseJsonFields(row, ['bracket_data'])));
    });
});

// Create new tournament
app.post('/api/dashboard/tournaments', (req, res) => {
    const { id, event_id, name, status, preview_type, external_url, format, bracket_data } = req.body;
    const sql = `INSERT INTO tournaments (id, event_id, name, status, preview_type, external_url, format, bracket_data) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [id, event_id || 'e_001', name, status, preview_type, external_url, format, JSON.stringify(bracket_data)], function(err) {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ success: true, id: this.lastID });
    });
});

// Update existing tournament
app.put('/api/dashboard/tournaments/:id', (req, res) => {
    const eventId = req.query.event_id || req.body.event_id || 'e_001';
    const { name, status, preview_type, external_url, format, bracket_data } = req.body;
    const sql = `UPDATE tournaments SET name = ?, status = ?, preview_type = ?, external_url = ?, format = ?, bracket_data = ? WHERE id = ? AND event_id = ?`;
    db.run(sql, [name, status, preview_type, external_url, format, JSON.stringify(bracket_data), req.params.id, eventId], function(err) {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ updated: this.changes });
    });
});

// Delete tournament
app.delete('/api/dashboard/tournaments/:id', (req, res) => {
    const eventId = req.query.event_id || 'e_001';
    db.run("DELETE FROM tournaments WHERE id = ? AND event_id = ?", [req.params.id, eventId], function(err) {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ deleted: this.changes });
    });
});

// ==========================================
// 4A. EVENT SCHEDULE MANAGEMENT
// ==========================================
app.get('/api/dashboard/schedules', (req, res) => {
    const eventId = req.query.event_id || 'e_001';
    db.all('SELECT * FROM schedules WHERE event_id = ? ORDER BY session_time ASC', [eventId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/dashboard/schedules', (req, res) => {
    const { id, event_id, title, location, session_time, status } = req.body;
    const sql = `INSERT INTO schedules (id, event_id, title, location, session_time, status)
                 VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [id, event_id || 'e_001', title, location, session_time, status || 'upcoming'], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: id || this.lastID });
    });
});

app.put('/api/dashboard/schedules/:id', (req, res) => {
    const eventId = req.query.event_id || req.body.event_id || 'e_001';
    const { title, location, session_time, status } = req.body;
    const sql = `UPDATE schedules
                 SET title = ?, location = ?, session_time = ?, status = ?
                 WHERE id = ? AND event_id = ?`;
    db.run(sql, [title, location, session_time, status || 'upcoming', req.params.id, eventId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ updated: this.changes });
    });
});

app.delete('/api/dashboard/schedules/:id', (req, res) => {
    const eventId = req.query.event_id || 'e_001';
    db.run('DELETE FROM schedules WHERE id = ? AND event_id = ?', [req.params.id, eventId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

// ==========================================
// 5 & 6. BROCHURES & VENUE MAPS
// ==========================================
app.get('/api/dashboard/brochure', (req, res) => {
    const eventId = req.query.event_id || 'e_001';
    db.all("SELECT * FROM brochures WHERE event_id = ?", [eventId], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows);
    });
});

app.put('/api/dashboard/brochure/replace', (req, res) => {
    const { event_id = 'e_001', brochures = [] } = req.body;
    db.run("DELETE FROM brochures WHERE event_id = ?", [event_id], (deleteErr) => {
        if (deleteErr) return res.status(500).json({ error: deleteErr.message });
        if (!brochures.length) return res.json({ success: true, replaced: 0 });

        const stmt = db.prepare(`INSERT INTO brochures (id, event_id, file_name, file_type, file_url, description, size_bytes)
                                 VALUES (?, ?, ?, ?, ?, ?, ?)`);

        let insertError = null;
        brochures.forEach((item) => {
            stmt.run(
                [item.id, event_id, item.file_name, item.file_type, item.file_url, item.description, item.size_bytes],
                (insertErr) => {
                    if (insertErr && !insertError) insertError = insertErr;
                }
            );
        });

        stmt.finalize((finalizeErr) => {
            if (insertError) return res.status(500).json({ error: insertError.message });
            if (finalizeErr) return res.status(500).json({ error: finalizeErr.message });
            res.json({ success: true, replaced: brochures.length });
        });
    });
});

app.get('/api/dashboard/venue-maps', (req, res) => {
    const eventId = req.query.event_id || 'e_001';
    db.all("SELECT * FROM venue_maps WHERE event_id = ?", [eventId], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows.map(row => parseJsonFields(row, ['zones'])));
    });
});

app.put('/api/dashboard/venue-maps/replace', (req, res) => {
    const { event_id = 'e_001', maps = [] } = req.body;
    db.run("DELETE FROM venue_maps WHERE event_id = ?", [event_id], (deleteErr) => {
        if (deleteErr) return res.status(500).json({ error: deleteErr.message });
        if (!maps.length) return res.json({ success: true, replaced: 0 });

        const stmt = db.prepare(`INSERT INTO venue_maps (id, event_id, name, image_url, zones)
                                 VALUES (?, ?, ?, ?, ?)`);

        let insertError = null;
        maps.forEach((item) => {
            stmt.run(
                [item.id, event_id, item.name, item.image_url, JSON.stringify(item.zones || [])],
                (insertErr) => {
                    if (insertErr && !insertError) insertError = insertErr;
                }
            );
        });

        stmt.finalize((finalizeErr) => {
            if (insertError) return res.status(500).json({ error: insertError.message });
            if (finalizeErr) return res.status(500).json({ error: finalizeErr.message });
            res.json({ success: true, replaced: maps.length });
        });
    });
});

app.get('/api/dashboard/announcements', (req, res) => {
    const eventId = req.query.event_id || 'e_001';
    db.all("SELECT * FROM announcements WHERE event_id = ? ORDER BY posted_time DESC", [eventId], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows);
    });
});

app.put('/api/dashboard/announcements/replace', (req, res) => {
    const { event_id = 'e_001', announcements = [] } = req.body;
    db.run("DELETE FROM announcements WHERE event_id = ?", [event_id], (deleteErr) => {
        if (deleteErr) return res.status(500).json({ error: deleteErr.message });
        if (!announcements.length) return res.json({ success: true, replaced: 0 });

        const stmt = db.prepare(`INSERT INTO announcements (id, event_id, message, is_urgent)
                                 VALUES (?, ?, ?, ?)`);

        let insertError = null;
        announcements.forEach((item) => {
            stmt.run(
                [item.id, event_id, item.message, item.is_urgent ? 1 : 0],
                (insertErr) => {
                    if (insertErr && !insertError) insertError = insertErr;
                }
            );
        });

        stmt.finalize((finalizeErr) => {
            if (insertError) return res.status(500).json({ error: insertError.message });
            if (finalizeErr) return res.status(500).json({ error: finalizeErr.message });
            res.json({ success: true, replaced: announcements.length });
        });
    });
});

// ==========================================
// 7 & 8. SCHEDULE & ANNOUNCEMENTS (Guest)
// ==========================================
app.get('/api/guest/schedule', (req, res) => {
    const eventId = currentEventForGuests.event_id || 'e_001';
    db.all("SELECT * FROM schedules WHERE event_id = ? ORDER BY session_time ASC", [eventId], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows);
    });
});

app.get('/api/guest/announcements', (req, res) => {
    const eventId = currentEventForGuests.event_id || 'e_001';
    db.all("SELECT * FROM announcements WHERE event_id = ? ORDER BY posted_time DESC", [eventId], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows);
    });
});

app.get('/api/guest/brochure', (req, res) => {
    const eventId = currentEventForGuests.event_id || 'e_001';
    db.all("SELECT * FROM brochures WHERE event_id = ?", [eventId], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows);
    });
});

app.get('/api/guest/venue-maps', (req, res) => {
    const eventId = currentEventForGuests.event_id || 'e_001';
    db.all("SELECT * FROM venue_maps WHERE event_id = ?", [eventId], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows.map(row => parseJsonFields(row, ['zones'])));
    });
});

app.get('/api/guest/tournaments', (req, res) => {
    const eventId = currentEventForGuests.event_id || 'e_001';
    db.all("SELECT * FROM tournaments WHERE event_id = ?", [eventId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows.map(row => parseJsonFields(row, ['bracket_data'])));
    });
});

// ==========================================
// 9. FEEDBACK SUBMISSIONS
// ==========================================
app.post('/api/guest/feedback', (req, res) => {
    const { id, event_id, name, role, description } = req.body;
    const sql = "INSERT INTO feedback_submissions (id, event_id, name, role, description) VALUES (?, ?, ?, ?, ?)";
    db.run(sql, [id, event_id, name, role, description], function(err) {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ success: true, id: this.lastID });
    });
});

// ==========================================
// 10. ACTIVITY LOGS
// ==========================================
app.get('/api/dashboard/activity', (req, res) => {
    const eventId = req.query.event_id || 'e_001';
    db.all("SELECT * FROM activity_logs WHERE event_id = ? ORDER BY created_at DESC LIMIT 20", [eventId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        if (rows && rows.length > 0) {
            return res.json(rows.map((row) => ({
                id: row.id,
                text: row.action_text,
                time: row.created_at,
                color: row.color_theme || 'primary',
            })));
        }

        const counts = {
            checkedIn: 0,
            tournaments: 0,
            brochures: 0,
            maps: 0,
            schedules: 0,
            announcements: 0,
        };

        db.get("SELECT COUNT(*) AS count FROM attendees WHERE event_id = ? AND status = 'Checked In'", [eventId], (e1, r1) => {
            if (e1) return res.status(500).json({ error: e1.message });
            counts.checkedIn = r1?.count || 0;

            db.get("SELECT COUNT(*) AS count FROM tournaments WHERE event_id = ?", [eventId], (e2, r2) => {
                if (e2) return res.status(500).json({ error: e2.message });
                counts.tournaments = r2?.count || 0;

                db.get("SELECT COUNT(*) AS count FROM brochures WHERE event_id = ?", [eventId], (e3, r3) => {
                    if (e3) return res.status(500).json({ error: e3.message });
                    counts.brochures = r3?.count || 0;

                    db.get("SELECT COUNT(*) AS count FROM venue_maps WHERE event_id = ?", [eventId], (e4, r4) => {
                        if (e4) return res.status(500).json({ error: e4.message });
                        counts.maps = r4?.count || 0;

                        db.get("SELECT COUNT(*) AS count FROM schedules WHERE event_id = ?", [eventId], (e5, r5) => {
                            if (e5) return res.status(500).json({ error: e5.message });
                            counts.schedules = r5?.count || 0;

                            db.get("SELECT COUNT(*) AS count FROM announcements WHERE event_id = ?", [eventId], (e6, r6) => {
                                if (e6) return res.status(500).json({ error: e6.message });
                                counts.announcements = r6?.count || 0;

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

                                return res.json(generated);
                            });
                        });
                    });
                });
            });
        });
    });
});

// ==========================================
// 11. CURRENT EVENT FOR GUESTS
// ==========================================
app.get('/api/events/current-for-guests', (req, res) => {
    db.get('SELECT * FROM events WHERE id = ?', [currentEventForGuests.event_id || 'e_001'], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
            event_id: currentEventForGuests.event_id || 'e_001',
            event: row || null,
        });
    });
});

app.put('/api/events/current-for-guests', (req, res) => {
    const { event_id } = req.body;
    if (event_id) {
        currentEventForGuests.event_id = event_id;
    }
    res.json(currentEventForGuests);
});

// --- Boot Server ---
app.listen(port, () => {
    console.log(`🚀 EventFlow Backend active at http://localhost:${port}`);
});