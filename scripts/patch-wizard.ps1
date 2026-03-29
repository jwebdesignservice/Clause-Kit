$wiz = Get-Content "app\app\IntakeWizard.tsx" -Raw -Encoding UTF8

# 1. Add yourFullName, yourBusinessName, yourLogo to interface
$wiz = $wiz -replace '  // Your details\r?\n  yourName: string', "  // Your details`r`n  yourFullName: string`r`n  yourBusinessName: string`r`n  yourLogo?: string`r`n  yourName?: string"

# 2. Update useState initial data
$wiz = $wiz -replace "yourName: '', yourEmail:", "yourFullName: '', yourBusinessName: '', yourLogo: '', yourEmail:"

# 3. Update step 0 validation
$wiz = $wiz -replace "if \(!data\.yourName\?\.trim\(\)\) e\.yourName = 'Your name or company name is required'", "if (!data.yourFullName?.trim()) e.yourFullName = 'Your full name is required'`r`n      if (!data.yourBusinessName?.trim()) e.yourBusinessName = 'Business name is required'"

# 4. Replace step 0 fields
$old4 = @'
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full name or company name" error={errors.yourName}>
                  <Input name="yourName" value={data.yourName} onChange={set} placeholder="e.g. Jane Smith / Acme Ltd" hasError={!!errors.yourName} />
                </Field>
                <Field label="Email address" error={errors.yourEmail}>
                  <Input name="yourEmail" value={data.yourEmail} onChange={set} placeholder="jane@acme.co.uk" type="email" hasError={!!errors.yourEmail} />
                </Field>
              </div>
              <Field label="Business address" error={errors.yourAddress}>
                <Textarea name="yourAddress" value={data.yourAddress} onChange={set} placeholder="123 High Street&#10;London&#10;EC1A 1BB" rows={3} hasError={!!errors.yourAddress} />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Company number" optional hint="If Ltd company">
                  <Input name="yourCompanyNumber" value={data.yourCompanyNumber} onChange={set} placeholder="e.g. 12345678" />
                </Field>
                <Field label="VAT number" optional>
                  <Input name="yourVatNumber" value={data.yourVatNumber} onChange={set} placeholder="e.g. GB123456789" />
                </Field>
              </div>
            </div>
          )}
'@

$new4 = @'
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full name" error={errors.yourFullName}>
                  <Input name="yourFullName" value={(data.yourFullName as string) ?? ''} onChange={set} placeholder="e.g. Jane Smith" hasError={!!errors.yourFullName} />
                </Field>
                <Field label="Business name" error={errors.yourBusinessName}>
                  <Input name="yourBusinessName" value={(data.yourBusinessName as string) ?? ''} onChange={set} placeholder="e.g. Acme Ltd" hasError={!!errors.yourBusinessName} />
                </Field>
              </div>
              <Field label="Email address" error={errors.yourEmail}>
                <Input name="yourEmail" value={data.yourEmail} onChange={set} placeholder="jane@acme.co.uk" type="email" hasError={!!errors.yourEmail} />
              </Field>
              <Field label="Business address" error={errors.yourAddress}>
                <Textarea name="yourAddress" value={data.yourAddress} onChange={set} placeholder="123 High Street&#10;London&#10;EC1A 1BB" rows={3} hasError={!!errors.yourAddress} />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Company number" optional hint="If Ltd company">
                  <Input name="yourCompanyNumber" value={data.yourCompanyNumber} onChange={set} placeholder="e.g. 12345678" />
                </Field>
                <Field label="VAT number" optional>
                  <Input name="yourVatNumber" value={data.yourVatNumber} onChange={set} placeholder="e.g. GB123456789" />
                </Field>
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>
                  Logo <span className="text-xs font-normal ml-1" style={{ color: '#9CA3AF' }}>(optional)</span>
                </label>
                <p className="text-xs mb-2" style={{ color: '#9CA3AF' }}>Appears at the top of your contract. PNG or JPG, max 2MB.</p>
                {(data.yourLogo as string) ? (
                  <div className="flex items-center gap-3 p-3 border" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
                    <img src={data.yourLogo as string} alt="Logo preview" className="h-10 object-contain" style={{ maxWidth: 120 }} />
                    <button type="button" onClick={() => set('yourLogo', '')} className="text-xs font-medium hover:opacity-70" style={{ color: '#EF4444' }}>Remove</button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed py-5 cursor-pointer hover:border-[#2D6A4F] transition-colors" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        if (file.size > 2 * 1024 * 1024) { alert('Logo must be under 2MB'); return }
                        const reader = new FileReader()
                        reader.onload = (ev) => set('yourLogo', ev.target?.result as string ?? '')
                        reader.readAsDataURL(file)
                      }}
                    />
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#9CA3AF' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                    <span className="text-sm font-medium" style={{ color: '#6B7280' }}>Upload logo</span>
                  </label>
                )}
              </div>
            </div>
          )}
'@

$wiz = $wiz.Replace($old4, $new4)

# 5. Fix review summary
$wiz = $wiz -replace "                      data\.yourName,", "                      data.yourFullName ? ``\${data.yourFullName as string}\${data.yourBusinessName ? ' — ' + (data.yourBusinessName as string) : ''}`` : null,"

[System.IO.File]::WriteAllText("$PWD\app\app\IntakeWizard.tsx", $wiz, [System.Text.Encoding]::UTF8)
Write-Host "IntakeWizard done"
