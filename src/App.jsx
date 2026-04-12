import React from 'react';
import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import './App.css';

import HomePage from './pages/HomePage';
import ClientIntakePage from './pages/ClientIntakePage';
import ClientProfilesPage from './pages/ClientProfilesPage';
import ClientProfileDetailPage from './pages/ClientProfileDetailPage';
import ClientDashboardPage from './pages/ClientDashboardPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ItineraryBuilderPage from './pages/ItineraryBuilderPage';
import ItineraryDraftsPage from './pages/ItineraryDraftsPage';
import ItineraryDraftDetailPage from './pages/ItineraryDraftDetailPage';

function AppShell() {
  const linkStyle = ({ isActive }) => ({
    color: isActive ? '#0b0e16' : 'rgba(255,255,255,0.78)',
    background: isActive ? '#ffffff' : 'transparent',
    textDecoration: 'none',
    padding: '10px 14px',
    borderRadius: '999px',
    fontWeight: 700,
    fontSize: '14px',
    border: '1px solid rgba(255,255,255,0.08)',
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#06070b',
        color: '#ffffff',
      }}
    >
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backdropFilter: 'blur(16px)',
          background: 'rgba(6,7,11,0.72)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            maxWidth: '1320px',
            margin: '0 auto',
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <NavLink
            to="/"
            style={{
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 900,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontSize: '13px',
            }}
          >
            LOQE
          </NavLink>

          <nav
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <NavLink to="/" style={linkStyle}>
              Home
            </NavLink>
            <NavLink to="/client-intake" style={linkStyle}>
              Client Intake
            </NavLink>
            <NavLink to="/client-profiles" style={linkStyle}>
              Client Profiles
            </NavLink>
            <NavLink to="/itinerary-drafts" style={linkStyle}>
              Itinerary Drafts
            </NavLink>
          </nav>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/client-intake" element={<ClientIntakePage />} />

          <Route path="/client-profiles" element={<ClientProfilesPage />} />
          <Route path="/clients" element={<Navigate to="/client-profiles" replace />} />

          <Route path="/client-profiles/:id" element={<ClientProfileDetailPage />} />
          <Route path="/clients/:id" element={<ClientProfileDetailPage />} />

          <Route path="/client-profiles/:id/dashboard" element={<ClientDashboardPage />} />
          <Route path="/clients/:id/dashboard" element={<ClientDashboardPage />} />
          <Route path="/dashboard/:profileId" element={<ClientDashboardPage />} />

          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/recommendations/:profileId" element={<RecommendationsPage />} />
          <Route path="/client-profiles/:id/recommendations" element={<RecommendationsPage />} />
          <Route path="/clients/:id/recommendations" element={<RecommendationsPage />} />

          <Route path="/itinerary-builder" element={<ItineraryBuilderPage />} />
          <Route path="/itinerary-builder/:profileId" element={<ItineraryBuilderPage />} />
          <Route path="/client-profiles/:id/itinerary-builder" element={<ItineraryBuilderPage />} />
          <Route path="/clients/:id/itinerary-builder" element={<ItineraryBuilderPage />} />

          <Route path="/itinerary-drafts" element={<ItineraryDraftsPage />} />
          <Route path="/itinerary-drafts/:id" element={<ItineraryDraftDetailPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}