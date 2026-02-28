import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Leaf, MapPin, ClipboardList, Trash2 } from 'lucide-react';

function App() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', price: '' });

  // 1. Fetch items from Render
  const fetchItems = () => {
    axios.get('https://ecosync-api.onrender.com/items/')
      .then(res => {
        setItems(res.data);
      })
      .catch(err => console.error("Error fetching items:", err));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // 2. Handle Submit (Add Item)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://ecosync-api.onrender.com/items/', formData);
      setFormData({ title: '', description: '', price: '' });
      setShowForm(false);
      fetchItems(); // Refresh list
    } catch (err) {
      alert("Backend error! Is Render awake?");
    }
  };

  // 3. Handle Delete (New Functionality)
  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://ecosync-api.onrender.com/items/${id}`);
      fetchItems(); // Refresh list after deleting
    } catch (err) {
      alert("Could not delete item. Check if the backend supports DELETE.");
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <header style={{ marginBottom: '20px' }}>
          <h1 style={logoStyle}><Leaf size={28} /> EcoSync</h1>
          <p style={{ opacity: 0.7 }}>Smart Waste Orchestration v2.0</p>
        </header>

        <div style={buttonGroup}>
          <button style={actionBtn}><MapPin size={18} /> Find Centers</button>
          <button style={actionBtn} onClick={() => setShowForm(!showForm)}>
            <ClipboardList size={18} /> {showForm ? "Close" : "Post Item"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={formStyle}>
            <input 
              placeholder="Item Title" 
              style={inputStyle} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              value={formData.title} required 
            />
            <input 
              placeholder="Weight (kg)" 
              style={inputStyle} 
              onChange={(e) => setFormData({...formData, price: e.target.value})} 
              value={formData.price} required 
            />
            <button type="submit" style={submitBtn}>Submit to Marketplace</button>
          </form>
        )}

        <h3 style={{ marginTop: '30px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>Live Marketplace</h3>
        <div style={listContainer}>
          {items.map((item) => (
            <div key={item.id} style={itemCard}>
              <div>
                <strong>{item.title}</strong>
                <p style={{ fontSize: '0.8rem', margin: '4px 0', opacity: 0.8 }}>{item.price} kg</p>
              </div>
              <button onClick={() => handleDelete(item.id)} style={deleteBtn}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {items.length === 0 && <p style={{ textAlign: 'center', opacity: 0.5 }}>No items found.</p>}
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const containerStyle = { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' };
const cardStyle = { maxWidth: '600px', margin: '0 auto', background: '#1e293b', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' };
const logoStyle = { display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', margin: 0 };
const buttonGroup = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' };
const actionBtn = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', border: 'none', borderRadius: '8px', background: '#334155', color: 'white', cursor: 'pointer', fontWeight: 'bold' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px', padding: '15px', background: '#0f172a', borderRadius: '8px' };
const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid #334155', background: '#1e293b', color: 'white' };
const submitBtn = { padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
const listContainer = { marginTop: '15px' };
const itemCard = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#334155', borderRadius: '8px', marginBottom: '10px' };
const deleteBtn = { background: '#ef4444', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' };

export default App;