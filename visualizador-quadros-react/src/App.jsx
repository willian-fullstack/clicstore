import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import BottomToolbar from './components/BottomToolbar'
import DimensionBadges from './components/DimensionBadges'
import Scene from './components/Scene'

export const productSizes = [
  {
    id: 'p21x30',
    title: 'Quadro 21x30 cm',
    posterLine1: 'A4',
    posterLine2: '21x30',
    w: 0.21,
    h: 0.30,
    wOuter: 0.25,
    hOuter: 0.34,
    frontDepth: 0.007,
    backDepth: 0.005,
    frontHoleWidth: 0.20,
    frontHoleHeight: 0.29,
    thicknessText: '1.2 cm'
  },
  {
    id: 'p30x45',
    title: 'Quadro 30x45 cm',
    posterLine1: 'A3',
    posterLine2: '30x45',
    w: 0.30,
    h: 0.45,
    wOuter: 0.34,
    hOuter: 0.49,
    frontDepth: 0.012,
    backDepth: 0.008,
    frontHoleWidth: 0.29, // 1cm menor que w
    frontHoleHeight: 0.44, // 1cm menor que h
    thicknessText: '2.0 cm'
  }
];

export const modelMetaMap = [
  { name: "Carvalho (Madeira)", color: "#cba376", tag: "Madeira" },
  { name: "Preto (Fosco)", color: "#111111", tag: "Sólido" },
  { name: "Branco (Fosco)", color: "#ffffff", tag: "Sólido" },
  { name: "Tabaco (Madeira Escura)", color: "#382013", tag: "Madeira" }
];

export const rodapeModelsMap = [
  { name: "Carvalho (Com Friso)", color: "#cba376", tag: "Friso" },
  { name: "Tabaco (Com Friso)", color: "#382013", tag: "Friso" },
  { name: "Tabaco (Liso)", color: "#382013", tag: "Liso" },
  { name: "Carvalho (Liso)", color: "#cba376", tag: "Liso" },
  { name: "Branco (Com Friso)", color: "#ffffff", tag: "Friso" },
  { name: "Escuro / Wengê (Com Friso)", color: "#1c1410", tag: "Friso" },
  { name: "Escuro / Wengê (Liso)", color: "#1c1410", tag: "Liso" },
  { name: "Branco (Liso)", color: "#ffffff", tag: "Branco" }
];

