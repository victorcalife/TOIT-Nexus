/**
 * HOOK DE TEMA - TOIT NEXUS
 * Hook personalizado para gerenciar temas usando next-themes
 * Versão: 1.0.0
 */

import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * Hook para gerenciar temas do sistema
 * @returns {Object} Objeto com propriedades e métodos do tema
 */
export const useTheme = () => {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  // Evitar hidratação mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Temas disponíveis
  const themes = [
    { value: 'light', label: 'Claro', icon: 'Sun' },
    { value: 'dark', label: 'Escuro', icon: 'Moon' },
    { value: 'system', label: 'Sistema', icon: 'Monitor' }
  ];

  // Alternar entre temas
  const toggleTheme = () => {
    const currentTheme = theme || 'system';
    const themeOrder = ['light', 'dark', 'system'];
    const currentIndex = themeOrder.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  // Definir tema específico
  const setSpecificTheme = (newTheme) => {
    if (themes.some(t => t.value === newTheme)) {
      setTheme(newTheme);
    }
  };

  // Obter tema atual resolvido
  const getCurrentTheme = () => {
    if (!mounted) return 'light'; // Fallback durante SSR
    return resolvedTheme || theme || 'light';
  };

  // Verificar se é tema escuro
  const isDark = () => {
    return getCurrentTheme() === 'dark';
  };

  // Verificar se é tema claro
  const isLight = () => {
    return getCurrentTheme() === 'light';
  };

  // Verificar se está usando tema do sistema
  const isSystem = () => {
    return theme === 'system';
  };

  // Obter informações do tema atual
  const getThemeInfo = () => {
    const currentTheme = theme || 'system';
    return themes.find(t => t.value === currentTheme) || themes[0];
  };

  return {
    // Estado
    theme,
    resolvedTheme,
    systemTheme,
    mounted,
    themes,
    
    // Métodos
    setTheme,
    toggleTheme,
    setSpecificTheme,
    getCurrentTheme,
    getThemeInfo,
    
    // Verificações
    isDark,
    isLight,
    isSystem
  };
};

export default useTheme;