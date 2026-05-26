import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import useStore from '../store/useStore'
import { getSatellitePosition, getOrbitPath, eciToThreeJs } from '../utils/satellite'

const KM_TO_UNIT = 1 / 6371 // Convert km to Three.js units

const CATEGORY_COLORS = {
  iss: '#00ff88',
  starlink: '#00c8ff',
  gps: '#ffb400',
  weather: '#ff6644',
  science: '#cc88ff',
  communication: '#8888ff',
  india: '#ff9933', // saffron color for India category
  all: '#ffffff',
}

const Satellites = () => {
  const { getFilteredSatellites } = useStore()
  const visibleSatellites = getFilteredSatellites()
  
  return (
    <group>
      {visibleSatellites.map((sat, index) => (
        <SatelliteWithOrbit key={sat.noradId || index} satellite={sat} />
      ))}
    </group>
  )
}

const SatelliteWithOrbit = ({ satellite }) => {
  const satRef = useRef()
  const orbitRef = useRef()
  const labelRef = useRef()
  
  const {
    currentTime,
    isPlaying,
    selectedSatellite,
    hoveredSatellite,
    setHoveredSatellite,
    selectSatellite,
    showOrbits,
    showVelocityVectors,
    showLabels,
    getFilteredSatellites,
  } = useStore()
  
  const isSelected = selectedSatellite?.noradId === satellite.noradId
  const color = CATEGORY_COLORS[satellite.category] || CATEGORY_COLORS.all
  
  // Update satellite position
  useFrame(({ camera }) => {
    if (!satRef.current) return
    
    const date = new Date(currentTime)
    const position = getSatellitePosition(satellite, date)
    
    if (position && position.eci) {
      const pos = eciToThreeJs(position.eci)
      satRef.current.position.set(pos.x, pos.y, pos.z)
      
      // Pulse effect for selected satellite
      if (isSelected) {
        const scale = 1 + 0.3 * Math.sin(Date.now() * 0.005)
        satRef.current.scale.setScalar(scale)
      } else {
        satRef.current.scale.setScalar(1)
      }
    }

    // Dynamic Label Occlusion & Proximity-based Visibility
    if (labelRef.current) {
      const isHovered = hoveredSatellite?.noradId === satellite.noradId
      const satPos = satRef.current.position
      const dist = camera.position.distanceTo(satPos)
      const camDist = camera.position.length()
      const isFront = dist < camDist
      
      // Calculate dynamic scale factor based on distance to camera (reference distance 2.5)
      const scaleFactor = 2.5 / dist
      const distanceScale = Math.max(0.4, Math.min(1.4, scaleFactor))
      
      if (isSelected || isHovered) {
        // High visibility for selected or hovered satellites (always shown, even on back side or zoomed out)
        labelRef.current.style.display = 'block'
        labelRef.current.style.opacity = '1'
        
        const finalScale = distanceScale * 1.15
        labelRef.current.style.transform = `scale(${finalScale})`
        
        if (isSelected) {
          labelRef.current.className = "text-[10px] text-cyan-neon bg-cyan-bright/25 border-2 border-cyan-neon px-2 py-0.5 rounded pointer-events-none whitespace-nowrap font-mono font-bold select-none shadow-[0_0_12px_rgba(0,240,255,0.5)]"
        } else {
          // Hovered satellite: lime green theme
          labelRef.current.className = "text-[9px] text-lime-neon bg-space-100 border border-lime-neon/60 px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap font-mono select-none"
        }
      } else if (showLabels && isFront) {
        // Normal labels: visible when on front side and zoomed in
        const filteredCount = getFilteredSatellites().length
        const isZoomedIn = camDist < 4.5
        const shouldShow = isZoomedIn || filteredCount <= 15
        
        if (shouldShow) {
          labelRef.current.style.display = 'block'
          
          // Fade smoothly as we zoom out towards 4.5 (only for large sets)
          let opacity = 1.0
          if (filteredCount > 15 && camDist > 3.0) {
            opacity = Math.max(0, Math.min(1, (4.5 - camDist) / 1.5))
          }
          
          labelRef.current.style.opacity = opacity.toString()
          
          const finalScale = distanceScale * (0.85 + 0.15 * opacity)
          labelRef.current.style.transform = `scale(${finalScale})`
          labelRef.current.className = "text-[9px] text-cyan-bright bg-space-100/90 border border-cyan-bright/30 px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap font-mono select-none"
          
          if (opacity === 0) {
            labelRef.current.style.display = 'none'
          }
        } else {
          labelRef.current.style.display = 'none'
          labelRef.current.style.opacity = '0'
        }
      } else {
        // Hidden if not selected/hovered and showLabels is false or satellite is on the back side
        labelRef.current.style.display = 'none'
        labelRef.current.style.opacity = '0'
      }
    }
  })
  
  // Generate orbit path
  const orbitPath = useMemo(() => {
    if (!satellite.satrec) return null
    
    // Propagate the orbit trail once from the initial date. Since ECI coordinates are
    // inertial, the orbit trail shape is static in the 3D scene and does not rotate with time.
    const points = getOrbitPath(satellite.satrec, new Date(), 180)
    return points.map(p => eciToThreeJs(p))
  }, [satellite.satrec])
  
  const orbitGeometry = useMemo(() => {
    if (!orbitPath) return null
    
    const vectors = orbitPath.map(p => new THREE.Vector3(p.x, p.y, p.z))
    return new THREE.BufferGeometry().setFromPoints(vectors)
  }, [orbitPath])
  
  const handleClick = (e) => {
    e.stopPropagation()
    selectSatellite(satellite)
  }
  
  const handlePointerOver = (e) => {
    e.stopPropagation()
    setHoveredSatellite(satellite)
    document.body.style.cursor = 'pointer'
  }
  
  const handlePointerOut = () => {
    setHoveredSatellite(null)
    document.body.style.cursor = 'default'
  }
  
  return (
    <group>
      {/* Satellite marker */}
      <mesh
        ref={satRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshBasicMaterial color={color} />
        <Html
          position={[0, 0.02, 0]}
          center
        >
          <div
            ref={labelRef}
            className="text-[9px] text-cyan-bright bg-space-100/90 border border-cyan-bright/30 px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap font-mono select-none"
            style={{ display: 'none', opacity: 0 }}
          >
            {satellite.name}
          </div>
        </Html>
      </mesh>
      
      {/* Orbit path */}
      {showOrbits && orbitGeometry && (
        <line ref={orbitRef} geometry={orbitGeometry}>
          <lineBasicMaterial
            color={color}
            transparent
            opacity={isSelected ? 0.7 : 0.25}
            linewidth={isSelected ? 2 : 1}
          />
        </line>
      )}
      
      {/* Velocity vector (optional) */}
      {showVelocityVectors && isSelected && (
        <VelocityVector satellite={satellite} color={color} />
      )}
    </group>
  )
}

const VelocityVector = ({ satellite, color }) => {
  const vectorRef = useRef()
  const { currentTime } = useStore()
  
  useFrame(() => {
    if (!vectorRef.current) return
    
    const date = new Date(currentTime)
    const position = getSatellitePosition(satellite, date)
    
    if (position && position.eci && position.velocity) {
      const satPos = eciToThreeJs(position.eci)
      const velScale = 0.0002 // Scale down velocity for visualization
      
      const velVec = {
        x: position.velocity.x * velScale,
        y: position.velocity.z * velScale,
        z: position.velocity.y * velScale,
      }
      
      const points = [
        new THREE.Vector3(satPos.x, satPos.y, satPos.z),
        new THREE.Vector3(
          satPos.x + velVec.x,
          satPos.y + velVec.y,
          satPos.z + velVec.z
        ),
      ]
      
      vectorRef.current.geometry.setFromPoints(points)
    }
  })
  
  return (
    <line ref={vectorRef}>
      <bufferGeometry />
      <lineBasicMaterial color={color} opacity={0.8} transparent linewidth={2} />
    </line>
  )
}

export default Satellites
