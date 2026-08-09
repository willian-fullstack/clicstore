import { useState } from 'react'
import { Box as BoxIcon, Ruler, Palette, Sun, UploadCloud, CornerDownRight, Minus } from 'lucide-react'
import { productSizes, modelMetaMap, rodapeModelsMap } from '../App'

export default function Sidebar({
  productType,
  showMeasures, setShowMeasures,
  customColor, setCustomColor,
  matReflexo, setMatReflexo,
  matRelevo, setMatRelevo,
  environment, setEnvironment,
  floorType, setFloorType,
  wallColor, setWallColor,
  lampColor, setLampColor,
  lampIntensity, setLampIntensity,
  setPosterTex,
  activeModelIndex, setActiveModelIndex,
  activeSizeIndex, setActiveSizeIndex,
  setMultiModelMode,
  cutLeft45, setCutLeft45,
  cutRight45, setCutRight45,
  cornerMode, setCornerMode
}) {
  const [activeTab, setActiveTab] = useState('models')

  const handlePosterUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPosterTex(url)
    }
  }

  return (
    <aside className="sidebar" style={{
      position: 'absolute',
      top: '85px',
      left: '20px',
      bottom: '20px',
      width: '400px',
      zIndex: 10,
      background: 'var(--panel-bg)',
      backdropFilter: 'blur(20px)',
      border: '1px solid var(--panel-border)',
      borderRadius: 'var(--radius)',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
      overflow: 'hidden'
    }}>
      <nav className="sidebar-tabs" style={{
        display: 'flex',
        background: 'rgba(0,0,0,0.15)',
        borderBottom: '1px solid var(--panel-border)',
        padding: '6px',
        gap: '4px'
      }}>
        {[
          { id: 'models', icon: <BoxIcon size={16}/>, label: productType === 'quadros' ? 'Quadros (4)' : 'Rodapés (8)' },
          { id: 'dimensions', icon: <Ruler size={16}/>, label: 'Medidas' },
          { id: 'materials', icon: <Palette size={16}/>, label: 'Tinta Custom' },
          { id: 'scene', icon: <Sun size={16}/>, label: 'Cenário & Piso' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '10px 4px', background: activeTab === tab.id ? 'var(--card-bg)' : 'transparent',
              border: activeTab === tab.id ? '1px solid var(--linha)' : 'none',
              color: activeTab === tab.id ? 'var(--tag-color)' : 'var(--text-muted)',
              fontSize: '11px', fontWeight: 600, borderRadius: '8px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              cursor: 'pointer', boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.3)' : 'none'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-content" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {activeTab === 'models' && productType === 'quadros' && (
          <div className="tab-pane">
            <div className="section-tag" style={tagStyle}>01 · Tamanho do Quadro</div>
            <select 
              value={activeSizeIndex}
              onChange={(e) => setActiveSizeIndex(parseInt(e.target.value))}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--card-bg)', color: 'var(--text-main)', border: '1px solid var(--panel-border)', outline: 'none', fontWeight: 600, cursor: 'pointer' }}
            >
              {productSizes.map((size, idx) => (
                <option key={size.id} value={idx}>{size.title}</option>
              ))}
            </select>
            
            <div className="section-tag" style={{...tagStyle, marginTop: '20px'}}>02 · Coleção de Quadros (Cores)</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {modelMetaMap.map((meta, idx) => (
                <div 
                  key={meta.name}
                  onClick={() => {
                    setActiveModelIndex(idx);
                    setMultiModelMode(false);
                  }}
                  style={{
                    background: activeModelIndex === idx ? 'var(--card-hover)' : 'var(--card-bg)',
                    border: activeModelIndex === idx ? '1px solid var(--abs-dourado)' : '1px solid var(--panel-border)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s',
                    boxShadow: activeModelIndex === idx ? '0 4px 15px rgba(0,0,0,0.2)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: meta.color, border: '2px solid rgba(255,255,255,0.2)' }}></div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: activeModelIndex === idx ? 'var(--abs-dourado-claro)' : 'var(--text-main)' }}>{meta.name}</div>
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '4px' }}>
                    {meta.tag}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'models' && productType === 'rodapes' && (
          <div className="tab-pane">
            <div className="section-tag" style={tagStyle}>01 · Coleção de Rodapés</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {rodapeModelsMap.map((meta, idx) => (
                <div 
                  key={meta.name}
                  onClick={() => {
                    setActiveModelIndex(idx);
                    setMultiModelMode(false);
                  }}
                  style={{
                    background: activeModelIndex === idx ? 'var(--card-hover)' : 'var(--card-bg)',
                    border: activeModelIndex === idx ? '1px solid var(--abs-dourado)' : '1px solid var(--panel-border)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s',
                    boxShadow: activeModelIndex === idx ? '0 4px 15px rgba(0,0,0,0.2)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: meta.color, border: '2px solid rgba(255,255,255,0.2)' }}></div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: activeModelIndex === idx ? 'var(--abs-dourado-claro)' : 'var(--text-main)' }}>{meta.name}</div>
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '4px' }}>
                    {meta.tag}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="section-tag" style={{...tagStyle, marginTop: '20px'}}>02 · Cortes e Cantos (Mitre)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Corte Esquerdo (45º)</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Canto para junção</div>
                </div>
                <input type="checkbox" checked={cutLeft45} onChange={(e) => setCutLeft45(e.target.checked)} style={{ cursor: 'pointer' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Corte Direito (45º)</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Canto para junção</div>
                </div>
                <input type="checkbox" checked={cutRight45} onChange={(e) => setCutRight45(e.target.checked)} style={{ cursor: 'pointer' }} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dimensions' && (
          <div className="tab-pane">
            <div className="section-tag" style={tagStyle}>Cotagem Arquitetônica 3D</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Exibir Cotas Arquitetônicas 3D</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Linhas técnicas e flechas</div>
              </div>
              <input type="checkbox" checked={showMeasures} onChange={(e) => setShowMeasures(e.target.checked)} style={{ cursor: 'pointer' }} />
            </div>
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="tab-pane">
             <div className="section-tag" style={tagStyle}>Personalização de Cor</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--card-bg)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                <input type="color" value={customColor} onChange={e => setCustomColor(e.target.value)} style={{ width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Seletor de Cor Customizada</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sobrepor pintura no modelo 3D</div>
                </div>
             </div>
             
             <div className="section-tag" style={{...tagStyle, marginTop: '16px'}}>Acabamento da Madeira</div>
             <div style={{ background: 'var(--card-bg)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--panel-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  <span>Reflexo (Brilho/Verniz)</span><span>{matReflexo}%</span>
                </div>
                <input type="range" min="0" max="100" value={matReflexo} onChange={e => setMatReflexo(e.target.value)} style={{ width: '100%' }} />
             </div>
             <div style={{ background: 'var(--card-bg)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--panel-border)', marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  <span>Relevo (Crespo/Bump)</span><span>{matRelevo}%</span>
                </div>
                <input type="range" min="0" max="300" value={matRelevo} onChange={e => setMatRelevo(e.target.value)} style={{ width: '100%' }} />
             </div>
          </div>
        )}

        {activeTab === 'scene' && (
          <div className="tab-pane">
            <div className="section-tag" style={tagStyle}>Ambiente Virtual</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button onClick={() => setEnvironment('studio')} style={{...btnOptStyle, borderColor: environment === 'studio' ? 'var(--tag-color)' : 'var(--panel-border)', background: environment === 'studio' ? 'rgba(197, 157, 74, 0.22)' : 'var(--card-bg)'}}>Estúdio Neutro</button>
              <button onClick={() => setEnvironment('room')} style={{...btnOptStyle, borderColor: environment === 'room' ? 'var(--tag-color)' : 'var(--panel-border)', background: environment === 'room' ? 'rgba(197, 157, 74, 0.22)' : 'var(--card-bg)'}}>Parede + Piso Real</button>
            </div>
            
            <div className="section-tag" style={{...tagStyle, marginTop: '16px'}}>Textura do Piso</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {['parquet', 'oak', 'wenge', 'carrara', 'marquina', 'concrete'].map(t => (
                 <button key={t} onClick={() => setFloorType(t)} style={{...btnOptStyle, borderColor: floorType === t ? 'var(--tag-color)' : 'var(--panel-border)', background: floorType === t ? 'rgba(197, 157, 74, 0.25)' : 'var(--card-bg)'}}>{t}</button>
              ))}
            </div>

            <div className="section-tag" style={{...tagStyle, marginTop: '16px'}}>Imagem / Pôster do Quadro</div>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', padding: '10px', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
               <UploadCloud size={16} /> Carregar Foto ou Arte (.JPG/.PNG)
               <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePosterUpload} />
            </label>
            
            <div className="section-tag" style={{...tagStyle, marginTop: '16px'}}>Luminária de Canto (Abajur PBR)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--card-bg)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
              <input type="color" value={lampColor} onChange={e => setLampColor(e.target.value)} style={{ width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Cor da Luz</div>
              </div>
            </div>
            <div style={{ background: 'var(--card-bg)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--panel-border)', marginTop: '10px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                 <span>Intensidade da Luz</span><span>{lampIntensity}%</span>
               </div>
               <input type="range" min="0" max="100" value={lampIntensity} onChange={e => setLampIntensity(e.target.value)} style={{ width: '100%' }} />
            </div>
            
            <div className="section-tag" style={{...tagStyle, marginTop: '16px'}}>Cor da Parede</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--card-bg)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
               <input type="color" value={wallColor} onChange={e => setWallColor(e.target.value)} style={{ width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer' }} />
               <div><div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Tinta da Parede</div></div>
            </div>

            {productType === 'rodapes' && (
              <div style={{ marginTop: '16px' }}>
                <div className="section-tag" style={{...tagStyle, marginBottom: '8px'}}>Modo de Instalação de Canto</div>
                <div className="grid-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div 
                    className={`option-card ${cornerMode === 'single' ? 'active' : ''}`}
                    onClick={() => setCornerMode('single')}
                    style={{ background: cornerMode === 'single' ? 'var(--linha)' : 'var(--card-bg)', border: '1px solid var(--panel-border)', padding: '10px', borderRadius: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  >
                    <div style={{ background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', marginBottom: '8px' }}>
                      <Minus size={20} color="var(--tag-color)" />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)' }}>Barra Reta</span>
                  </div>

                  <div 
                    className={`option-card ${cornerMode === 'miter' ? 'active' : ''}`}
                    onClick={() => setCornerMode('miter')}
                    style={{ background: cornerMode === 'miter' ? 'var(--linha)' : 'var(--card-bg)', border: '1px solid var(--panel-border)', padding: '10px', borderRadius: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  >
                    <div style={{ background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', marginBottom: '8px' }}>
                      <CornerDownRight size={20} color="var(--tag-color)" />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)' }}>Canto 90º</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}

const tagStyle = { display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--tag-color)', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 800, marginBottom: '6px' }
const btnOptStyle = { padding: '10px', borderRadius: '10px', color: 'var(--text-main)', fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }
