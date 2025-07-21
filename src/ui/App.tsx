import { useState } from 'react'
import reactLogo from './assets/react.svg'


import './App.css'

function Sidebar() {
  return (
    <div className="sidebar" style={{width: '250px', height: '100vh', backgroundColor: '#1a1a1a', color: 'white', padding: '1rem', boxSizing: 'border-box'}}>
      <h2 style={{marginBottom: '1rem'}}>Sidebar</h2>
      <ul style={{listStyle: 'none', padding: 0}}>
        <li style={{padding: '0.5rem 0'}}><a href="#" style={{color: 'white', textDecoration: 'none'}}>Home</a></li>
        <li style={{padding: '0.5rem 0'}}><a href="#" style={{color: 'white', textDecoration: 'none'}}>About</a></li>
        <li style={{padding: '0.5rem 0'}}><a href="#" style={{color: 'white', textDecoration: 'none'}}>Services</a></li>
        <li style={{padding: '0.5rem 0'}}><a href="#" style={{color: 'white', textDecoration: 'none'}}>Contact</a></li>
      </ul>
    </div>
  )
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{display: 'flex', height: '100vh'}}>
      <Sidebar />
      <main style={{flex: 1, padding: '1rem'}}>
        <div>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1>Vite + React</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
      </main>
    </div>
  )
}

export default App



