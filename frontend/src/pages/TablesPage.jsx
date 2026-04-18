import React, { useEffect, useState, useCallback } from 'react'
import api from '../api'
import socket from '../socket'
import { PageHeader, Modal, Btn, statusBadge, calcBill } from '../components/UI'

export default function TablesPage() {
  const [tables, setTables]   = useState([])
  const [orders, setOrders]   = useState([])
  const [sel, setSel]         = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [t, o] = await Promise.all([api.get('/tables'), api.get('/orders')])
    setTables(t.data); setOrders(o.data); setLoading(false)
  }, [])

  useEffect(() => {
    load()
    socket.on('table:update', load)
    socket.on('order:update', load)
    return () => { socket.off('table:update', load); socket.off('order:update', load) }
  }, [load])

  async function updateStatus(id, status) {
    await api.put(`/tables/${id}`, { status })
    setSel(null); load()
  }

  const selTable = tables.find(t => t.id === sel)
  const selOrder = selTable ? orders.find(o => o.table_id === selTable.id && !['paid','cancelled'].includes(o.status)) : null

  const statusConfig = {
    available: { color: '#7a9e7e', bg: 'rgba(122,158,126,0.08)', border: 'rgba(122,158,126,0.25)', label: 'Available' },
    occupied:  { color: '#d4a847', bg: 'rgba(212,168,71,0.08)',  border: 'rgba(212,168,71,0.25)',  label: 'Occupied'  },
    reserved:  { color: '#7aaed4', bg: 'rgba(122,174,212,0.08)', border: 'rgba(122,174,212,0.25)', label: 'Reserved'  },
  }

  if (loading) return <div style={{ color: 'var(--text3)' }}>Loading…</div>

  const counts = ['available','occupied','reserved'].map(s => ({ s, n: tables.filter(t => t.status === s).length }))

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <PageHeader
        title="Table Management"
        subtitle="Monitor and manage seating across the restaurant"
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            {counts.map(({ s, n }) => (
              <div key={s} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 20, fontSize: 12,
                background: statusConfig[s].bg, border: `1px solid ${statusConfig[s].border}`,
                color: statusConfig[s].color,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusConfig[s].color, display: 'inline-block' }} />
                {n} {s}
              </div>
            ))}
          </div>
        }
      />

      {/* Floor plan image */}
      <div style={{
        borderRadius: 12, overflow: 'hidden', marginBottom: 20, height: 120,
        background: `linear-gradient(rgba(26,21,16,0.7), rgba(26,21,16,0.85)),
          url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop') center/cover`,
        display: 'flex', alignItems: 'center', padding: '0 28px',
      }}>
        <div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: 'var(--text)' }}>Dining Floor</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{tables.length} tables · Click any table to manage</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
        {tables.map(t => {
          const cfg = statusConfig[t.status]
          return (
            <div key={t.id} onClick={() => setSel(t.id)} style={{
              background: sel === t.id ? cfg.bg : 'var(--bg2)',
              border: `1px solid ${sel === t.id ? cfg.color : (t.status !== 'available' ? cfg.border : 'var(--border)')}`,
              borderRadius: 10, padding: '14px 10px', cursor: 'pointer',
              textAlign: 'center', transition: 'all .15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = cfg.color; e.currentTarget.style.background = cfg.bg }}
              onMouseLeave={e => { if (sel !== t.id) { e.currentTarget.style.borderColor = t.status !== 'available' ? cfg.border : 'var(--border)'; e.currentTarget.style.background = 'var(--bg2)' }}}
            >
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 600, color: cfg.color, marginBottom: 3 }}>
                {t.number}
              </div>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: cfg.color, opacity: 0.8, marginBottom: 4 }}>
                {cfg.label}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>{t.capacity} guests</div>
            </div>
          )
        })}
      </div>

      {sel && selTable && (
        <Modal title={`Table ${selTable.number}`} onClose={() => setSel(null)}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>Capacity: {selTable.capacity} guests</span>
            {statusBadge(selTable.status)}
          </div>

          {selOrder && (
            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 16, marginBottom: 18, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.5 }}>Active Order #{selOrder.id}</div>
              {selOrder.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', color: 'var(--text2)' }}>
                  <span>{item.qty}× {item.name}</span>
                  <span style={{ color: 'var(--gold)' }}>₹{item.price * item.qty}</span>
                </div>
              ))}
              {selOrder.items && (() => {
                const { total } = calcBill(selOrder.items)
                return (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600, color: 'var(--gold)', fontFamily: 'Playfair Display, serif' }}>
                    <span>Total (incl. GST)</span><span>₹{total.toFixed(0)}</span>
                  </div>
                )
              })()}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {selTable.status !== 'available' && <Btn variant="sage"    size="sm" onClick={() => updateStatus(sel, 'available')}>Mark Available</Btn>}
            {selTable.status !== 'occupied'  && <Btn variant="amber"   size="sm" onClick={() => updateStatus(sel, 'occupied')}>Mark Occupied</Btn>}
            {selTable.status !== 'reserved'  && <Btn variant="blue"    size="sm" onClick={() => updateStatus(sel, 'reserved')}>Mark Reserved</Btn>}
          </div>
        </Modal>
      )}
    </div>
  )
}
