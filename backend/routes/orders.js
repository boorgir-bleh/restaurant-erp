const router = require('express').Router();
const { getPool } = require('../db');
const { auth, requireRole } = require('../middleware/auth');

function calcBill(items) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const gst = parseFloat((subtotal * 0.05).toFixed(2));
  const total = parseFloat((subtotal + gst).toFixed(2));
  return { subtotal, gst, total };
}

// GET /api/orders
router.get('/', auth, async (req, res) => {
  try {
    const db = await getPool();
    const [orders] = await db.query(
      'SELECT * FROM orders ORDER BY created_at DESC'
    );
    for (const order of orders) {
      const [items] = await db.query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [order.id]
      );
      order.items = items;
    }
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const db = await getPool();
    const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Order not found' });
    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
    res.json({ ...rows[0], items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders
router.post('/', auth, async (req, res) => {
  const { table_id, items, notes = '' } = req.body;
  if (!table_id || !items || !items.length) {
    return res.status(400).json({ error: 'table_id and items are required' });
  }
  try {
    const db = await getPool();
    const { subtotal, gst, total } = calcBill(items);
    const [result] = await db.query(
      'INSERT INTO orders (table_id, waiter, notes, subtotal, gst, total) VALUES (?, ?, ?, ?, ?, ?)',
      [table_id, req.user.name, notes, subtotal, gst, total]
    );
    const orderId = result.insertId;
    const itemRows = items.map(i => [orderId, i.menu_item_id, i.name, i.price, i.qty]);
    await db.query('INSERT INTO order_items (order_id, menu_item_id, name, price, qty) VALUES ?', [itemRows]);
    await db.query("UPDATE tables_list SET status = 'occupied' WHERE id = ?", [table_id]);

    req.io.emit('order:update', { action: 'created', orderId });
    req.io.emit('table:update', { tableId: table_id, status: 'occupied' });

    const [order] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const [orderItems] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    res.status(201).json({ ...order[0], items: orderItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/orders/:id
router.put('/:id', auth, async (req, res) => {
  const { status, notes } = req.body;
  try {
    const db = await getPool();
    const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Order not found' });

    const fields = [];
    const vals = [];
    if (status) { fields.push('status = ?'); vals.push(status); }
    if (notes !== undefined) { fields.push('notes = ?'); vals.push(notes); }
    if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });

    vals.push(req.params.id);
    await db.query(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, vals);

    // Free table when paid or cancelled
    if (status === 'paid' || status === 'cancelled') {
      await db.query("UPDATE tables_list SET status = 'available' WHERE id = ?", [rows[0].table_id]);
      req.io.emit('table:update', { tableId: rows[0].table_id, status: 'available' });
    }

    req.io.emit('order:update', { action: 'updated', orderId: req.params.id, status });
    res.json({ message: 'Order updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/orders/:id
router.delete('/:id', auth, requireRole('manager'), async (req, res) => {
  try {
    const db = await getPool();
    await db.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
    req.io.emit('order:update', { action: 'deleted', orderId: req.params.id });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
