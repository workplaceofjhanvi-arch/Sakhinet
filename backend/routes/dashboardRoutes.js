const express = require('express');
const supabase = require('../supabaseClient');

const router = express.Router();

router.get('/', async (req, res) => {
  const { college_id } = req.query;
  if (!college_id) return res.status(400).json({ error: 'college_id is required' });

  const { data: requests, error } = await supabase
    .from('requests')
    .select('type, status, location_note, via, created_at')
    .eq('college_id', college_id);

  if (error) return res.status(500).json({ error: error.message });

  const count = (key) =>
    requests.reduce((acc, r) => {
      const k = r[key] || 'unknown';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});

  const byDay = {};
  requests.forEach((r) => {
    const d = r.created_at.slice(0, 10);
    byDay[d] = (byDay[d] || 0) + 1;
  });

  const { data: resp } = await supabase
    .from('responses')
    .select('created_at, requests!inner(created_at, college_id)')
    .eq('requests.college_id', college_id);

  let avgResponse = null;
  if (resp && resp.length) {
    const mins = resp
      .map((r) => (new Date(r.created_at) - new Date(r.requests.created_at)) / 60000)
      .filter((m) => m >= 0);
    if (mins.length) {
      avgResponse = Math.round((mins.reduce((a, b) => a + b, 0) / mins.length) * 10) / 10;
    }
  }

  const { data: dispensers } = await supabase
    .from('dispensers')
    .select('location, stock_level')
    .eq('college_id', college_id)
    .order('stock_level', { ascending: true });

  const completed = requests.filter((r) => r.status === 'done').length;

  res.json({
    total_requests: requests.length,
    completed_requests: completed,
    completion_rate: requests.length ? Math.round((completed / requests.length) * 100) : 0,
    avg_response_minutes: avgResponse,
    by_status: count('status'),
    by_type: count('type'),
    by_route: count('via'),
    by_location: count('location_note'),
    by_day: byDay,
    dispensers: dispensers || [],
  });
});

module.exports = router;