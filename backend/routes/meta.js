const router = require('express').Router();
const { getPool } = require('../db');
const { auth } = require('../middleware/auth');

// GET /api/meta/menu
router.get('/menu', auth, async (req, res) => {
  try {
    const db = await getPool();
    const [rows] = await db.query('SELECT * FROM menu_items WHERE available = 1 ORDER BY category, name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
