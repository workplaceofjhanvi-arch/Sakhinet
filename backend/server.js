require('dotenv').config();
const express = require('express');
const cors = require('cors');
const supabase = require('./supabaseClient');
const requestRoutes = require('./routes/requestRoutes');
const userRoutes = require('./routes/userRoutes');
const responseRoutes = require('./routes/responseRoutes');
const washroomRoutes = require('./routes/washroomRoutes');
const rewardRoutes = require('./routes/rewardRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Pad Help API is running');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/colleges', async (req, res) => {
  const { data, error } = await supabase.from('colleges').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.use('/api/requests', requestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/washrooms', washroomRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});