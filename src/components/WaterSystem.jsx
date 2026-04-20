import './WaterSystem.css'

function SideTank({ title, level, maxLevel, side, low = false }) {
  const pct = Math.max(0, Math.min(100, (level / maxLevel) * 100))

  return (
    <div className={`wm-tank-card wm-tank-card-${side}`}>
      <div className="wm-tank-shell">
        <div className="wm-tank-lid" />
        <div className="wm-tank-body">
          <div className="wm-tank-water" style={{ height: `${pct}%` }} />
        </div>
        <div className={`wm-scale wm-scale-${side}`}>
          {[100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0].map(mark => (
            <span key={mark} style={{ top: `${100 - mark}%` }}>
              {mark}
            </span>
          ))}
        </div>
      </div>
      <div className="wm-card-title wm-card-title-bottom">
        {title}
        {low && <span className="wm-low-pill">LOW</span>}
      </div>
    </div>
  )
}

function Pump({ label, active, attack = false }) {
  return (
    <div className="wm-pump-block">
      <div className={`wm-pump ${active ? 'is-active' : ''} ${attack ? 'is-attack' : ''}`}>
        <div className="wm-pump-ring" />
        <div className="wm-pump-housing">
          <div className={`wm-pump-fan ${active ? 'is-spinning' : ''}`}>
            <span className="wm-pump-blade blade-a" />
            <span className="wm-pump-blade blade-b" />
            <span className="wm-pump-blade blade-c" />
            <span className="wm-pump-blade blade-d" />
          </div>
          <div className="wm-pump-center" />
        </div>
        <div className="wm-pump-port wm-pump-port-left" />
        <div className="wm-pump-port wm-pump-port-right" />
      </div>
      <div className="wm-pump-label wm-pump-label-bottom">{label}</div>
    </div>
  )
}

function PurificationTank({ active }) {
  return (
    <div className="wm-purification-card">
      <div className="wm-purification-tank">
        <div className={`wm-water-motion ${active ? 'is-active' : ''}`} aria-hidden="true">
          <span className="wm-water-ring wm-water-ring-a" />
          <span className="wm-water-ring wm-water-ring-b" />
          <span className="wm-water-ring wm-water-ring-c" />
          <span className="wm-water-glow" />
        </div>
        <div className={`wm-stirrer ${active ? 'is-spinning' : ''}`}>
          <span className="wm-stirrer-stick" />
        </div>
      </div>
    </div>
  )
}

export default function WaterSystem({ system }) {
  const {
    purificationLevel,
    mainTankLevel,
    purificationActive,
    pumpR2P,
    pumpP2M,
    modbusAttack,
    PURIFICATION_CAPACITY,
    MAIN_TANK_CAPACITY,
  } = system

  const purificationRunning = purificationActive && purificationLevel > 0
  const mainLow = (mainTankLevel / MAIN_TANK_CAPACITY) * 100 <= 20

  return (
    <div className="water-system water-management-diagram">
      <div className="wm-diagram">
        <div className="wm-top-row">
          <SideTank
            title="Tank 1"
            level={purificationLevel}
            maxLevel={PURIFICATION_CAPACITY}
            side="left"
          />
          <PurificationTank active={purificationRunning} />
          <SideTank
            title="Tank 2"
            level={mainTankLevel}
            maxLevel={MAIN_TANK_CAPACITY}
            side="right"
            low={mainLow}
          />
        </div>

        <div className="wm-pipes" aria-hidden="true">
          <div className="wm-pipe wm-pipe-mid-left" />
          <div className={`wm-pipe wm-pipe-mid-left-flow ${pumpR2P ? 'is-flowing' : ''}`} />

          <div className="wm-pipe wm-pipe-mid-right" />
          <div className={`wm-pipe wm-pipe-mid-right-flow ${pumpP2M ? 'is-flowing' : ''} ${modbusAttack ? 'is-attack' : ''}`} />
        </div>

        <div className="wm-pump-row">
          <Pump label="Pump 1" active={pumpR2P} />
          <Pump label="Pump 2" active={pumpP2M} attack={modbusAttack} />
        </div>
      </div>
    </div>
  )
}
