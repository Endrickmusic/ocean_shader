import { OrbitControls, useEnvironment, Box } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useRef, useMemo, useEffect } from "react"
import { DoubleSide, Vector2, Color, BoxGeometry, MeshNormalMaterial } from "three"
import { useControls } from "leva"

import ModifiedShader from './ModifiedShader.jsx'


export default function Shader(){

    const meshRef = useRef()
    const materialRef = useRef()
    const debugObject = {}

    debugObject.depthColor = '#4242c1'
    debugObject.surfaceColor = '#ffb700'

    const options = useControls("Controls",{
      BigElevation: { value: 0.02, min: -5, max: 5, step: 0.001 },
      BigFrequency: { value: 3.5, min: -5, max: 5, step: 0.001 },
      BigSpeed: { value: 0.5, min: -5, max: 5, step: 0.001 },
      Wireframe: false
      })


      useEffect((state, delta) => {
 
          if (meshRef.current.material.userData.shader) {

            meshRef.current.material.userData.shader.uniforms.uBigWaveElevation.value = options.BigElevation
            meshRef.current.material.userData.shader.uniforms.uBigWaveFrequency.value = options.BigFrequency
            meshRef.current.material.userData.shader.uniforms.uBigWaveSpeed.value = options.BigSpeed
            
            materialRef.current.wireframe = options.Wireframe
          }

          meshRef.current.geometry.computeVertexNormals()
        },
        [options]

      )
  
  const envMap = useEnvironment({files:'./environments/aerodynamics_workshop_2k.hdr'})
  const viewport = useThree(state => state.viewport)
  
  return (
    <>
      <OrbitControls />  

      <directionalLight 
      position={[0, 5, 0]}
      />

      <group>      
        <mesh 
        ref={meshRef}
        scale={1}
        rotation={[-0.0*Math.PI, 0, 0]}
        >
            <planeGeometry 
            args={[1, 1, 128, 128]} 
            />
            <meshStandardMaterial
              ref={materialRef}
              side={DoubleSide}
              wireframe={false}
              roughness={1.0}
              metalness={1.0}
              envMap={envMap}
            />
        </mesh>

        <ModifiedShader 
        options={options}
        meshRef={meshRef}
        />

        <Box
        position={[-2, 0, 0]}
        >
          <meshNormalMaterial />
        </Box>
      </group>
   
   </>
  )}
