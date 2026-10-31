const express = require('express');
const supabase = require('../supabaseClient');

const router = express.Router();

router.post('/', async (req, res) => {
  const { request_id, volunteer_id } = req.body;
  if (!request_id || !volunteer_id) {
    return res.status(400).json({ error: 'request_id and volunteer_id are required' });
  }

  const { data: request, error: reqErr } = await supabase
    .from('requests')
    .select('*')
    .eq('id', request_id)
    .single();

  if (reqErr) return res.status(500).json({ error: reqErr.message });
  if (request.status !== 'open') return res.status(400).json({ error: 'Request is no longer open' });
  if (request.requester_id && request.requester_id === volunteer_id) {
    return res.status(400).json({ error: 'You cannot accept your own request' });
  }

  const { data, error } = await supabase
    .from('responses')
    .insert([{ request_id, volunteer_id }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  await supabase.from('requests').update({ status: 'accepted' }).eq('id', request_id);
  res.status(201).json(data);
});

router.post('/:id/confirm', async (req, res) => {
  const { by } = req.body;
  if (by !== 'requester' && by !== 'volunteer') {
    return res.status(400).json({ error: 'by must be requester or volunteer' });
  }

  const field = by === 'requester' ? 'confirmed_by_requester' : 'confirmed_by_volunteer';

  const { data: updated, error } = await supabase
    .from('responses')
    .update({ [field]: true })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  if (updated.confirmed_by_requester && updated.confirmed_by_volunteer && updated.status !== 'completed') {
    const pointsToAdd = 10;

    await supabase.from('responses').update({ status: 'completed' }).eq('id', updated.id);
    await supabase.from('requests').update({ status: 'done' }).eq('id', updated.request_id);
    await supabase.from('points_log').insert([
      { user_id: updated.volunteer_id, request_id: updated.request_id, points: pointsToAdd }
    ]);

    const { data: user } = await supabase
      .from('users')
      .select('points')
      .eq('id', updated.volunteer_id)
      .single();

    await supabase
      .from('users')
      .update({ points: (user.points || 0) + pointsToAdd })
      .eq('id', updated.volunteer_id);

    return res.json({ ...updated, status: 'completed', points_awarded: pointsToAdd });
  }

  res.json(updated);
});

module.exports = router;