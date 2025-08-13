import { useEffect } from "react";

export default function PublicLanding() {
  useEffect(() => {
    // Redirecionar para a landing page HTML estática
    window.location.href = '/nexus-quantum-landing.html';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando TOIT NEXUS...</p>
      </div>
    </div>
  );
}
