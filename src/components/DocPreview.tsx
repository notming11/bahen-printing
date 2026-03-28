import { useState, useEffect, useRef } from 'react'
import type { MockFile, PrintSettings } from '../types'
import { LOREM_PARAGRAPHS } from '../data'
import { ArrowRight, CircleAlert, FileIcon } from 'lucide-react'

interface Props {
  file: MockFile | null
  settings: PrintSettings
  onOpenFile: () => void   
}
const PAGE_RATIO = 1.414 // A4 
const A4_WIDTH_CM = 21.0  

const FALLBACK_MARGIN = { label: 'Normal', t: 2.54, b: 2.54, l: 2.54, r: 2.54 }

function EmptyState({ onOpenFile }: { onOpenFile: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-slate-100 overflow-hidden min-h-0">
      <img
        src="src\assets\doc.png"
        alt="No document"
        className="w-28 h-auto opacity-80"
      />
      <p className="font-sans text-sm text-slate-500">No document open</p>
      <p className="font-mono text-xs text-slate-400 flex flex-row gap-2">
        File <ArrowRight className='h-4 w-4'/> select a document to begin
      </p>
      <button 
        onClick={onOpenFile}
        className="flex flex-row gap-1 mt-2 px-2 py-1.5 text-xs font-mono bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
      >
        <span><FileIcon className='h-3 w-3'/></span> Open file 
      </button>
    </div>
  )
}

function PageContent({ nup, opacity = 1 }: { nup: number; opacity?: number }) {
  const fs = Math.max(3.5, 11 / Math.sqrt(nup))
  const mb = Math.max(2, 7 / Math.sqrt(nup))
  const paras = nup > 1 ? LOREM_PARAGRAPHS.slice(0, 1) : LOREM_PARAGRAPHS

  return (
    <div style={{ opacity, transition: 'opacity 0.35s' }}>
      {paras.map((p, i) => (
        <p key={i} style={{
          fontFamily: '"IBM Plex Sans", sans-serif',
          fontSize: fs,
          lineHeight: 1.55,
          color: '#1e293b',
          marginBottom: mb,
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
        }}>{p}</p>
      ))}
    </div>
  )
}

interface PageProps {
  pw: number
  ph: number
  mT: number; mB: number; mL: number; mR: number
  nup: number
  isFront: boolean
  showLabel: boolean
  showCutoff: boolean
  file: MockFile
  scaleMultiplier: number
}

