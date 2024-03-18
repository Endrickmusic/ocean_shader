import { useMemo, useLayoutEffect } from "react"
import { useFrame } from '@react-three/fiber'

export default function modMaterial( { materialRef, options } ) {

    const customUniforms = useMemo(
        () => ({
          uTime: {
            type: "f",
            value: 1.0,
              },
          uBigWaveElevation: {
              type: "f",
              value: options.BigElevation,
              },
               
          uBigWaveFrequency: {
              type: "f",
              value: options.BigFrequency,
              },
               
          uBigWaveSpeed: {
              type: "f",
              value: options.BigSpeed,
              },
          uNoiseRangeDown: {
              type: "f",
              value: options.NoiseRangeDown,
              },
          uNoiseRangeUp: {
              type: "f",
              value: options.NoiseRangeUp,
              }
         }),[]
      )   

    useFrame((state, delta) => {
        if (materialRef.current.userData.shader){
        materialRef.current.userData.shader.uniforms.uTime.value += delta
      }   
      })

    useLayoutEffect(() => {
      console.log(materialRef.current)

    
    materialRef.current.onBeforeCompile = (shader) => {

    shader.uniforms = {...customUniforms, ...shader.uniforms }  

    shader.vertexShader = shader.vertexShader.replace(

        '#include <common>',
        `
            #include <common>

            uniform float uTime;
            uniform float uParameter1;
            uniform float uParameter2;

            uniform float uBigWaveElevation;
            uniform float uBigWaveFrequency;
            uniform float uBigWaveSpeed;

            uniform float uNoiseRangeUp;
            uniform float uNoiseRangeDown;
            uniform float uSmallWaveSpeed;
            uniform float uSmallWaveIteration;

            varying vec2 vUv;
            varying vec3 vColor;
            varying float vElevation;

            // float PI = 3.141592;

            //	Classic Perlin 3D Noise 
            //	by Stefan Gustavson
            //
            vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
            vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
            vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

            float cnoise(vec3 P){
              vec3 Pi0 = floor(P); // Integer part for indexing
              vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
              Pi0 = mod(Pi0, 289.0);
              Pi1 = mod(Pi1, 289.0);
              vec3 Pf0 = fract(P); // Fractional part for interpolation
              vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
              vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
              vec4 iy = vec4(Pi0.yy, Pi1.yy);
              vec4 iz0 = Pi0.zzzz;
              vec4 iz1 = Pi1.zzzz;

              vec4 ixy = permute(permute(ix) + iy);
              vec4 ixy0 = permute(ixy + iz0);
              vec4 ixy1 = permute(ixy + iz1);

              vec4 gx0 = ixy0 / 7.0;
              vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
              gx0 = fract(gx0);
              vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
              vec4 sz0 = step(gz0, vec4(0.0));
              gx0 -= sz0 * (step(0.0, gx0) - 0.5);
              gy0 -= sz0 * (step(0.0, gy0) - 0.5);

              vec4 gx1 = ixy1 / 7.0;
              vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
              gx1 = fract(gx1);
              vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
              vec4 sz1 = step(gz1, vec4(0.0));
              gx1 -= sz1 * (step(0.0, gx1) - 0.5);
              gy1 -= sz1 * (step(0.0, gy1) - 0.5);

              vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
              vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
              vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
              vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
              vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
              vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
              vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
              vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

              vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
              g000 *= norm0.x;
              g010 *= norm0.y;
              g100 *= norm0.z;
              g110 *= norm0.w;
              vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
              g001 *= norm1.x;
              g011 *= norm1.y;
              g101 *= norm1.z;
              g111 *= norm1.w;

              float n000 = dot(g000, Pf0);
              float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
              float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
              float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
              float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
              float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
              float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
              float n111 = dot(g111, Pf1);

              vec3 fade_xyz = fade(Pf0);
              vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
              vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
              float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
              return 2.2 * n_xyz;
            }

            float waveElevation(vec3 p){
              float elevation = sin(p.x * uBigWaveFrequency + uTime * uBigWaveSpeed) *
                                uBigWaveElevation;

              // float elevation = sin(position.x * uBigWaveFrequency + uTime * 0.2) * 
              //                   cos(position.z * uBigWaveFrequency + uTime * 0.2 * 0.5) * 
              //                   uBigWaveElevation;
              // for(float i = 1.0; i <= 4.; i++)
              // {
              // elevation -= abs(cnoise(vec3(modelPosition.yz * uSmallWaveFrequency * i, uTime * uSmallWaveSpeed)) * uSmallWaveElevation / i);
              // elevation -= abs(cnoise(vec3(position.xz * 5. * i, uTime * 0.2)) * 0.2 / i);
              // }
              
              return elevation;
            }

            float distortedPos(vec3 p){
                float n = cnoise(p * uBigWaveFrequency + uTime * uBigWaveSpeed) * uBigWaveElevation;
                float noiseArea = sin(smoothstep(uNoiseRangeDown, uNoiseRangeUp, p.y) * PI);
                return n * noiseArea;
            }

            vec3 orthogonal(vec3 n){
              return normalize(
                  abs(n.x) > abs(n.z) ? vec3(-n.y, n.x, 0.) : vec3(0., -n.z, n.y)
              );
            }
        ` 
        )

    shader.vertexShader = shader.vertexShader.replace(
            '#include <beginnormal_vertex>',
           
            `
            #include <beginnormal_vertex>
            
            // Compute normals

                vec3 displacedPosition = position + normal * distortedPos(position);

                float eps = 0.001;    

                vec3 tangent = orthogonal(normal);
                vec3 bitangent = normalize(cross(tangent, normal));

                vec3 neighbour1 = position + tangent * eps;
                vec3 neighbour2 = position + bitangent * eps;

                vec3 displacedN1 = neighbour1 + normal * distortedPos(neighbour1);
                vec3 displacedN2 = neighbour2 + normal * distortedPos(neighbour2);

                vec3 displacedTangent = displacedN1 - displacedPosition;
                vec3 displacedBitangent = displacedN2 - displacedPosition;

                vec3 displacedNormal = normalize(cross(displacedTangent, displacedBitangent));
                
            `
        )

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
         #include <begin_vertex>    
              
        transformed = displacedPosition;

                // transformed.z += elevation;
                
                // Varyings
                vUv = uv;
                vNormal = displacedNormal;
        `)

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <common>',
          `
          #include <common>
          uniform float uTime;
          uniform float progress;
          uniform sampler2D texture1;
          uniform vec4 uResolution;
          uniform vec3 uDepthColor;
          uniform vec3 uSurfaceColor;
          uniform float uColorOffset;
          uniform float uColorMultiplier;

          varying vec2 vUv;
          varying vec3 vPosition;
          varying vec3 vColor;
          varying float vElevation;
          `
     )
        shader.fragmentShader = shader.fragmentShader.replace(

          '#include <color_fragment>',
          `
          #include <color_fragment>

          vec3 col = 0.5 + 0.5 * cos(uTime * 0.4 + vUv.xyx + vec3(0,2,4));
          diffuseColor = vec4(col, 1.0);
          `
     )


     materialRef.current.userData.shader = shader
    }
  console.log(materialRef.current)

}, [])


}

