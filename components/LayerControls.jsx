import { motion } from 'framer-motion'
import useStore from '../store/useStore'

const layers = [
  { key: 'showOrbits',          label: 'ORBITS',    color: '#00c8ff', toggle: 'toggleOrbits' },
  { key: 'showGrid',            label: 'GRID',      color: '#4488cc', toggle: 'toggleGrid' },
  { key: 'showAtmosphere',      label: 'ATMO',      color: '#0040ff', toggle: 'toggleAtmosphere' },
  { key: 'showStars',           label: 'STARS',     color: '#ffffff', toggle: 'toggleStars' },
  { key: 'showLabels',          label: 'LABELS',    color: '#88ff88', toggle: 'toggleLabels' },
  { key: 'showGroundTracks',    label: 'TRACKS',    color: '#ffaa00', toggle: 'toggleGroundTracks' },
  { key: 'showVelocityVectors', label: 'VECTORS',   color: '#ff4488', toggle: 'toggleVelocityVectors' },
  { key: 'autoRotate',          label: 'AUTO ROT',  color: '#aa88ff', toggle: 'toggleAutoRotate' },
]

const LayerControls = () => {
  const store = useStore()

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="absolute bottom-4 left-4 glass-panel px-4 py-2 flex flex-wrap gap-2 z-10 max-w-[200px]"
    >
      {layers.map(({ key, label, color, toggle }) => {
        const isOn = store[key]
        return (
          <button
            key={key}
            onClick={store[toggle]}
            className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] tracking-wider font-medium transition-all duration-200 ${
              isOn
                ? 'border-cyan-bright/40 bg-cyan-bright/10'
                : 'border-cyan-bright/10 bg-transparent opacity-50'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                background: isOn ? color : '#334',
                boxShadow: isOn ? `0 0 6px ${color}` : 'none',
              }}
            />
            <span className={isOn ? 'text-cyan-bright' : 'text-cyan-bright/40'}>
              {label}
            </span>
          </button>
        )
      })}
    </motion.div>
  )
}

export default LayerControls
