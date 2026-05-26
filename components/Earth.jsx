import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import * as satellite from 'satellite.js'
import useStore from '../store/useStore'

const EARTH_RADIUS = 1.0 // 1 unit = 6371 km

const Earth = () => {
  const earthRef = useRef()
  const atmosphereRef = useRef()
  const cloudsRef = useRef()
  const gridRef = useRef()
  
  const { showAtmosphere, showGrid, currentTime, isPlaying } = useStore()
  
  // Earth rotation based on Greenwich Mean Sidereal Time (GMST)
  useFrame(() => {
    if (earthRef.current) {
      const date = new Date(currentTime)
      const gmst = satellite.gstime(date)
      
      earthRef.current.rotation.y = gmst
      if (gridRef.current) gridRef.current.rotation.y = gmst
      if (cloudsRef.current) cloudsRef.current.rotation.y = gmst * 1.02 // Slightly faster for drift
    }
  })
  
  // Procedural Earth texture (continents approximation)
  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 1024
    const ctx = canvas.getContext('2d')
    
    // Ocean base
    ctx.fillStyle = '#0a2845'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Noise-based land masses (simplified)
    ctx.fillStyle = '#1a4a2a'
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const size = Math.random() * 40 + 10
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
    
    // Ice caps
    ctx.fillStyle = '#d0e0f0'
    ctx.fillRect(0, 0, canvas.width, 80)
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80)
    
    return new THREE.CanvasTexture(canvas)
  }, [])
  
  // Cloud layer texture
  const cloudTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 1024
    const ctx = canvas.getContext('2d')
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Random cloud patches
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const size = Math.random() * 60 + 20
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
    
    return new THREE.CanvasTexture(canvas)
  }, [])
  
  return (
    <group>
      {/* Main Earth sphere */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        <meshPhongMaterial
          map={earthTexture}
          emissive="#051520"
          emissiveIntensity={0.2}
          shininess={25}
          specular="#224466"
        />
      </mesh>
      
      {/* Cloud layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[EARTH_RADIUS * 1.01, 64, 64]} />
        <meshPhongMaterial
          map={cloudTexture}
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>
      
      {/* Atmosphere glow */}
      {showAtmosphere && (
        <>
          <mesh ref={atmosphereRef}>
            <sphereGeometry args={[EARTH_RADIUS * 1.06, 32, 32]} />
            <meshPhongMaterial
              color="#0066ff"
              emissive="#002244"
              transparent
              opacity={0.12}
              side={THREE.FrontSide}
              depthWrite={false}
            />
          </mesh>
          
          <mesh>
            <sphereGeometry args={[EARTH_RADIUS * 1.02, 32, 32]} />
            <meshPhongMaterial
              color="#0088ff"
              emissive="#001133"
              transparent
              opacity={0.08}
              side={THREE.BackSide}
              depthWrite={false}
            />
          </mesh>
        </>
      )}
      
      {/* Lat/Lon Grid */}
      {showGrid && (
        <group ref={gridRef}>
          <LatLonGrid radius={EARTH_RADIUS} />
        </group>
      )}
    </group>
  )
}

// Latitude/Longitude Grid Lines
const LatLonGrid = ({ radius }) => {
  const lines = useMemo(() => {
    const lineGeometries = []
    
    // Latitude lines (parallels)
    for (let lat = -80; lat <= 80; lat += 20) {
      const points = []
      const phi = (90 - lat) * (Math.PI / 180)
      
      for (let lon = 0; lon <= 360; lon += 5) {
        const theta = lon * (Math.PI / 180)
        const x = radius * Math.sin(phi) * Math.cos(theta)
        const y = radius * Math.cos(phi)
        const z = radius * Math.sin(phi) * Math.sin(theta)
        points.push(new THREE.Vector3(x, y, z))
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      lineGeometries.push(geometry)
    }
    
    // Longitude lines (meridians)
    for (let lon = 0; lon < 360; lon += 20) {
      const points = []
      const theta = lon * (Math.PI / 180)
      
      for (let lat = -90; lat <= 90; lat += 5) {
        const phi = (90 - lat) * (Math.PI / 180)
        const x = radius * Math.sin(phi) * Math.cos(theta)
        const y = radius * Math.cos(phi)
        const z = radius * Math.sin(phi) * Math.sin(theta)
        points.push(new THREE.Vector3(x, y, z))
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      lineGeometries.push(geometry)
    }
    
    return lineGeometries
  }, [radius])
  
  return (
    <>
      {lines.map((geometry, i) => (
        <line key={i} geometry={geometry}>
          <lineBasicMaterial color="#004488" transparent opacity={0.25} />
        </line>
      ))}
    </>
  )
}

export default Earth
