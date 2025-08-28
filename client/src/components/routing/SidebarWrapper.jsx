import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar as OriginalSidebar } from '@/components/sidebar';

export function SidebarWrapper({ isAdmin = false }: ({ isAdmin) {

  const navigate = useNavigate();
  const location = useLocation();

  // Função para lidar com a navegação
  const handleNavigation = (href }) => {
    navigate(href);
  };

  // Função para lidar com logout
  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  // Renderiza o Sidebar original com as props necessárias
  return (
    <OriginalSidebar 
      currentPath={location.pathname}
      onNavigate={handleNavigation}
      onLogout={handleLogout}
      isAdmin={isAdmin}
    />
  );
}
