const { Router } = require('express');
const pool = require('../db');

const router = Router();

router.get('/', async (req, res) => {
  try {
    await pool.execute('SELECT 1');
    res.json({
      status: 'ok',
      service: 'ant-registrar',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      service: 'ant-registrar',
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
