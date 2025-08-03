import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

const AnalyticsRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Main Analytics Dashboard */}
      <Route path="/" element={<AnalyticsDashboard />} />
      
      {/* Individual Article Analytics (future enhancement) */}
      <Route path="/articles/:id" element={<div>Individual Article Analytics - Coming Soon</div>} />
      
      {/* Redirect any other paths to the main dashboard */}
      <Route path="*" element={<Navigate to="/analytics" replace />} />
    </Routes>
  );
};

export default AnalyticsRoutes;
