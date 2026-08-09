import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Html, Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

export default function FrameModel({ meta, size, customColor, matReflexo, posterTex, carvalhoMat, tabacoMat, showMeasures, isExploded, isVertical = true }) {
  
  // Parâmetros do frame reais da arquitetura
  const width = isVertical ? size.w : size.h
  const height = isVertical ? size.h : size.w
  const wOuter = isVertical ? size.wOuter : size.hOuter
  const hOuter = isVertical ? size.hOuter : size.wOuter
  const frontDepth = size.frontDepth
  const backDepth = size.backDepth
  const frontHoleWidth = isVertical ? size.frontHoleWidth : size.frontHoleHeight
  const frontHoleHeight = isVertical ? size.frontHoleHeight : size.frontHoleWidth

  // Criar geometria do frame
  const { geometries, mdfGeom, posterGeom, glassGeom } = useMemo(() => {
    const createTrapezoid = (outW, outH, inW, inH, side) => {
      const shape = new THREE.Shape()
      if (side === 'top') {
          shape.moveTo(-outW/2, outH/2); shape.lineTo(outW/2, outH/2);
          shape.lineTo(inW/2, inH/2); shape.lineTo(-inW/2, inH/2);
      } else if (side === 'bottom') {
          shape.moveTo(outW/2, -outH/2); shape.lineTo(-outW/2, -outH/2);
          shape.lineTo(-inW/2, -inH/2); shape.lineTo(inW/2, -inH/2);
      } else if (side === 'left') {
          shape.moveTo(-outW/2, outH/2); shape.lineTo(-inW/2, inH/2);
          shape.lineTo(-inW/2, -inH/2); shape.lineTo(-outW/2, -outH/2);
      } else if (side === 'right') {
          shape.moveTo(outW/2, outH/2); shape.lineTo(outW/2, -outH/2);
          shape.lineTo(inW/2, -inH/2); shape.lineTo(inW/2, inH/2);
      }
      return shape
    }

    const sides = ['top', 'bottom', 'left', 'right']
    const geoms = sides.map(side => {
      const shapeFront = createTrapezoid(wOuter, hOuter, frontHoleWidth, frontHoleHeight, side)
      const geomFront = new THREE.ExtrudeGeometry(shapeFront, { depth: frontDepth, bevelEnabled: false })
      
      const shapeBack = createTrapezoid(wOuter, hOuter, width, height, side)
      const geomBack = new THREE.ExtrudeGeometry(shapeBack, { depth: backDepth, bevelEnabled: false })
      
      const applyCutMaterials = (geom, isBackLayer) => {
        if(geom.groups.length === 2 && geom.groups[1].count === 24) {
            const startSides = geom.groups[1].start;
            const isLeft = (side === 'left');
            
            geom.groups.splice(1, 1, 
                { start: startSides, count: 6, materialIndex: isLeft ? 2 : 1 },
                { start: startSides + 6, count: 6, materialIndex: isLeft ? 1 : 2 },
                { start: startSides + 12, count: 6, materialIndex: isLeft ? 2 : 1 },
                { start: startSides + 18, count: 6, materialIndex: isLeft ? 1 : 2 }
            );

            const pos = geom.attributes.position.array;
            const uv = geom.attributes.uv.array;
            
            for(let cutStart = startSides; cutStart < startSides + 24; cutStart += 6) {
                const segIdx = Math.floor((cutStart - startSides) / 6);
                const isCut = isLeft ? (segIdx === 0 || segIdx === 2) : (segIdx === 1 || segIdx === 3);
                
                if (isCut) {
                    for(let v = cutStart; v < cutStart + 6; v++) {
                        const x = pos[v*3], y = pos[v*3+1], z = pos[v*3+2];
                        const a = (side === 'top' || side === 'bottom') ? y : x;
                        const worldZ = isBackLayer ? (z - backDepth) : z;
                        uv[v*2] = a * 30;
                        uv[v*2+1] = worldZ * 30;
                    }
                }
            }
        }
      };

      applyCutMaterials(geomFront, false);
      applyCutMaterials(geomBack, true);

      return { side, geomFront, geomBack }
    })

    const mdf = new THREE.BoxGeometry(width - 0.001, height - 0.001, 0.003)
    const post = new THREE.BoxGeometry(width - 0.001, height - 0.001, 0.001)
    const gls = new THREE.BoxGeometry(width - 0.001, height - 0.001, 0.001)

    return { geometries: geoms, mdfGeom: mdf, posterGeom: post, glassGeom: gls }
  }, [width, height, wOuter, hOuter, frontHoleWidth, frontHoleHeight, frontDepth, backDepth])

  // Materiais dinâmicos baseados no modelMetaMap
  const { frameMaterial, matBorderRotated, glassMaterial, backMaterial, defaultPosterMaterial } = useMemo(() => {
    let mat;
    if (meta.name.includes('Carvalho') && carvalhoMat) {
      mat = carvalhoMat.clone()
      mat.color.set('#ffffff') // Reset tint
    } else if (meta.name.includes('Tabaco') && tabacoMat) {
      mat = tabacoMat.clone()
      mat.color.set('#ffffff') // Reset tint
    } else {
      mat = new THREE.MeshStandardMaterial({ color: meta.color })
    }

    // Se o user pintou com a cor customizada, aplica. Senão, mantém a original.
    if (customColor !== '#ffffff') {
      mat.color.set(customColor)
    }

    mat.roughness = 1.0 - (matReflexo / 100 * 0.9)
    mat.envMapIntensity = (matReflexo / 100) * 1.5
    
    const matGlassFront = new THREE.MeshStandardMaterial({
      color: 0x000000, metalness: 0.8, roughness: 0.0, envMapIntensity: 2.5,
      transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false
    })
    
    const matGlassSides = new THREE.MeshPhysicalMaterial({
      color: 0xeeeeee, metalness: 0.1, roughness: 0.1, envMapIntensity: 1.0,
      transparent: true, opacity: 0.85, depthWrite: true
    })

    const glassMaterials = [matGlassSides, matGlassSides, matGlassSides, matGlassSides, matGlassFront, matGlassFront]

    const back = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9 })
    
    // Poster Dinamico
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = Math.round(1024 * (height / width))
    const ctx = canvas.getContext('2d')
    
    ctx.fillStyle = '#e8e8e8'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    ctx.fillStyle = '#0a0a0a'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    ctx.font = 'bold 450px sans-serif'
    ctx.fillText(size.posterLine1, canvas.width / 2, canvas.height / 2 - 200)
    
    ctx.font = 'bold 240px sans-serif'
    ctx.fillText(size.posterLine2, canvas.width / 2, canvas.height / 2 + 150)
    
    ctx.font = 'bold 110px sans-serif'
    ctx.fillText('com acetato', canvas.width / 2, canvas.height / 2 + 350)
    
    const barHeight = 160
    ctx.fillStyle = '#e30613'
    ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight)
    
    ctx.fillStyle = '#ffffff'
    ctx.font = 'italic bold 105px sans-serif'
    ctx.fillText('clicstore', canvas.width / 2, canvas.height - (barHeight / 2))
    
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    const defaultPoster = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 })

    const matBorderRotated = mat.clone();
    if (matBorderRotated.map) {
        matBorderRotated.map = matBorderRotated.map.clone();
        matBorderRotated.map.rotation = Math.PI / 2;
        matBorderRotated.map.center.set(0.5, 0.5);
        matBorderRotated.map.needsUpdate = true;
    }
    if (matBorderRotated.normalMap) {
        matBorderRotated.normalMap = matBorderRotated.normalMap.clone();
        matBorderRotated.normalMap.rotation = Math.PI / 2;
        matBorderRotated.normalMap.center.set(0.5, 0.5);
        matBorderRotated.normalMap.needsUpdate = true;
    }

    return { frameMaterial: mat, matBorderRotated, glassMaterial: glassMaterials, backMaterial: back, defaultPosterMaterial: defaultPoster }
  }, [meta, customColor, matReflexo, carvalhoMat, tabacoMat])

  const posterMat = useMemo(() => {
    if (!posterTex) return defaultPosterMaterial
    const tex = new THREE.TextureLoader().load(posterTex)
    tex.colorSpace = THREE.SRGBColorSpace
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 })
  }, [posterTex, defaultPosterMaterial])

  const totalDepth = frontDepth + backDepth
  const zOffset = - (totalDepth / 2 - backDepth)

  const mdfRef = useRef()
  const posterRef = useRef()
  const glassRef = useRef()

  useFrame(() => {
    const lerpSpeed = 0.1
    if (mdfRef.current) {
        mdfRef.current.position.lerp(new THREE.Vector3(0, 0, isExploded ? -0.15 : -0.0021), lerpSpeed)
    }
    if (posterRef.current) {
        posterRef.current.position.lerp(new THREE.Vector3(0, 0, isExploded ? -0.05 : -0.0008), lerpSpeed)
    }
    if (glassRef.current) {
        glassRef.current.position.lerp(new THREE.Vector3(0, 0, isExploded ? 0.05 : -0.00015), lerpSpeed)
    }
  })

