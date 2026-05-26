import { Suspense, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import Earth from './Earth'
import Satellites from './Satellites'
import useStore from '../store/useStore'

const Scene = () => {
  const { showStars, autoRotate, followSelected, selectedSatellite } = useStore()
  
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 45, near: 0.001, far: 200 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.6} color="#112244" />
          <directionalLight
            position={[5, 2, 3]}
            intensity={1.2}
            color="#ffffff"
          />
          <pointLight position={[-5, -2, -3]} intensity={0.3} color="#4488cc" />
          
          {/* Stars background */}
          {showStars && <Stars radius={100} depth={50} count={3000} factor={4} fade speed={0.5} />}
          
          {/* Earth and satellites */}
          <Earth />
          <Satellites />
          
          {/* Camera controls */}
          <CameraControls autoRotate={autoRotate} />
        </Suspense>
      </Canvas>
    </div>
  )
}

const CameraControls = ({ autoRotate }) => {
  const controlsRef = useRef()
  const { followSelected, selectedSatellite, setFollowSelected } = useStore()
  
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate
      
      // Disable auto-rotate when user interacts
      const handleInteraction = () => {
        if (autoRotate) {
          setFollowSelected(false)
        }
      }
      
      controlsRef.current.addEventListener('start', handleInteraction)
      return () => {
        controlsRef.current?.removeEventListener('start', handleInteraction)
      }
    }
  }, [autoRotate, setFollowSelected])
  
  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      autoRotate={autoRotate}
      autoRotateSpeed={0.5}
      minDistance={1.3}
      maxDistance={8}
      enableDamping
      dampingFactor={0.05}
    />
  )
}

export default Scene
