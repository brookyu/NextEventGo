import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ShareManager from '@/components/sharing/ShareManager';

const SharingRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Main Sharing Management */}
      <Route path="/" element={<ShareManager />} />
      
      {/* Article-specific sharing */}
      <Route path="/articles/:articleId" element={<ShareManager />} />
      
      {/* Redirect any other paths to the main sharing page */}
      <Route path="*" element={<Navigate to="/sharing" replace />} />
    </Routes>
  );
};

export default SharingRoutes;
