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
    db.all("SELECT * FROM attendees", [], (err, rows) => {
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
    const { status } = req.body;
    const time = status === 'Checked In' ? new Date().toLocaleString() : null;
    db.run("UPDATE attendees SET status = ?, check_in_time = ? WHERE id = ?", [status, time, req.params.id], function(err) {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ updated: this.changes });
    });
});

// Full Details Update (Edit Modal)
app.put('/api/dashboard/attendance/:id', (req, res) => {
    const { name, email, ticket_type, registration_source, status, check_in_time } = req.body;
    const sql = `UPDATE attendees SET name = ?, email = ?, ticket_type = ?, registration_source = ?, status = ?, check_in_time = ? WHERE id = ?`;
    db.run(sql, [name, email, ticket_type, registration_source, status, check_in_time, req.params.id], function(err) {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ updated: this.changes });
    });
});

// ==========================================
// 4. TOURNAMENT MANAGEMENT
// ==========================================
app.get('/api/dashboard/tournaments', (req, res) => {
    db.all("SELECT * FROM tournaments", [], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows.map(row => parseJsonFields(row, ['bracket_data'])));
    });
});

// Create new tournament
app.post('/api/dashboard/tournaments', (req, res) => {
    const { id, event_id, name, status, preview_type, external_url, format, bracket_data } = req.body;
    const sql = `INSERT INTO tournaments (id, event_id, name, status, preview_type, external_url, format, bracket_data) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [id, event_id, name, status, preview_type, external_url, format, JSON.stringify(bracket_data)], function(err) {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ success: true, id: this.lastID });
    });
});

// Update existing tournament
app.put('/api/dashboard/tournaments/:id', (req, res) => {
    const { name, status, preview_type, external_url, format, bracket_data } = req.body;
    const sql = `UPDATE tournaments SET name = ?, status = ?, preview_type = ?, external_url = ?, format = ?, bracket_data = ? WHERE id = ?`;
    db.run(sql, [name, status, preview_type, external_url, format, JSON.stringify(bracket_data), req.params.id], function(err) {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ updated: this.changes });
    });
});

// ==========================================
// 5 & 6. BROCHURES & VENUE MAPS
// ==========================================
app.get('/api/dashboard/brochure', (req, res) => {
    db.all("SELECT * FROM brochures", [], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows);
    });
});

app.get('/api/dashboard/venue-maps', (req, res) => {
    db.all("SELECT * FROM venue_maps", [], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows.map(row => parseJsonFields(row, ['zones'])));
    });
});

// ==========================================
// 7 & 8. SCHEDULE & ANNOUNCEMENTS (Guest)
// ==========================================
app.get('/api/guest/schedule', (req, res) => {
    db.all("SELECT * FROM schedules ORDER BY session_time ASC", [], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows);
    });
});

app.get('/api/guest/announcements', (req, res) => {
    db.all("SELECT * FROM announcements ORDER BY posted_time DESC", [], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows);
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
    db.all("SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 15", [], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows);
    });
});

// --- Boot Server ---
app.listen(port, () => {
    console.log(`🚀 EventFlow Backend active at http://localhost:${port}`);
});