import React, { useEffect, useState, useCallback } from 'react'
import api from '../api'
import socket from '../socket'
import { PageHeader, Card, Modal, Btn, Table, Input, Select, Textarea, statusBadge, Toast, calcBill, BillBreakdown } from '../components/UI'

const CATS = ['all','starters','mains','rice','breads','desserts','beverages']
const STATUS_NEXT = { pending: 'cooking', cooking: 'served', served: 'paid' }

export default function OrdersPage() {
  const [orders, setOrders]   = useState([])
  const [tables, setTables]   = useState([])
  const [menu, setMenu]       = useState([])
  const [modal, setModal]     = useState(null)
  const [toast, setToast]     = useState(null)
  const [cat, setCat]         = useState('all')
  const [newTable, setNewTable]   = useState('')
  const [newNotes, setNewNotes]   = useState('')
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [o, t, m] = await Promise.all([api.get('/orders'), api.get('/tables'), api.get('/meta/menu')])
    setOrders(o.data)
    setTables(t.data)
    setMenu(m.data)
    if (!newTable && t.data.length) setNewTable(String(t.data[0].id))
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    socket.on('order:update', load)
    return () => socket.off('order:update', load)
  }, [load])

  async function advanceStatus(id, status) {
    await api.put(`/orders/${id}`, { status })
    setToast(`Order #${id} → ${status}`)
    load()
  }

  async function placeOrder() {
    if (!cartItems.length) return
    await api.post('/orders', {
      table_id: parseInt(newTable),
      items: cartItems.map(i => ({ menu_item_id: i.id, name: i.name, price: i.price, qty: i.qty })),
      notes: newNotes,
    })
    setModal(null); setCartItems([]); setNewNotes('')
    setToast('Order placed!'); load()
  }

  function addToCart(item) {
    setCartItems(prev => {
      const ex = prev.find(i => i.id === item.id)
      if (ex) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...item, qty: 1 }]
    })
  }

  const filteredMenu = cat === 'all' ? menu : menu.filter(m => m.category === cat)

  const elapsed = (ts) => {
    const m = Math.floor((Date.now() - new Date(ts)) / 60000)
    return m < 60 ? `${m}m ago` : `${Math.floor(m/60)}h ago`
  }

  if (loading) return <div style={{ color: 'var(--text3)' }}>Loading…</div>

  return (
    <div>
      <PageHeader title="Orders" actions={
        <Btn variant="primary" size="sm" onClick={() => setModal('new')}>+ New Order</Btn>
      } />

      <Card>
        <Table
          columns={['#','Table','Items','Amount','Status','Waiter','Time','Action']}
          rows={[...orders].reverse().map(o => {
            const bill = calcBill(o.items || [])
            return [
              `#${o.id}`,
              `T${o.table_id}`,
              `${(o.items||[]).length} items`,
              <span style={{ color: 'var(--amber)' }}>₹{bill.total.toFixed(0)}</span>,
              statusBadge(o.status),
              o.waiter?.split(' ')[0] || '—',
              elapsed(o.created_at),
              STATUS_NEXT[o.status]
                ? <Btn variant="outline" size="sm" onClick={() => advanceStatus(o.id, STATUS_NEXT[o.status])}>→ {STATUS_NEXT[o.status]}</Btn>
                : null,
            ]
          })}
        />
      </Card>

      {modal === 'new' && (
        <Modal title="New Order" onClose={() => { setModal(null); setCartItems([]) }} width={560}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Select label="Table" value={newTable} onChange={e => setNewTable(e.target.value)}
              options={tables.map(t => ({ value: t.id, label: `Table ${t.number} (${t.status})` }))} />
            <Input label="Notes" value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Allergies, preferences…" />
          </div>

          {/* Category chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {CATS.map(c => (
              <span key={c} onClick={() => setCat(c)} style={{
                display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
                borderRadius: 20, fontSize: 11, cursor: 'pointer', transition: 'all .12s',
                background: cat === c ? '#14532d' : 'var(--bg4)',
                color: cat === c ? 'var(--accent)' : 'var(--text3)',
                border: `1px solid ${cat === c ? 'var(--accent3)' : 'var(--border)'}`,
              }}>{c}</span>
            ))}
          </div>

          {/* Menu grid */}
          <div style={{ maxHeight: 220, overflowY: 'auto', background: 'var(--bg3)', borderRadius: 6, padding: 8, marginBottom: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {filteredMenu.map(m => {
                const inCart = cartItems.find(i => i.id === m.id)
                return (
                  <div key={m.id} onClick={() => addToCart(m)} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 10px', cursor: 'pointer', transition: 'all .12s', borderRadius: 6,
                    background: inCart ? '#0a1f0e' : 'var(--bg2)',
                    border: `1px solid ${inCart ? 'var(--accent3)' : 'var(--border)'}`,
                  }}>
                    <div>
                      <div style={{ fontSize: 12, color: inCart ? 'var(--accent)' : 'var(--text)', fontWeight: inCart ? 600 : 400 }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{m.category}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, color: 'var(--amber)' }}>₹{m.price}</div>
                      {inCart && <div style={{ fontSize: 11, color: 'var(--accent)' }}>{inCart.qty} added</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Cart summary */}
          {cartItems.length > 0 && (
            <div style={{ background: 'var(--bg3)', borderRadius: 6, padding: 10, marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>{cartItems.length} items selected</div>
              {cartItems.map(i => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0' }}>
                  <span>{i.qty}× {i.name}</span>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ color: 'var(--amber)' }}>₹{i.price * i.qty}</span>
                    <span style={{ cursor: 'pointer', color: 'var(--red)', fontSize: 11 }}
                      onClick={() => setCartItems(prev => prev.filter(p => p.id !== i.id))}>✕</span>
                  </div>
                </div>
              ))}
              <BillBreakdown items={cartItems} />
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn variant="outline" size="sm" onClick={() => { setModal(null); setCartItems([]) }}>Cancel</Btn>
            <Btn variant="primary" size="sm" onClick={placeOrder} disabled={!cartItems.length}>Place Order</Btn>
          </div>
        </Modal>
      )}

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
