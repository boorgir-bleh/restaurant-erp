const router = require('express').Router();
const { getPool } = require('../db');
const { auth } = require('../middleware/auth');

// GET /api/dashboard
router.get('/', auth, async (req, res) => {
  try {
    const db = await getPool();

    const [[{ revenue }]] = await db.query(
      "SELECT COALESCE(SUM(total), 0) AS revenue FROM orders WHERE status = 'paid' AND DATE(created_at) = CURDATE()"
    );
    const [[{ active_orders }]] = await db.query(
      "SELECT COUNT(*) AS active_orders FROM orders WHERE status NOT IN ('paid','cancelled')"
    );
    const [[{ available_tables }]] = await db.query(
      "SELECT COUNT(*) AS available_tables FROM tables_list WHERE status = 'available'"
    );
    const [[{ total_tables }]] = await db.query('SELECT COUNT(*) AS total_tables FROM tables_list');
    const [[{ reservations_today }]] = await db.query(
      "SELECT COUNT(*) AS reservations_today FROM reservations WHERE reservation_date = CURDATE() AND status = 'confirmed'"
    );

    const [recent_orders] = await db.query(
      "SELECT o.id, o.table_id, o.status, o.total, o.created_at FROM orders o ORDER BY created_at DESC LIMIT 5"
    );

    res.json({
      revenue: parseFloat(revenue),
      active_orders,
      available_tables,
      total_tables,
      reservations_today,
      recent_orders,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
