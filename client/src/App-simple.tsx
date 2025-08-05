function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          TOIT NEXUS
        </h1>
        <p className="text-gray-600 mb-6">
          Sistema funcionando corretamente!
        </p>
        <div className="bg-green-100 border border-green-400 rounded p-4">
          <p className="text-green-800 font-semibold">
            ✅ React App carregado com sucesso
          </p>
          <p className="text-green-600 text-sm mt-2">
            supnexus.toit.com.br está operacional
          </p>
        </div>
        <div className="mt-6 text-sm text-gray-500">
          <p>Hostname: {window.location.hostname}</p>
          <p>Path: {window.location.pathname}</p>
        </div>
      </div>
    </div>
  );
}

export default App;