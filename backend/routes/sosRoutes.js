const express = require('express');
const supabase = require('../supabaseClient');

const router = express.Router();

// Send an SOS: a high-priority request that expires in 15 minutes
router.post('/', async (req, res) => {
  const { college_id, requester_id, location_note, latitude, longitude } = req.body;
  if (!college_id) return res.status(400).json({ error: 'college_id is required' });

  const expires_at = new Date(Date.now() + 15 * 60000).toISOString();

  const { data, error } = await supabase
    .from('requests')
    .insert([{
      college_id,
      requester_id,
      type: 'sos',
      priority: 1,
      location_note: location_note || 'Nearby',
      latitude,
      longitude,
      via: 'internet',
      expires_at,
    }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  const { data: safe_points } = await supabase
    .from('safe_points')
    .select('*')
    .eq('college_id', college_id);

  res.status(201).json({ request: data, safe_points: safe_points || [] });
});

// Safe points of a college
router.get('/safe-points', async (req, res) => {
  const { college_id } = req.query;
  if (!college_id) return res.status(400).json({ error: 'college_id is required' });

  const { data, error } = await supabase
    .from('safe_points')
    .select('*')
    .eq('college_id', college_id);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Trusted contacts
router.get('/contacts', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });

  const { data, error } = await supabase
    .from('trusted_contacts')
    .select('*')
    .eq('user_id', user_id);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/contacts', async (req, res) => {
  const { user_id, name, phone } = req.body;
  if (!user_id || !name || !phone) {
    return res.status(400).json({ error: 'user_id, name and phone are required' });
  }

  const { count } = await supabase
    .from('trusted_contacts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user_id);

  if (count >= 3) return res.status(400).json({ error: 'You can save up to 3 trusted contacts' });

  const { data, error } = await supabase
    .from('trusted_contacts')
    .insert([{ user_id, name, phone }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

module.exports = router;