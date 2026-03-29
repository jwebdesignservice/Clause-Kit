$pg = Get-Content "app\app\page.tsx" -Raw -Encoding UTF8

$oldTerms = @'
          {sideTab === 'terms' && (
            keyTerms.length > 0 ? keyTerms.map(t => (
              <div key={t.label} className="mb-3">
                <p className="text-xs font-medium mb-0.5" style={{ color: '#9CA3AF' }}>{t.label}</p>
                <p className="text-sm" style={{ color: '#1B4332' }}>{t.value}</p>
              </div>
            )) : (
              <p className="text-xs italic" style={{ color: '#9CA3AF' }}>No key terms available for this contract type.</p>
            )
          )}
'@

$newStyling = @'
          {sideTab === 'styling' && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#9CA3AF' }}>Logo</p>
                {docLogo ? (
                  <div className="flex items-center gap-3 p-3 border" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
                    <img src={docLogo} alt="Logo" className="h-8 object-contain" style={{ maxWidth: 100 }} />
                    <button onClick={() => setDocLogo('')} className="text-xs font-medium hover:opacity-70" style={{ color: '#EF4444' }}>Remove</button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed py-4 cursor-pointer hover:border-[#2D6A4F] transition-colors" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
                    <input type="file" accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 2 * 1024 * 1024) { alert('Logo must be under 2MB'); return }; const reader = new FileReader(); reader.onload = (ev) => setDocLogo(ev.target?.result as string ?? ''); reader.readAsDataURL(file) }} />
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#9CA3AF' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                    <span className="text-sm" style={{ color: '#6B7280' }}>Upload logo</span>
                  </label>
                )}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#9CA3AF' }}>Font Family</p>
                <select value={docFont} onChange={(e) => setDocFont(e.target.value)} className="w-full border px-3 py-2 text-sm focus:outline-none" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8', color: '#1A1A1A' }}>
                  <option value="Inter, sans-serif">Inter (default)</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                  <option value="'Courier New', monospace">Courier New</option>
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="system-ui, sans-serif">System UI</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#9CA3AF' }}>Body Size</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setDocBodySize(s => Math.max(10, s - 1))} className="w-7 h-7 flex items-center justify-center border text-sm hover:bg-[#FAFAF8]" style={{ borderColor: '#E5E5E2' }}>-</button>
                    <span className="text-sm font-medium flex-1 text-center" style={{ color: '#1B4332' }}>{docBodySize}px</span>
                    <button onClick={() => setDocBodySize(s => Math.min(24, s + 1))} className="w-7 h-7 flex items-center justify-center border text-sm hover:bg-[#FAFAF8]" style={{ borderColor: '#E5E5E2' }}>+</button>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#9CA3AF' }}>Heading Size</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setDocHeadingSize(s => Math.max(12, s - 1))} className="w-7 h-7 flex items-center justify-center border text-sm hover:bg-[#FAFAF8]" style={{ borderColor: '#E5E5E2' }}>-</button>
                    <span className="text-sm font-medium flex-1 text-center" style={{ color: '#1B4332' }}>{docHeadingSize}px</span>
                    <button onClick={() => setDocHeadingSize(s => Math.min(32, s + 1))} className="w-7 h-7 flex items-center justify-center border text-sm hover:bg-[#FAFAF8]" style={{ borderColor: '#E5E5E2' }}>+</button>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#9CA3AF' }}>Body Weight</p>
                <div className="flex gap-2">
                  {([400, 500, 600] as const).map(w => (
                    <button key={w} onClick={() => setDocFontWeight(w)} className="flex-1 py-1.5 text-xs font-medium border transition-colors" style={docFontWeight === w ? { backgroundColor: '#D8F3DC', borderColor: '#2D6A4F', color: '#1B4332' } : { borderColor: '#E5E5E2', color: '#6B7280' }}>
                      {w === 400 ? 'Regular' : w === 500 ? 'Medium' : 'Semibold'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#9CA3AF' }}>Body Colour</p>
                  <div className="flex items-center gap-2">
                    <input type="color" value={docBodyColor} onChange={(e) => setDocBodyColor(e.target.value)} className="w-8 h-8 border cursor-pointer" style={{ borderColor: '#E5E5E2', padding: 2 }} />
                    <span className="text-xs font-mono" style={{ color: '#6B7280' }}>{docBodyColor}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#9CA3AF' }}>Heading Colour</p>
                  <div className="flex items-center gap-2">
                    <input type="color" value={docHeadingColor} onChange={(e) => setDocHeadingColor(e.target.value)} className="w-8 h-8 border cursor-pointer" style={{ borderColor: '#E5E5E2', padding: 2 }} />
                    <span className="text-xs font-mono" style={{ color: '#6B7280' }}>{docHeadingColor}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => { setDocFont('Inter, sans-serif'); setDocBodySize(14); setDocHeadingSize(18); setDocBodyColor('#374151'); setDocHeadingColor('#1B4332'); setDocFontWeight(400) }} className="w-full py-2 text-xs font-medium border hover:bg-[#FAFAF8] transition-colors" style={{ borderColor: '#E5E5E2', color: '#6B7280' }}>
                Reset to defaults
              </button>
            </div>
          )}
'@

$pg = $pg.Replace($oldTerms, $newStyling)
[System.IO.File]::WriteAllText("$PWD\app\app\page.tsx", $pg, [System.Text.Encoding]::UTF8)
Write-Host "Styling panel done"
