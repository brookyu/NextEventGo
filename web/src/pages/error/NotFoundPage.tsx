import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page not found</h2>
          <p className="text-gray-600">The page you're looking for doesn't exist.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/dashboard" className="btn-primary">
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Link>
          <button onClick={() => window.history.back()} className="btn-secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
