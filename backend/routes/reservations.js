const router = require('express').Router();
const { getPool } = require('../db');
const { auth, requireRole } = require('../middleware/auth');

// GET /api/reservations
router.get('/', auth, async (req, res) => {
  try {
    const db = await getPool();
    const [rows] = await db.query('SELECT * FROM reservations ORDER BY reservation_date, reservation_time');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reservations/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const db = await getPool();
    const [rows] = await db.query('SELECT * FROM reservations WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Reservation not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reservations
router.post('/', auth, requireRole('manager', 'staff'), async (req, res) => {
  const { guest_name, phone, reservation_date, reservation_time, guests = 2, table_id, notes = '' } = req.body;
  if (!guest_name || !reservation_date || !reservation_time) {
    return res.status(400).json({ error: 'guest_name, reservation_date and reservation_time are required' });
  }
  try {
    const db = await getPool();
    const [result] = await db.query(
      'INSERT INTO reservations (guest_name, phone, reservation_date, reservation_time, guests, table_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [guest_name, phone, reservation_date, reservation_time, guests, table_id || null, notes]
    );
    if (table_id) {
      await db.query("UPDATE tables_list SET status = 'reserved' WHERE id = ?", [table_id]);
      req.io.emit('table:update', { tableId: table_id, status: 'reserved' });
    }
    req.io.emit('reservation:update', { action: 'created', id: result.insertId });
    res.status(201).json({ id: result.insertId, guest_name, reservation_date, reservation_time });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/reservations/:id
router.put('/:id', auth, requireRole('manager', 'staff'), async (req, res) => {
  const { guest_name, phone, reservation_date, reservation_time, guests, table_id, status, notes } = req.body;
  try {
    const db = await getPool();
    const [rows] = await db.query('SELECT * FROM reservations WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Reservation not found' });

    const updates = { guest_name, phone, reservation_date, reservation_time, guests, table_id, status, notes };
    const fields = Object.entries(updates).filter(([, v]) => v !== undefined).map(([k]) => `${k} = ?`);
    const vals = Object.entries(updates).filter(([, v]) => v !== undefined).map(([, v]) => v);

    if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });
    vals.push(req.params.id);
    await db.query(`UPDATE reservations SET ${fields.join(', ')} WHERE id = ?`, vals);

    if (table_id !== undefined && table_id !== rows[0].table_id) {
      if (rows[0].table_id) {
        await db.query("UPDATE tables_list SET status = 'available' WHERE id = ?", [rows[0].table_id]);
      }
      if (table_id) {
        await db.query("UPDATE tables_list SET status = 'reserved' WHERE id = ?", [table_id]);
        req.io.emit('table:update', { tableId: table_id, status: 'reserved' });
      }
    }
    if (status === 'cancelled' && rows[0].table_id) {
      await db.query("UPDATE tables_list SET status = 'available' WHERE id = ?", [rows[0].table_id]);
      req.io.emit('table:update', { tableId: rows[0].table_id, status: 'available' });
    }

    req.io.emit('reservation:update', { action: 'updated', id: req.params.id });
    res.json({ message: 'Reservation updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/reservations/:id
router.delete('/:id', auth, requireRole('manager', 'staff'), async (req, res) => {
  try {
    const db = await getPool();
    const [rows] = await db.query('SELECT * FROM reservations WHERE id = ?', [req.params.id]);
    if (rows[0]?.table_id) {
      await db.query("UPDATE tables_list SET status = 'available' WHERE id = ?", [rows[0].table_id]);
    }
    await db.query('DELETE FROM reservations WHERE id = ?', [req.params.id]);
    req.io.emit('reservation:update', { action: 'deleted', id: req.params.id });
    res.json({ message: 'Reservation deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
