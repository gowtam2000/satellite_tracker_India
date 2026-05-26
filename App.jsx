import { useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Scene from './components/Scene'
import Sidebar from './components/Sidebar'
import InfoPanel from './components/InfoPanel'
import TimeControls from './components/TimeControls'
import LayerControls from './components/LayerControls'
import TopBar from './components/TopBar'
import Notifications from './components/Notifications'
import StarfieldBackground from './components/StarfieldBackground'
import useStore from './store/useStore'
import { parseTLE } from './utils/satellite'
import { loadTLEData, SAMPLE_TLE_DATA } from './services/tleService'

const App = () => {
  const {
    setSatellites,
    satellites,
    isPlaying,
    simulationSpeed,
    currentTime,
    setCurrentTime,
    addNotification,
    selectedSatellite,
  } = useStore()

  const [isLoadingTLE, setIsLoadingTLE] = useState(false)
  const rafRef = useRef()
  const lastTickRef = useRef(performance.now())

  // ── Simulation time loop ──────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const now = performance.now()
      const dt = (now - lastTickRef.current) / 1000 // seconds
      lastTickRef.current = now

      if (isPlaying) {
        setCurrentTime(t => t + dt * simulationSpeed * 1000)
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isPlaying, simulationSpeed, setCurrentTime])

  // ── Load TLE data ─────────────────────────────────────────────
  const loadSatellites = async (useLive = false) => {
    setIsLoadingTLE(true)
    try {
      const tleRaw = useLive
        ? await loadTLEData(true)
        : SAMPLE_TLE_DATA

      const parsed = tleRaw
        .map(t => {
          const sat = parseTLE(t.name, t.line1, t.line2, t.category)
          return sat
        })
        .filter(Boolean)

      setSatellites(parsed)

      addNotification({
        type: 'success',
        title: 'Satellites Loaded',
        message: `Tracking ${parsed.length} satellites`,
        duration: 3000,
      })
    } catch (err) {
      console.error('Failed to load TLE:', err)
      addNotification({
        type: 'warning',
        title: 'TLE Load Failed',
        message: 'Using cached sample data',
        duration: 4000,
      })

      // Fallback to sample data
      const parsed = SAMPLE_TLE_DATA
        .map(t => parseTLE(t.name, t.line1, t.line2, t.category))
        .filter(Boolean)
      setSatellites(parsed)
    } finally {
      setIsLoadingTLE(false)
    }
  }

  // Initial load with sample data (no CORS issues)
  useEffect(() => {
    loadSatellites(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Collision check (simple, runs every 30s sim-time) ─────────
  const lastCollisionCheck = useRef(currentTime)
  useEffect(() => {
    if (currentTime - lastCollisionCheck.current < 30000) return
    lastCollisionCheck.current = currentTime
    // Basic proximity stub — extend with real check via checkCollision()
  }, [currentTime])

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020812]">
      {/* Starfield */}
      <StarfieldBackground />

      {/* 3D Globe */}
      <Scene />

      {/* Scan-line FX */}
      <div className="scan-line pointer-events-none" />

      {/* UI Panels */}
      <TopBar
        onRefreshTLE={() => loadSatellites(true)}
        isLoadingTLE={isLoadingTLE}
        satCount={satellites.length}
      />

      <Sidebar />

      <AnimatePresence>
        {selectedSatellite && <InfoPanel key="info" />}
      </AnimatePresence>

      <TimeControls />
      <LayerControls />
      <Notifications />
    </div>
  )
}

export default App
