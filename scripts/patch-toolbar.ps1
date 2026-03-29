$pg = Get-Content "app\app\page.tsx" -Raw -Encoding UTF8

$toolbarComp = @'
// ── Floating selection toolbar ────────────────────────────────────────────────

function SelectionToolbar({ position, onClose }: { position: { x: number; y: number }; onClose: () => void }) {
  const execCmd = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value ?? undefined)
    onClose()
  }
  return (
    <div
      className="fixed z-50 flex items-center gap-0.5 px-2 py-1.5 shadow-lg border"
      style={{ left: position.x, top: position.y - 48, backgroundColor: '#1B4332', borderColor: '#2D6A4F', transform: 'translateX(-50%)' }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <button onClick={() => execCmd('bold')} className="px-2 py-1 text-xs font-bold text-white hover:bg-[#2D6A4F] transition-colors" title="Bold">B</button>
      <button onClick={() => execCmd('italic')} className="px-2 py-1 text-xs italic text-white hover:bg-[#2D6A4F] transition-colors" title="Italic">I</button>
      <button onClick={() => execCmd('underline')} className="px-2 py-1 text-xs underline text-white hover:bg-[#2D6A4F] transition-colors" title="Underline">U</button>
      <div className="w-px h-4 mx-1" style={{ backgroundColor: '#2D6A4F' }} />
      <button onClick={() => execCmd('fontSize', '2')} className="px-1.5 py-1 text-white hover:bg-[#2D6A4F] transition-colors" title="Smaller" style={{ fontSize: 10 }}>A-</button>
      <button onClick={() => execCmd('fontSize', '4')} className="px-1.5 py-1 text-white hover:bg-[#2D6A4F] transition-colors" title="Larger" style={{ fontSize: 14 }}>A+</button>
      <div className="w-px h-4 mx-1" style={{ backgroundColor: '#2D6A4F' }} />
      <label className="flex items-center gap-1 cursor-pointer px-1" title="Text colour">
        <span className="text-xs text-white font-medium">A</span>
        <input
          type="color"
          defaultValue="#374151"
          className="w-4 h-4 cursor-pointer"
          style={{ border: 'none', padding: 0, background: 'transparent' }}
          onChange={(e) => execCmd('foreColor', e.target.value)}
        />
      </label>
      <div className="w-px h-4 mx-1" style={{ backgroundColor: '#2D6A4F' }} />
      <button onClick={() => { document.execCommand('removeFormat'); onClose() }} className="px-2 py-1 text-xs text-white hover:bg-[#2D6A4F] transition-colors" title="Clear">✕</button>
    </div>
  )
}

'@

$pg = $pg -replace "function ContractViewer\(", "$toolbarComp`r`nfunction ContractViewer("
[System.IO.File]::WriteAllText("$PWD\app\app\page.tsx", $pg, [System.Text.Encoding]::UTF8)
Write-Host "Toolbar component done"