function FrameSide({ side, geomFront, geomBack, materialsArray, backDepth, isExploded }) {
  const frontRef = useRef()
  const backRef = useRef()

  const offsetDist = 0.08
  const explodeT = useMemo(() => new THREE.Vector3(0,0,0), [])
  const explodeB = useMemo(() => new THREE.Vector3(0,0,-backDepth), [backDepth])

  useMemo(() => {
    if (side === 'top') { explodeT.y = offsetDist; explodeT.z = 0.02; explodeB.y = offsetDist; explodeB.z = -backDepth + 0.02; }
    if (side === 'bottom') { explodeT.y = -offsetDist; explodeT.z = 0.02; explodeB.y = -offsetDist; explodeB.z = -backDepth + 0.02; }
    if (side === 'left') { explodeT.x = -offsetDist; explodeT.z = 0.02; explodeB.x = -offsetDist; explodeB.z = -backDepth + 0.02; }
    if (side === 'right') { explodeT.x = offsetDist; explodeT.z = 0.02; explodeB.x = offsetDist; explodeB.z = -backDepth + 0.02; }
  }, [side, explodeT, explodeB, backDepth])

  useFrame(() => {
    const lerpSpeed = 0.1
    if (frontRef.current) {
      const target = isExploded ? explodeT : new THREE.Vector3(0,0,0)
      frontRef.current.position.lerp(target, lerpSpeed)
    }
    if (backRef.current) {
      const target = isExploded ? explodeB : new THREE.Vector3(0,0,-backDepth)
      backRef.current.position.lerp(target, lerpSpeed)
    }
  })

  return (
    <group>
      <mesh ref={frontRef} geometry={geomFront} material={materialsArray} position={[0, 0, 0]} castShadow receiveShadow />
      <mesh ref={backRef} geometry={geomBack} material={materialsArray} position={[0, 0, -backDepth]} castShadow receiveShadow />
    </group>
  )
}

