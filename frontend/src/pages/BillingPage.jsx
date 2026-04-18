import React, { useEffect, useState, useCallback } from 'react'
import api from '../api'
import socket from '../socket'
import { PageHeader, Card, Btn, statusBadge, Toast, calcBill, BillBreakdown } from '../components/UI'

export default function BillingPage() {
  const [orders, setOrders] = useState([])
  const [sel, setSel]       = useState(null)
  const [toast, setToast]   = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await api.get('/orders')
    setOrders(res.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    socket.on('order:update', load)
    return () => socket.off('order:update', load)
  }, [load])

  async function settle(id) {
    await api.put(`/orders/${id}`, { status: 'paid' })
    setSel(null)
    setToast(`Order #${id} settled 💰`)
    load()
  }

  const billable = orders.filter(o => o.status === 'served')
  const paid     = orders.filter(o => o.status === 'paid')
  const selOrder = sel ? orders.find(o => o.id === sel) : null

  const totalRevenue = paid.reduce((s, o) => s + calcBill(o.items || []).total, 0)

  if (loading) return <div style={{ color: 'var(--text3)' }}>Loading…</div>

  return (
    <div>
      <PageHeader title="Billing & Payments" actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--amber)' }}>{billable.length} pending payment</span>
          <span style={{ fontSize: 12, color: 'var(--accent)' }}>{paid.length} settled today</span>
        </div>
      } />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Left: awaiting payment */}
        <Card title="Awaiting Payment">
          {billable.length === 0
            ? <div style={{ color: 'var(--text3)', fontSize: 13 }}>No bills to settle</div>
            : billable.map(o => {
                const bill = calcBill(o.items || [])
                return (
                  <div key={o.id}
                    onClick={() => setSel(sel === o.id ? null : o.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 8px', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                      borderRadius: 6, background: sel === o.id ? 'var(--bg3)' : 'transparent',
                      transition: 'background .12s',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>Order #{o.id} · Table {o.table_id}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{(o.items||[]).length} items · {o.waiter}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--amber)' }}>₹{bill.total.toFixed(0)}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>incl. 5% GST</div>
                    </div>
                  </div>
                )
              })
          }
        </Card>

        {/* Right: bill preview or revenue summary */}
        {selOrder
          ? (
            <Card title={`Bill Preview — Order #${sel}`}>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>
                Table {selOrder.table_id} · {selOrder.waiter}
              </div>
              {(selOrder.items || []).map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                  <span>{item.qty}× {item.name}</span>
                  <span style={{ color: 'var(--text2)' }}>₹{item.price * item.qty}</span>
                </div>
              ))}
              <div style={{ marginTop: 12 }}>
                <BillBreakdown items={selOrder.items || []} />
              </div>
              <Btn variant="primary" style={{ width: '100%', marginTop: 12 }} onClick={() => settle(sel)}>
                💳 Settle Payment
              </Btn>
            </Card>
          )
          : (
            <Card title="Revenue Summary">
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)', marginBottom: 8, fontFamily: 'Courier New, monospace' }}>
                ₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>Total collected today</div>
              {paid.length === 0
                ? <div style={{ fontSize: 13, color: 'var(--text3)' }}>No payments yet</div>
                : paid.map(o => (
                  <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '5px 0', borderBottom: '1px solid var(--border)', color: 'var(--text2)' }}>
                    <span>Order #{o.id} · Table {o.table_id}</span>
                    <span style={{ color: 'var(--accent)' }}>₹{calcBill(o.items || []).total.toFixed(0)}</span>
                  </div>
                ))
              }
            </Card>
          )
        }
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
