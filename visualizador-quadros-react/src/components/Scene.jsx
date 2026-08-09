import { useEffect, useRef, useMemo, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, OrbitControls, ContactShadows, Html, SpotLight, Line } from '@react-three/drei'
import { EffectComposer, Bloom, N8AO } from '@react-three/postprocessing'
import * as THREE from 'three'
import FrameModel from './FrameModel'
import RodapeModel from './RodapeModel'

import { productSizes, modelMetaMap, rodapeModelsMap } from '../App'

// Procedural Texture Generators
function generateFloorTexture(type) {
  const cvs = document.createElement('canvas')
  cvs.width = 512; cvs.height = 512;
  const ctx = cvs.getContext('2d')
  
  if (type === 'parquet') {
    ctx.fillStyle = '#b8895e'; ctx.fillRect(0,0,512,512);
    ctx.fillStyle = '#9b6d45';
    for(let i=0; i<512; i+=64) {
      for(let j=0; j<512; j+=64) {
        if((i+j)%128===0) ctx.fillRect(i,j,64,64);
      }
    }
    ctx.strokeStyle = 'rgba(60,40,20,0.3)'; ctx.lineWidth = 2;
    for(let i=0; i<=512; i+=64) {
      ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,512); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(512,i); ctx.stroke();
    }
  } else if (type === 'concrete') {
    ctx.fillStyle = '#a0a5aa'; ctx.fillRect(0,0,512,512);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    for(let i=0; i<40; i++) {
      ctx.beginPath(); ctx.arc(Math.random()*512, Math.random()*512, 30+Math.random()*60, 0, Math.PI*2); ctx.fill();
    }
    ctx.strokeStyle = 'rgba(120,125,130,0.5)'; ctx.lineWidth = 2; ctx.strokeRect(0,0,512,512);
  } else if (type === 'marquina') {
      ctx.fillStyle = '#141414'; ctx.fillRect(0,0,512,512);
      ctx.strokeStyle = 'rgba(240,240,240,0.65)'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(0,40); ctx.bezierCurveTo(180,140, 220,320, 512,480); ctx.stroke();
      ctx.strokeStyle = 'rgba(197,157,74,0.55)'; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(120,0); ctx.bezierCurveTo(280,180, 380,260, 450,512); ctx.stroke();
  } else if (type === 'carrara') {
      ctx.fillStyle = '#f4f6f8'; ctx.fillRect(0,0,512,512);
      ctx.strokeStyle = 'rgba(160,175,190,0.35)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(30,0); ctx.bezierCurveTo(150,120, 80,300, 300,512);
      ctx.moveTo(200,0); ctx.bezierCurveTo(350,180, 220,380, 512,420); ctx.stroke();
  } else {
    // Fallback oak
    ctx.fillStyle = '#d4a373'; ctx.fillRect(0,0,512,512);
    for(let y=0; y<512; y+=128) {
      ctx.fillStyle = (y%256===0)? '#c79260' : '#e0b080'; ctx.fillRect(0, y, 512, 126);
    }
  }

  const tex = new THREE.CanvasTexture(cvs)
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6,6);
  return tex
}

