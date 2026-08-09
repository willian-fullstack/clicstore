import { useMemo, useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { useGLTF, Html, Line } from '@react-three/drei'

export default function RodapeModel({ activeModelIndex, cutLeft45, cutRight45, showMeasures, isCornerPiece, mainBboxMinX, onBboxUpdate }) {
  const { scene } = useGLTF('/rodape.glb')
  const groupRef = useRef()
  const [bboxDim, setBboxDim] = useState(null)

  // Clone object and geometries
  const clonedObject = useMemo(() => {
    const rootObjects = scene.children;
    // activeModelIndex might be out of bounds if scene is not ready
    const meshObj = rootObjects[activeModelIndex % rootObjects.length];
    if (!meshObj) return null;

    const clone = meshObj.clone();
    clone.userData.originalPosition = clone.position.clone();
    
    // Clone geometries so we don't modify the global cached GLTF
    clone.traverse((c) => {
      if (c.isMesh && c.geometry) {
        c.geometry = c.geometry.clone();
      }
    });

    return clone;
  }, [scene, activeModelIndex]);

  // Apply miter cut
  useEffect(() => {
    if (!clonedObject) return;

    clonedObject.traverse((c) => {
      if (c.isMesh && c.geometry) {
        const geometry = c.geometry;
        const posAttr = geometry.attributes.position;
        if (!posAttr) return;

        if (!geometry.userData.originalPositions) {
          geometry.userData.originalPositions = Float32Array.from(posAttr.array);
        }

        const origPos = geometry.userData.originalPositions;
        const currentPos = posAttr.array;

        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        for (let i = 0; i < origPos.length; i += 3) {
          const x = origPos[i];
          const y = origPos[i + 1];
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }

        const localThickness = (maxX - minX);
        const localLength = (maxY - minY);
        const endMargin = localLength * 0.25;

        const scaleY = c.scale ? c.scale.y : 1;
        const targetCutDepthMeters = 0.009; // 9mm
        const maxDeltaY = targetCutDepthMeters / (scaleY || 1);

        for (let i = 0; i < origPos.length; i += 3) {
          let x = origPos[i];
          let y = origPos[i + 1];
          let z = origPos[i + 2];

          let ratio = (x - minX) / (localThickness || 1);

          // Since Local Y maps to World -X, minY (smallest local Y) is the RIGHT side of the screen,
          // and maxY (largest local Y) is the LEFT side of the screen.
          // Therefore, cutLeft45 should cut maxY, and cutRight45 should cut minY.
          
          if (cutRight45 && Math.abs(y - minY) < endMargin) {
            y = minY + ratio * maxDeltaY;
          }

          if (cutLeft45 && Math.abs(y - maxY) < endMargin) {
            y = maxY - ratio * maxDeltaY;
          }

          currentPos[i] = x;
          currentPos[i + 1] = y;
          currentPos[i + 2] = z;
        }

        posAttr.needsUpdate = true;
        geometry.computeVertexNormals();
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
      }
    });

    // Reset position to original before applying deltas, to prevent cumulative offsets on re-render!
    clonedObject.position.copy(clonedObject.userData.originalPosition);
    
    // Reset rotation to default Blender export values (270 on X, 180 on Y, 0 on Z)
    // This makes it stand upright, but pointing into the Z axis.
    clonedObject.rotation.set(Math.PI * 1.5, Math.PI, 0);
    
    // Apply base correction around WORLD Y axis (upright axis) so it lies parallel to the wall (X axis)
    clonedObject.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);

    if (isCornerPiece) {
      clonedObject.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
    }

    clonedObject.updateMatrixWorld(true);

    // Compute bounding box
    const initialBbox = new THREE.Box3().setFromObject(clonedObject);

    // Delta alignment: Center X, align bottom Y EXACTLY at 0 (on floor) and back Z EXACTLY flush at 0 (against wall!)
    let deltaX = - (initialBbox.min.x + initialBbox.max.x) / 2;
    const deltaY = - initialBbox.min.y; // Sitting flat on floor Y=0
    let deltaZ = - initialBbox.min.z + 0.001; // Flush against wall Z=0

    if (isCornerPiece && mainBboxMinX !== undefined) {
      // 1. Back face flush against side wall (X = mainBboxMinX)
      // 2. Back end meeting back wall (Z = 0)
      deltaX = mainBboxMinX - initialBbox.min.x;
      deltaZ = - initialBbox.min.z;
    }

    // Set position
    clonedObject.position.set(
      clonedObject.userData.originalPosition.x + deltaX,
      clonedObject.userData.originalPosition.y + deltaY,
      clonedObject.userData.originalPosition.z + deltaZ
    );
    
    // Recalculate final world bounding box for dimensions
    clonedObject.updateMatrixWorld(true);
    const bbox = new THREE.Box3().setFromObject(clonedObject);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    setBboxDim({ bbox, size });

    if (onBboxUpdate && !isCornerPiece) {
      onBboxUpdate(bbox);
    }

  }, [clonedObject, cutLeft45, cutRight45, isCornerPiece, mainBboxMinX]);

  if (!clonedObject) return null;

  return (
    <group ref={groupRef}>
      <primitive object={clonedObject} />

      {/* Render Dimensions */}
      {showMeasures && bboxDim && (
        <RodapeDimensions bbox={bboxDim.bbox} size={bboxDim.size} />
      )}
    </group>
  )
}

