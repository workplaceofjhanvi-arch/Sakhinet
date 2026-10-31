const express = require('express');
const supabase = require('../supabaseClient');

const router = express.Router();

router.get('/', async (req, res) => {
  const { college_id, has_dustbin, has_water, has_pads } = req.query;
  if (!college_id) return res.status(400).json({ error: 'college_id is required' });

  let query = supabase.from('washrooms').select('*').eq('college_id', college_id);
  if (has_dustbin === 'true') query = query.eq('has_dustbin', true);
  if (has_water === 'true') query = query.eq('has_water', true);
  if (has_pads === 'true') query = query.eq('has_pads', true);

  const { data, error } = await query.order('rating', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  const { college_id, name, latitude, longitude, has_water, has_dustbin, has_lock, has_pads, rating } = req.body;
  if (!college_id || !name) return res.status(400).json({ error: 'college_id and name are required' });

  const { data, error } = await supabase
    .from('washrooms')
    .insert([{ college_id, name, latitude, longitude, has_water, has_dustbin, has_lock, has_pads, rating }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

router.post('/:id/report', async (req, res) => {
  const { reporter_id, issue } = req.body;
  if (!issue) return res.status(400).json({ error: 'issue is required' });

  const { data, error } = await supabase
    .from('reports')
    .insert([{ washroom_id: req.params.id, reporter_id, issue }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

module.exports = router;