const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, '..', 'app', 'app', 'page.tsx')
let src = fs.readFileSync(filePath, 'utf8')

// Normalise CRLF → LF for reliable matching
src = src.replace(/\r\n/g, '\n')

// ── 1. Fix party1 field name ──────────────────────────────────────────────────
src = src.replace(
  "party1: (intake.yourName as string) ?? '',",
  "party1: ((intake.yourFullName ?? intake.yourName) as string) ?? '',"
)

// ── 2. Add SelectionToolbar component before ContractViewer ──────────────────
const toolbar = [
  '',
  '// ── Floating selection toolbar ───────────────────────────────────────────────',
  '',
  'function SelectionToolbar({ position, onClose }: { position: { x: number; y: number }; onClose: () => void }) {',
  "  const execCmd = (cmd: string, value?: string) => {",
  "    document.execCommand(cmd, false, value ?? undefined)",
  "    onClose()",
  "  }",
  "  return (",
  "    <div",
  '      className="fixed z-50 flex items-center gap-0.5 px-2 py-1.5 shadow-lg border"',
  "      style={{ left: position.x, top: position.y - 48, backgroundColor: '#1B4332', borderColor: '#2D6A4F', transform: 'translateX(-50%)' }}",
  "      onMouseDown={(e) => e.preventDefault()}",
  "    >",
  '      <button onClick={() => execCmd("bold")} className="px-2 py-1 text-xs font-bold text-white hover:bg-[#2D6A4F] transition-colors" title="Bold">B</button>',
  '      <button onClick={() => execCmd("italic")} className="px-2 py-1 text-xs italic text-white hover:bg-[#2D6A4F] transition-colors" title="Italic">I</button>',
  '      <button onClick={() => execCmd("underline")} className="px-2 py-1 text-xs underline text-white hover:bg-[#2D6A4F] transition-colors" title="Underline">U</button>',
  "      <div className=\"w-px h-4 mx-1\" style={{ backgroundColor: '#2D6A4F' }} />",
  '      <button onClick={() => execCmd("fontSize", "2")} className="px-1.5 py-1 text-white hover:bg-[#2D6A4F] transition-colors" title="Smaller" style={{ fontSize: 10 }}>A-</button>',
  '      <button onClick={() => execCmd("fontSize", "4")} className="px-1.5 py-1 text-white hover:bg-[#2D6A4F] transition-colors" title="Larger" style={{ fontSize: 14 }}>A+</button>',
  "      <div className=\"w-px h-4 mx-1\" style={{ backgroundColor: '#2D6A4F' }} />",
  '      <label className="flex items-center gap-1 cursor-pointer px-1" title="Text colour">',
  '        <span className="text-xs text-white font-medium">A</span>',
  '        <input type="color" defaultValue="#374151" className="w-4 h-4 cursor-pointer" style={{ border: "none", padding: 0, background: "transparent" }} onChange={(e) => execCmd("foreColor", e.target.value)} />',
  '      </label>',
  "      <div className=\"w-px h-4 mx-1\" style={{ backgroundColor: '#2D6A4F' }} />",
  '      <button onClick={() => { document.execCommand("removeFormat"); onClose() }} className="px-2 py-1 text-xs text-white hover:bg-[#2D6A4F] transition-colors" title="Clear">\u2715</button>',
  '    </div>',
  '  )',
  '}',
  '',
].join('\n')

src = src.replace('function ContractViewer(', toolbar + '\nfunction ContractViewer(')

// ── 3. Replace sideTab type ───────────────────────────────────────────────────
src = src.replace(
  "useState<'parties' | 'details' | 'terms'>('parties')",
  "useState<'parties' | 'details' | 'styling'>('parties')"
)

// ── 4. Add styling state + selectionToolbar after sigError ───────────────────
const stylingState = [
  '',
  "  const [docFont, setDocFont] = useState('Inter, sans-serif')",
  '  const [docBodySize, setDocBodySize] = useState(14)',
  '  const [docHeadingSize, setDocHeadingSize] = useState(18)',
  "  const [docBodyColor, setDocBodyColor] = useState('#374151')",
  "  const [docHeadingColor, setDocHeadingColor] = useState('#1B4332')",
  '  const [docFontWeight, setDocFontWeight] = useState<400 | 500 | 600>(400)',
  "  const [docLogo, setDocLogo] = useState<string>(String(contract.intakeData?.yourLogo ?? ''))",
  '  const [selectionToolbar, setSelectionToolbar] = useState<{ x: number; y: number } | null>(null)',
].join('\n')