function DimensionLines({ width, height, zOffset, totalDepth }) {
  const arrowGeo = useMemo(() => new THREE.ConeGeometry(0.0025, 0.009, 12), [])
  const arrowMat = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xc59d4a, depthTest: false, transparent: true, opacity: 0.95 }), [])

  const ArrowHead = ({ pos, dir }) => {
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
    return <mesh position={pos} quaternion={quaternion} geometry={arrowGeo} material={arrowMat} renderOrder={1000} />
  }

  const wY = -height/2 - 0.08
  const hX = width/2 + 0.08
  const tX = -width/2 - 0.08
  const tY = height/2 - 0.08

  return (
    <group position={[0, 0, 0]}>
      {/* LARGURA (Base) */}
      <Line points={[[-width/2, wY, zOffset], [width/2, wY, zOffset]]} color="#c59d4a" lineWidth={2} depthTest={false} renderOrder={999} />
      <ArrowHead pos={[-width/2, wY, zOffset]} dir={new THREE.Vector3(-1, 0, 0)} />
      <ArrowHead pos={[width/2, wY, zOffset]} dir={new THREE.Vector3(1, 0, 0)} />
      <Html position={[0, wY, zOffset]} center>
         <div className="measurement-badge" style={{ display:'flex', gap:'5px', color:'var(--abs-dourado-claro)', fontWeight:800, fontSize:'11px', textShadow:'0 2px 10px rgba(0,0,0,0.9)', whiteSpace:'nowrap' }}>
           <span style={{ color:'white', fontSize:'10px' }}>LARGURA</span> {(width * 100).toFixed(1)} cm
         </div>
      </Html>

      {/* ALTURA (Direita) */}
      <Line points={[[hX, -height/2, zOffset], [hX, height/2, zOffset]]} color="#c59d4a" lineWidth={2} depthTest={false} renderOrder={999} />
      <ArrowHead pos={[hX, -height/2, zOffset]} dir={new THREE.Vector3(0, -1, 0)} />
      <ArrowHead pos={[hX, height/2, zOffset]} dir={new THREE.Vector3(0, 1, 0)} />
      <Html position={[hX, 0, zOffset]} center>
         <div className="measurement-badge" style={{ display:'flex', gap:'5px', color:'var(--abs-dourado-claro)', fontWeight:800, fontSize:'11px', textShadow:'0 2px 10px rgba(0,0,0,0.9)', whiteSpace:'nowrap' }}>
           <span style={{ color:'white', fontSize:'10px' }}>ALTURA</span> {(height * 100).toFixed(1)} cm
         </div>
      </Html>

      {/* ESPESSURA (Topo Esquerda) */}
      {totalDepth && (
        <group>
          <Line points={[[tX, tY, zOffset - (totalDepth/2)], [tX, tY, zOffset + (totalDepth/2)]]} color="#c59d4a" lineWidth={2} depthTest={false} renderOrder={999} />
          <ArrowHead pos={[tX, tY, zOffset - (totalDepth/2)]} dir={new THREE.Vector3(0, 0, -1)} />
          <ArrowHead pos={[tX, tY, zOffset + (totalDepth/2)]} dir={new THREE.Vector3(0, 0, 1)} />
          <Html position={[tX - 0.05, tY, zOffset]} center>
             <div className="measurement-badge" style={{ display:'flex', gap:'5px', color:'var(--abs-dourado-claro)', fontWeight:800, fontSize:'11px', textShadow:'0 2px 10px rgba(0,0,0,0.9)', whiteSpace:'nowrap' }}>
               <span style={{ color:'white', fontSize:'10px' }}>ESPESSURA</span> {(totalDepth * 100).toFixed(1)} cm
             </div>
          </Html>
        </group>
      )}
    </group>
  )
}

  return (
    <group position={[0, 0, 0]} castShadow receiveShadow>
      
      {/* Bordas do Quadro */}
      {geometries.map(({ side, geomFront, geomBack }) => {
        const matFront = (side === 'left' || side === 'right') ? frameMaterial : matBorderRotated;
        const matSide = matBorderRotated; 
        const matCut = backMaterial; 
        const materialsArray = [matFront, matSide, matCut];

        return (
          <FrameSide 
            key={side} 
            side={side} 
            geomFront={geomFront} 
            geomBack={geomBack} 
            materialsArray={materialsArray} 
            backDepth={backDepth} 
            isExploded={isExploded} 
          />
        )
      })}

      {/* MDF Fundo */}
      <mesh ref={mdfRef} geometry={mdfGeom} material={backMaterial} position={[0, 0, -0.0021]} rotation={[0, Math.PI, 0]} />

      {/* Pôster */}
      <mesh ref={posterRef} geometry={posterGeom} material={posterMat} position={[0, 0, -0.0008]} />

      {/* Vidro / Acetato */}
      <mesh ref={glassRef} geometry={glassGeom} material={glassMaterial} position={[0, 0, -0.00015]} />

      {/* Linhas de Dimensão HTML */}
      {showMeasures && <DimensionLines width={wOuter} height={hOuter} zOffset={0} totalDepth={totalDepth} />}
    </group>
  )
}
