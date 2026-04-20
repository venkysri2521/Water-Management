import { useEffect, useRef, useState } from 'react'
import './PilferageAlert.css'

export default function PilferageAlert({ onDismiss }) {
  const [buzzing, setBuzzing] = useState(true)
  const intervalRef = useRef(null)

  useEffect(() => {
    // Simulate buzzer beeping
    let count = 0
    intervalRef.current = setInterval(() => {
      setBuzzing(b => !b)
      count++
      if (count > 20) clearInterval(intervalRef.current)
    }, 300)

    return () => clearInterval(intervalRef.current)
  }, [])

  return (
    <div className="pilferage-overlay">
      <div className={`pilferage-modal ${buzzing ? 'buzzing' : ''}`}>
        {/* Buzzer graphic */}
        <div className="buzzer-container">
          <div className={`buzzer-body ${buzzing ? 'buzz-active' : ''}`}>
            <div className="buzzer-core" />
            <div className="buzzer-ring r1" />
            <div className="buzzer-ring r2" />
            <div className="buzzer-ring r3" />
          </div>
          <div className="buzz-waves">
            <div className="bwave bw1" />
            <div className="bwave bw2" />
            <div className="bwave bw3" />
          </div>
        </div>

        <div className="pilferage-content">
          <div className="pilferage-badge">⚠ PILFERAGE DETECTED</div>
          <h2 className="pilferage-title">Unauthorized Water Access</h2>
          <p className="pilferage-desc">
            Water is being drained from the main pipe. The system has detected
            unauthorized extraction at the pipeline junction.
          </p>
          <div className="pilferage-info">
            <div className="pinfo-item">
              <span className="pinfo-label">Alert Type</span>
              <span className="pinfo-val red">PILFERAGE</span>
            </div>
            <div className="pinfo-item">
              <span className="pinfo-label">Status</span>
              <span className="pinfo-val red">ACTIVE</span>
            </div>
            <div className="pinfo-item">
              <span className="pinfo-label">Action</span>
              <span className="pinfo-val">Water flow halted</span>
            </div>
          </div>
          <button className="pilferage-dismiss" onClick={onDismiss}>
            Acknowledge & Stop Drain
          </button>
        </div>
      </div>
    </div>
  )
}
