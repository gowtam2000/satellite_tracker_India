import { motion } from 'framer-motion'
import { Maximize2, Settings, Moon, Sun, RefreshCw, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import useStore from '../store/useStore'

const TopBar = ({ onRefreshTLE, isLoadingTLE, satCount }) => {
  const { toggleSettings, notifications } = useStore()
  const [isDark] = useState(true)

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  return (
    <motion.div
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 glass-panel px-5 py-2 flex items-center gap-4 z-20"
    >
      {/* Logo / title */}
      <div className="flex items-center gap-2">
        <span className="text-cyan-neon font-bold text-sm tracking-widest uppercase">
          ⬡ Orbital Command
        </span>
      </div>

      <div className="w-px h-5 bg-cyan-bright/20" />

      {/* Satellite count */}
      <div className="flex items-center gap-2 text-[11px]">
        <span className="w-1.5 h-1.5 rounded-full bg-lime-neon animate-glow-pulse" />
        <span className="text-cyan-bright/60">SATS:</span>
        <span className="text-lime-neon font-bold">{satCount}</span>
      </div>

      {/* Collision alerts */}
      {notifications.length > 0 && (
        <div className="flex items-center gap-1.5 text-[11px] text-yellow-400">
          <AlertTriangle className="w-3 h-3" />
          <span>{notifications.length} ALERT{notifications.length !== 1 ? 'S' : ''}</span>
        </div>
      )}

      <div className="w-px h-5 bg-cyan-bright/20" />

      {/* Refresh TLE */}
      <button
        onClick={onRefreshTLE}
        disabled={isLoadingTLE}
        className="flex items-center gap-1.5 btn-secondary"
        title="Refresh live TLE data"
      >
        <RefreshCw className={`w-3 h-3 ${isLoadingTLE ? 'animate-spin' : ''}`} />
        <span className="text-[10px]">{isLoadingTLE ? 'LOADING…' : 'LIVE TLE'}</span>
      </button>

      <button onClick={handleFullscreen} className="btn-secondary p-1.5" title="Fullscreen">
        <Maximize2 className="w-3 h-3" />
      </button>

      <button onClick={toggleSettings} className="btn-secondary p-1.5" title="Settings">
        <Settings className="w-3 h-3" />
      </button>
    </motion.div>
  )
}

export default TopBar
