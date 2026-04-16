🏆 EventFlow: Database & Operations Handover Guide

This document provides the technical details and operational instructions for the current state of the EventFlow project. It is intended for teammates taking over development.
🚀 1. How to Run the Project

EventFlow requires both the Backend (Node.js/SQLite) and Frontend (Vite/React) to be running simultaneously.
Step 1: Start the Backend

    Open a terminal in the project root.

    Run: node server.js

    What happens: The server initializes eventflow.db (SQLite). If the file is missing, it creates it and builds the customization and tournaments tables automatically. It also monitors the uploads/ folder for images.

Step 2: Start the Frontend

    Open a second terminal.

    Run: npm run dev

    What happens: Launches the React application. It will attempt to communicate with the backend at http://localhost:5000.

🛠️ 2. The Database Architecture
SQLite & JSON Storage

We use SQLite (eventflow.db) for its simplicity—it is a single file and requires no external setup.

    Relational Data: Standard fields like primary_color or status are stored in columns.

    Complex Data (JSON): The tournament bracket (teams, scores, matchups) is stored as a JSON string in the bracket_data column. This allows us to save complex nested objects without needing a complicated table structure.

The API Bridge (src/services/api.js)

All communication with the database happens through this file.

    Rule: Do not write fetch() calls inside your components. Use the api object.

    Example: const data = await api.getTournaments();

✅ 3. Features Implemented
🎨 Customization & Global Theming

    Host Dashboard: Allows uploading a logo and background image, and picking a primary theme color.

    Backend: Uses Multer to save physical files into the uploads/ directory and stores the file paths in the DB.

    Global Injection: GuestLayout.jsx fetches the theme on load and injects the primary_color into a CSS variable: --theme-primary.

    Usage: You can use var(--theme-primary) in any CSS/Module file to stay synced with the host's branding.

🎮 Tournament Management

    Dual-Mode Support:

        Internal Bracket: Managed directly in the app. Hosts can update scores for Quarter-Finals, Semi-Finals, and Finals.

        External Link: Hosts can paste a link to Challonge/Smash.gg. The guest app will detect this and show an "Open Website" button instead of a bracket.

    Live Updates: The Guest view is fully synchronized with the database; any score saved in the Host dashboard reflects instantly for the Guest.

📂 4. Critical File Map
File Path	Role

server.js	The Backend server. 
Manages DB connection and file uploads.

src/services/api.js	The Bridge. 
Contains all functions for talking to the DB.

src/components/guest/GuestLayout.jsx	The Theme Manager. 
Fetches and distributes the custom branding.

src/pages/host/TournamentPage.jsx	
Host-side bracket and tournament editor.

src/pages/guest/GuestTournamentPage.jsx	
Guest-side live bracket/link viewer.

eventflow.db	
The actual database file (SQLite).

uploads/	
Folder containing all user-uploaded logos and images.

⚠️ 5. Important Notes for Teammates

    .gitignore: Ensure eventflow.db and the uploads/ folder are in your .gitignore. We should not be pushing our local database files to GitHub, as it will overwrite each other's work.(for when deploying only as currently the database is still being hosted locally so just push everything)

    Schema Changes: If you need to add a new table or column, you must update the CREATE TABLE query at the top of server.js.

    Image Paths: If images aren't loading, check if the uploads folder exists in your project root. The server needs this folder to save files.