src = src.replace(
  "  const [sigError, setSigError] = useState<string | null>(null)",
  "  const [sigError, setSigError] = useState<string | null>(null)" + stylingState
)

// ── 5. Suppress unused keyTerms ───────────────────────────────────────────────
src = src.replace(
  '  const keyTerms = Object.entries(KEY_TERM_LABELS)',
  '  // eslint-disable-next-line @typescript-eslint/no-unused-vars\n  const keyTerms = Object.entries(KEY_TERM_LABELS)'
)

// ── 6. Apply fontFamily + fontWeight to doc container ────────────────────────
src = src.replace(
  '<div className="flex-1 overflow-y-auto" style={{ backgroundColor: \'#FFFFFF\' }}>',
  '<div className="flex-1 overflow-y-auto" style={{ backgroundColor: \'#FFFFFF\', fontFamily: docFont, fontWeight: docFontWeight }}>'
)

// ── 7. Replace tabs array ─────────────────────────────────────────────────────
src = src.replace(
  "(['parties', 'details', 'terms'] as const).map",
  "(['parties', 'details', 'styling'] as const).map"
)
src = src.replace(
  "{t === 'parties' ? 'Parties' : t === 'details' ? 'Details' : 'Key Terms'}",
  "{t === 'parties' ? 'Parties' : t === 'details' ? 'Details' : 'Styling'}"
)

// ── 8. Replace Key Terms panel with Styling panel ────────────────────────────
const oldTerms = [
  "          {sideTab === 'terms' && (",
  "            keyTerms.length > 0 ? keyTerms.map(t => (",
  '              <div key={t.label} className="mb-3">',
  "                <p className=\"text-xs font-medium mb-0.5\" style={{ color: '#9CA3AF' }}>{t.label}</p>",
  "                <p className=\"text-sm\" style={{ color: '#1B4332' }}>{t.value}</p>",
  '              </div>',
  '            )) : (',
  "              <p className=\"text-xs italic\" style={{ color: '#9CA3AF' }}>No key terms available for this contract type.</p>",
  '            )',
  '          )}',
].join('\n')

