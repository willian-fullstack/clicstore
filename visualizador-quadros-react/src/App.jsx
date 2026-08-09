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
  const [multiModelMode, setMultiModelMode] = useState(true)
  const [showMeasures, setShowMeasures] = useState(true)
  
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
        multiModelMode={multiModelMode}
        setMultiModelMode={setMultiModelMode}
        onTakePhoto={handleTakePhoto}
      />
      
      <Sidebar 
          productType={productType}
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
          multiModelMode={multiModelMode} setMultiModelMode={setMultiModelMode}
          lampIntensity={lampIntensity} setLampIntensity={setLampIntensity}
          cutLeft45={cutLeft45} setCutLeft45={setCutLeft45}
          cutRight45={cutRight45} setCutRight45={setCutRight45}
          cornerMode={cornerMode} setCornerMode={handleCornerMode}
        />
      
      <BottomToolbar productType={productType} activeView={cameraView} setCameraView={setCameraView} />

      <DimensionBadges show={showMeasures} />

      <div id="webgl-container">
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
                multiModelMode={multiModelMode}
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
