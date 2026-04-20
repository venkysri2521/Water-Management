import './HouseGrid.css'

const HOUSE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']

const wrapperStyle = {
  fontSize: '1.08rem',
}

const headerTitleStyle = {
  fontSize: '1.45rem',
}

const headerSubStyle = {
  fontSize: '1rem',
}

const houseInfoStyle = {
  gap: '0.35rem',
}

const houseNameStyle = {
  fontSize: '1.18rem',
}

const houseIdStyle = {
  fontSize: '0.98rem',
}

const walletLabelStyle = {
  fontSize: '1rem',
}

const walletAmountStyle = {
  fontSize: '1.05rem',
}

const walletMetaStyle = {
  fontSize: '0.95rem',
}

const tapButtonStyle = color => ({
  '--c': color,
  fontSize: '1rem',
  padding: '0.9rem 1rem',
})

function HouseCard({ house, onToggle, apiAttack, mainTankLevel }) {
  const color = HOUSE_COLORS[house.id - 1]
  const walletPct = house.wallet
  const isLowWallet = house.wallet < 20
  const canConsume = house.wallet > 0 && mainTankLevel > 5
  const led = house.consuming && canConsume ? 'green' : 'red'

  return (
    <div className={`house-card ${apiAttack ? 'house-attack' : ''}`} style={{ '--house-color': color }}>
      <div className="house-icon-area">
        <svg width="56" height="50" viewBox="0 0 56 50" fill="none" className={`house-svg ${house.consuming && canConsume ? 'house-active' : ''}`}>
          <polygon points="28,2 52,20 4,20" fill={color} opacity="0.9" />
          <polygon points="28,2 52,20 4,20" fill="none" stroke={color} strokeWidth="1.5" />
          <rect x="8" y="20" width="40" height="28" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
          <rect x="22" y="32" width="12" height="16" rx="6" fill={color} opacity="0.7" />
          <rect x="11" y="24" width="10" height="8" rx="2" fill={color} opacity="0.3" stroke={color} strokeWidth="1" />
          <rect x="35" y="24" width="10" height="8" rx="2" fill={color} opacity="0.3" stroke={color} strokeWidth="1" />
          <rect x="36" y="6" width="6" height="10" fill="#94a3b8" />
          {house.consuming && canConsume && (
            <>
              <circle cx="39" cy="4" r="2" fill="#cbd5e1" opacity="0.6" className="smoke s1" />
              <circle cx="41" cy="1" r="1.5" fill="#cbd5e1" opacity="0.4" className="smoke s2" />
            </>
          )}
        </svg>
        <div className={`led-indicator led-${led}`} title={led === 'green' ? 'Consuming water' : 'Not consuming'} />
      </div>

      <div className="house-info" style={houseInfoStyle}>
        <div className="house-name" style={houseNameStyle}>{house.name}</div>
        <div className="house-id" style={houseIdStyle}>Unit {String(house.id).padStart(2, '0')}</div>
      </div>

      <div className="wallet-section">
        <div className="wallet-header">
          <span className="wallet-label" style={walletLabelStyle}>Wallet</span>
          <span className={`wallet-amount ${isLowWallet ? 'wallet-low' : ''}`} style={walletAmountStyle}>
            Rs.{house.wallet.toFixed(1)}
          </span>
        </div>
        <div className="wallet-bar-bg">
          <div
            className="wallet-bar-fill"
            style={{ width: `${walletPct}%`, background: isLowWallet ? '#ef4444' : color }}
          />
        </div>
        <div className="wallet-meta" style={walletMetaStyle}>
          <span>{house.consumed.toFixed(1)} L consumed</span>
          <span>Rs.5/L</span>
        </div>
      </div>

      <div className="house-controls">
        <button
          className={`tap-btn ${house.consuming && canConsume ? 'tap-on' : 'tap-off'}`}
          onClick={() => onToggle(house.id)}
          disabled={!canConsume && !house.consuming}
          style={tapButtonStyle(color)}
        >
          <TapIcon active={house.consuming && canConsume} />
          {house.consuming && canConsume ? 'Close Tap' : 'Open Tap'}
        </button>
      </div>
    </div>
  )
}

function TapIcon({ active }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 4h8a2 2 0 012 2v1H2V4z" fill="currentColor" opacity="0.8" />
      <path d="M5 7v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {active && <path d="M5 12l-1 2M5 12l1 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
    </svg>
  )
}

export default function HouseGrid({ system }) {
  const { houses, toggleConsumption, apiAttack, mainTankLevel } = system

  return (
    <div className="house-grid-wrapper" style={wrapperStyle}>
      <div className="hg-header">
        <span className="hg-title" style={headerTitleStyle}>Residential Supply</span>
        <span className="hg-sub" style={headerSubStyle}>4 Units Active</span>
      </div>
      <div className="house-grid">
        {houses.map(house => (
          <HouseCard
            key={house.id}
            house={house}
            onToggle={toggleConsumption}
            apiAttack={apiAttack}
            mainTankLevel={mainTankLevel}
          />
        ))}
      </div>
    </div>
  )
}
