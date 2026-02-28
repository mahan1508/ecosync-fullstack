import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Leaf, MapPin, ClipboardList, Trash2, Globe } from 'lucide-react';

function App() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showCenters, setShowCenters] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', price: '' });

  // Mock data for Recycling Centers
  const [centers] = useState([
    { id: 1, name: "EcoRecycle Hub", address: "123 Green St", type: "Electronics" },
    { id: 2, name: "City Waste Center", address: "456 Blue Ave", type: "Plastic/Metal" },
    { id: 3, name: "Renewable Depot", address: "789 Pine Rd", type: "All Materials" }
  ]);

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

  // Calculate Total Carbon Saved based on the backend's data
  const totalCarbonSaved = items.reduce((sum, item) => sum + (parseFloat(item.carbon_offset_kg) || 0), 0);

  // 2. Handle Submit (Updated to match Backend Schema)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // We must send 'category' and 'weight_kg' because the backend main.py needs them
      await axios.post('https://ecosync-api.onrender.com/items/', {
        title: formData.title,
        description: "Shared via EcoSync Community",
        category: "electronics", // Default category to satisfy backend
        price: parseFloat(formData.price) || 0,
        weight_kg: parseFloat(formData.price) || 0 // Using weight as price for simplicity
      });
      
      setFormData({ title: '', description: '', price: '' });
      setShowForm(false);
      fetchItems(); 
    } catch (err) {
      console.error("Submission error:", err.response?.data || err.message);
      alert("Error adding item. Make sure you entered a valid weight number!");
    }
  };

  // 3. Handle Delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://ecosync-api.onrender.com/items/${id}`);
      fetchItems(); 
    } catch (err) {
      alert("Could not delete item. Check if your backend supports DELETE.");
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        
        {/* HEADER SECTION */}
        <header style={{ marginBottom: '20px' }}>
          <h1 style={logoStyle}><Leaf size={28} /> EcoSync</h1>
          <p style={{ opacity: 0.7 }}>Smart Waste Orchestration v2.0</p>
        </header>

        {/* CARBON COUNTER STAT */}
        <div style={statsBox}>
          <Globe size={20} color="#10b981" />
          <span>Total Carbon Offset: <strong>{totalCarbonSaved.toFixed(1)} kg CO2</strong></span>
        </div>

        {/* ACTION BUTTONS */}
        <div style={buttonGroup}>
          <button 
            style={{...actionBtn, background: showCenters ? '#10b981' : '#334155'}} 
            onClick={() => { setShowCenters(!showCenters); setShowForm(false); }}
          >
            <MapPin size={18} /> {showCenters ? "Hide Centers" : "Find Centers"}
          </button>
          <button 
            style={{...actionBtn, background: showForm ? '#10b981' : '#334155'}} 
            onClick={() => { setShowForm(!showForm); setShowCenters(false); }}
          >
            <ClipboardList size={18} /> {showForm ? "Close Form" : "Post Item"}
          </button>
        </div>

        {/* RECYCLING CENTERS LIST */}
        {showCenters && (
          <div style={infoPanel}>
            <h4 style={{ color: '#10b981', marginTop: 0 }}>Nearby Recycling Centers</h4>
            {centers.map(center => (
              <div key={center.id} style={centerItem}>
                <strong>{center.name}</strong>
                <p style={{ margin: '2px 0', fontSize: '0.85rem', opacity: 0.8 }}>
                  {center.address} • <span style={{color: '#10b981'}}>{center.type}</span>
                </p>
              </div>
            ))}
          </div>
        )}

        {/* POST ITEM FORM */}
        {showForm && (
          <form onSubmit={handleSubmit} style={formStyle}>
            <input 
              placeholder="Item Title (e.g. Old Monitor)" 
              style={inputStyle} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              value={formData.title} required 
            />
            <input 
              placeholder="Weight in kg (Numbers only)" 
              type="number"
              style={inputStyle} 
              onChange={(e) => setFormData({...formData, price: e.target.value})} 
              value={formData.price} required 
            />
            <button type="submit" style={submitBtn}>Add to Marketplace</button>
          </form>
        )}

        {/* MARKETPLACE LIST */}
        <h3 style={listHeaderStyle}>Live Marketplace</h3>
        <div style={listContainer}>
          {items.map((item) => (
            <div key={item.id} style={itemCard}>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '1.1rem' }}>{item.title}</strong>
                <p style={{ margin: '4px 0', color: '#10b981', fontWeight: 'bold' }}>{item.weight_kg} kg</p>
                <small style={{ opacity: 0.6 }}>Offset: {item.carbon_offset_kg}kg CO2</small>
              </div>
              <button onClick={() => handleDelete(item.id)} style={deleteBtn}>
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

// --- STYLES ---
const containerStyle = { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' };
const cardStyle = { maxWidth: '500px', margin: '0 auto', background: '#1e293b', padding: '25px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' };
const logoStyle = { display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', marginBottom: '5px' };
const statsBox = { display: 'flex', alignItems: 'center', gap: '10px', background: '#0f172a', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #334155' };
const buttonGroup = { display: 'flex', gap: '10px', marginTop: '20px' };
const actionBtn = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', transition: '0.3s' };
const infoPanel = { marginTop: '20px', padding: '15px', background: '#0f172a', borderRadius: '12px', border: '1px solid #10b981' };
const centerItem = { padding: '10px 0', borderBottom: '1px solid #334155' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px', padding: '15px', background: '#0f172a', borderRadius: '8px' };
const inputStyle = { padding: '12px', borderRadius: '6px', border: '1px solid #334155', background: '#1e293b', color: 'white' };
const submitBtn = { padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const listHeaderStyle = { marginTop: '30px', fontSize: '1.2rem', borderBottom: '1px solid #334155', paddingBottom: '10px' };
const listContainer = { marginTop: '15px' };
const itemCard = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#334155', borderRadius: '10px', marginBottom: '12px' };
const deleteBtn = { background: '#ef4444', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' };

export default App;