import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Leaf, ShoppingBag, Tag, ShieldCheck, CheckCircle, Clock, Trash2, MessageCircle, Globe, Lock, LogOut, Search, Filter, Laptop, Beaker, Layers, IndianRupee, Camera, X } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000/items/';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: <Layers size={14}/> },
  { id: 'electronics', label: 'E-Waste', icon: <Laptop size={14}/>, rate: 45 },
  { id: 'plastic', label: 'Plastic', icon: <Beaker size={14}/>, rate: 12 },
  { id: 'metal', label: 'Metal', icon: <Filter size={14}/>, rate: 30 }
];

function App() {
  const [items, setItems] = useState([]);
  const [userRole, setUserRole] = useState(null); 
  const [adminPass, setAdminPass] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCat, setActiveCat] = useState('all');
  const [formData, setFormData] = useState({ title: '', weight: '', category: 'electronics' });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fetchItems = () => {
    axios.get(API_URL).then(res => setItems(res.data)).catch(err => console.log(err));
  };

  useEffect(() => { fetchItems(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const calculateEarnings = (itemList) => {
    return itemList.reduce((total, item) => {
      const cat = CATEGORIES.find(c => c.id === item.category);
      const rate = cat ? cat.rate : 0;
      return total + (item.weight_kg * rate);
    }, 0);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = activeCat === 'all' || item.category === activeCat;
    if (userRole === 'buyer') return item.status === 'verified' && matchesSearch && matchesCat;
    return matchesSearch && matchesCat;
  });

  const handleLogin = (role) => {
    if (role === 'admin') {
      if (adminPass === "admin123") { setUserRole('admin'); setAdminPass(""); }
      else { alert("Incorrect Admin Password!"); }
    } else { setUserRole(role); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('category', formData.category);
    data.append('weight_kg', parseFloat(formData.weight));
    data.append('description', "Verified Community Waste");
    data.append('price', 0);
    if (selectedFile) {
      data.append('image', selectedFile);
    }

    try {
      await axios.post(API_URL, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ title: '', weight: '', category: 'electronics' });
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowForm(false);
      fetchItems();
    } catch (err) {
      alert("Error uploading item. Check if backend is running.");
    }
  };

  const handleApprove = async (id) => {
    await axios.patch(`${API_URL}${id}/approve`);
    fetchItems();
  };

  const handleDelete = (id) => {
    axios.delete(`${API_URL}${id}`).then(() => fetchItems());
  };

  if (!userRole) {
    return (
      <div style={styles.container}>
        <div style={styles.loginCard}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Leaf size={40} color="#10b981" />
            <h1 style={{ margin: '10px 0', color: 'white' }}>EcoSync</h1>
            <p style={{ opacity: 0.7, color: 'white' }}>Visual Waste Verification</p>
          </div>
          <button onClick={() => handleLogin('buyer')} style={styles.loginBtn}><ShoppingBag size={18} /> Enter as Buyer</button>
          <button onClick={() => handleLogin('seller')} style={styles.loginBtn}><Tag size={18} /> Enter as Seller</button>
          <div style={styles.adminBox}>
            <input type="password" placeholder="Admin Key" style={styles.input} value={adminPass} onChange={(e) => setAdminPass(e.target.value)} />
            <button onClick={() => handleLogin('admin')} style={{ ...styles.loginBtn, background: '#ef4444', marginTop: '10px' }}>Admin Login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <header style={styles.header}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={styles.logo}><Leaf /> EcoSync</h1>
            <button onClick={() => {setUserRole(null); setActiveCat('all');}} style={styles.logoutBtn}><LogOut size={14} /> Exit</button>
          </div>
        </header>

        {(userRole === 'seller' || userRole === 'admin') && (
          <div style={styles.earningsCard}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <div style={styles.iconCircle}><IndianRupee size={18} color="#10b981"/></div>
              <div>
                <p style={{fontSize: '11px', color: '#94a3b8', margin: 0}}>{userRole === 'seller' ? 'Estimated Earnings' : 'Total Value'}</p>
                <h2 style={{margin: 0, color: '#10b981'}}>₹{calculateEarnings(filteredItems).toLocaleString()}</h2>
              </div>
            </div>
            {userRole === 'seller' && <span style={styles.pendingText}>Proof Required</span>}
          </div>
        )}

        <div style={styles.catRow}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCat(cat.id)} style={activeCat === cat.id ? styles.catBtnActive : styles.catBtn}>
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        <div style={styles.searchContainer}>
          <Search size={16} style={styles.searchIcon} />
          <input placeholder="Search listings..." style={styles.searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        {userRole === 'seller' && (
          <div style={{ marginBottom: '20px' }}>
            <button style={styles.postBtn} onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "+ List Waste with Photo"}</button>
            {showForm && (
              <form onSubmit={handleSubmit} style={styles.form}>
                <input placeholder="What are you recycling?" style={styles.input} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                <input placeholder="Weight (kg)" type="number" style={styles.input} value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} required />
                <select style={styles.input} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="electronics">E-Waste (₹45/kg)</option>
                  <option value="plastic">Plastic (₹12/kg)</option>
                  <option value="metal">Metal (₹30/kg)</option>
                </select>
                
                <div style={styles.fileUploadArea}>
                   {!previewUrl ? (
                     <label style={styles.fileLabel}>
                       <Camera size={20} />
                       <span>Take/Upload Photo</span>
                       <input type="file" accept="image/*" onChange={handleFileChange} style={{display: 'none'}} />
                     </label>
                   ) : (
                     <div style={styles.previewContainer}>
                       <img src={previewUrl} alt="Preview" style={styles.previewImg} />
                       <button type="button" onClick={() => {setSelectedFile(null); setPreviewUrl(null);}} style={styles.removeImgBtn}><X size={14}/></button>
                     </div>
                   )}
                </div>

                <button type="submit" style={styles.submitBtn}>Submit for Review</button>
              </form>
            )}
          </div>
        )}

        <div style={styles.listContainer}>
          {filteredItems.map(item => {
            const currentRate = CATEGORIES.find(c => c.id === item.category)?.rate || 0;
            return (
              <div key={item.id} style={styles.itemCard}>
                {item.image_url && <img src={item.image_url} style={styles.thumb} alt="waste" />}
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{fontSize: '14px'}}>{item.title}</strong>
                    <span style={styles.miniBadge}>{item.category}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0' }}>
                    {item.weight_kg}kg • ₹{item.weight_kg * currentRate}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {userRole === 'admin' && item.status === 'pending' && <button onClick={() => handleApprove(item.id)} style={styles.verifyBtn}>Verify</button>}
                  {userRole === 'buyer' && <button style={styles.requestBtn} onClick={() => window.open(`https://wa.me/910000000000`)}>Buy</button>}
                  {(userRole === 'admin' || userRole === 'seller') && <button onClick={() => handleDelete(item.id)} style={styles.deleteBtn}><Trash2 size={12} /></button>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center' },
  loginCard: { background: '#1e293b', padding: '40px', borderRadius: '20px', width: '350px', alignSelf: 'center' },
  loginBtn: { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '10px', border: 'none', background: '#334155', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  adminBox: { marginTop: '20px', padding: '15px', background: '#0f172a', borderRadius: '12px', border: '1px solid #ef4444' },
  card: { width: '100%', maxWidth: '400px', background: '#1e293b', padding: '20px', borderRadius: '20px' },
  header: { borderBottom: '1px solid #334155', paddingBottom: '15px', marginBottom: '20px' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', margin: 0 },
  logoutBtn: { padding: '6px 12px', borderRadius: '6px', border: '1px solid #334155', background: 'transparent', color: '#94a3b8', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' },
  earningsCard: { background: '#0f172a', padding: '15px', borderRadius: '15px', marginBottom: '20px', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  iconCircle: { background: '#10b98122', padding: '10px', borderRadius: '12px' },
  pendingText: { fontSize: '10px', color: '#f59e0b', background: '#f59e0b11', padding: '4px 8px', borderRadius: '10px' },
  catRow: { display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '15px', paddingBottom: '5px' },
  catBtn: { padding: '6px 12px', borderRadius: '20px', border: '1px solid #334155', background: 'transparent', color: '#94a3b8', fontSize: '12px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' },
  catBtnActive: { padding: '6px 12px', borderRadius: '20px', border: '1px solid #10b981', background: '#10b98122', color: '#10b981', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' },
  searchContainer: { position: 'relative', marginBottom: '15px' },
  searchIcon: { position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' },
  searchInput: { width: '100%', padding: '10px 10px 10px 35px', background: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '10px', boxSizing: 'border-box' },
  postBtn: { width: '100%', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  form: { background: '#0f172a', padding: '15px', borderRadius: '12px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { padding: '10px', background: '#1e293b', border: '1px solid #334155', color: 'white', borderRadius: '8px' },
  fileUploadArea: { border: '2px dashed #334155', borderRadius: '10px', padding: '15px', textAlign: 'center', background: '#1e293b' },
  fileLabel: { cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: '#94a3b8', fontSize: '12px' },
  previewContainer: { position: 'relative', width: '100%', height: '100px' },
  previewImg: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' },
  removeImgBtn: { position: 'absolute', top: '5px', right: '5px', background: '#ef4444', border: 'none', color: 'white', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  submitBtn: { padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  listContainer: { marginTop: '20px' },
  itemCard: { display: 'flex', alignItems: 'center', background: '#334155', padding: '12px', borderRadius: '12px', marginBottom: '10px', gap: '12px' },
  thumb: { width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' },
  miniBadge: { fontSize: '9px', background: '#0f172a', color: '#10b981', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' },
  verifyBtn: { background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' },
  requestBtn: { background: 'transparent', color: '#10b981', border: '1px solid #10b981', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' },
  deleteBtn: { background: '#ef444422', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }
};

export default App;