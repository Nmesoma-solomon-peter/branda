import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import PrivateRoute from './components/common/PrivateRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import MaintenanceCheck from './components/common/MaintenanceCheck';
import CookieConsent from './components/common/CookieConsent';
import AnnouncementBanner from './components/common/AnnouncementBanner';
import FeedbackForm from './components/common/FeedbackForm';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SMEDashboard from './pages/SMEDashboard';
import SpecialistDashboard from './pages/SpecialistDashboard';
import ProjectDetailPage from './pages/ProjectDetailPage';
import AdminLogin from './pages/manage/AdminLogin';
import AdminDashboard from './pages/manage/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import KYCPage from './pages/KYCPage';
import MessagesPage from './pages/MessagesPage';
import ChatPage from './pages/ChatPage';
import PortfolioManagement from './pages/PortfolioManagement';
import BrowseSpecialists from './pages/BrowseSpecialists';
import BrowseProjects from './pages/BrowseProjects';
import ProjectProposals from './pages/ProjectProposals';
import SpecialistProfile from './pages/SpecialistProfile';
import FAQ from './pages/FAQ';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import TwoFactorAuth from './pages/TwoFactorAuth';
import Onboarding from './pages/Onboarding';
import ReferralPage from './pages/ReferralPage';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import BrandNameGenerator from './pages/BrandNameGenerator';
import ColorPaletteGenerator from './pages/ColorPaletteGenerator';
import SpecialistEarnings from './pages/SpecialistEarnings';
import SpecialistPackages from './pages/SpecialistPackages';
import SpecialistAvailability from './pages/SpecialistAvailability';
import TicketSystem from './pages/TicketSystem';
import CaseStudies from './pages/CaseStudies';
import AccessDenied from './pages/AccessDenied';
import NotFound from './pages/NotFound';
import Maintenance from './pages/Maintenance';
import PaymentHistory from './pages/PaymentHistory';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <MaintenanceCheck>
            <CookieConsent />
            <AnnouncementBanner />
            <FeedbackForm />
            <Routes>
              <Route path="/" element={<><Navbar /><LandingPage /></>} />
              <Route path="/login" element={<><Navbar /><LoginPage /></>} />
              <Route path="/register" element={<><Navbar /><RegisterPage /></>} />
<Route path="/forgot-password" element={<><Navbar /><ForgotPassword /><Footer /></>} />
  <Route path="/reset-password/:token" element={<><Navbar /><ResetPassword /><Footer /></>} />
  <Route path="/verify-email/:token" element={<><Navbar /><VerifyEmail /><Footer /></>} />
  <Route path="/terms" element={<><Navbar /><Terms /><Footer /></>} />
  <Route path="/privacy" element={<><Navbar /><Privacy /><Footer /></>} />
              <Route path="/tools/brand-name" element={<><Navbar /><BrandNameGenerator /></>} />
              <Route path="/tools/color-palette" element={<><Navbar /><ColorPaletteGenerator /></>} />
              <Route path="/dashboard" element={<><Navbar /><PrivateRoute role="sme"><SMEDashboard /></PrivateRoute></>} />
              <Route path="/specialist-dashboard" element={<><Navbar /><PrivateRoute role="specialist"><SpecialistDashboard /></PrivateRoute></>} />
              <Route path="/projects/:id" element={<><Navbar /><PrivateRoute><ProjectDetailPage /></PrivateRoute></>} />
              <Route path="/payments" element={<><Navbar /><PrivateRoute role="sme"><PaymentHistory /></PrivateRoute></>} />
              <Route path="/profile" element={<><Navbar /><PrivateRoute><ProfilePage /></PrivateRoute></>} />
              <Route path="/kyc" element={<><Navbar /><PrivateRoute role="specialist"><KYCPage /></PrivateRoute></>} />
              <Route path="/messages" element={<><Navbar /><PrivateRoute><MessagesPage /></PrivateRoute></>} />
              <Route path="/chat" element={<><Navbar /><PrivateRoute><ChatPage /></PrivateRoute></>} />
              <Route path="/portfolio" element={<><Navbar /><PrivateRoute role="specialist"><PortfolioManagement /></PrivateRoute></>} />
              <Route path="/browse" element={<><Navbar /><PrivateRoute role="sme"><BrowseSpecialists /></PrivateRoute></>} />
              <Route path="/browse-projects" element={<><Navbar /><PrivateRoute role="specialist"><BrowseProjects /></PrivateRoute></>} />
              <Route path="/projects/:id/proposals" element={<><Navbar /><PrivateRoute><ProjectProposals /></PrivateRoute></>} />
              <Route path="/specialists/:id" element={<><Navbar /><SpecialistProfile /></>} />
              <Route path="/faq" element={<><Navbar /><FAQ /></>} />
              <Route path="/blog" element={<><Navbar /><Blog /></>} />
              <Route path="/blog/:slug" element={<><Navbar /><BlogPost /></>} />
              <Route path="/contact" element={<><Navbar /><Contact /></>} />
              <Route path="/security/2fa" element={<><Navbar /><PrivateRoute><TwoFactorAuth /></PrivateRoute></>} />
              <Route path="/onboarding" element={<><Navbar /><PrivateRoute><Onboarding /></PrivateRoute></>} />
              <Route path="/referrals" element={<><Navbar /><PrivateRoute><ReferralPage /></PrivateRoute></>} />
              <Route path="/earnings" element={<><Navbar /><PrivateRoute role="specialist"><SpecialistEarnings /></PrivateRoute></>} />
              <Route path="/packages" element={<><Navbar /><PrivateRoute role="specialist"><SpecialistPackages /></PrivateRoute></>} />
              <Route path="/availability" element={<><Navbar /><PrivateRoute role="specialist"><SpecialistAvailability /></PrivateRoute></>} />
              <Route path="/tickets" element={<><Navbar /><PrivateRoute><TicketSystem /></PrivateRoute></>} />
              <Route path="/case-studies" element={<><Navbar /><CaseStudies /></>} />
              <Route path="/manage/login" element={<AdminLogin />} />
              <Route path="/manage/dashboard" element={<AdminDashboard />} />
              <Route path="/manage" element={<AdminLogin />} />
              <Route path="/access-denied" element={<><Navbar /><AccessDenied /></>} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="*" element={<><Navbar /><NotFound /></>} />
            </Routes>
          </MaintenanceCheck>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
