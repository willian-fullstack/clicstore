import { Camera, Image as ImageIcon, Sparkles, Lightbulb, Grid } from 'lucide-react'

export default function Header({ productType, setProductType, theme, onThemeChange, realisticRender, onToggleRender, multiModelMode, setMultiModelMode, onTakePhoto }) {
  return (
    <header className="top-header" style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      right: '20px',
      zIndex: 10,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      pointerEvents: 'none',
    }}>
      <div className="brand-badge" style={{
        pointerEvents: 'auto',
        background: 'var(--panel-bg)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--panel-border)',
        padding: '10px 20px',
        borderRadius: 'var(--radius)',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      }}>
        <div className="mock-logo" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '18px', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          <span className="clic" style={{ fontWeight: 600, WebkitTextStroke: '0.03em currentColor' }}>CLIC</span>
          <span className="store" style={{ opacity: 0.85 }}>STORE</span>
          <span className="studio-badge" style={{ fontSize: '10px', padding: '3px 8px', background: 'var(--abs-dourado)', color: 'var(--abs-preto)', borderRadius: '4px', fontWeight: 700, letterSpacing: '1.5px', marginLeft: '4px' }}>STUDIO</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--linha)', paddingLeft: '12px' }}>
          <div className="brand-title" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
            Catálogo 3D <em style={{ color: 'var(--tag-color)' }}>Premium</em>
          </div>
          <div className="brand-subtitle" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Visualizador Oficial da Marca</div>
        </div>
      </div>

      {/* Product Type Toggle */}
      <div style={{ pointerEvents: 'auto', display: 'flex', gap: '4px', background: 'var(--panel-bg)', backdropFilter: 'blur(16px)', padding: '4px', borderRadius: '30px', border: '1px solid var(--panel-border)', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
        <button 
          onClick={() => setProductType('quadros')}
          style={{ padding: '8px 24px', borderRadius: '26px', border: 'none', background: productType === 'quadros' ? 'linear-gradient(135deg, var(--abs-dourado), var(--abs-dourado-claro))' : 'transparent', color: productType === 'quadros' ? '#111' : 'var(--text-main)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s' }}
        >
          Quadros 3D
        </button>
        <button 
          onClick={() => setProductType('rodapes')}
          style={{ padding: '8px 24px', borderRadius: '26px', border: 'none', background: productType === 'rodapes' ? 'linear-gradient(135deg, var(--abs-dourado), var(--abs-dourado-claro))' : 'transparent', color: productType === 'rodapes' ? '#111' : 'var(--text-main)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s' }}
        >
          Rodapés 3D
        </button>
      </div>

      <div className="header-actions" style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button 
          className={`btn-action primary ${realisticRender ? 'render-active' : ''}`}
          onClick={onToggleRender}
          style={{
            background: realisticRender ? 'linear-gradient(135deg, #10b981, #059669)' : 'var(--panel-bg)',
            color: realisticRender ? '#ffffff' : 'var(--text-main)',
            border: 'none',
            padding: '10px 16px',
            borderRadius: 'var(--radius)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 600,
            boxShadow: realisticRender ? '0 4px 20px rgba(16, 185, 129, 0.4)' : '0 4px 15px rgba(0,0,0,0.3)',
          }}
        >
          {realisticRender ? <Sparkles size={16} /> : <Lightbulb size={16} />} 
          {realisticRender ? 'Render Realista (Blender PBR)' : 'Render Padrão'}
        </button>

        <div className="theme-picker-header" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--panel-bg)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--panel-border)',
          padding: '8px 14px',
          borderRadius: 'var(--radius)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
        }}>
          <span className="theme-label" style={{ fontSize: '9px', fontWeight: 800, color: 'var(--tag-color)', marginRight: '2px' }}>TEMA:</span>
          {['preto', 'dourado', 'dourado-claro', 'creme', 'offwhite'].map(t => (
            <button
              key={t}
              onClick={() => onThemeChange(t)}
              style={{
                width: '20px', height: '20px', borderRadius: '50%',
                border: theme === t ? '2px solid var(--abs-dourado)' : '1.5px solid rgba(0, 0, 0, 0.25)',
                background: `var(--abs-${t === 'preto' ? 'preto' : t === 'dourado' ? 'dourado' : t === 'dourado-claro' ? 'dourado-claro' : t === 'creme' ? 'creme' : 'offwhite'})`,
                cursor: 'pointer'
              }}
            />
          ))}
        </div>

        <button 
          className={`btn-action ${multiModelMode ? 'primary' : ''}`} 
          onClick={() => setMultiModelMode(!multiModelMode)}
          style={{
            background: multiModelMode ? 'linear-gradient(135deg, var(--abs-dourado), var(--abs-dourado-claro))' : 'var(--panel-bg)',
            color: multiModelMode ? '#111111' : 'var(--text-main)',
            border: multiModelMode ? 'none' : '1px solid var(--panel-border)',
            padding: '10px 16px',
            borderRadius: 'var(--radius)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          <Grid size={16} /> Exibir Todos Lado a Lado
        </button>

        <button 
          className="btn-action primary" 
          onClick={onTakePhoto}
          style={{
          background: 'linear-gradient(135deg, var(--abs-dourado), var(--abs-dourado-claro))',
          color: '#111111',
          border: 'none',
          padding: '10px 16px',
          borderRadius: 'var(--radius)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          fontWeight: 700,
        }}>
          <Camera size={16} /> Tirar Foto HD
        </button>
      </div>
    </header>
  )
}
