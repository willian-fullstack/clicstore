import { Camera, Eye, Layout, SplitSquareHorizontal, ZoomIn, RefreshCw, Box } from 'lucide-react'

export default function BottomToolbar({ productType, activeView, setCameraView }) {
  const tools = [
    { id: 'iso', icon: <Box size={18} />, title: 'Visão Perspectiva 3D' },
    { id: 'side', icon: <Layout size={18} />, title: 'Corte Lateral (Espessura)' },
    { id: 'front', icon: <Layout size={18} />, title: 'Vista Frontal (Altura)' },
    { id: 'zoom', icon: <ZoomIn size={18} />, title: 'Close do Friso / Detalhe' },
    { id: 'explode', icon: <SplitSquareHorizontal size={18} />, title: 'Visão Explodida (Separar Peças)' },
    { id: 'reset', icon: <RefreshCw size={18} />, title: 'Resetar Câmera' },
  ].filter(t => productType !== 'rodapes' || t.id !== 'explode')

  return (
    <div className="bottom-toolbar" style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10,
      background: 'var(--panel-bg)',
      backdropFilter: 'blur(16px)',
      border: '1px solid var(--panel-border)',
      borderRadius: '30px',
      padding: '6px 12px',
      display: 'flex',
      gap: '8px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    }}>
      {tools.map(tool => (
        <button
          key={tool.id}
          className={`tool-btn ${activeView === tool.id ? 'active' : ''}`}
          title={tool.title}
          onClick={() => setCameraView(tool.id)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: activeView === tool.id ? 'var(--abs-dourado)' : 'transparent',
            border: 'none',
            color: activeView === tool.id ? '#111111' : 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  )
}
