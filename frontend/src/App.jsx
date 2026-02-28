import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Leaf, MapPin, ClipboardList, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function App() {
  const [items, setItems] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'electronics', price: 0, weight_kg: 0 });

  const fetchItems = () => {
    axios.get('http://127.0.0.1:8000/items/').then(res => setItems(res.data)).catch(() => {});
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/items/', formData);
      setShowForm(false);
      fetchItems();
    } catch (err) { alert("Backend error! Is main.py running?"); }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        
        <header style={{ marginBottom: '20px' }}>
          <h1 style={logoStyle}><Leaf size={28} /> EcoSync</h1>
          <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Smart Waste Orchestration v2.0</p>
        </header>

        {/* Action Buttons - Stacked on Mobile, Side-by-Side on Desktop */}
        <div style={buttonGridStyle}>
          <button onClick={() => setShowMap(true)} style={actionBtn}><MapPin size={20} /> Find Centers</button>
          <button onClick={() => setShowForm(true)} style={actionBtn}><ClipboardList size={20} /> Post Item</button>
        </div>

        {/* Live List */}
        <div style={listContainer}>
          <h3 style={{ color: '#10b981', fontSize: '0.9rem', marginBottom: '10px' }}>Live Marketplace</h3>
          {items.length > 0 ? items.map(item => (
            <div key={item.id} style={itemRow}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{item.category}</div>
              </div>
              <div style={{ color: '#10b981', fontWeight: 'bold' }}>{item.carbon_offset_kg}kg</div>
            </div>
          )) : <p style={{ opacity: 0.4 }}>No items found...</p>}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div style={modalOverlay}>
            <form onSubmit={handleSubmit} style={formBox}>
              <h3 style={{ marginBottom: '15px' }}>List New Item</h3>
              <input placeholder="Title" onChange={e => setFormData({...formData, title: e.target.value})} style={inputField} required />
              <select onChange={e => setFormData({...formData, category: e.target.value})} style={inputField}>
                <option value="electronics">Electronics</option>
                <option value="furniture">Furniture</option>
                <option value="clothing">Clothing</option>
              </select>
              <input type="number" placeholder="Weight (kg)" onChange={e => setFormData({...formData, weight_kg: parseFloat(e.target.value)})} style={inputField} required />
              <button type="submit" style={submitBtn}>Confirm Post</button>
              <button onClick={() => setShowForm(false)} style={cancelBtn}>Cancel</button>
            </form>
          </div>
        )}

        {/* Map Modal */}
        {showMap && (
          <div style={modalOverlay}>
            <div style={mapBox}>
              <button onClick={() => setShowMap(false)} style={closeMapBtn}><X size={18}/></button>
              <MapContainer center={[12.9716, 77.5946]} zoom={12} style={{ height: '100%', borderRadius: '15px' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[12.9716, 77.5946]}><Popup>EcoSync Hub</Popup></Marker>
              </MapContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- RESPONSIVE STYLES ---
const containerStyle = { backgroundColor: '#0f172a', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center', padding: '15px' };
const cardStyle = { background: 'rgba(255, 255, 255, 0.03)', padding: '25px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', width: '100%', maxWidth: '500px', alignSelf: 'center' };
const logoStyle = { color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '0 0 5px 0' };
const buttonGridStyle = { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' };
const actionBtn = { flex: '1 1 140px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '15px', borderRadius: '15px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' };
const listContainer = { background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '15px' };
const itemRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' };
const formBox = { background: '#1e293b', padding: '25px', borderRadius: '20px', width: '100%', maxWidth: '350px', display: 'flex', flexDirection: 'column', gap: '12px' };
const mapBox = { width: '100%', height: '70vh', maxWidth: '800px', background: '#1e293b', borderRadius: '20px', position: 'relative', padding: '8px' };
const inputField = { padding: '12px', borderRadius: '10px', border: '1px solid #334155', background: '#0f172a', color: 'white' };
const submitBtn = { background: '#10b981', color: 'white', padding: '12px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' };
const cancelBtn = { color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' };
const closeMapBtn = { position: 'absolute', top: '-10px', right: '-10px', zIndex: 2001, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };

export default App;