function RenderedPage({ pw, ph, mT, mB, mL, mR, nup, isFront, showLabel, showCutoff, file, scaleMultiplier }: PageProps) {
  const nupCols = nup <= 2 ? nup : 2
  const nupRows = Math.ceil(nup / nupCols)
  const contentW = pw - mL - mR
  const contentH = ph - mT - mB
  const leftCutW = showCutoff ? Math.max(0, (1.5 * pw / A4_WIDTH_CM) - mL) : 0

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {file.pages > 1 && [5, 2.5].map((o, i) => (
        <div key={i} style={{
          position: 'absolute', top: o, left: o,
          width: pw, height: ph,
          background: '#cbd5e1', border: '1px solid #b0bec5',
          pointerEvents: 'none',
        }} />
      ))}
      <div style={{
        position: 'relative',
        width: pw, height: ph,
        background: '#fff',
        border: '1px solid #d1d5db',
        boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
        overflow: 'hidden', 
      }}>
        {/* margin guide */}
        <div style={{
          position: 'absolute',
          top: mT, bottom: mB, left: mL, right: mR,
          border: '1px dashed rgba(37,99,235,0.30)',
          pointerEvents: 'none', zIndex: 10,
          transition: 'top 0.4s ease, bottom 0.4s ease, left 0.4s ease, right 0.4s ease',
        }} />

        {/* page content */}
        <div style={{
          position: 'absolute',
          top: mT, left: mL,
          width: contentW,
          height: contentH,
          overflow: 'hidden', 
          transition: 'top 0.4s ease, left 0.4s ease, width 0.4s ease, height 0.4s ease',
        }}>
          {nup > 1 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${nupCols}, 1fr)`,
              gridTemplateRows: `repeat(${nupRows}, 1fr)`,
              gap: 2,
              width: '100%', height: '100%',
            }}>
              {Array.from({ length: nup }).map((_, i) => (
                <div key={i} style={{
                  background: '#f8fafc',
                  border: '0.5px solid #e2e8f0',
                  overflow: 'hidden',
                  position: 'relative',
                  padding: 2,
                }}>
                  <div style={{
                    transform: `scale(${0.48 / Math.sqrt(nup)})`,
                    transformOrigin: 'top left',
                    width: `${Math.ceil(100 / (0.48 / Math.sqrt(nup)))}%`,
                    pointerEvents: 'none',
                  }}>
                    <PageContent nup={nup} opacity={isFront ? 1 : 0.35} />
                  </div>
                  <span style={{
                    position: 'absolute', bottom: 1, right: 2,
                    fontSize: 5, color: '#94a3b8',
                    fontFamily: '"IBM Plex Mono", monospace',
                  }}>p{i + 1}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              transform: `scale(${scaleMultiplier})`,
              transformOrigin: 'top left',
              width: `${100 / scaleMultiplier}%`,
              pointerEvents: 'none',
            }}>
              <PageContent nup={1} opacity={isFront ? 1 : 0.3} />
            </div>
          )}
        </div>

        {leftCutW > 0 && isFront && (
          <div style={{
            position: 'absolute', top: 0, bottom: 0, left: 0,
            width: leftCutW,
            background: 'rgba(239,68,68,0.13)',
            borderRight: '2px solid rgba(239,68,68,0.5)',
            pointerEvents: 'none', zIndex: 11,
            transition: 'width 0.4s ease',
          }} />
        )}

        {showLabel && (
          <span style={{
            position: 'absolute', top: 4, right: 5,
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: Math.max(7, pw * 0.028),
            fontWeight: 700, letterSpacing: '0.08em',
            color: isFront ? '#2563eb' : '#94a3b8',
          }}>{isFront ? 'FRONT' : 'BACK'}</span>
        )}
      </div>
    </div>
  )
}

export function DocPreview({ file, settings, onOpenFile }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setDims({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    setDims({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  // Guard against undefined margins (e.g. if initial state isn't set yet)
  const [animM,  setAnimM]  = useState(settings.margins ?? FALLBACK_MARGIN)
  const [animD,  setAnimD]  = useState(settings.duplex)
  const [animN,  setAnimN]  = useState(settings.nup)
  const [animSc, setAnimSc] = useState(settings.scale)
  const [page,   setPage]   = useState(1)

  useEffect(() => {
    if (!settings.margins) return
    const t = setTimeout(() => setAnimM(settings.margins), 10)
    return () => clearTimeout(t)
  }, [settings.margins])

  useEffect(() => {
    const t = setTimeout(() => { setAnimD(settings.duplex); setAnimN(settings.nup) }, 10)
    return () => clearTimeout(t)
  }, [settings.duplex, settings.nup])

  useEffect(() => {
    const t = setTimeout(() => setAnimSc(settings.scale), 10)
    return () => clearTimeout(t)
  }, [settings.scale])

  if (!file) return <EmptyState onOpenFile={onOpenFile} />

  const m = animM ?? FALLBACK_MARGIN

  const PAD_X = 56, PAD_Y = 100
  const avW = Math.max(1, dims.w - PAD_X)
  const avH = Math.max(1, dims.h - PAD_Y)
  const slots = animD ? 2 : 1
  const spineW = animD ? 10 : 0
  const maxByW = (avW - spineW) / slots
  const maxByH = avH / PAGE_RATIO
  const pw = Math.floor(Math.min(maxByW, maxByH, 320))
  const ph = Math.floor(pw * PAGE_RATIO)
  const cmToPx = pw / A4_WIDTH_CM
  const mL = Math.round(m.l * cmToPx)
  const mR = Math.round(m.r * cmToPx)
  const mT = Math.round(m.t * cmToPx)
  const mB = Math.round(m.b * cmToPx)
  const scaleMultiplier = parseFloat(animSc.replace('%', '')) / 100
  const isCutoff = file.cutoff && m.l * cmToPx < (1.5 * cmToPx)
  const pageProps = { pw, ph, mT, mB, mL, mR, nup: animN, file, isCutoff, scaleMultiplier }

  return (
    <div ref={containerRef} className="flex-1 bg-slate-100 flex flex-col items-center justify-center overflow-hidden min-h-0 min-w-0 gap-3">
      
      <div style={{ width: pw }} className="flex justify-between items-center font-mono text-xs text-slate-400 shrink-0">
        <button 
          onClick={onOpenFile}
          className="flex flex-row gap-1 mt-2 px-2 py-1.5 text-xs font-mono bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
        >
          <span><FileIcon className='h-3 w-3'/></span> Open file 
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className={page > 1 ? 'text-[#1e3a5f] cursor-pointer text-base' : 'text-slate-300 cursor-default text-base'}
          >
            &#8249;
          </button>
          <span className="text-[#1e3a5f]">{page}/{file.pages}</span>
          <button
            onClick={() => setPage(p => Math.min(file.pages, p + 1))}
            className={page < file.pages ? 'text-[#1e3a5f] cursor-pointer text-base' : 'text-slate-300 cursor-default text-base'}
          >
            &#8250;
          </button>
        </div>
      </div>

      <div className="flex items-start shrink-0" style={{ transition: 'gap 0.3s' }}>
        {animD ? (
          <>
            <RenderedPage {...pageProps} isFront={true}  showLabel={true}  showCutoff={isCutoff} />
            <div style={{
              width: spineW, height: ph, flexShrink: 0,
              background: 'linear-gradient(to right,#94a3b8 0%,#e2e8f0 45%,#e2e8f0 55%,#94a3b8 100%)',
              boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.07), inset 2px 0 4px rgba(0,0,0,0.07)',
            }} />
            <RenderedPage {...pageProps} isFront={false} showLabel={true}  showCutoff={false} />
          </>
        ) : (
          <RenderedPage {...pageProps} isFront={true} showLabel={false} showCutoff={isCutoff} />
        )}
      </div>

      {isCutoff && (
        <div className="shrink-0 px-4 py-1.5 bg-red-50 border border-red-200 text-red-700 font-mono text-[11px] rounded flex flex-row gap-2">
          <CircleAlert className='w-4 h-4'/> Content may be cut off. Try <strong>Wide</strong> or <strong>Scale to fit</strong>
        </div>
      )}
    </div>
  )
}