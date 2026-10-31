const express = require('express');
const supabase = require('../supabaseClient');

const router = express.Router();

router.post('/', async (req, res) => {
  const { college_id, name, email } = req.body;
  if (!college_id || !email) return res.status(400).json({ error: 'college_id and email are required' });

  const { data, error } = await supabase
    .from('users')
    .insert([{ college_id, name, email }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;