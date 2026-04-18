const router = require('express').Router();
const { getPool } = require('../db');
const { auth, requireRole } = require('../middleware/auth');

// GET /api/tables
router.get('/', auth, async (req, res) => {
  try {
    const db = await getPool();
    const [rows] = await db.query('SELECT * FROM tables_list ORDER BY number');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tables/:id
router.put('/:id', auth, requireRole('manager', 'staff'), async (req, res) => {
  const { status, capacity } = req.body;
  const allowed = ['available', 'occupied', 'reserved'];
  if (status && !allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  try {
    const db = await getPool();
    const fields = [];
    const vals = [];
    if (status) { fields.push('status = ?'); vals.push(status); }
    if (capacity) { fields.push('capacity = ?'); vals.push(capacity); }
    if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });
    vals.push(req.params.id);
    await db.query(`UPDATE tables_list SET ${fields.join(', ')} WHERE id = ?`, vals);
    req.io.emit('table:update', { tableId: parseInt(req.params.id), status });
    res.json({ message: 'Table updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
