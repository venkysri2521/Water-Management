import WaterSystem from './components/WaterSystem'
import ControlPanel from './components/ControlPanel'
import HouseGrid from './components/HouseGrid'
import PilferageAlert from './components/PilferageAlert'
import { useWaterSystem } from './hooks/useWaterSystem'
import './App.css'

export default function App() {
  const system = useWaterSystem()

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-logo">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="17" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1.5"/>
            <path d="M18 4C18 4 8 15 8 22C8 27.5 12.5 32 18 32C23.5 32 28 27.5 28 22C28 15 18 4 18 4Z" fill="#0ea5e9"/>
            <path d="M18 10C18 10 13 17 13 22C13 24.8 15.2 27 18 27C20.8 27 23 24.8 23 22C23 17 18 10 18 10Z" fill="white" opacity="0.5"/>
          </svg>
          <div className="header-text">
            <h1>AquaFlow <span>IMS</span></h1>
            <span className="header-sub">Integrated Water Management & Optimization Solution</span>
          </div>
        </div>
      </header>

      <div className="section-divider">
        <span>Pipeline View</span>
      </div>

      <main className="app-main">
        {/* ── ROW 1: Pipeline + Primary System Controls (Purification + Main Tank Fill) ── */}
        <div className="top-section">
          <div className="pipeline-section">
            <WaterSystem system={system} />
          </div>
          <ControlPanel system={system} variant="primary" />
        </div>

        <div className="section-divider">
          <span>Control & Distribution</span>
        </div>

        {/* ── ROW 2: Secondary System Controls (House Supply + Pilferage) + House Grid ── */}
        <div className="bottom-section">
          <ControlPanel system={system} variant="secondary" />
          <HouseGrid system={system} />
        </div>
      </main>

      {system.pilferageAlert && <PilferageAlert onDismiss={system.dismissPilferage} />}
    </div>
  )
}
