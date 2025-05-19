import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Float } from '@react-three/drei'

function Vegetable() {
  return (
    <Float
      speed={1.5} 
      rotationIntensity={0.5} 
      floatIntensity={0.5}
    >
      <group>
        {/* Tomato body */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#e74c3c" roughness={0.5} />
        </mesh>
        
        {/* Tomato stem */}
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.3, 16]} />
          <meshStandardMaterial color="#27ae60" />
        </mesh>
        
        {/* Leaf */}
        <mesh position={[0.2, 1, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[0.4, 0.1, 0.2]} />
          <meshStandardMaterial color="#2ecc71" />
        </mesh>
      </group>
    </Float>
  )
}

export default function VegetableModel() {
  return (
    <div className="h-[500px] w-full bg-gradient-to-b from-green-50 to-white rounded-2xl overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <spotLight 
          position={[10, 10, 10]} 
          angle={0.15} 
          penumbra={1} 
          intensity={1} 
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Vegetable />
        
        <OrbitControls
          enableZoom={false}
          autoRotate
          autoRotateSpeed={4}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  )
} 