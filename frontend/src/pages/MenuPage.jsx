import React, { useEffect, useState } from 'react'
import api from '../api'
import { PageHeader } from '../components/UI'

const CATS = ['starters','mains','rice','breads','desserts','beverages']
const CAT_ICONS = { starters: '🥗', mains: '🍛', rice: '🍚', breads: '🫓', desserts: '🍮', beverages: '🥃' }
const CAT_IMAGES = {
  starters:  'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&auto=format&fit=crop',
  mains:     'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&auto=format&fit=crop',
  rice:      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop',
  breads:    'https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=400&auto=format&fit=crop',
  desserts:  'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&auto=format&fit=crop',
  beverages: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&auto=format&fit=crop',
}

export default function MenuPage() {
  const [menu, setMenu]       = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCat, setActiveCat] = useState('all')

  useEffect(() => {
    api.get('/meta/menu').then(r => { setMenu(r.data); setLoading(false) })
  }, [])

  const filtered = activeCat === 'all' ? menu : menu.filter(m => m.category === activeCat)

  if (loading) return <div style={{ color: 'var(--text3)' }}>Loading…</div>

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <PageHeader title="Our Menu" subtitle={`${menu.length} dishes crafted with care`} />

      {/* Hero */}
      <div style={{
        borderRadius: 12, overflow: 'hidden', marginBottom: 24, height: 140,
        background: `linear-gradient(90deg, rgba(26,21,16,0.95) 35%, rgba(26,21,16,0.5)),
          url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop') center/cover`,
        display: 'flex', alignItems: 'center', padding: '0 32px',
      }}>
        <div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: 'var(--text)', fontStyle: 'italic' }}>
            "Crafted with passion, served with pride"
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>Seasonal ingredients · Traditional recipes · Modern presentation</div>
        </div>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {['all', ...CATS].map(c => (
          <span key={c} onClick={() => setActiveCat(c)} style={{
            padding: '6px 16px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
            transition: 'all .15s', fontWeight: activeCat === c ? 500 : 400,
            background: activeCat === c ? 'rgba(212,168,71,0.15)' : 'var(--bg2)',
            color: activeCat === c ? 'var(--gold)' : 'var(--text3)',
            border: `1px solid ${activeCat === c ? 'rgba(212,168,71,0.4)' : 'var(--border)'}`,
          }}>
            {c !== 'all' && CAT_ICONS[c] + ' '}{c.charAt(0).toUpperCase() + c.slice(1)}
          </span>
        ))}
      </div>

      {/* Category sections */}
      {CATS.filter(cat => activeCat === 'all' || activeCat === cat).map(cat => {
        const items = filtered.filter(m => m.category === cat)
        if (!items.length) return null
        return (
          <div key={cat} style={{ marginBottom: 28 }}>
            {/* Category header with image */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14,
              padding: '12px 16px', borderRadius: 10,
              background: 'var(--bg2)', border: '1px solid var(--border)',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                background: `url(${CAT_IMAGES[cat]}) center/cover`,
              }} />
              <div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: 'var(--text)' }}>
                  {CAT_ICONS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{items.length} dishes</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {items.map(m => (
                <div key={m.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'var(--bg2)', borderRadius: 8, padding: '12px 14px',
                  border: '1px solid var(--border)', transition: 'border-color .15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,168,71,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <span style={{ fontSize: 13, color: 'var(--text)' }}>{m.name}</span>
                  <span style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 600, marginLeft: 8, whiteSpace: 'nowrap' }}>₹{m.price}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
