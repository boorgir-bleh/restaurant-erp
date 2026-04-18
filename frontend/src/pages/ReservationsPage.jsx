import React, { useEffect, useState, useCallback } from 'react'
import api from '../api'
import socket from '../socket'
import { PageHeader, Card, Modal, Btn, Table, Input, Select, Textarea, statusBadge, Toast } from '../components/UI'

const EMPTY = { guest_name: '', phone: '', reservation_date: '', reservation_time: '', guests: 2, table_id: '', notes: '', status: 'pending' }

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([])
  const [tables, setTables]             = useState([])
  const [modal, setModal]               = useState(null)
  const [form, setForm]                 = useState(EMPTY)
  const [editId, setEditId]             = useState(null)
  const [toast, setToast]               = useState(null)
  const [loading, setLoading]           = useState(true)

  const load = useCallback(async () => {
    const [r, t] = await Promise.all([api.get('/reservations'), api.get('/tables')])
    setReservations(r.data)
    setTables(t.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    socket.on('reservation:update', load)
    return () => socket.off('reservation:update', load)
  }, [load])

  function openNew() { setForm(EMPTY); setEditId(null); setModal('form') }
  function openEdit(r) {
    setForm({
      guest_name: r.guest_name, phone: r.phone || '', reservation_date: r.reservation_date,
      reservation_time: r.reservation_time, guests: r.guests, table_id: r.table_id || '',
      notes: r.notes || '', status: r.status,
    })
    setEditId(r.id); setModal('form')
  }

  async function save() {
    if (!form.guest_name || !form.reservation_date || !form.reservation_time) return
    const payload = { ...form, table_id: form.table_id || null, guests: parseInt(form.guests) }
    if (editId) {
      await api.put(`/reservations/${editId}`, payload)
      setToast('Reservation updated')
    } else {
      await api.post('/reservations', payload)
      setToast('Reservation created')
    }
    setModal(null); load()
  }

  async function del(id) {
    if (!confirm('Delete this reservation?')) return
    await api.delete(`/reservations/${id}`)
    setToast('Reservation deleted'); load()
  }

  async function confirm_(id) {
    await api.put(`/reservations/${id}`, { status: 'confirmed' })
    setToast('Reservation confirmed'); load()
  }

  const f = (k) => e => setForm(p => ({ ...p, [k]: e.target.value }))

  if (loading) return <div style={{ color: 'var(--text3)' }}>Loading…</div>

  return (
    <div>
      <PageHeader title="Reservations" actions={
        <Btn variant="primary" size="sm" onClick={openNew}>+ New Reservation</Btn>
      } />

      <Card>
        <Table
          columns={['Guest','Phone','Date','Time','Guests','Table','Status','Notes','Actions']}
          rows={reservations.map(r => [
            <span style={{ fontWeight: 600 }}>{r.guest_name}</span>,
            r.phone || '—',
            r.reservation_date,
            r.reservation_time,
            r.guests,
            r.table_id ? `T${r.table_id}` : '—',
            statusBadge(r.status),
            <span style={{ fontSize: 11, color: 'var(--text3)', maxWidth: 120, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.notes || '—'}</span>,
            <div style={{ display: 'flex', gap: 4 }}>
              <Btn variant="outline" size="sm" onClick={() => openEdit(r)}>Edit</Btn>
              {r.status === 'pending' && <Btn variant="primary" size="sm" onClick={() => confirm_(r.id)}>Confirm</Btn>}
              <Btn variant="danger" size="sm" onClick={() => del(r.id)}>✕</Btn>
            </div>,
          ])}
        />
      </Card>

      {modal === 'form' && (
        <Modal title={editId ? 'Edit Reservation' : 'New Reservation'} onClose={() => setModal(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Guest Name"   value={form.guest_name}        onChange={f('guest_name')}        placeholder="Full name" />
            <Input label="Phone"        value={form.phone}             onChange={f('phone')}             placeholder="10-digit number" />
            <Input label="Date"         value={form.reservation_date}  onChange={f('reservation_date')}  type="date" />
            <Input label="Time"         value={form.reservation_time}  onChange={f('reservation_time')}  type="time" />
            <Input label="Guests"       value={form.guests}            onChange={f('guests')}            type="number" />
            <Select label="Table (optional)" value={form.table_id} onChange={f('table_id')}
              options={[{ value: '', label: 'Auto-assign' }, ...tables.map(t => ({ value: t.id, label: `Table ${t.number} (${t.capacity} seats)` }))]} />
          </div>
          <Textarea label="Notes" value={form.notes} onChange={f('notes')} placeholder="Special requests, occasions…" />
          <Select label="Status" value={form.status} onChange={f('status')}
            options={[{ value: 'pending', label: 'Pending' }, { value: 'confirmed', label: 'Confirmed' }, { value: 'cancelled', label: 'Cancelled' }]} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Btn variant="outline" size="sm" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn variant="primary" size="sm" onClick={save}>{editId ? 'Update' : 'Create'}</Btn>
          </div>
        </Modal>
      )}

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
