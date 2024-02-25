import { OrbitControls, useEnvironment } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useRef, useMemo, useEffect } from "react"
import { DoubleSide, Vector2, Color } from "three"
import { useControls } from "leva"

import vertexShader from "./shader/ocean/vertexShader.js"
import fragmentShader from "./shader/ocean/fragmentShader.js"

import ModifiedShader from './ModifiedShader.jsx'


export default function Shader(){

    const meshRef = useRef()
    const materialRef = useRef()
    const debugObject = {}

    debugObject.depthColor = '#4242c1'
    debugObject.surfaceColor = '#ffb700'

    const options = useControls("Controls",{
      parameter1: { value: 0.5, min: -5, max: 5, step: 0.001 },
      parameter2: { value: 0.0, min: -5, max: 5, step: 0.001 },
      Wireframe: false
      })

    useFrame((state) => {

      let time = state.clock.getElapsedTime()
      // meshRef.current.material.uniforms.uTime.value = time
    
    })
  
      // Define the shader uniforms with memoization to optimize performance
      const uniforms = useMemo(
        () => ({
          uTime: {
            type: "f",
            value: 1.0,
              },
          uResolution: {
            type: "v2",
            value: new Vector2(4, 3),
            },
          uParameter1: {
              type: "f",
              value: options.parameter1,
              },
          uParameter2: {
              type: "f",
              value: options.parameter2,
              }
         }),[]
      )   

      useEffect(
        (state, delta) => {

          
          if (meshRef.current.material.userData.shader) {

            meshRef.current.material.userData.shader.uniforms.uParameter1.value = options.parameter1
            meshRef.current.material.userData.shader.uniforms.uParameter2.value = options.parameter2
            
            materialRef.current.wireframe = options.Wireframe
          }
        },
        [options]
      )
  
  const envMap = useEnvironment({files:'./environments/aerodynamics_workshop_2k.hdr'})
  const viewport = useThree(state => state.viewport)
  
  return (
    <>
      <OrbitControls />  

      <directionalLight />

      <group>      
        <mesh 
        ref={meshRef}
        scale={1}
        rotation={[0.6*Math.PI, 0, 0]}
        >
            <planeGeometry args={[1, 1, 512, 512]} />
            <meshStandardMaterial
              ref={materialRef}
              side={DoubleSide}
              wireframe={true}
              roughness={0.3}
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
