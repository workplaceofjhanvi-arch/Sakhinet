import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';

const API_URL = 'http://10.160.206.39:5000';
const COLLEGE_ID = '11111111-1111-1111-1111-111111111111';
const REQUESTER_ID = '22222222-2222-2222-2222-222222222222';
const VOLUNTEER_ID = '33333333-3333-3333-3333-333333333333';

async function api(path, options) {
  const res = await fetch(API_URL + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export default function App() {
  const [tab, setTab] = useState('help');
  const [type, setType] = useState('pad');
  const [note, setNote] = useState('');
  const [requests, setRequests] = useState([]);
  const [washrooms, setWashrooms] = useState([]);
  const [leaders, setLeaders] = useState([]);

  const load = useCallback(async () => {
    try {
      setRequests(await api('/api/requests?college_id=' + COLLEGE_ID));
      setWashrooms(await api('/api/washrooms?college_id=' + COLLEGE_ID));
      setLeaders(await api('/api/rewards/leaderboard?college_id=' + COLLEGE_ID));
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function sendRequest() {
    try {
      await api('/api/requests', {
        method: 'POST',
        body: JSON.stringify({
          college_id: COLLEGE_ID,
          requester_id: REQUESTER_ID,
          type,
          location_note: note || 'Nearby',
          via: 'internet',
        }),
      });
      setNote('');
      Alert.alert('Sent', 'Volunteers from your college have been alerted.');
      load();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  async function accept(id) {
    try {
      await api('/api/responses', {
        method: 'POST',
        body: JSON.stringify({ request_id: id, volunteer_id: VOLUNTEER_ID }),
      });
      Alert.alert('Thank you', 'You accepted this request.');
      load();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  const tabs = [
    ['help', 'Help'],
    ['washrooms', 'Washrooms'],
    ['rewards', 'Rewards'],
    ['cycle', 'Cycle'],
  ];

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.college}>Demo College</Text>
        <Text style={s.title}>Sakhinet</Text>
      </View>

      <ScrollView contentContainerStyle={s.body}>
        {tab === 'help' && (
          <View>
            <View style={s.switchRow}>
              <TouchableOpacity style={[s.chip, type === 'pad' && s.chipOn]} onPress={() => setType('pad')}>
                <Text style={[s.chipText, type === 'pad' && s.chipTextOn]}>Pad</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.chip, type === 'cramps' && s.chipOn]} onPress={() => setType('cramps')}>
                <Text style={[s.chipText, type === 'cramps' && s.chipTextOn]}>Cramps</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={s.input}
              placeholder="Where are you? (e.g. Near Block C)"
              placeholderTextColor="#9AA3B5"
              value={note}
              onChangeText={setNote}
            />

            <View style={s.bigWrap}>
              <View style={s.ringOuter}>
                <View style={s.ringInner}>
                  <TouchableOpacity style={s.bigButton} onPress={sendRequest}>
                    <Text style={s.bigButtonText}>Tap for help</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={s.hint}>Anonymous. Only verified students of your college see your request.</Text>
            </View>

            <View style={s.routes}>
              <Text style={[s.routeText, { color: '#5EEAD4', fontWeight: '700' }]}>Internet</Text>
              <Text style={s.routeText}>SMS</Text>
              <Text style={s.routeText}>Bluetooth</Text>
            </View>

            <Text style={s.heading}>Someone needs help</Text>
            {requests.length === 0 && <Text style={s.muted}>No open requests right now.</Text>}
            {requests.map((r) => (
              <View key={r.id} style={s.card}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>{r.type === 'cramps' ? 'Cramp help' : 'Pad needed'}</Text>
                  <Text style={s.muted}>Student near: {r.location_note}</Text>
                </View>
                <TouchableOpacity style={s.smallButton} onPress={() => accept(r.id)}>
                  <Text style={s.smallButtonText}>I can help</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {tab === 'washrooms' && (
          <View>
            <Text style={s.heading}>Washrooms</Text>
            {washrooms.length === 0 && <Text style={s.muted}>No washrooms added yet.</Text>}
            {washrooms.map((w) => (
              <View key={w.id} style={[s.card, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                <Text style={s.cardTitle}>{w.name}</Text>
                <Text style={s.muted}>Rating {w.rating} / 5</Text>
                <Text style={s.body2}>Water: {w.has_water ? 'yes' : 'no'}   Dustbin: {w.has_dustbin ? 'yes' : 'no'}</Text>
                <Text style={s.body2}>Lock: {w.has_lock ? 'yes' : 'no'}   Pads: {w.has_pads ? 'yes' : 'no'}</Text>
              </View>
            ))}
          </View>
        )}

        {tab === 'rewards' && (
          <View>
            <Text style={s.heading}>Top helpers</Text>
            {leaders.length === 0 && <Text style={s.muted}>No helpers yet.</Text>}
            {leaders.map((u, i) => (
              <View key={u.id} style={s.card}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>{i + 1}. {u.name}</Text>
                  <Text style={s.muted}>{u.points} points</Text>
                </View>
                <Text style={s.badge}>{u.badge}</Text>
              </View>
            ))}
          </View>
        )}

        {tab === 'cycle' && (
          <View>
            <Text style={s.heading}>Cycle and pain tracker</Text>
            <Text style={s.muted}>Coming next: log your pain and get a one-page summary for your doctor. This data stays on your phone.</Text>
          </View>
        )}

        <TouchableOpacity style={s.refresh} onPress={load}>
          <Text style={s.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={s.nav}>
        {tabs.map(([key, label]) => (
          <TouchableOpacity key={key} style={s.navItem} onPress={() => setTab(key)}>
            <Text style={[s.navText, tab === key && s.navTextOn]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#14161F' },
  header: { paddingTop: 56, paddingHorizontal: 24 },
  college: { color: '#9AA3B5', fontSize: 14 },
  title: { color: '#E8ECF4', fontSize: 28, fontWeight: 'bold', marginTop: 2 },
  body: { padding: 24, paddingBottom: 8 },
  switchRow: { flexDirection: 'row', gap: 10 },
  chip: { flex: 1, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#2C3142', backgroundColor: '#1B1F2B', alignItems: 'center', justifyContent: 'center' },
  chipOn: { borderColor: '#2DD4BF', backgroundColor: '#1E3A3A' },
  chipText: { color: '#C4CBDA', fontSize: 16 },
  chipTextOn: { color: '#5EEAD4', fontWeight: '700' },
  input: { backgroundColor: '#1B1F2B', borderWidth: 1, borderColor: '#2C3142', borderRadius: 12, padding: 12, color: '#E8ECF4', marginTop: 16 },
  bigWrap: { alignItems: 'center', marginTop: 28 },
  ringOuter: { width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(45,212,191,0.07)', alignItems: 'center', justifyContent: 'center' },
  ringInner: { width: 226, height: 226, borderRadius: 113, backgroundColor: 'rgba(45,212,191,0.15)', alignItems: 'center', justifyContent: 'center' },
  bigButton: { width: 200, height: 200, borderRadius: 100, backgroundColor: '#2DD4BF', alignItems: 'center', justifyContent: 'center' },
  bigButtonText: { color: '#06201C', fontSize: 26, fontWeight: '800' },
  hint: { color: '#9AA3B5', textAlign: 'center', fontSize: 14, marginTop: 20, maxWidth: 260 },
  routes: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#1B1F2B', borderWidth: 1, borderColor: '#2C3142', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, marginTop: 24 },
  routeText: { color: '#9AA3B5', fontSize: 14 },
  heading: { color: '#E8ECF4', fontSize: 18, fontWeight: 'bold', marginTop: 24, marginBottom: 10 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1B1F2B', borderWidth: 1, borderColor: '#2C3142', borderRadius: 14, padding: 14, marginBottom: 10 },
  cardTitle: { color: '#E8ECF4', fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  muted: { color: '#9AA3B5', fontSize: 14 },
  body2: { color: '#C4CBDA', fontSize: 14, marginTop: 4 },
  badge: { color: '#5EEAD4', fontWeight: '700' },
  smallButton: { backgroundColor: '#2DD4BF', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  smallButtonText: { color: '#06201C', fontWeight: 'bold' },
  refresh: { alignItems: 'center', padding: 16 },
  refreshText: { color: '#5EEAD4', fontWeight: 'bold' },
  nav: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#2C3142', paddingTop: 12, paddingBottom: 28 },
  navItem: { flex: 1, alignItems: 'center' },
  navText: { color: '#9AA3B5', fontSize: 14 },
  navTextOn: { color: '#5EEAD4', fontWeight: '700' },
});