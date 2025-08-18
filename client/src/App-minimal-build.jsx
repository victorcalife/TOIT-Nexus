/**
 * APP MÍNIMO PARA BUILD DE TESTE
 * Apenas para testar o deploy no Railway
 */

import React from 'react';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 TOIT NEXUS
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Sistema Quântico Empresarial - Build de Teste
          </p>
          
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Status do Sistema</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Frontend:</span>
                <span className="text-green-600 font-semibold">✅ Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Backend:</span>
                <span className="text-green-600 font-semibold">✅ Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Database:</span>
                <span className="text-green-600 font-semibold">✅ Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Quantum System:</span>
                <span className="text-green-600 font-semibold">✅ Online</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <button 
                onClick={() => window.location.href = '/login'}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔐 Login Cliente
              </button>
              
              <button 
                onClick={() => window.location.href = '/support-login'}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
              >
                🛠️ Login Suporte
              </button>
            </div>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            <p>Build: {new Date().toISOString()}</p>
            <p>Environment: {import.meta.env.MODE}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