const newStyling = [
  "          {sideTab === 'styling' && (",
  '            <div className="space-y-5">',
  '              <div>',
  "                <p className=\"text-xs font-bold uppercase tracking-widest mb-2\" style={{ color: '#9CA3AF' }}>Logo</p>",
  '                {docLogo ? (',
  "                  <div className=\"flex items-center gap-3 p-3 border\" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>",
  '                    <img src={docLogo} alt="Logo" className="h-8 object-contain" style={{ maxWidth: 100 }} />',
  "                    <button onClick={() => setDocLogo('')} className=\"text-xs font-medium hover:opacity-70\" style={{ color: '#EF4444' }}>Remove</button>",
  '                  </div>',
  '                ) : (',
  "                  <label className=\"flex items-center justify-center gap-2 border-2 border-dashed py-4 cursor-pointer hover:border-[#2D6A4F] transition-colors\" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>",
  "                    <input type=\"file\" accept=\"image/png,image/jpeg,image/jpg\" className=\"hidden\" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 2 * 1024 * 1024) { alert('Logo must be under 2MB'); return }; const reader = new FileReader(); reader.onload = (ev) => setDocLogo(ev.target?.result as string ?? ''); reader.readAsDataURL(file) }} />",
  "                    <svg className=\"w-4 h-4\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" style={{ color: '#9CA3AF' }}><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\" /><polyline points=\"17 8 12 3 7 8\" /><line x1=\"12\" y1=\"3\" x2=\"12\" y2=\"15\" /></svg>",
  "                    <span className=\"text-sm\" style={{ color: '#6B7280' }}>Upload logo</span>",
  '                  </label>',
  '                )}',
  '              </div>',
  '              <div>',
  "                <p className=\"text-xs font-bold uppercase tracking-widest mb-2\" style={{ color: '#9CA3AF' }}>Font Family</p>",
  "                <select value={docFont} onChange={(e) => setDocFont(e.target.value)} className=\"w-full border px-3 py-2 text-sm focus:outline-none\" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8', color: '#1A1A1A' }}>",
  '                  <option value="Inter, sans-serif">Inter (default)</option>',
  '                  <option value="Georgia, serif">Georgia</option>',
  "                  <option value=\"'Times New Roman', serif\">Times New Roman</option>",
  "                  <option value=\"'Courier New', monospace\">Courier New</option>",
  '                  <option value="Arial, sans-serif">Arial</option>',
  '                  <option value="system-ui, sans-serif">System UI</option>',
  '                </select>',
  '              </div>',
  '              <div className="grid grid-cols-2 gap-3">',
  '                <div>',
  "                  <p className=\"text-xs font-bold uppercase tracking-widest mb-2\" style={{ color: '#9CA3AF' }}>Body Size</p>",
  '                  <div className="flex items-center gap-2">',
  "                    <button onClick={() => setDocBodySize(s => Math.max(10, s - 1))} className=\"w-7 h-7 flex items-center justify-center border text-sm hover:bg-[#FAFAF8]\" style={{ borderColor: '#E5E5E2' }}>-</button>",
  "                    <span className=\"text-sm font-medium flex-1 text-center\" style={{ color: '#1B4332' }}>{docBodySize}px</span>",
  "                    <button onClick={() => setDocBodySize(s => Math.min(24, s + 1))} className=\"w-7 h-7 flex items-center justify-center border text-sm hover:bg-[#FAFAF8]\" style={{ borderColor: '#E5E5E2' }}>+</button>",
  '                  </div>',
  '                </div>',
  '                <div>',
  "                  <p className=\"text-xs font-bold uppercase tracking-widest mb-2\" style={{ color: '#9CA3AF' }}>Heading Size</p>",
  '                  <div className="flex items-center gap-2">',
  "                    <button onClick={() => setDocHeadingSize(s => Math.max(12, s - 1))} className=\"w-7 h-7 flex items-center justify-center border text-sm hover:bg-[#FAFAF8]\" style={{ borderColor: '#E5E5E2' }}>-</button>",
  "                    <span className=\"text-sm font-medium flex-1 text-center\" style={{ color: '#1B4332' }}>{docHeadingSize}px</span>",
  "                    <button onClick={() => setDocHeadingSize(s => Math.min(32, s + 1))} className=\"w-7 h-7 flex items-center justify-center border text-sm hover:bg-[#FAFAF8]\" style={{ borderColor: '#E5E5E2' }}>+</button>",
  '                  </div>',
  '                </div>',
  '              </div>',
  '              <div>',
  "                <p className=\"text-xs font-bold uppercase tracking-widest mb-2\" style={{ color: '#9CA3AF' }}>Body Weight</p>",
  '                <div className="flex gap-2">',
  '                  {([400, 500, 600] as const).map(w => (',
  "                    <button key={w} onClick={() => setDocFontWeight(w)} className=\"flex-1 py-1.5 text-xs font-medium border transition-colors\" style={docFontWeight === w ? { backgroundColor: '#D8F3DC', borderColor: '#2D6A4F', color: '#1B4332' } : { borderColor: '#E5E5E2', color: '#6B7280' }}>",
  "                      {w === 400 ? 'Regular' : w === 500 ? 'Medium' : 'Semibold'}",
  '                    </button>',
  '                  ))}',
  '                </div>',
  '              </div>',
  '              <div className="grid grid-cols-2 gap-3">',
  '                <div>',
  "                  <p className=\"text-xs font-bold uppercase tracking-widest mb-2\" style={{ color: '#9CA3AF' }}>Body Colour</p>",
  '                  <div className="flex items-center gap-2">',
  "                    <input type=\"color\" value={docBodyColor} onChange={(e) => setDocBodyColor(e.target.value)} className=\"w-8 h-8 border cursor-pointer\" style={{ borderColor: '#E5E5E2', padding: 2 }} />",
  "                    <span className=\"text-xs font-mono\" style={{ color: '#6B7280' }}>{docBodyColor}</span>",
  '                  </div>',
  '                </div>',
  '                <div>',
  "                  <p className=\"text-xs font-bold uppercase tracking-widest mb-2\" style={{ color: '#9CA3AF' }}>Heading Colour</p>",
  '                  <div className="flex items-center gap-2">',
  "                    <input type=\"color\" value={docHeadingColor} onChange={(e) => setDocHeadingColor(e.target.value)} className=\"w-8 h-8 border cursor-pointer\" style={{ borderColor: '#E5E5E2', padding: 2 }} />",
  "                    <span className=\"text-xs font-mono\" style={{ color: '#6B7280' }}>{docHeadingColor}</span>",
  '                  </div>',
  '                </div>',
  '              </div>',
  "              <button onClick={() => { setDocFont('Inter, sans-serif'); setDocBodySize(14); setDocHeadingSize(18); setDocBodyColor('#374151'); setDocHeadingColor('#1B4332'); setDocFontWeight(400) }} className=\"w-full py-2 text-xs font-medium border hover:bg-[#FAFAF8] transition-colors\" style={{ borderColor: '#E5E5E2', color: '#6B7280' }}>",
  '                Reset to defaults',
  '              </button>',
  '            </div>',
  '          )}',
].join('\n')

