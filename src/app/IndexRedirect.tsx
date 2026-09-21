import { Navigate, useLocation } from 'react-router-dom'

export function IndexRedirect() {
  const { search } = useLocation()
  return <Navigate to={{ pathname: '/card-processing', search }} replace />
}
