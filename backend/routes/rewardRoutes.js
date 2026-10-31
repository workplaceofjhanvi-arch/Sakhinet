const express = require('express');
const supabase = require('../supabaseClient');

const router = express.Router();

router.get('/leaderboard', async (req, res) => {
  const { college_id } = req.query;
  if (!college_id) return res.status(400).json({ error: 'college_id is required' });

  const { data, error } = await supabase
    .from('users')
    .select('id, name, points')
    .eq('college_id', college_id)
    .order('points', { ascending: false })
    .limit(10);

  if (error) return res.status(500).json({ error: error.message });

  const withBadges = data.map((u) => ({
    ...u,
    badge: u.points >= 300 ? 'Gold' : u.points >= 150 ? 'Silver' : u.points >= 50 ? 'Bronze' : 'Starter'
  }));

  res.json(withBadges);
});

module.exports = router;