export default function Scene({ placedItems, setPlacedItems, theme, showMeasures, customColor, matReflexo, matRelevo, environment, floorType, wallColor, lampColor, lampIntensity, realisticRender, cameraView, posterTex, cutLeft45, cutRight45, cornerMode }) {
  const { camera } = useThree()
  const controlsRef = useRef()
  const sideWallX = -1.35
  
  // Extrair texturas base do GLTF (rodape.glb)
  const { scene: rodapeScene } = useGLTF('/quadro.glb')
  
  const { carvalhoMat, tabacoMat, mdfMat } = useMemo(() => {
    let carvalho = null
    let tabaco = null
    let mdf = null
    if (rodapeScene) {
      rodapeScene.traverse((c) => {
        if (c.isMesh && c.material) {
          const m = Array.isArray(c.material) ? c.material[0] : c.material
          if ((m.name?.toLowerCase().includes('carvalho') || c.name?.toLowerCase().includes('carvalho')) && !carvalho) {
             carvalho = m.clone()
             if(carvalho.map) {
                 carvalho.map = carvalho.map.clone()
                 carvalho.map.wrapS = THREE.RepeatWrapping
                 carvalho.map.wrapT = THREE.RepeatWrapping
                 carvalho.map.repeat.set(1.5, 1.5)
             }
          }
          if ((m.name?.toLowerCase().includes('tabaco') || c.name?.toLowerCase().includes('tabaco')) && !tabaco) {
             tabaco = m.clone()
              if(tabaco.normalMap) {
                 tabaco.normalMap = tabaco.normalMap.clone()
                 tabaco.normalMap.wrapS = THREE.RepeatWrapping
                 tabaco.normalMap.wrapT = THREE.RepeatWrapping
                 tabaco.normalMap.repeat.set(1.5, 1.5)
              }
           }
           if ((m.name?.toLowerCase().includes('mdf') || c.name?.toLowerCase().includes('mdf')) && !mdf && m.map) {
              mdf = m.clone()
              if(mdf.map) {
                  mdf.map = mdf.map.clone()
                  mdf.map.matrixAutoUpdate = true
                  mdf.map.wrapS = THREE.RepeatWrapping
                  mdf.map.wrapT = THREE.RepeatWrapping
                  mdf.map.repeat.set(1, 1)
                  mdf.map.offset.set(0.5, 0.5)
              }
              if(mdf.normalMap) {
                  mdf.normalMap = mdf.normalMap.clone()
                  mdf.normalMap.matrixAutoUpdate = true
                  mdf.normalMap.wrapS = THREE.RepeatWrapping
                  mdf.normalMap.wrapT = THREE.RepeatWrapping
                  mdf.normalMap.repeat.set(1, 1)
                  mdf.normalMap.offset.set(0.5, 0.5)
              }
           }
        }
      })
    }
    return { carvalhoMat: carvalho, tabacoMat: tabaco, mdfMat: mdf }
  }, [rodapeScene])
  
  const floorTex = useMemo(() => generateFloorTexture(floorType), [floorType])

  // Dynamic BBox extraction for the active/last rodape
  useEffect(() => {
    // Keep camera logic intact, assuming we center on [0,0,0] or the last placed item
    if (!controlsRef.current) return
    const controls = controlsRef.current
    
    // Move camera instantly
    camera.position.set(
      cameraView === 'zoom' ? 0.3 : 1.1,
      cameraView === 'zoom' ? 0.4 : 1.2,
      cameraView === 'zoom' ? 1.0 : 3.4
    )
    controls.target.set(0, 0, 0)
  }, [cameraView, camera])

  const lampIntensityFloat = lampIntensity / 100
  
  const size = productSizes[0]

  return (
    <>
      <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI/2 + 0.02} />
      
      {/* Lighting */}
      <ambientLight intensity={0.95} color="#ffffff" />
      <directionalLight position={[3, 6, 4]} intensity={2.2} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-4, 3, -2]} intensity={0.2} color="#90b0ff" />

      {/* Realistic Environment */}
      {realisticRender && <Environment preset="city" background={false} environmentIntensity={0.15} />}
      
      {/* Placed Items */}
      <group position={[0, 0, 0]}>
        {placedItems.map((item, idx) => {
          const isQuadro = item.type === 'quadros'
          const meta = isQuadro ? modelMetaMap[item.modelIndex] : rodapeModelsMap[item.modelIndex]
          const itemSize = isQuadro ? productSizes[item.sizeIndex] : null

          let isFirstMainRodape = false;
          if (!isQuadro) {
             const firstMain = placedItems.find(i => i.type === 'rodapes' && i.wall !== 'side');
             if (firstMain && firstMain.id === item.id) {
               isFirstMainRodape = true;
             }
          }

          const isSideWall = item.wall === 'side';

          let groupPosition = isQuadro ? [item.position[0], item.position[1], 0] : item.position;
          let groupRotation = [0, 0, 0];

          if (isSideWall) {
            groupPosition = isQuadro ? [sideWallX + 0.01, item.position[1], item.position[2]] : [sideWallX, 0, item.position[2]];
            groupRotation = [0, Math.PI / 2, 0];
          }

          return (
            <group key={item.id} position={groupPosition} rotation={groupRotation}>
              {isQuadro ? (
                <FrameModel 
                  meta={meta} 
                  size={itemSize}
                  customColor={customColor} 
                  matReflexo={matReflexo} 
                  posterTex={posterTex}
                  isVertical={item.orientation === 'vertical'}
                  carvalhoMat={carvalhoMat}
                  tabacoMat={tabacoMat}
                  mdfMat={mdfMat}
                  showMeasures={showMeasures}
                  isExploded={cameraView === 'explode'}
                />
              ) : (
                <RodapeModel
                  activeModelIndex={item.modelIndex}
                  cutLeft45={cutLeft45}
                  cutRight45={cutRight45}
                  showMeasures={showMeasures}
                />
              )}
              
              <Html position={[isQuadro ? 0 : 0, isQuadro ? itemSize.hOuter / 2 + 0.1 : 0.2, 0]} center zIndexRange={[100, 0]}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setPlacedItems(prev => prev.filter(i => i.id !== item.id));
                  }}
                  style={{
                    background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%',
                    width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                    opacity: 0.8, pointerEvents: 'auto'
                  }}
                  title="Excluir item"
                >
                  ×
                </button>
              </Html>

              {/* Corner Piece for Rodape if it's the first main wall piece (leftmost) and in Miter mode */}
              {!isQuadro && cornerMode === 'miter' && isFirstMainRodape && (
                 <RodapeModel
                    activeModelIndex={item.modelIndex}
                    cutLeft45={true}
                    cutRight45={false}
                    showMeasures={false}
                    isCornerPiece={true}
                    mainBboxMinX={-1.35}
                  />
              )}
            </group>
          )
        })}
      </group>

      {/* Room Environment */}
      {environment === 'room' && (
        <group>
          {/* Floor */}
          <mesh rotation={[-Math.PI/2, 0, 0]} position={[0,0,10]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshPhysicalMaterial 
              map={floorTex} 
              roughness={0.3} 
              clearcoat={floorType === 'carrara' || floorType === 'marquina' ? 1.0 : 0.7} 
              clearcoatRoughness={0.1}
            />
          </mesh>

          {/* Walls */}
          <mesh position={[0, 4, -0.01]} receiveShadow>
            <planeGeometry args={[20, 8]} />
            <meshStandardMaterial color={wallColor} />
          </mesh>
          
          {/* Dynamic Side Wall */}
          <mesh 
            position={[sideWallX, 4, 10]} 
            rotation={[0, Math.PI/2, 0]} 
            receiveShadow
          >
            <planeGeometry args={[20, 8]} />
            <meshStandardMaterial color={wallColor} />
          </mesh>

          {/* PBR Lamp */}
          {realisticRender && lampIntensityFloat > 0 && (
            <group position={[-0.9, 0, 0.45]}>
              <mesh position={[0, 0.01, 0]} castShadow><cylinderGeometry args={[0.12, 0.13, 0.02, 32]}/><meshStandardMaterial color="#3d352a" metalness={0.8}/></mesh>
              <mesh position={[0, 0.71, 0]} castShadow><cylinderGeometry args={[0.01, 0.01, 1.4]}/><meshStandardMaterial color="#c59d4a" metalness={0.8}/></mesh>
              <mesh position={[0, 1.30, 0]}>
                <cylinderGeometry args={[0.10, 0.18, 0.26, 32, 1, true]}/>
                <meshStandardMaterial color="#fff4e5" emissive={lampColor} emissiveIntensity={2.0 * lampIntensityFloat} side={THREE.DoubleSide}/>
              </mesh>
              <pointLight position={[0, 1.25, 0]} color={lampColor} intensity={60 * lampIntensityFloat} castShadow distance={10} decay={2} />
              {showMeasures && <LampDimension />}
            </group>
          )}
        </group>
      )}

      {/* Studio Floor (If room is not active) */}
      {environment === 'studio' && (
        <group>
          <mesh rotation={[-Math.PI/2, 0, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshPhysicalMaterial color="#1a1a1a" roughness={0.15} metalness={0.0} reflectivity={0.8} clearcoat={1.0} clearcoatRoughness={0.12} />
          </mesh>
          <gridHelper args={[10, 20, '#c59d4a', '#2d2618']} position={[0, 0.001, 0]} />
        </group>
      )}

      {/* Post Processing */}
      {realisticRender && (
        <EffectComposer disableNormalPass={false} multisampling={4}>
          <N8AO aoRadius={0.04} intensity={2} distanceFalloff={0.2} color="black" halfRes={false} />
          <Bloom luminanceThreshold={2.0} mipmapBlur intensity={0.2 * lampIntensityFloat} />
        </EffectComposer>
      )}
    </>
  )
}

function LampDimension() {
  const arrowGeo = useMemo(() => new THREE.ConeGeometry(0.0025, 0.009, 12), [])
  const arrowMat = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xc59d4a, depthTest: false, transparent: true, opacity: 0.95 }), [])

  const start = new THREE.Vector3(-0.15, 0, 0)
  const end = new THREE.Vector3(-0.15, 1.40, 0)
  const p1 = new THREE.Vector3(0, 0, 0)
  const p2 = new THREE.Vector3(0, 1.40, 0)
  const mid = new THREE.Vector3(-0.15, 0.7, 0)

  return (
    <group>
      <Line points={[start, end]} color="#c59d4a" lineWidth={2} depthTest={false} renderOrder={999} />
      
      <mesh position={start} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), new THREE.Vector3(0,-1,0))} geometry={arrowGeo} material={arrowMat} renderOrder={1000} />
      <mesh position={end} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), new THREE.Vector3(0,1,0))} geometry={arrowGeo} material={arrowMat} renderOrder={1000} />

      <Html position={mid} center style={{ pointerEvents: 'none' }}>
        <div className="measurement-badge" style={{ display:'flex', gap:'5px', color:'var(--abs-dourado-claro)', fontWeight:800, fontSize:'11px', textShadow:'0 2px 10px rgba(0,0,0,0.9)', whiteSpace:'nowrap', textAlign:'center' }}>
          <span style={{ color:'white', fontSize:'10px' }}>ALT. ABAJUR</span>
          <span>1.40 m</span>
        </div>
      </Html>
    </group>
  )
}