if (!src.includes(oldTerms)) { console.error('ERROR: Key Terms block not found'); process.exit(1) }
src = src.replace(oldTerms, newStyling)

// ── 9. Add logo + onMouseUp + SelectionToolbar ────────────────────────────────
const oldDocArea = [
  "          {/* Party info cards \u2014 at top of document */}",
  '          <DocumentPartyHeader contract={contract} intake={intake} />',
  '',
  '          {/* Document body \u2014 parsed sections */}',
  '          <div>',
  '            {blocks.map((block, i) => {',
].join('\n')

const newDocArea = [
  '          {/* Logo */}',
  '          {docLogo && (',
  '            <div className="mb-6">',
  '              <img src={docLogo} alt="Logo" className="object-contain" style={{ maxHeight: 60, maxWidth: 200 }} />',
  '            </div>',
  '          )}',
  '',
  "          {/* Party info cards \u2014 at top of document */}",
  '          <DocumentPartyHeader contract={contract} intake={intake} />',
  '',
  '          {/* Document body \u2014 parsed sections */}',
  '          <div onMouseUp={() => {',
  '            const sel = window.getSelection()',
  '            if (sel && sel.toString().length > 0 && sel.rangeCount > 0) {',
  '              const r = sel.getRangeAt(0).getBoundingClientRect()',
  '              setSelectionToolbar({ x: r.left + r.width / 2, y: r.top + window.scrollY })',
  '            } else { setSelectionToolbar(null) }',
  '          }}>',
  '            {selectionToolbar && (',
  '              <SelectionToolbar position={selectionToolbar} onClose={() => setSelectionToolbar(null)} />',
  '            )}',
  '            {blocks.map((block, i) => {',
].join('\n')

if (!src.includes(oldDocArea)) { console.error('ERROR: Doc area block not found'); process.exit(1) }
src = src.replace(oldDocArea, newDocArea)

// ── 10. Apply docHeadingColor/Size to section heading ────────────────────────
const oldHeading = [
  '                          className="text-sm font-bold uppercase tracking-wide outline-none focus:bg-[#FAFAF8] px-1 -mx-1"',
  "                          style={{ color: '#1B4332' }}",
].join('\n')
const newHeading = [
  '                          className="font-bold uppercase tracking-wide outline-none focus:bg-[#FAFAF8] px-1 -mx-1"',
  '                          style={{ color: docHeadingColor, fontSize: docHeadingSize }}',
].join('\n')
src = src.replace(oldHeading, newHeading)

// Write back (keep LF - Next.js is fine with it)
fs.writeFileSync(filePath, src, 'utf8')
console.log('page.tsx patched successfully')
