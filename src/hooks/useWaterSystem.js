import { useState, useEffect, useRef, useCallback } from 'react'

const PURIFICATION_CAPACITY = 1000
const MAIN_TANK_CAPACITY = 500
const HOUSE_WALLET_MAX = 100
const WATER_COST_PER_LITER = 5
const FILL_RATE = 2 // ml per tick
const CONSUMPTION_RATE = 1.5
const MAIN_TANK_REFILL_START_PCT = 0.8
const MAIN_TANK_REFILL_STOP_PCT = 0.95

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
    setPilferageActive(true)
    setPilferageAlert(true)
  }, [])

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
          const flow = 3 + Math.random() * 1
          setFlowRateP2M(flow)
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
        const usage = CONSUMPTION_RATE * (0.8 + Math.random() * 0.4)
        const cost = usage * WATER_COST_PER_LITER / 1000
        const newWallet = Math.max(0, h.wallet - cost)
        setMainTankLevel(mt => Math.max(0, mt - usage / 4))
        return { ...h, wallet: newWallet, consumed: h.consumed + usage / 4, consuming: newWallet > 0 }
      }))

      // Pilferage drains main tank
      if (pilferageActive) {
        setMainTankLevel(mt => Math.max(0, mt - 3))
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
