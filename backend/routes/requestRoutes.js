const express = require('express');
const supabase = require('../supabaseClient');

const router = express.Router();

router.post('/', async (req, res) => {
  const { college_id, requester_id, type, location_note, via } = req.body;
  if (!college_id) return res.status(400).json({ error: 'college_id is required' });

  const minutes = Number(process.env.REQUEST_EXPIRY_MINUTES || 5);
  const expires_at = new Date(Date.now() + minutes * 60000).toISOString();

  const { data, error } = await supabase
    .from('requests')
    .insert([{ college_id, requester_id, type: type || 'pad', location_note, via: via || 'internet', expires_at }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

router.get('/', async (req, res) => {
  const { college_id } = req.query;
  if (!college_id) return res.status(400).json({ error: 'college_id is required' });

  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .eq('college_id', college_id)
    .eq('status', 'open')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;