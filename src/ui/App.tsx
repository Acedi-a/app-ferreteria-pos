import { useState } from 'react'
import reactLogo from './assets/react.svg'


import './App.css'

function Sidebar() {
  return (
    <div className="bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-lg" style={{width: '280px', height: '100vh', padding: '2rem 1.5rem', boxSizing: 'border-box'}}>
      <div className="mb-8">
        <h2 className="text-2xl font-light text-gray-900 mb-2">ProyectoCoria</h2>
        <p className="text-sm font-light text-gray-500">Sistema de Gestión</p>
      </div>
      
      <nav className="space-y-2">
        <a href="#" className="flex items-center px-4 py-3 text-gray-700 rounded-xl hover:bg-gray-100/80 hover:text-gray-900 transition-all duration-200 font-light">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
          Dashboard
        </a>
        <a href="#" className="flex items-center px-4 py-3 text-gray-700 rounded-xl hover:bg-gray-100/80 hover:text-gray-900 transition-all duration-200 font-light">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
          Clientes
        </a>
        <a href="#" className="flex items-center px-4 py-3 text-gray-700 rounded-xl hover:bg-gray-100/80 hover:text-gray-900 transition-all duration-200 font-light">
          <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
          Productos
        </a>
        <a href="#" className="flex items-center px-4 py-3 text-gray-700 rounded-xl hover:bg-gray-100/80 hover:text-gray-900 transition-all duration-200 font-light">
          <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
          Categorías
        </a>
        <a href="#" className="flex items-center px-4 py-3 text-gray-700 rounded-xl hover:bg-gray-100/80 hover:text-gray-900 transition-all duration-200 font-light">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
          Reportes
        </a>
      </nav>
      
      <div className="absolute bottom-8 left-6 right-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-2xl border border-gray-200/50">
          <p className="text-xs font-light text-gray-600 mb-2">Versión 1.0.0</p>
          <p className="text-xs font-light text-gray-500">© 2024 ProyectoCoria</p>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg p-8 mb-8">
            <div className="text-center mb-8">
              <a href="https://react.dev" target="_blank">
                <img src={reactLogo} className="logo react mx-auto mb-4" alt="React logo" />
              </a>
              <h1 className="text-4xl font-light text-gray-900 mb-2">Vite + React</h1>
              <p className="text-gray-500 font-light">Aplicación con estética macOS</p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-gray-200/50 text-center">
              <button 
                onClick={() => setCount((count) => count + 1)}
                className="bg-white/80 backdrop-blur-xl px-6 py-3 rounded-xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-200 font-light text-gray-900 hover:bg-white"
              >
                count is {count}
              </button>
              <p className="mt-4 text-sm font-light text-gray-600">
                Edit <code className="bg-gray-100 px-2 py-1 rounded text-xs">src/App.tsx</code> and save to test HMR
              </p>
            </div>
            
            <p className="text-center text-sm font-light text-gray-500 mt-8">
              Click on the Vite and React logos to learn more
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App



