import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ArticleList from '@/components/articles/ArticleList';
import CreateUpdateArticle from '@/components/articles/CreateUpdateArticle';
import ArticleViewer from '@/components/articles/ArticleViewer';

const ArticlesRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Article Management Routes */}
      <Route path="/" element={<ArticleList />} />
      <Route path="/new" element={<CreateUpdateArticle mode="create" />} />
      <Route path="/:id/edit" element={<CreateUpdateArticle mode="edit" />} />
      <Route path="/:id" element={<ArticleViewer />} />
      
      {/* Redirect any other paths to the main list */}
      <Route path="*" element={<Navigate to="/articles" replace />} />
    </Routes>
  );
};

export default ArticlesRoutes;
