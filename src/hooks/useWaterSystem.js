import { useState, useEffect, useRef, useCallback } from 'react'

const PURIFICATION_CAPACITY = 1000
const MAIN_TANK_CAPACITY = 500
const HOUSE_WALLET_MAX = 100
const WATER_COST_PER_LITER = 5
const FILL_RATE = 2 // ml per tick
const CONSUMPTION_RATE = 1.5
const MAIN_TANK_REFILL_START_PCT = 0.2
const MAIN_TANK_REFILL_STOP_PCT = 0.85

// Mock API function to log actions
const sendAPI = (actionName, payload) => {
  console.log(`%c[API SENT] %c${actionName}`, 'color: #0ea5e9; font-weight: bold;', 'color: inherit;', payload)
}

export function useWaterSystem() {
  const [reservoirLevel, setReservoirLevel] = useState(850)
  const [purificationLevel, setPurificationLevel] = useState(320)
  const [mainTankLevel, setMainTankLevel] = useState(410)
  const [purificationActive, setPurificationActive] = useState(true)
  const [pumpR2P, setPumpR2P] = useState(true) // reservoir to purification
  const [pumpP2M, setPumpP2M] = useState(false) // purification to main
  const [pilferageAlert, setPilferageAlert] = useState(false)
  const [pilferageActive, setPilferageActive] = useState(false)
  const [modbusAttack, setModbusAttack] = useState(false)
  const [apiAttack, setApiAttack] = useState(false)
  const [flowRateR2P, setFlowRateR2P] = useState(0)
  const [flowRateP2M, setFlowRateP2M] = useState(0)
  const [totalPurified, setTotalPurified] = useState(1240)
  const [fillTimeMain, setFillTimeMain] = useState(0)
  const [autoMode, setAutoMode] = useState(true)

  const [houses, setHouses] = useState([
    { id: 1, name: 'House 1', wallet: 75, consuming: false, consumed: 12.5, active: true },
    { id: 2, name: 'House 2', wallet: 42, consuming: true, consumed: 28.0, active: true },
    { id: 3, name: 'House 3', wallet: 18, consuming: false, consumed: 45.5, active: true },
    { id: 4, name: 'House 4', wallet: 60, consuming: true, consumed: 8.0, active: true },
  ])

  const tickRef = useRef(null)
  const pilferageSound = useRef(null)

  const dismissPilferage = useCallback(() => {
    setPilferageAlert(false)
    setPilferageActive(false)
  }, [])

  const triggerPilferage = useCallback(() => {
    if (pilferageActive || pilferageAlert) return
    setPilferageActive(true)
    
    // Play a buzzer sound
    if (!pilferageSound.current) {
      pilferageSound.current = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg')
    }
    
    // After 4 seconds, detect the pilferage and stop it
    setTimeout(() => {
      setPilferageActive(false)
      setPilferageAlert(true)
      
      sendAPI("Pilferage", {
        action: "Pilferage to be detected and water to be stopped",
        status: "Pilferage Detected",
        action_taken: "Water Stopped"
      })
      
      if (pilferageSound.current) {
        pilferageSound.current.play().catch(e => console.error('Audio play failed', e))
      }
    }, 4000)
  }, [pilferageActive, pilferageAlert])

  const triggerModbusAttack = useCallback(() => {
    setModbusAttack(true)
    // Stop filling even when tank is low
    setPumpP2M(false)
    setTimeout(() => setModbusAttack(false), 8000)
  }, [])

  const triggerApiAttack = useCallback(() => {
    setApiAttack(true)
    // Corrupt wallet data
    setHouses(prev => prev.map(h => ({ ...h, wallet: Math.max(0, h.wallet - Math.random() * 30) })))
    setTimeout(() => setApiAttack(false), 6000)
  }, [])

  const rechargeWallet = useCallback((houseId, amount) => {
    setHouses(prev => prev.map(h =>
      h.id === houseId ? { ...h, wallet: Math.min(HOUSE_WALLET_MAX, h.wallet + amount) } : h
    ))
  }, [])

  const toggleConsumption = useCallback((houseId) => {
    setHouses(prev => prev.map(h =>
      h.id === houseId ? { ...h, consuming: !h.consuming } : h
    ))
  }, [])

  const resetSystem = useCallback(() => {
    setReservoirLevel(1000)
    setPurificationLevel(0)
    setMainTankLevel(0)
    setPilferageAlert(false)
    setPilferageActive(false)
    setModbusAttack(false)
    setApiAttack(false)
    setHouses(prev => prev.map(h => ({ ...h, wallet: 100, consuming: false, consumed: 0 })))
  }, [])

  // Simulation tick
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setReservoirLevel(prev => {
        let level = prev
        if (pumpR2P && level > 0 && purificationLevel < PURIFICATION_CAPACITY) {
          const flow = 2 + Math.random() * 1
          setFlowRateR2P(flow)
          
          sendAPI("Water Purification", {
            action: "Water from Reservoir to Purification",
            "Quantity of water": level,
            "Flow of water": flow
          })
          
          level = Math.max(0, level - flow)
          setPurificationLevel(pl => {
            const newPl = Math.min(PURIFICATION_CAPACITY, pl + flow * 0.95)
            if (purificationActive) setTotalPurified(tp => tp + flow * 0.95)
            return newPl
          })
        } else {
          setFlowRateR2P(0)
        }
        // Auto refill reservoir slowly
        if (autoMode && level < 200) level = Math.min(1000, level + 5)
        return level
      })

      setPurificationLevel(prev => {
        let level = prev
        // Refill main tank with hysteresis so it starts early enough and
        // doesn't rapidly toggle near the stop threshold.
        const mainPct = mainTankLevel / MAIN_TANK_CAPACITY
        const shouldFillMain =
          !modbusAttack &&
          level > 50 &&
          (pumpP2M ? mainPct < MAIN_TANK_REFILL_STOP_PCT : mainPct <= MAIN_TANK_REFILL_START_PCT)

        if (shouldFillMain) {
          setPumpP2M(true)
          const flow = MAIN_TANK_CAPACITY / 240 // Takes 2 minutes (120s = 240 ticks)
          setFlowRateP2M(flow)
          
          sendAPI("Filling Main tank", {
            action: "Purification tank to Main Tank",
            "How much water is there in water tank": mainTankLevel,
            "Water flow rate": flow,
            "Time taken to fill the tank": fillTimeMain
          })
          
          level = Math.max(0, level - flow)
          setMainTankLevel(mt => {
            const newMt = Math.min(MAIN_TANK_CAPACITY, mt + flow)
            setFillTimeMain(t => t + 1/60)
            return newMt
          })
        } else {
          setPumpP2M(false)
          setFlowRateP2M(0)
        }
        return level
      })

      // House consumption
      setHouses(prev => prev.map(h => {
        if (!h.consuming || h.wallet <= 0 || mainTankLevel <= 0) return { ...h, consuming: h.wallet > 0 ? h.consuming : false }
        if (apiAttack) return h
        
        // 1 unit of main tank = 1 Liter = Rs. 5
        // Consume 0.5 Liters per tick (so the tank doesn't drain too fast, 4 houses * 0.5 = 2.0 L/tick)
        const requestedUsage = 0.5
        const maxAffordable = h.wallet / WATER_COST_PER_LITER
        const actualUsage = Math.min(requestedUsage, maxAffordable, mainTankLevel)
        
        sendAPI("House Water supply", {
          action: "Main Tank to House",
          "Quantity of water": h.consumed + actualUsage,
          "Flow of water": actualUsage,
          "Wallet amount": h.wallet
        })
        
        const cost = actualUsage * WATER_COST_PER_LITER
        const newWallet = Math.max(0, h.wallet - cost)
        
        setMainTankLevel(mt => Math.max(0, mt - actualUsage))
        
        return { 
          ...h, 
          wallet: newWallet, 
          consumed: h.consumed + actualUsage, 
          consuming: newWallet > 0 
        }
      }))

      // Pilferage drains main tank to reservoir
      if (pilferageActive) {
        setMainTankLevel(mt => {
          const amount = Math.min(mt, 10) // Drain 20 units/sec
          setReservoirLevel(r => Math.min(1000, r + amount))
          return mt - amount
        })
      }
    }, 500)

    return () => clearInterval(tickRef.current)
  }, [pumpR2P, pumpP2M, purificationActive, modbusAttack, apiAttack, pilferageActive, autoMode, mainTankLevel, purificationLevel])

  return {
    reservoirLevel, setReservoirLevel,
    purificationLevel,
    mainTankLevel,
    purificationActive, setPurificationActive,
    pumpR2P, setPumpR2P,
    pumpP2M, setPumpP2M,
    pilferageAlert, pilferageActive,
    modbusAttack, apiAttack,
    flowRateR2P, flowRateP2M,
    totalPurified,
    fillTimeMain,
    autoMode, setAutoMode,
    houses,
    dismissPilferage,
    triggerPilferage,
    triggerModbusAttack,
    triggerApiAttack,
    rechargeWallet,
    toggleConsumption,
    resetSystem,
    PURIFICATION_CAPACITY,
    MAIN_TANK_CAPACITY,
    HOUSE_WALLET_MAX,
  }
}