function RodapeDimensions({ bbox, size }) {
  const axes = [
    { name: 'x', val: size.x },
    { name: 'y', val: size.y },
    { name: 'z', val: size.z }
  ].sort((a, b) => a.val - b.val);

  const thicknessAxis = axes[0].name; // Smallest (e.g. 9mm)
  const heightAxis = axes[1].name;    // Middle (e.g. 10cm)
  const lengthAxis = axes[2].name;    // Largest (e.g. 90cm)

  // 1. COMPRIMENTO
  let cP1 = new THREE.Vector3();
  let cP2 = new THREE.Vector3();
  let cOffset = new THREE.Vector3();

  if (lengthAxis === 'z') {
    cP1.set(bbox.max.x, bbox.min.y, bbox.min.z);
    cP2.set(bbox.max.x, bbox.min.y, bbox.max.z);
    cOffset.set(0.08, 0, 0);
  } else {
    cP1.set(bbox.min.x, bbox.min.y, bbox.max.z);
    cP2.set(bbox.max.x, bbox.min.y, bbox.max.z);
    cOffset.set(0, -0.04, 0.08);
  }

  // 2. ESPESSURA
  let tP1 = new THREE.Vector3();
  let tP2 = new THREE.Vector3();
  let tOffset = new THREE.Vector3();

  if (thicknessAxis === 'z') {
    tP1.set(bbox.min.x, bbox.min.y, bbox.min.z);
    tP2.set(bbox.min.x, bbox.min.y, bbox.max.z);
    tOffset.set(-0.06, 0, 0);
  } else if (thicknessAxis === 'x') {
    tP1.set(bbox.min.x, bbox.min.y, bbox.max.z);
    tP2.set(bbox.max.x, bbox.min.y, bbox.max.z);
    tOffset.set(0, -0.02, 0.06);
  } else {
    tP1.set(bbox.min.x, bbox.min.y, bbox.min.z);
    tP2.set(bbox.min.x, bbox.max.y, bbox.min.z);
    tOffset.set(-0.06, 0, 0);
  }

  // 3. ALTURA
  let hP1 = new THREE.Vector3();
  let hP2 = new THREE.Vector3();
  let hOffset = new THREE.Vector3();

  if (heightAxis === 'y') {
    hP1.set(bbox.min.x, bbox.min.y, bbox.max.z);
    hP2.set(bbox.min.x, bbox.max.y, bbox.max.z);
    hOffset.set(-0.06, 0, 0);
  } else if (heightAxis === 'z') {
    hP1.set(bbox.min.x, bbox.max.y, bbox.min.z);
    hP2.set(bbox.min.x, bbox.max.y, bbox.max.z);
    hOffset.set(0, 0.06, 0);
  } else {
    hP1.set(bbox.max.x, bbox.max.y, bbox.min.z);
    hP2.set(bbox.min.x, bbox.max.y, bbox.min.z);
    hOffset.set(0, 0.06, 0);
  }

  const formatMm = (val) => (val * 1000).toFixed(0) + ' mm';
  const formatCm = (val) => (val * 100).toFixed(1) + ' cm';

  return (
    <group>
      <DimLine p1={cP1} p2={cP2} offset={cOffset} text={formatCm(axes[2].val)} label="COMPR." />
      <DimLine p1={tP1} p2={tP2} offset={tOffset} text={formatMm(axes[0].val)} label="ESP." />
      <DimLine p1={hP1} p2={hP2} offset={hOffset} text={formatCm(axes[1].val)} label="ALT." />
    </group>
  );
}

function DimLine({ p1, p2, offset, text, label }) {
  const start = p1.clone().add(offset);
  const end = p2.clone().add(offset);
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const dir = new THREE.Vector3().subVectors(end, start).normalize();

  const arrowGeo = useMemo(() => new THREE.ConeGeometry(0.0025, 0.009, 12), [])
  const arrowMat = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xc59d4a, depthTest: false, transparent: true, opacity: 0.95 }), [])

  const ArrowHead = ({ pos, arrowDir }) => {
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), arrowDir)
    return <mesh position={pos} quaternion={quaternion} geometry={arrowGeo} material={arrowMat} renderOrder={1000} />
  }

  return (
    <group>
      {/* Main dimension line */}
      <Line points={[start, end]} color="#c59d4a" lineWidth={2} depthTest={false} renderOrder={999} />
      
      {/* Arrows */}
      <ArrowHead pos={start} arrowDir={dir.clone().negate()} />
      <ArrowHead pos={end} arrowDir={dir} />

      {/* HTML Label */}
      <Html position={mid} center style={{ pointerEvents: 'none' }}>
        <div className="measurement-badge" style={{ display:'flex', gap:'5px', color:'var(--abs-dourado-claro)', fontWeight:800, fontSize:'11px', textShadow:'0 2px 10px rgba(0,0,0,0.9)', whiteSpace:'nowrap', textAlign:'center' }}>
          <span style={{ color:'white', fontSize:'10px' }}>{label}</span>
          <span>{text}</span>
        </div>
      </Html>
    </group>
  )
}
