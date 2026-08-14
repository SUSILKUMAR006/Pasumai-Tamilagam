import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Route guards
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import PublicRoute from './components/PublicRoute';

// Navigation Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Page Imports (Home kept eager since it's the most common landing page)
import Home from './pages/Home';
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const TreeMap = lazy(() => import('./pages/TreeMap'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const TreeDetails = lazy(() => import('./pages/TreeDetails'));

// User Dashboard Page Imports
const Dashboard = lazy(() => import('./pages/Dashboard'));
const RegisterTree = lazy(() => import('./pages/RegisterTree'));
const Profile = lazy(() => import('./pages/Profile'));

// Admin Page Imports
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const AdminVerification = lazy(() => import('./pages/Admin/AdminVerification'));
const AdminTreeManagement = lazy(() => import('./pages/Admin/AdminTreeManagement'));
const AdminUserManagement = lazy(() => import('./pages/Admin/AdminUserManagement'));
const AdminTreeSpecies = lazy(() => import('./pages/Admin/AdminTreeSpecies'));
const AdminMap = lazy(() => import('./pages/Admin/AdminMap'));
const AdminAnalytics = lazy(() => import('./pages/Admin/AdminAnalytics'));
const AdminReports = lazy(() => import('./pages/Admin/AdminReports'));

const RouteFallback = () => (
  <div className="flex-1 flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600"></div>
  </div>
);

const AppContent = () => {
  const location = useLocation();
  // Don't render general public Navbar/Footer on Admin paths
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && <Navbar />}

      <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<TreeMap />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/tree/:id" element={<TreeDetails />} />

        {/* Public Auth Routes (Redirects if already authenticated) */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected User Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/register-tree"
          element={
            <PrivateRoute>
              <RegisterTree />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* Protected Admin Console Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/verification"
          element={
            <AdminRoute>
              <AdminVerification />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/trees"
          element={
            <AdminRoute>
              <AdminTreeManagement />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUserManagement />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/species"
          element={
            <AdminRoute>
              <AdminTreeSpecies />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/map"
          element={
            <AdminRoute>
              <AdminMap />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <AdminRoute>
              <AdminAnalytics />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <AdminRoute>
              <AdminReports />
            </AdminRoute>
          }
        />

        {/* Catch-all fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
      </Suspense>

      {!isAdminRoute && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
};

export default App;
