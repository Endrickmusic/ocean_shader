import { OrbitControls, useEnvironment } from "@react-three/drei"
import { useRef, useEffect } from "react"
import { DoubleSide } from "three"
import { useControls } from "leva"

import ModifiedShader from './ModifiedShader.jsx'


export default function Shader(){

    const meshRef = useRef()
    const materialRef = useRef()
    const debugObject = {}

    debugObject.Color = '#4242c1'

    const options = useControls("Controls",{
      BigElevation: { value: 0.2, min: -5, max: 5, step: 0.001 },
      BigFrequency: { value: 2.5, min: 0, max: 30, step: 0.001 },
      BigSpeed: { value: .5, min: -5, max: 5, step: 0.001 },
      Wireframe: false
      })


      useEffect((state, delta) => {
 
          if (meshRef.current.material.userData.shader) {

            meshRef.current.material.userData.shader.uniforms.uBigWaveElevation.value = options.BigElevation
            meshRef.current.material.userData.shader.uniforms.uBigWaveFrequency.value = options.BigFrequency
            meshRef.current.material.userData.shader.uniforms.uBigWaveSpeed.value = options.BigSpeed
            
            materialRef.current.wireframe = options.Wireframe
          }
        },
        [options]

      )
  
  const envMap = useEnvironment({files:'./environments/aerodynamics_workshop_2k.hdr'})
  
  return (
    <>
      <OrbitControls />  

      <directionalLight 
      position={[0, 2, 0]}
      intensity={3}
      />
      <group>      
        <mesh 
        ref={meshRef}
        scale={1}
        rotation={[Math.PI, 0, 0.2 * Math.PI]}
        position={[-0.2, -0.15, 0]}
        >
            <coneGeometry 
            args={[.5, 1., 128, 128]} 
            />
            <meshStandardMaterial
              ref={materialRef}
              side={DoubleSide}
              wireframe={false}
              roughness={0.2}
              metalness={1.0}
              envMap={envMap}
            />
        </mesh>

        <ModifiedShader 
        options={options}
        meshRef={meshRef}
        /> 

      </group>
   
   </>
  )}
