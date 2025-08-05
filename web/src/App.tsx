import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

// Layout components
import AuthLayout from '@/components/layout/AuthLayout'
import DashboardLayout from '@/components/layout/DashboardLayout'

// Page components
import LoginPage from '@/pages/auth/LoginPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import EventsPage from '@/pages/events/EventsPage'
import EventDetailPage from '@/pages/events/EventDetailPage'
import EventFormPage from '@/pages/events/EventFormPage'
import ArticlesPage from '@/pages/articles/ArticlesPage'
import MobileArticleViewer from '@/components/articles/MobileArticleViewer'
import CreateUpdateArticle from '@/components/articles/CreateUpdateArticle'
import ImagesPage from '@/pages/images/ImagesPage'
import VideosPage from '@/pages/videos/VideosPage'
import CloudVideosPage from '@/pages/cloud-videos/CloudVideosPage'
import NewsPage from '@/pages/news/NewsPage'
import SurveysPage from '@/pages/surveys/SurveysPage'
import SurveyTestPage from '@/pages/surveys/SurveyTestPage'
import SurveyBuilderPage from '@/pages/surveys/SurveyBuilderPage'
import AttendeesPage from '@/pages/attendees/AttendeesPage'
import UsersPage from '@/pages/users/UsersPage'
import WeChatPage from '@/pages/wechat/WeChatPage'
import MigrationDashboard from '@/pages/migration/MigrationDashboard'
import SettingsPage from '@/pages/settings/SettingsPage'
import Test135Editor from '@/components/articles/Test135Editor'

function App() {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      {!isAuthenticated ? (
        <>
          <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          {/* Protected routes */}
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardLayout><DashboardPage /></DashboardLayout>} />

          {/* Events */}
          <Route path="/events" element={<DashboardLayout><EventsPage /></DashboardLayout>} />
          <Route path="/events/new" element={<DashboardLayout><EventFormPage /></DashboardLayout>} />
          <Route path="/events/:id" element={<DashboardLayout><EventDetailPage /></DashboardLayout>} />
          <Route path="/events/:id/edit" element={<DashboardLayout><EventFormPage /></DashboardLayout>} />

          {/* Content Management */}
          <Route path="/articles" element={<DashboardLayout><ArticlesPage /></DashboardLayout>} />
          <Route path="/articles/create" element={<DashboardLayout><CreateUpdateArticle mode="create" /></DashboardLayout>} />
          <Route path="/articles/:id" element={<MobileArticleViewer />} />
          <Route path="/articles/:id/edit" element={<DashboardLayout><CreateUpdateArticle mode="edit" /></DashboardLayout>} />
          <Route path="/images" element={<DashboardLayout><ImagesPage /></DashboardLayout>} />
          <Route path="/videos" element={<DashboardLayout><VideosPage /></DashboardLayout>} />
          <Route path="/cloud-videos" element={<DashboardLayout><CloudVideosPage /></DashboardLayout>} />
          <Route path="/news" element={<DashboardLayout><NewsPage /></DashboardLayout>} />
          <Route path="/surveys" element={<DashboardLayout><SurveysPage /></DashboardLayout>} />
          <Route path="/surveys/test" element={<DashboardLayout><SurveyTestPage /></DashboardLayout>} />
          <Route path="/surveys/:surveyId/builder" element={<DashboardLayout><SurveyBuilderPage /></DashboardLayout>} />
          <Route path="/attendees" element={<DashboardLayout><AttendeesPage /></DashboardLayout>} />

          {/* User Management */}
          <Route path="/users" element={<DashboardLayout><UsersPage /></DashboardLayout>} />

          {/* System */}
          <Route path="/wechat" element={<DashboardLayout><WeChatPage /></DashboardLayout>} />
          <Route path="/migration" element={<DashboardLayout><MigrationDashboard /></DashboardLayout>} />
          <Route path="/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
          <Route path="/test-135editor" element={<DashboardLayout><Test135Editor /></DashboardLayout>} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      )}
    </Routes>
  )
}

export default App
