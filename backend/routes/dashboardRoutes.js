const express = require('express');
const supabase = require('../supabaseClient');

const router = express.Router();

router.get('/', async (req, res) => {
  const { college_id } = req.query;
  if (!college_id) return res.status(400).json({ error: 'college_id is required' });

  const { data: requests, error } = await supabase
    .from('requests')
    .select('type, status, location_note, via')
    .eq('college_id', college_id);

  if (error) return res.status(500).json({ error: error.message });

  const count = (key) =>
    requests.reduce((acc, r) => {
      const k = r[key] || 'unknown';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});

  res.json({
    total_requests: requests.length,
    by_status: count('status'),
    by_type: count('type'),
    by_route: count('via'),
    by_location: count('location_note')
  });
});

module.exports = router;
