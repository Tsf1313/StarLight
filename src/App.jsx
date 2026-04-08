import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts (TBD)
import HostLayout from './components/host/HostLayout';
import GuestLayout from './components/guest/GuestLayout';

// Landing & Auth
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Host Pages
import DashboardOverview from './pages/host/DashboardOverview';
import BrochurePage from './pages/host/BrochurePage';
import VenueMapPage from './pages/host/VenueMapPage';
import CustomizePage from './pages/host/CustomizePage';
import AttendancePage from './pages/host/AttendancePage';
import TournamentPage from './pages/host/TournamentPage';

// Guest Pages
import GuestHomePage from './pages/guest/GuestHomePage';
import GuestTournamentPage from './pages/guest/GuestTournamentPage';
import GuestBrochurePage from './pages/guest/GuestBrochurePage';
import GuestVenueMapPage from './pages/guest/GuestVenueMapPage';
import GuestFeedbackPage from './pages/guest/GuestFeedbackPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Host Dashboard Routes */}
        <Route path="/dashboard" element={<HostLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="tournament" element={<TournamentPage />} />
          <Route path="brochure" element={<BrochurePage />} />
          <Route path="venue-map" element={<VenueMapPage />} />
          <Route path="customize" element={<CustomizePage />} />
        </Route>

        {/* Guest App Routes */}
        <Route path="/guest" element={<GuestLayout />}>
          <Route index element={<GuestHomePage />} />
          <Route path="brochure" element={<GuestBrochurePage />} />
          <Route path="map" element={<GuestVenueMapPage />} />
          <Route path="tournament" element={<GuestTournamentPage />} />
          <Route path="feedback" element={<GuestFeedbackPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
