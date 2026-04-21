import WaterSystem from './components/WaterSystem'
import HouseGrid from './components/HouseGrid'
import { useWaterSystem } from './hooks/useWaterSystem'
import './App.css'

export default function App() {
  const system = useWaterSystem()
  const { houses, toggleConsumption, rechargeWallet, apiAttack, mainTankLevel, resetSystem } = system

  const house1 = houses[0]
  const restHouses = houses.slice(1)

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-logo">
          <svg width="52" height="52" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="17" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1.5"/>
            <path d="M18 4C18 4 8 15 8 22C8 27.5 12.5 32 18 32C23.5 32 28 27.5 28 22C28 15 18 4 18 4Z" fill="#0ea5e9"/>
            <path d="M18 10C18 10 13 17 13 22C13 24.8 15.2 27 18 27C20.8 27 23 24.8 23 22C23 17 18 10 18 10Z" fill="white" opacity="0.5"/>
          </svg>
          <div className="header-text">
            <h1>AquaFlow <span>IMS</span></h1>
          </div>
        </div>
        <button className="reset-all-btn" onClick={resetSystem}>
          ↺ Reset All
        </button>
      </header>

      <main className="app-main">
        {/* ── ROW 1: Pipeline (with embedded controls) + House 1 ── */}
        <div className="top-section">
          <div className="pipeline-section">
            <WaterSystem system={system} />
          </div>
          <div className="house1-wrapper">
            <HouseGrid
              system={system}
              houses={[house1]}
              onToggle={toggleConsumption}
              onRecharge={rechargeWallet}
              apiAttack={apiAttack}
              mainTankLevel={mainTankLevel}
              singleColumn
            />
          </div>
        </div>

        {/* ── ROW 2: Houses 2, 3, 4 ── */}
        <div className="bottom-section">
          <HouseGrid
            system={system}
            houses={restHouses}
            onToggle={toggleConsumption}
            onRecharge={rechargeWallet}
            apiAttack={apiAttack}
            mainTankLevel={mainTankLevel}
          />
        </div>
      </main>
    </div>
  )
}
