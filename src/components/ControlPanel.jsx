import './ControlPanel.css'

export default function ControlPanel({ system, variant = 'all' }) {
  const {
    purificationActive, setPurificationActive,
    pumpR2P, setPumpR2P,
    pumpP2M, setPumpP2M,
    pilferageActive,
    autoMode, setAutoMode,
    modbusAttack, apiAttack,
    triggerPilferage, triggerModbusAttack, triggerApiAttack,
    resetSystem,
    mainTankLevel, MAIN_TANK_CAPACITY,
    purificationLevel, PURIFICATION_CAPACITY,
  } = system

  const mainPct = Math.round((mainTankLevel / MAIN_TANK_CAPACITY) * 100)
  const purPct  = Math.round((purificationLevel / PURIFICATION_CAPACITY) * 100)

  // ── Section: Water Purification (S1) ──
  const PurificationSection = (
    <div className="cp-section">
      <div className="cp-section-label">
        <span className="scenario-tag s1">S1</span> Water Purification
      </div>
      <div className="cp-scenario-status">
        <div className="status-row">
          <span className="status-dot" style={{ background: purificationActive ? '#22c55e' : '#ef4444' }} />
          <span>Purification: <b>{purificationActive ? 'ON' : 'OFF'}</b></span>
        </div>
        <div className="status-row">
          <span className="status-dot" style={{ background: pumpR2P ? '#22c55e' : '#94a3b8' }} />
          <span>Reservoir → Purif Tank: <b>{purPct}%</b></span>
        </div>
        <div className="cp-led-row">
          <div className={`cp-led ${purificationActive ? 'led-green' : 'led-red'}`} />
          <span className="cp-led-label">{purificationActive ? 'Purification in progress' : 'Purification completed'}</span>
        </div>
      </div>
      <div className="cp-buttons">
        <button
          className={`ctrl-btn ${pumpR2P ? 'btn-active' : ''}`}
          onClick={() => setPumpR2P(v => !v)}
        >
          <span className="btn-icon">⚙</span>
          Pump 1 {pumpR2P ? 'ON' : 'OFF'}
        </button>
        <button
          className={`ctrl-btn ${purificationActive ? 'btn-active' : ''}`}
          onClick={() => setPurificationActive(v => !v)}
        >
          <span className="btn-icon">◎</span>
          Purif. {purificationActive ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  )

  // ── Section: Main Tank Fill (S2) ──
  const MainTankSection = (
    <div className="cp-section">
      <div className="cp-section-label">
        <span className="scenario-tag s2">S2</span> Main Tank Fill
      </div>
      <div className="cp-scenario-status">
        <div className="status-row">
          <span className="status-dot" style={{ background: pumpP2M ? '#22c55e' : '#94a3b8' }} />
          <span>Main Tank Level: <b>{mainPct}%</b></span>
        </div>
        <div className="status-row">
          <span className="status-dot" style={{ background: modbusAttack ? '#ef4444' : '#94a3b8' }} />
          <span>Modbus: <b style={{ color: modbusAttack ? '#dc2626' : 'inherit' }}>{modbusAttack ? 'UNDER ATTACK' : 'Secure'}</b></span>
        </div>
        {modbusAttack && (
          <div className="attack-warning">
            ⚠ Refill halted — registry compromised
          </div>
        )}
      </div>
      <div className="cp-buttons">
        <button
          className={`ctrl-btn ${pumpP2M ? 'btn-active' : ''}`}
          onClick={() => setPumpP2M(v => !v)}
        >
          <span className="btn-icon">⚙</span>
          Pump 2 {pumpP2M ? 'ON' : 'OFF'}
        </button>
        <button
          className={`ctrl-btn btn-attack ${modbusAttack ? 'btn-attacking' : ''}`}
          onClick={triggerModbusAttack}
          disabled={modbusAttack}
        >
          <span className="btn-icon">⚡</span>
          Modbus Attack
        </button>
      </div>
    </div>
  )

  // ── Section: House Water Supply (S3) ──
  const HouseSupplySection = (
    <div className="cp-section">
      <div className="cp-section-label">
        <span className="scenario-tag s3">S3</span> House Water Supply
      </div>
      <div className="cp-scenario-status">
        <div className="status-row">
          <span className="status-dot" style={{ background: apiAttack ? '#ef4444' : '#22c55e' }} />
          <span>API / DB: <b style={{ color: apiAttack ? '#dc2626' : '#16a34a' }}>{apiAttack ? 'UNDER ATTACK' : 'Secure'}</b></span>
        </div>
        {apiAttack && (
          <div className="attack-warning">
            ⚠ Wallet data compromised via DB attack
          </div>
        )}
      </div>
      <div className="cp-buttons">
        <button
          className={`ctrl-btn btn-attack ${apiAttack ? 'btn-attacking' : ''}`}
          onClick={triggerApiAttack}
          disabled={apiAttack}
        >
          <span className="btn-icon">🗄</span>
          API/DB Attack
        </button>
        <button
          className={`ctrl-btn ${autoMode ? 'btn-active' : ''}`}
          onClick={() => setAutoMode(v => !v)}
        >
          <span className="btn-icon">⊞</span>
          Auto Mode
        </button>
      </div>
    </div>
  )

  // ── Section: Pilferage Detection (S4) ──
  const PilferageSection = (
    <div className="cp-section">
      <div className="cp-section-label">
        <span className="scenario-tag s4">S4</span> Pilferage Detection
      </div>
      <div className="cp-scenario-status">
        <div className="status-row">
          <span className="status-dot" style={{ background: pilferageActive ? '#ef4444' : '#22c55e' }} />
          <span>Pipeline: <b style={{ color: pilferageActive ? '#dc2626' : '#16a34a' }}>{pilferageActive ? 'PILFERAGE ACTIVE' : 'Normal'}</b></span>
        </div>
        {pilferageActive && (
          <div className="attack-warning">
            ⚠ Unauthorized drain detected — flow halted
          </div>
        )}
        <div className="cp-led-row">
          <div className={`cp-led ${pilferageActive ? 'led-red' : 'led-off'}`} />
          <span className="cp-led-label">{pilferageActive ? 'Pilferage at junction' : 'No pilferage'}</span>
        </div>
      </div>
      <div className="cp-buttons">
        <button
          className={`ctrl-btn btn-pilferage ${pilferageActive ? 'btn-attacking' : ''}`}
          onClick={triggerPilferage}
        >
          <span className="btn-icon">⚠</span>
          Trigger Pilferage
        </button>
        <button className="ctrl-btn btn-reset" onClick={resetSystem}>
          <span className="btn-icon">↺</span>
          Reset All
        </button>
      </div>
    </div>
  )

  // ── Choose which sections to render based on variant ──
  let sections
  let title
  if (variant === 'primary') {
    sections = <>{PurificationSection}{MainTankSection}</>
    title = 'System Controls — Treatment & Fill'
  } else if (variant === 'secondary') {
    sections = <>{HouseSupplySection}{PilferageSection}</>
    title = 'System Controls — Distribution & Security'
  } else {
    sections = <>{PurificationSection}{MainTankSection}{HouseSupplySection}{PilferageSection}</>
    title = 'System Controls'
  }

  return (
    <div className={`control-panel cp-${variant}`}>
      <div className="cp-header">
        <span className="cp-title">{title}</span>
        <div className={`auto-badge ${autoMode ? 'auto-on' : 'auto-off'}`}>
          {autoMode ? 'AUTO' : 'MANUAL'}
        </div>
      </div>

      <div className="cp-grid">
        {sections}
      </div>
    </div>
  )
}
