import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Leaf, MapPin, ClipboardList, Trash2 } from 'lucide-react';

function App() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', price: '' });

  // 1. Fetch items from your live Render backend
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

  // 2. Handle Submit (Add new items)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://ecosync-api.onrender.com/items/', formData);
      setFormData({ title: '', description: '', price: '' });
      setShowForm(false);
      fetchItems(); // Refresh the list automatically
    } catch (err) {
      alert("Error adding item. Make sure Render is active!");
    }
  };

  // 3. Handle Delete (The new functionality)
  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://ecosync-api.onrender.com/items/${id}`);
      fetchItems(); // Refresh the list after deleting
    } catch (err) {
      alert("Could not delete item. Check if your backend supports DELETE.");
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
            <ClipboardList size={18} /> {showForm ? "Close Form" : "Post Item"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={formStyle}>
            <input 
              placeholder="Item Title (e.g. Old Monitor)" 
              style={inputStyle} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              value={formData.title} required 
            />
            <input 
              placeholder="Weight in kg" 
              style={inputStyle} 
              onChange={(e) => setFormData({...formData, price: e.target.value})} 
              value={formData.price} required 
            />
            <button type="submit" style={submitBtn}>Add to Marketplace</button>
          </form>
        )}

        <h3 style={listHeaderStyle}>Live Marketplace</h3>
        <div style={listContainer}>
          {items.map((item) => (
            <div key={item.id} style={itemCard}>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '1.1rem' }}>{item.title}</strong>
                <p style={{ margin: '4px 0', color: '#10b981', fontWeight: 'bold' }}>{item.price} kg</p>
              </div>
              <button 
                onClick={() => handleDelete(item.id)} 
                style={deleteBtn}
                title="Delete Item"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <p style={{ textAlign: 'center', opacity: 0.5, marginTop: '20px' }}>
              No items listed yet. Be the first to post!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// --- STYLING (The CSS-in-JS) ---
const containerStyle = { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' };
const cardStyle = { maxWidth: '500px', margin: '0 auto', background: '#1e293b', padding: '25px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' };
const logoStyle = { display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', marginBottom: '5px' };
const buttonGroup = { display: 'flex', gap: '10px', marginTop: '20px' };
const actionBtn = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', border: 'none', borderRadius: '8px', background: '#334155', color: 'white', cursor: 'pointer', fontSize: '14px' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px', padding: '15px', background: '#0f172a', borderRadius: '8px' };
const inputStyle = { padding: '12px', borderRadius: '6px', border: '1px solid #334155', background: '#1e293b', color: 'white' };
const submitBtn = { padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const listHeaderStyle = { marginTop: '30px', fontSize: '1.2rem', borderBottom: '1px solid #334155', paddingBottom: '10px' };
const listContainer = { marginTop: '15px' };
const itemCard = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#334155', borderRadius: '10px', marginBottom: '12px', transition: 'transform 0.2s' };
const deleteBtn = { background: '#ef4444', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };

export default App;