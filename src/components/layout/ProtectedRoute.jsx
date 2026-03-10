import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { PageLoader } from '../common/LoadingSpinner'

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, profile, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return <PageLoader />
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
        return <Navigate to="/unauthorized" replace />
    }

    return children
}