export default function App() {
  const [productType, setProductType] = useState('quadros') // 'quadros' or 'rodapes'
  const [theme, setTheme] = useState('preto')
  
  // Scene State
  const [activeModelIndex, setActiveModelIndex] = useState(0)
  const [activeSizeIndex, setActiveSizeIndex] = useState(0)
  const [placedItems, setPlacedItems] = useState([
    { id: 'initial', type: 'quadros', modelIndex: 0, sizeIndex: 0, position: [0, 1.5, 0], orientation: 'vertical' }
  ])
  const [selectedItemId, setSelectedItemId] = useState(null)
  const [showMeasures, setShowMeasures] = useState(true)

  const checkCollision = (proposedItem, allItems) => {
    const sizeProp = productSizes[proposedItem.sizeIndex];
    const isProposedVert = proposedItem.orientation === 'vertical';
    const propW = isProposedVert ? sizeProp.wOuter : sizeProp.hOuter;
    const propH = isProposedVert ? sizeProp.hOuter : sizeProp.wOuter;
    const propWall = proposedItem.wall || 'main';
    const propX = propWall === 'side' ? proposedItem.position[2] : proposedItem.position[0];
    const propY = proposedItem.position[1];

    for (const other of allItems) {
      if (other.id === proposedItem.id || other.type !== 'quadros') continue;
      
      const otherWall = other.wall || 'main';
      if (otherWall !== propWall) continue;

      const otherSize = productSizes[other.sizeIndex];
      const isOtherVert = other.orientation === 'vertical';
      const otherW = isOtherVert ? otherSize.wOuter : otherSize.hOuter;
      const otherH = isOtherVert ? otherSize.hOuter : otherSize.wOuter;
      const otherX = otherWall === 'side' ? other.position[2] : other.position[0];
      const otherY = other.position[1];

      // AABB Collision check with a small threshold (0.005m / 5mm) to allow snug fits
      if (
        Math.abs(propX - otherX) * 2 < (propW + otherW - 0.005) &&
        Math.abs(propY - otherY) * 2 < (propH + otherH - 0.005)
      ) {
        return true; 
      }
    }
    return false;
  };

  const handleMoveItem = (id, axis, step) => {
    setPlacedItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      
      const newPos = [...item.position];
      const isSideWall = item.wall === 'side';

      if (axis === 'x') {
        if (isSideWall) {
          newPos[2] += step;
        } else {
          newPos[0] += step;
        }
      } else if (axis === 'y' && item.type === 'quadros') {
        newPos[1] += step;
      }

      // Temporarily disabled collision check on manual move to allow un-sticking items
      // if (item.type === 'quadros') {
      //   const proposedItem = { ...item, position: newPos };
      //   if (checkCollision(proposedItem, prev)) {
      //     return item; // Overlap detected, do not move
      //   }
      // }

      return { ...item, position: newPos };
    }));
  };

  const handleUpdateOrientation = (id) => {
    setPlacedItems(prev => {
      const itemIndex = prev.findIndex(i => i.id === id);
      if (itemIndex === -1) return prev;
      
      const item = prev[itemIndex];
      if (item.type !== 'quadros') return prev;

      const proposedItem = { ...item, orientation: item.orientation === 'vertical' ? 'horizontal' : 'vertical' };
      if (checkCollision(proposedItem, prev)) return prev; // block rotation if it overlaps!

      const newItems = [...prev];
      newItems[itemIndex] = proposedItem;
      return newItems;
    });
  };
  
  // Custom Materials State
  const [customColor, setCustomColor] = useState('#ffffff')
  const [matReflexo, setMatReflexo] = useState(82)
  const [matRelevo, setMatRelevo] = useState(300)
  
  // Environment State
  const [environment, setEnvironment] = useState('studio') // 'studio' or 'room'
  const [floorType, setFloorType] = useState('parquet')
  const [wallColor, setWallColor] = useState('#888888')
  
  // Poster State
  const [posterTex, setPosterTex] = useState(null)
  
  // Lighting (Lamp) State
  const [lampColor, setLampColor] = useState('#ffe4b5')
  const [lampIntensity, setLampIntensity] = useState(1)
  const [realisticRender, setRealisticRender] = useState(true)

  // Rodapes Cut State
  const [cutLeft45, setCutLeft45] = useState(false)
  const [cutRight45, setCutRight45] = useState(false)
  
  // Rodapés specific state
  const [cornerMode, setCornerMode] = useState('single')

  // Auto-activate miter cuts and room environment when switching to miter corner mode
  const handleCornerMode = (mode) => {
    setCornerMode(mode)
    if (mode === 'miter') {
      setEnvironment('room')
      setCutLeft45(true)
      setCutRight45(true)
    }
  }

  // Camera State
  const [cameraView, setCameraView] = useState('iso') // iso, side, front, zoom

  const applyTheme = (newTheme) => {
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const handleTakePhoto = () => {
    const canvas = document.querySelector('#webgl-container canvas')
    if (canvas) {
      const link = document.createElement('a')
      link.download = 'quadro_clicstore.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {/* Gold Progress Rail */}
      <div id="rail"></div>

      <Header 
        productType={productType}
        setProductType={setProductType}
        theme={theme} 
        onThemeChange={applyTheme} 
        realisticRender={realisticRender} 
        onToggleRender={() => setRealisticRender(!realisticRender)}
        onTakePhoto={handleTakePhoto}
      />
      
      <Sidebar 
          productType={productType} setProductType={setProductType}
          theme={theme}
          showMeasures={showMeasures} setShowMeasures={setShowMeasures}
          customColor={customColor} setCustomColor={setCustomColor}
          matReflexo={matReflexo} setMatReflexo={setMatReflexo}
          matRelevo={matRelevo} setMatRelevo={setMatRelevo}
          environment={environment} setEnvironment={setEnvironment}
          floorType={floorType} setFloorType={setFloorType}
          wallColor={wallColor} setWallColor={setWallColor}
          lampColor={lampColor} setLampColor={setLampColor}
          realisticRender={realisticRender} setRealisticRender={setRealisticRender}
          posterTex={posterTex} setPosterTex={setPosterTex}
          activeModelIndex={activeModelIndex} setActiveModelIndex={setActiveModelIndex}
          activeSizeIndex={activeSizeIndex} setActiveSizeIndex={setActiveSizeIndex}
          lampIntensity={lampIntensity} setLampIntensity={setLampIntensity}
          cutLeft45={cutLeft45} setCutLeft45={setCutLeft45}
          cutRight45={cutRight45} setCutRight45={setCutRight45}
          cornerMode={cornerMode} setCornerMode={handleCornerMode}
          placedItems={placedItems}
          setPlacedItems={setPlacedItems}
          selectedItemId={selectedItemId}
          setSelectedItemId={setSelectedItemId}
          onMoveItem={handleMoveItem}
          onUpdateOrientation={handleUpdateOrientation}
        />
      
      <BottomToolbar productType={productType} activeView={cameraView} setCameraView={setCameraView} />

      <DimensionBadges show={showMeasures} />

      <div 
        id="webgl-container"
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
        onDrop={(e) => {
          e.preventDefault();
          const rect = e.currentTarget.getBoundingClientRect();
          const dropX = e.clientX - rect.left;
          const isSideWall = dropX < rect.width * 0.35; // 35% left side of the screen is the side wall

          const itemData = e.dataTransfer.getData('application/json');
          if (itemData) {
            const data = JSON.parse(itemData);
            setPlacedItems(prev => {
              const wallTarget = isSideWall ? 'side' : 'main';
              const itemsOnSameWall = prev.filter(i => i.type === data.type && (i.wall === wallTarget || (!i.wall && wallTarget === 'main')));
              
              let newX = 0;
              let newZ = isSideWall ? 0.45 : 0; // All items on side wall start at 0.45 on Z to clear the corner
              
              if (itemsOnSameWall.length > 0) {
                if (isSideWall) {
                  const maxZ = Math.max(...itemsOnSameWall.map(i => i.position[2] || 0));
                  newZ = maxZ + (data.type === 'quadros' ? 0.4 : 0.9);
                } else {
                  const maxX = Math.max(...itemsOnSameWall.map(i => i.position[0]));
                  newX = maxX + (data.type === 'quadros' ? 0.4 : 0.9);
                }
              } else {
                if (!isSideWall && data.type === 'rodapes') {
                  newX = -0.9;
                }
              }
              const yPos = data.type === 'quadros' ? 1.5 : 0;
              const newItem = { ...data, id: Date.now().toString(), position: [newX, yPos, newZ], wall: wallTarget };
              if (data.type === 'quadros') newItem.orientation = 'vertical';

              // If it's a quadro, perform collision check to push it to a safe space or allow?
              // For simplicity, we just add it, but it might overlap if newX/newZ didn't account for Y.
              // We'll let it be for now since it's just a drop placement.
              
              return [...prev, newItem];
            });
          }
        }}
      >
        <Canvas 
          shadows
          dpr={[1, 2]}
          gl={{ antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
          camera={{ position: [1.1, 1.2, 3.4], fov: 40 }}
        >
            <color attach="background" args={[
              theme === 'creme' || theme === 'offwhite' ? '#f3ebe3' : 
              theme === 'dourado' || theme === 'dourado-claro' ? '#382013' : 
              '#111111'
            ]} />
            
            <Suspense fallback={null}>
              <Scene 
                productType={productType}
                theme={theme}
                showMeasures={showMeasures}
                customColor={customColor}
                matReflexo={matReflexo}
                matRelevo={matRelevo}
                environment={environment}
                floorType={floorType}
                wallColor={wallColor}
                lampColor={lampColor}
                lampIntensity={lampIntensity}
                realisticRender={realisticRender}
                cameraView={cameraView}
                posterTex={posterTex}
                activeModelIndex={activeModelIndex}
                activeSizeIndex={activeSizeIndex}
                placedItems={placedItems}
                setPlacedItems={setPlacedItems}
                cutLeft45={cutLeft45}
                cutRight45={cutRight45}
                cornerMode={cornerMode}
              />
            </Suspense>
          </Canvas>
      </div>
    </div>
  )
}
