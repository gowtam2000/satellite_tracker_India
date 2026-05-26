import { motion } from 'framer-motion'
import {
  Play, Pause, SkipBack, SkipForward,
  ChevronsLeft, ChevronsRight, RotateCcw
} from 'lucide-react'
import useStore from '../store/useStore'

const SPEEDS = [0.1, 0.5, 1, 10, 100, 500, 1000]
const SPEED_LABELS = {
  0.1: '0.1×', 0.5: '0.5×', 1: '1×',
  10: '10×', 100: '100×', 500: '500×', 1000: '1000×'
}

const TimeControls = () => {
  const {
    simulationSpeed, setSimulationSpeed,
    isPlaying, togglePlayPause,
    currentTime, setCurrentTime,
  } = useStore()

  const speedIdx = SPEEDS.indexOf(simulationSpeed)

  const increaseSpeed = () => {
    const next = SPEEDS[Math.min(SPEEDS.length - 1, speedIdx + 1)]
    setSimulationSpeed(next)
  }
  const decreaseSpeed = () => {
    const prev = SPEEDS[Math.max(0, speedIdx - 1)]
    setSimulationSpeed(prev)
  }
  const resetTime = () => {
    setCurrentTime(Date.now())
    setSimulationSpeed(1)
  }

  const now = new Date(currentTime)
  const hh = now.getUTCHours().toString().padStart(2, '0')
  const mm = now.getUTCMinutes().toString().padStart(2, '0')
  const ss = now.getUTCSeconds().toString().padStart(2, '0')
  const doy = Math.ceil((now - new Date(now.getUTCFullYear(), 0, 1)) / 86400000)

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-panel px-4 py-3 flex items-center gap-3 z-10"
    >
      {/* UTC clock */}
      <div className="text-xs font-mono text-cyan-bright/60 tracking-wider mr-2 hidden sm:block">
        UTC {hh}:{mm}:{ss}
        <div className="text-[9px] text-cyan-bright/40">{now.getUTCFullYear()}.{doy.toString().padStart(3, '0')}</div>
      </div>

      <div className="w-px h-8 bg-cyan-bright/20" />

      {/* Controls */}
      <CtrlBtn icon={ChevronsLeft} onClick={() => setSimulationSpeed(-Math.abs(simulationSpeed))} title="Reverse" />
      <CtrlBtn icon={SkipBack} onClick={decreaseSpeed} title="Slow Down" />
      <CtrlBtn
        icon={isPlaying ? Pause : Play}
        onClick={togglePlayPause}
        title={isPlaying ? 'Pause' : 'Play'}
        active
      />
      <CtrlBtn icon={SkipForward} onClick={increaseSpeed} title="Speed Up" />
      <CtrlBtn icon={ChevronsRight} onClick={() => setSimulationSpeed(1000)} title="Max Speed" />
      <CtrlBtn icon={RotateCcw} onClick={resetTime} title="Reset Time" />

      <div className="w-px h-8 bg-cyan-bright/20" />

      {/* Speed display */}
      <div className="text-center min-w-[70px]">
        <div className="text-xs font-bold text-cyan-neon tracking-widest">
          {SPEED_LABELS[Math.abs(simulationSpeed)] || `${simulationSpeed}×`}
        </div>
        <div className="text-[9px] text-cyan-bright/40 tracking-wider">SIM SPEED</div>
      </div>

      {/* Speed bar */}
      <div className="hidden sm:flex items-center gap-1">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => setSimulationSpeed(s)}
            className={`w-1.5 rounded-full transition-all duration-200 ${
              simulationSpeed >= s ? 'bg-cyan-neon h-5' : 'bg-cyan-bright/20 h-3'
            }`}
          />
        ))}
      </div>
    </motion.div>
  )
}

const CtrlBtn = ({ icon: Icon, onClick, title, active }) => (
  <button
    onClick={onClick}
    title={title}
    className={`w-8 h-8 rounded flex items-center justify-center transition-all duration-200 ${
      active
        ? 'bg-cyan-bright/20 border border-cyan-bright/50 hover:bg-cyan-bright/30 hover:shadow-lg hover:shadow-cyan-neon/20'
        : 'bg-transparent border border-cyan-bright/20 hover:bg-cyan-bright/10 hover:border-cyan-bright/40'
    }`}
  >
    <Icon className="w-4 h-4 text-cyan-bright" />
  </button>
)

export default TimeControls
