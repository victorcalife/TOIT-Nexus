export function useAuth() {
  // For demo purposes, return a mock authenticated state
  const mockUser = {
    id: 'demo-user',
    name: 'Demo User',
    email: 'demo@toitnexus.com',
    role: 'super_admin',
    tenantId: 'demo-tenant'
  };

  // Always return demo state - no API calls
  const isAuthenticated = true;
  const isSuperAdmin = true;

  return {
    user: mockUser,
    isAuthenticated,
    isLoading: false,
    isSuperAdmin,
    error: null
  };
}