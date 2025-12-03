import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WeekView from './pages/WeekView';
import LessonView from './pages/LessonView';
import CertificateView from './pages/CertificateView';
import { isAuthenticated } from './utils/auth';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return !isAuthenticated() ? <>{children}</> : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
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
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/week/:week"
              element={
                <ProtectedRoute>
                  <WeekView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lesson/:subtopicId"
              element={
                <ProtectedRoute>
                  <LessonView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/certificate/:curriculumId"
              element={<CertificateView />}
            />
          </Routes>
        </div>
      </Router>
  );
}

export default App;
