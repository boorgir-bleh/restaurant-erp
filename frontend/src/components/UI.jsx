import React from 'react'

// ── BADGE ────────────────────────────────────────────────────────
const BADGE_STYLES = {
  green:  { background: 'rgba(122,158,126,0.15)', color: '#7a9e7e', border: '1px solid rgba(122,158,126,0.3)' },
  amber:  { background: 'rgba(212,168,71,0.15)',  color: '#d4a847', border: '1px solid rgba(212,168,71,0.3)' },
  red:    { background: 'rgba(224,112,112,0.15)', color: '#e07070', border: '1px solid rgba(224,112,112,0.3)' },
  blue:   { background: 'rgba(122,174,212,0.15)', color: '#7aaed4', border: '1px solid rgba(122,174,212,0.3)' },
  purple: { background: 'rgba(176,144,208,0.15)', color: '#b090d0', border: '1px solid rgba(176,144,208,0.3)' },
  gray:   { background: 'rgba(138,117,96,0.15)',  color: '#8a7560', border: '1px solid rgba(138,117,96,0.3)' },
  gold:   { background: 'rgba(212,168,71,0.15)',  color: '#d4a847', border: '1px solid rgba(212,168,71,0.3)' },
}

export function Badge({ color = 'gray', children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
      ...BADGE_STYLES[color]
    }}>{children}</span>
  )
}

export function statusBadge(status) {
  const map = {
    pending: 'amber', cooking: 'blue', served: 'purple',
    paid: 'green', cancelled: 'gray',
    available: 'green', occupied: 'amber', reserved: 'blue',
    confirmed: 'green', manager: 'gold', staff: 'green',
  }
  return <Badge color={map[status] || 'gray'}>{status}</Badge>
}

// ── CARD ─────────────────────────────────────────────────────────
export function Card({ title, children, style = {} }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '20px', ...style
    }}>
      {title && (
        <div style={{
          fontSize: 11, fontWeight: 600, color: 'var(--text3)',
          textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16,
        }}>{title}</div>
      )}
      {children}
    </div>
  )
}

// ── METRIC CARD ──────────────────────────────────────────────────
export function MetricCard({ label, value, sub, valueColor = 'var(--text)', icon }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '20px',
      transition: 'border-color .2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 2 }}>{label}</div>
        {icon && <span style={{ fontSize: 18, opacity: 0.6 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 26, fontWeight: 600, fontFamily: 'Playfair Display, serif', color: valueColor }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

// ── BUTTON ───────────────────────────────────────────────────────
const BTN_VARIANTS = {
  primary: { background: 'linear-gradient(135deg, #d4a847, #b8912e)', color: '#1a1510', border: 'none', fontWeight: 600 },
  outline: { background: 'none', color: 'var(--text2)', border: '1px solid var(--border2)' },
  danger:  { background: 'rgba(224,112,112,0.15)', color: '#e07070', border: '1px solid rgba(224,112,112,0.3)' },
  amber:   { background: 'rgba(212,168,71,0.15)', color: '#d4a847', border: '1px solid rgba(212,168,71,0.3)' },
  blue:    { background: 'rgba(122,174,212,0.15)', color: '#7aaed4', border: '1px solid rgba(122,174,212,0.3)' },
  sage:    { background: 'rgba(122,158,126,0.15)', color: '#7a9e7e', border: '1px solid rgba(122,158,126,0.3)' },
}

export function Btn({ variant = 'outline', size = 'md', onClick, disabled, children, style = {} }) {
  const pad = size === 'sm' ? '6px 14px' : '10px 20px'
  const fs  = size === 'sm' ? 12 : 13
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: pad, borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'Inter, sans-serif', fontSize: fs, fontWeight: 500,
      transition: 'all .15s', opacity: disabled ? .5 : 1,
      ...BTN_VARIANTS[variant], ...style
    }}>{children}</button>
  )
}

// ── MODAL ────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, width = 500 }) {
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }} style={{
      position: 'fixed', inset: 0, background: 'rgba(10,8,5,.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
      backdropFilter: 'blur(2px)',
    }}>
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 28, width, maxWidth: '95vw', maxHeight: '88vh', overflowY: 'auto',
        animation: 'fadeIn .2s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: 'var(--text)' }}>{title}</div>
          <Btn variant="outline" size="sm" onClick={onClose}>✕</Btn>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── FORM FIELDS ───────────────────────────────────────────────────
export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1.2 }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
  borderRadius: 8, padding: '10px 14px', color: 'var(--text)',
  fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'border .15s',
}

export function Input({ label, ...props }) {
  return (
    <Field label={label}>
      <input style={inputStyle} {...props}
        onFocus={e => e.target.style.borderColor = 'var(--gold)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
    </Field>
  )
}

export function Select({ label, value, onChange, options = [] }) {
  return (
    <Field label={label}>
      <select style={{ ...inputStyle, cursor: 'pointer' }} value={value} onChange={onChange}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  )
}

export function Textarea({ label, ...props }) {
  return (
    <Field label={label}>
      <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} {...props}
        onFocus={e => e.target.style.borderColor = 'var(--gold)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
    </Field>
  )
}

// ── TABLE ────────────────────────────────────────────────────────
export function Table({ columns, rows }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {columns.map(c => (
              <th key={c} style={{
                textAlign: 'left', padding: '10px 14px', fontSize: 10,
                color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5,
                fontWeight: 500, whiteSpace: 'nowrap',
              }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}
              onMouseEnter={e => Array.from(e.currentTarget.cells).forEach(c => c.style.background = 'rgba(255,255,255,0.02)')}
              onMouseLeave={e => Array.from(e.currentTarget.cells).forEach(c => c.style.background = '')}
            >
              {row.map((cell, j) => (
                <td key={j} style={{
                  padding: '11px 14px', borderBottom: '1px solid var(--border)',
                  color: 'var(--text2)', verticalAlign: 'middle', transition: 'background .1s',
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── TOAST ────────────────────────────────────────────────────────
export function Toast({ msg, onDone }) {
  React.useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t) }, [])
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      background: 'var(--bg3)', border: '1px solid rgba(212,168,71,0.4)',
      borderRadius: 10, padding: '12px 18px', fontSize: 13, color: '#d4a847',
      zIndex: 999, animation: 'fadeIn .2s ease',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>{msg}</div>
  )
}

// ── PAGE HEADER ───────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
      <div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{title}</h2>
        {subtitle && <div style={{ fontSize: 13, color: 'var(--text3)' }}>{subtitle}</div>}
      </div>
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{actions}</div>}
    </div>
  )
}

// ── GST / BILL ────────────────────────────────────────────────────
export function calcBill(items) {
  const sub  = items.reduce((s, i) => s + i.price * i.qty, 0)
  const sgst = parseFloat((sub * 0.025).toFixed(2))
  const cgst = parseFloat((sub * 0.025).toFixed(2))
  const total = parseFloat((sub + sgst + cgst).toFixed(2))
  return { sub, sgst, cgst, total }
}

export function BillBreakdown({ items }) {
  const { sub, sgst, cgst, total } = calcBill(items)
  const row = (label, val, highlight = false) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', color: highlight ? 'var(--gold)' : 'var(--text2)' }}>
      <span>{label}</span><span>₹{val.toFixed(2)}</span>
    </div>
  )
  return (
    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '12px 14px', border: '1px solid var(--border)' }}>
      {row('Subtotal', sub)}
      {row('SGST (2.5%)', sgst)}
      {row('CGST (2.5%)', cgst)}
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8 }}>
        {row('Grand Total', total, true)}
      </div>
    </div>
  )
}
