import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { X, MapPin, Gauge, Orbit, Clock } from 'lucide-react'
import useStore from '../store/useStore'
import { getSatellitePosition, getOrbitalParameters, getOrbitType } from '../utils/satellite'

const InfoPanel = () => {
  const { selectedSatellite, selectSatellite, infoPanelCollapsed, currentTime } = useStore()
  const [telemetry, setTelemetry] = useState(null)
  const [orbitalParams, setOrbitalParams] = useState(null)
  
  useEffect(() => {
    if (!selectedSatellite) return
    
    const date = new Date(currentTime)
    const position = getSatellitePosition(selectedSatellite, date)
    const params = getOrbitalParameters(selectedSatellite.satrec)
    
    if (position) {
      setTelemetry(position)
      setOrbitalParams(params)
    }
  }, [selectedSatellite, currentTime])
  
  if (!selectedSatellite || infoPanelCollapsed) return null
  
  const orbitType = telemetry ? getOrbitType(telemetry.altitude) : 'LEO'
  
  const ORBIT_BADGES = {
    LEO: 'badge-leo',
    MEO: 'badge-meo',
    GEO: 'badge-geo',
    HEO: 'badge-heo',
  }
  
  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute right-0 top-0 w-80 h-full glass-panel flex flex-col m-4 z-10"
    >
      {/* Header */}
      <div className="p-4 border-b border-cyan-bright/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-glow-pulse" />
          <h2 className="text-xs font-bold tracking-widest text-cyan-neon uppercase">
            Telemetry
          </h2>
        </div>
        <button
          onClick={() => selectSatellite(null)}
          className="p-1 hover:bg-cyan-bright/10 rounded transition-colors"
        >
          <X className="w-4 h-4 text-cyan-bright/60" />
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        {/* Satellite name */}
        <div className="mb-4">
          <h3 className="text-sm font-bold text-cyan-neon tracking-wide mb-2">
            {selectedSatellite.name}
          </h3>
          <span className={`orbit-badge ${ORBIT_BADGES[orbitType]} inline-block px-2 py-1 rounded text-[10px] font-semibold tracking-wider`}>
            {orbitType}
          </span>
        </div>
        
        {/* Real-time telemetry */}
        {telemetry && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <TelemetryCard
                icon={Gauge}
                label="Altitude"
                value={Math.round(telemetry.altitude)}
                unit="km"
              />
              <TelemetryCard
                icon={Gauge}
                label="Velocity"
                value={telemetry.velocityMagnitude.toFixed(2)}
                unit="km/s"
              />
              <TelemetryCard
                icon={MapPin}
                label="Latitude"
                value={telemetry.latitude.toFixed(2)}
                unit="°"
              />
              <TelemetryCard
                icon={MapPin}
                label="Longitude"
                value={telemetry.longitude.toFixed(2)}
                unit="°"
              />
            </div>
            
            {/* Orbital parameters */}
            {orbitalParams && (
              <>
                <div className="mb-3">
                  <h4 className="text-[10px] font-semibold tracking-wider text-cyan-bright/50 uppercase mb-2">
                    Orbital Elements
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <TelemetryCard
                      icon={Orbit}
                      label="Inclination"
                      value={orbitalParams.inclination.toFixed(1)}
                      unit="°"
                    />
                    <TelemetryCard
                      icon={Clock}
                      label="Period"
                      value={orbitalParams.periodMinutes.toFixed(1)}
                      unit="min"
                    />
                  </div>
                </div>
                
                <div className="glass-panel-dark p-3 rounded-md">
                  <div className="space-y-2 text-xs">
                    <DataRow label="Perigee" value={`${Math.round(orbitalParams.perigee)} km`} />
                    <DataRow label="Apogee" value={`${Math.round(orbitalParams.apogee)} km`} />
                    <DataRow label="Eccentricity" value={orbitalParams.eccentricity.toFixed(6)} />
                    <DataRow label="RAAN" value={`${orbitalParams.raan.toFixed(2)}°`} />
                    <DataRow label="Arg of Perigee" value={`${orbitalParams.argOfPerigee.toFixed(2)}°`} />
                  </div>
                </div>
              </>
            )}
          </>
        )}
        
        {/* Satellite info */}
        <div className="mt-4 glass-panel-dark p-3 rounded-md">
          <div className="text-[10px] text-cyan-bright/50 tracking-wider uppercase mb-2">
            Satellite ID
          </div>
          <div className="text-sm text-cyan-bright/90 font-mono">
            {selectedSatellite.noradId}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const TelemetryCard = ({ icon: Icon, label, value, unit }) => {
  return (
    <div className="glass-panel-dark p-3 rounded-md">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3 h-3 text-cyan-bright/40" />
        <div className="text-[9px] text-cyan-bright/50 tracking-wider uppercase">
          {label}
        </div>
      </div>
      <div className="text-sm font-bold text-cyan-bright/90">
        {value}
        <span className="text-[10px] text-cyan-bright/40 ml-1 font-normal">{unit}</span>
      </div>
    </div>
  )
}

const DataRow = ({ label, value }) => {
  return (
    <div className="flex justify-between items-center">
      <span className="text-cyan-bright/50">{label}</span>
      <span className="text-cyan-bright/90 font-medium">{value}</span>
    </div>
  )
}

export default InfoPanel
