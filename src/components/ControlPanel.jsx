import './ControlPanel.css'

export default function ControlPanel({ system }) {
  const {
    purificationActive, setPurificationActive,
    pumpR2P, setPumpR2P,
    pumpP2M, setPumpP2M,
    pilferageActive,
    autoMode, setAutoMode,
    totalPurified, fillTimeMain,
    modbusAttack, apiAttack,
    triggerPilferage, triggerModbusAttack, triggerApiAttack,
    resetSystem,
  } = system

  return (
    <div className="control-panel">
      <div className="cp-header">
        <span className="cp-title">System Controls</span>
        <div className={`auto-badge ${autoMode ? 'auto-on' : 'auto-off'}`}>
          {autoMode ? 'AUTO' : 'MANUAL'}
        </div>
      </div>

      <div className="cp-section">
        <div className="cp-section-label">Operations</div>
        <div className="cp-buttons">
          <button
            className={`ctrl-btn ${pumpR2P ? 'btn-active' : ''}`}
            onClick={() => setPumpR2P(v => !v)}
          >
            <span className="btn-icon">⚙</span>
            Pump 1 {pumpR2P ? 'ON' : 'OFF'}
          </button>
          <button
            className={`ctrl-btn ${pumpP2M ? 'btn-active' : ''}`}
            onClick={() => setPumpP2M(v => !v)}
          >
            <span className="btn-icon">⚙</span>
            Pump 2 {pumpP2M ? 'ON' : 'OFF'}
          </button>
          <button
            className={`ctrl-btn ${purificationActive ? 'btn-active' : ''}`}
            onClick={() => setPurificationActive(v => !v)}
          >
            <span className="btn-icon">◎</span>
            Purif. {purificationActive ? 'ON' : 'OFF'}
          </button>
          <button
            className={`ctrl-btn ${autoMode ? 'btn-active' : ''}`}
            onClick={() => setAutoMode(v => !v)}
          >
            <span className="btn-icon">⊞</span>
            Auto Mode
          </button>
          <button
            className={`ctrl-btn btn-pilferage ${pilferageActive ? 'btn-attacking' : ''}`}
            onClick={triggerPilferage}
          >
            <span className="btn-icon">⚠</span>
            Pilferage
          </button>
          <button className="ctrl-btn btn-reset" onClick={resetSystem}>
            <span className="btn-icon">↺</span>
            Reset All
          </button>
        </div>
      </div>
    </div>
  )
}
