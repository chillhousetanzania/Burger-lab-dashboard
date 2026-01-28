import { useState, useEffect, useRef } from 'react';
import { Save, Smartphone, Monitor, Plus, Trash2, Moon, Sun, Upload, Megaphone, RotateCcw, Lock, LogOut, ExternalLink, Globe } from 'lucide-react';

const API_BASE = ''; // Use relative paths, let Vite proxy handle dev and Express handle production.

function App() {
  const [menuData, setMenuData] = useState(null);
  const [history, setHistory] = useState([]); // Undo Stack
  const [fileHandle, setFileHandle] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, loading, saving, error
  const [errorDetails, setErrorDetails] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [theme, setTheme] = useState('dark');
  const fileInputRef = useRef(null);

  const [uploadTarget, setUploadTarget] = useState(null); // { category, index }
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_BASE}/${path}${path.includes('?') ? '' : '?v=5'}`;
  };

  const autoTranslate = async (category, index) => {
    const item = menuData[category][index];
    const text = item.name.en;
    if (!text) return;

    pushHistory();
    const newData = { ...menuData };

    // Visual feedback (optional hooks)

    try {
      if (!item.name.ar) {
        const resAr = await fetch(`${API_BASE}/api/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, targetLang: 'ar' })
        }).then(r => r.json());
        if (resAr.translation) newData[category][index].name.ar = resAr.translation;
      }

      if (!item.name.tr) {
        const resTr = await fetch(`${API_BASE}/api/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, targetLang: 'tr' })
        }).then(r => r.json());
        if (resTr.translation) newData[category][index].name.tr = resTr.translation;
      }
      setMenuData(newData);
    } catch (e) {
      alert("Translation failed: " + e.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoginError('');
      console.log('Attempting login at:', `${API_BASE}/api/login`);
      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: loginPassword }),
        mode: 'cors',
        cache: 'no-cache'
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        console.log('Login response JSON:', data);
        if (data.token) {
          setToken(data.token);
          localStorage.setItem('adminToken', data.token);
        } else {
          setLoginError(data.error || 'Login failed');
        }
      } else {
        const text = await response.text();
        console.error('Login response HTML (unexpected):', text);
        setLoginError(`Server returned HTML (check port 5174): ${text.substring(0, 50)}...`);
      }
    } catch (err) {
      console.error('Login Network/Syntax Error:', err);
      setLoginError('Connection Error: ' + err.message);
    }
  };

  const logout = () => {
    setToken('');
    localStorage.removeItem('adminToken');
  };

  const categoryLabels = {
    burgers: 'Beef Burger',
    chicken: 'Chicken Burger',
    extras: 'Extras',
    drinks: 'Drinks'
  };

  // Responsive check
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Theme Handling
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // History Helper
  const pushHistory = () => {
    if (!menuData) return;
    setHistory(prev => {
      const newHistory = [...prev, JSON.parse(JSON.stringify(menuData))];
      if (newHistory.length > 20) newHistory.shift(); // Limit to 20
      return newHistory;
    });
  };

  const undo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setMenuData(lastState);
    setHistory(prev => prev.slice(0, -1));
  };


  async function fetchMenu() {
    try {
      setStatus('loading');
      const response = await fetch(`${API_BASE}/api/menu`);
      if (!response.ok) throw new Error('Failed to fetch: ' + response.statusText);
      const json = await response.json();

      // Ensure specific structure
      if (!json.promotions) json.promotions = { isActive: false, text: { en: '', ar: '', tr: '' }, billboards: [] };
      if (!json.promotions.billboards) json.promotions.billboards = [];

      // Initialize Category Settings (For Dynamic Colors/Images)
      if (!json.categorySettings) json.categorySettings = {};

      // Migrate existing categories to have default settings if missing
      const defaultColors = {
        burgers: '#A01E28',
        chicken: '#D97706',
        extras: '#DC2626',
        drinks: '#0891b2'
      };

      Object.keys(json).forEach(key => {
        if (key === 'promotions' || key === 'categorySettings') return;
        if (!json.categorySettings[key]) {
          json.categorySettings[key] = {
            color: defaultColors[key] || '#' + Math.floor(Math.random() * 16777215).toString(16), // Random fallback
            image: `images/banner_${key}.webp` // Legacy fallback
          };
        }
      });

      setMenuData(json);
      setHistory([]); // Reset history on load
      setFileHandle({ name: 'Remote Server' });
      // Default to first real category (skip promotions key)
      const firstCat = Object.keys(json).find(k => k !== 'promotions') || 'burgers';
      setActiveCategory(firstCat);
      setStatus('idle');
    } catch (err) {
      console.error(err);
      setErrorDetails(err.toString());
      setStatus('error');
    }
  }

  // Load on mount
  useEffect(() => {
    if (token) fetchMenu();
  }, [token]);

  if (!token) {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          background: '#1e293b',
          padding: '2.5rem',
          borderRadius: '1.5rem',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '200px',
              height: '200px',
              background: '#fff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
              boxShadow: '0 0 0 8px rgba(255,255,255,0.1), 0 10px 25px rgba(0,0,0,0.2)'
            }}>
              <img
                src={`${API_BASE}/images/final_logo.webp`}
                alt="Burger Lab Logo"
                style={{
                  width: '130px',
                  height: 'auto',
                  filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.5))'
                }}
              />
            </div>
            <h1 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 'bold', margin: '0 0 0.5rem' }}>Burger Lab</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>Management Dashboard</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                autoFocus
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #334155',
                  background: '#0f172a',
                  color: '#fff',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
              {loginError && <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: 0 }}>{loginError}</p>}
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '0.75rem', borderRadius: '0.75rem', border: 'none', width: '100%', fontWeight: 'bold' }}
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div >
    );
  }

  async function saveFile() {
    if (!menuData) return;

    try {
      setStatus('saving');

      // AUTO-TRANSLATE BATCHING
      const newData = JSON.parse(JSON.stringify(menuData));
      let hasChanges = false;
      const translationPromises = [];

      // Helper to queue translation
      const queueTranslation = (text, targetLang, category, index, field) => {
        if (!text) return;
        translationPromises.push(
          fetch(`${API_BASE}/api/translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, targetLang })
          })
            .then(res => res.json())
            .then(res => {
              if (res.translation) {
                if (category === 'promotions' && field === 'text') {
                  if (!newData.promotions.text) newData.promotions.text = {};
                  newData.promotions.text[targetLang] = res.translation;
                } else if (category === 'categorySettings' && field === 'title') {
                  if (!newData.categorySettings[index]) newData.categorySettings[index] = { titles: {} }; // index here is category key
                  if (!newData.categorySettings[index].titles) newData.categorySettings[index].titles = {};
                  newData.categorySettings[index].titles[targetLang] = res.translation;
                } else {
                  // Standard Item
                  if (field === 'name') newData[category][index].name[targetLang] = res.translation;
                  if (field === 'description') {
                    if (!newData[category][index].description) newData[category][index].description = {};
                    newData[category][index].description[targetLang] = res.translation;
                  }
                }
                hasChanges = true;
              }
            })
            .catch(err => console.error("Batch translate error:", err))
        );
      };

      // Iterate all items
      const isArabic = (text) => /[\u0600-\u06FF]/.test(text);

      // Iterate all items
      Object.keys(newData).forEach(cat => {
        // Promotions Translation
        if (cat === 'promotions') {
          if (newData.promotions.text?.en) {
            const arText = newData.promotions.text.ar;
            if (!arText || !arText.trim() || !isArabic(arText)) queueTranslation(newData.promotions.text.en, 'ar', 'promotions', -1, 'text');
            if (!newData.promotions.text.tr || !newData.promotions.text.tr.trim()) queueTranslation(newData.promotions.text.en, 'tr', 'promotions', -1, 'text');
          }
          return;
        }

        // Category Settings Translation
        if (!newData.categorySettings) newData.categorySettings = {};
        if (!newData.categorySettings[cat]) newData.categorySettings[cat] = { color: '#000000', image: '', titles: { en: cat, ar: '', tr: '' } };
        if (!newData.categorySettings[cat].titles) newData.categorySettings[cat].titles = { en: cat, ar: '', tr: '' };

        // Ensure English title exists
        if (!newData.categorySettings[cat].titles.en) newData.categorySettings[cat].titles.en = cat.charAt(0).toUpperCase() + cat.slice(1);

        const catTitleEn = newData.categorySettings[cat].titles.en;
        const catTitleAr = newData.categorySettings[cat].titles.ar;
        if (!catTitleAr || !catTitleAr.trim() || !isArabic(catTitleAr)) queueTranslation(catTitleEn, 'ar', 'categorySettings', cat, 'title');
        if (!newData.categorySettings[cat].titles.tr || !newData.categorySettings[cat].titles.tr.trim()) queueTranslation(catTitleEn, 'tr', 'categorySettings', cat, 'title');

        if (cat === 'categorySettings') return;

        newData[cat].forEach((item, idx) => {
          // Translate Name
          if (item.name?.en) {
            const nameAr = item.name.ar;
            if (!nameAr || !nameAr.trim() || !isArabic(nameAr)) queueTranslation(item.name.en, 'ar', cat, idx, 'name');
            if (!item.name.tr || !item.name.tr.trim()) queueTranslation(item.name.en, 'tr', cat, idx, 'name');
          }
          // Translate Description
          if (item.description?.en) {
            const descAr = item.description.ar;
            if (!descAr || !descAr.trim() || !isArabic(descAr)) queueTranslation(item.description.en, 'ar', cat, idx, 'description');
            if (!item.description.tr || !item.description.tr.trim()) queueTranslation(item.description.en, 'tr', cat, idx, 'description');
          }
        });
      });

      if (translationPromises.length > 0) {
        await Promise.all(translationPromises);
        if (hasChanges) setMenuData(newData);
      }

      const response = await fetch(`${API_BASE}/api/menu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(hasChanges ? newData : menuData)
      });

      if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error('Session expired');
      }

      if (!response.ok) throw new Error('Failed to save');

      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      console.error(err);
      alert('Failed to save changes');
      setStatus('idle');
    }
  }

  const updateProduct = (category, index, field, value) => {
    const newData = { ...menuData };
    newData[category][index][field] = value;
    setMenuData(newData);
  };

  const updateName = (category, index, value) => {
    const newData = { ...menuData };
    if (!newData[category][index].name) newData[category][index].name = {};
    newData[category][index].name.en = value;
    setMenuData(newData);
  };

  const addNewItem = () => {
    pushHistory();
    if (!activeCategory || !menuData) return;
    const newData = { ...menuData };
    newData[activeCategory].push({
      name: { en: "New Item", ar: "", tr: "" },
      price: "0",
      calories: "0",
      image: "images/placeholder.webp",
      description: { en: "", ar: "", tr: "" }
    });
    setMenuData(newData);
  };

  const deleteItem = (index) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    pushHistory();
    const newData = { ...menuData };
    newData[activeCategory].splice(index, 1);
    setMenuData(newData);
  };

  // Image Upload Logic
  const triggerUpload = (category, index) => {
    setUploadTarget({ category, index });
    fileInputRef.current.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !uploadTarget) return;

    pushHistory(); // Save state before upload changes
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.status === 401 || res.status === 403) {
        logout();
        throw new Error('Session expired');
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Upload failed with status ' + res.status);
      }

      const data = await res.json();

      // Check if it's a promotion upload
      // Check if it's a promotion upload
      if (uploadTarget.category === 'promotions') {
        const newData = { ...menuData };
        if (!newData.promotions.billboards) newData.promotions.billboards = [];

        // Update existing or add new
        if (uploadTarget.index < newData.promotions.billboards.length) {
          newData.promotions.billboards[uploadTarget.index] = data.path;
        } else {
          newData.promotions.billboards.push(data.path);
        }
        setMenuData(newData);
      } else if (uploadTarget.category === 'header') {
        // Handle Category Header Image Upload
        // In this case, 'index' is actually the category key string
        const categoryKey = uploadTarget.index;
        const newData = { ...menuData };
        if (!newData.categorySettings) newData.categorySettings = {};
        if (!newData.categorySettings[categoryKey]) newData.categorySettings[categoryKey] = {};

        newData.categorySettings[categoryKey].image = data.path;
        setMenuData(newData);
      } else {
        // Standard product upload
        updateProduct(uploadTarget.category, uploadTarget.index, 'image', data.path);
      }

    } catch (err) {
      console.error(err);
      alert('Failed to upload image: ' + err.message);
    } finally {
      setUploadTarget(null);
      e.target.value = null; // Reset input
    }
  };

  // Promotion Handling
  const updatePromotion = (field, value) => {
    // Checkbox toggles should push history
    if (field === 'isActive') pushHistory();

    const newData = { ...menuData };
    if (field === 'isActive') newData.promotions.isActive = value;
    if (field === 'text') newData.promotions.text.en = value;
    setMenuData(newData);
  };

  const handleUpdatePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      alert("New passwords do not match");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/update-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      alert('Password updated successfully');
      setShowSettings(false);
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  if (!menuData) {
    return (
      <div className="container" style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '120px',
            height: '120px',
            background: '#fff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <img
              src={`${API_BASE}/images/final_logo.webp`}
              alt="Logo"
              style={{ width: '80px', height: 'auto' }}
            />
          </div>
          <h1>Burger Menu Dashboard</h1>
          {status === 'loading' && <p style={{ color: 'var(--text-muted)' }}>Loading menu data...</p>}
          {status === 'error' && (
            <div style={{ color: '#ef4444' }}>
              <p>Failed to load menu data.</p>
              <button className="btn btn-primary" onClick={fetchMenu} style={{ marginTop: '1rem' }}>
                Retry
              </button>
            </div>
          )}
          {status === 'idle' && <p>Initializing...</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ padding: isMobile ? '1rem' : '2rem' }}>
      <header className="flex justify-between items-center" style={{ marginBottom: '2rem', flexDirection: isMobile ? 'column' : 'row', gap: '1rem' }}>
        <div className="flex items-center gap-4">
          <div style={{
            width: isMobile ? 60 : 80,
            height: isMobile ? 60 : 80,
            background: '#fff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            padding: '8px',
            flexShrink: 0
          }}>
            <img
              src={`${API_BASE}/images/final_logo.webp`}
              alt="Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div>
            <h1>Dashboard</h1>
            <div className="file-status">
              {fileHandle?.name} {status === 'saving' ? 'Saving & Translating...' : status === 'saved' ? 'Saved' : ''}
              <span style={{ marginLeft: '1rem', opacity: 0.5 }}>{isMobile ? <Smartphone size={14} /> : <Monitor size={14} />}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4" style={{ width: isMobile ? '100%' : 'auto' }}>
          <button
            className="btn btn-outline"
            style={{ width: 44, padding: 0, justifyContent: 'center' }}
            onClick={undo}
            disabled={history.length === 0}
            title="Undo Last Action"
          >
            <RotateCcw size={20} style={{ opacity: history.length === 0 ? 0.3 : 1 }} />
          </button>

          <button
            className="btn btn-outline"
            style={{ width: 44, padding: 0, justifyContent: 'center' }}
            onClick={() => window.open(`${API_BASE}/menu`, '_blank')}
            title="View Live Menu"
          >
            <ExternalLink size={20} color="var(--primary)" />
          </button>

          <button
            className="btn btn-outline"
            style={{ width: 44, padding: 0, justifyContent: 'center', borderColor: '#ef4444' }}
            onClick={logout}
            title="Logout"
          >
            <LogOut size={20} color="#ef4444" />
          </button>
          <button
            className="btn btn-outline"
            style={{ width: 44, padding: 0, justifyContent: 'center' }}
            onClick={() => setShowSettings(!showSettings)}
            title="Account Settings"
          >
            <Lock size={20} color={showSettings ? 'var(--primary)' : 'currentColor'} />
          </button>
          <button
            className="btn btn-outline"
            style={{ width: 44, padding: 0, justifyContent: 'center' }}
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button className="btn btn-primary" onClick={saveFile} style={{ width: isMobile ? '100%' : 'auto', justifyContent: 'center', flexGrow: 1 }}>
            <Save size={20} />
            Save Changes
          </button>
        </div>
      </header>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

      <div className="grid" style={{ gridTemplateColumns: isMobile ? '1fr' : '220px 1fr', gap: '2rem' }}>
        {/* Sidebar Navigation */}
        <aside style={{ display: isMobile ? 'flex' : 'block', overflowX: isMobile ? 'auto' : 'visible', paddingBottom: isMobile ? '1rem' : 0, gap: '0.5rem' }}>
          {Object.keys(menuData).filter(k => k !== 'promotions' && k !== 'categorySettings').map(cat => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', width: isMobile ? 'auto' : '100%' }}>
              <button
                className="btn"
                style={{
                  width: isMobile ? 'auto' : '100%',
                  justifyContent: isMobile ? 'center' : 'flex-start',
                  background: activeCategory === cat ? 'var(--bg-input)' : 'transparent',
                  marginBottom: isMobile ? 0 : '0.25rem',
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                  border: isMobile ? '1px solid var(--border)' : 'transparent',
                  color: activeCategory === cat ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: activeCategory === cat ? 700 : 400,
                  flexGrow: 1
                }}
                onClick={() => setActiveCategory(cat)}
              >
                {categoryLabels[cat] || cat}
              </button>
              <div
                role="button"
                className="btn-icon danger"
                style={{ padding: '0.5rem', cursor: 'pointer', opacity: 0.7 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete entire "${cat}" category?`)) {
                    pushHistory();
                    const newData = { ...menuData };
                    delete newData[cat];
                    if (newData.categorySettings) delete newData.categorySettings[cat];
                    setMenuData(newData);
                    if (activeCategory === cat) setActiveCategory(null);
                  }
                }}
                title="Delete Category"
              >
                <Trash2 size={14} />
              </div>
            </div>
          ))}
          <button
            className="btn"
            style={{
              width: isMobile ? 'auto' : '100%',
              justifyContent: isMobile ? 'center' : 'flex-start',
              background: 'transparent',
              border: '1px dashed var(--border)',
              marginTop: '1rem',
              color: 'var(--text-muted)'
            }}
            onClick={() => {
              const name = prompt("Enter new category name (e.g. 'Sushi'):");
              if (name && name.trim()) {
                const key = name.toLowerCase().replace(/\s+/g, '');
                if (menuData[key]) {
                  alert('Category already exists!');
                  return;
                }
                const newData = { ...menuData };
                newData[key] = [];
                // Assign new random color
                if (!newData.categorySettings) newData.categorySettings = {};
                newData.categorySettings[key] = {
                  color: '#' + Math.floor(Math.random() * 16777215).toString(16),
                  image: 'images/banner_all.webp' // Default placeholder
                };
                setMenuData(newData);
                setActiveCategory(key);
                pushHistory();
              }
            }}
          >
            <Plus size={16} style={{ marginRight: '0.5rem' }} /> Add Category
          </button>
        </aside>

        {/* Main Editor */}
        <main style={{ overflowX: 'auto' }}>

          {/* Promotions Dashboard at the top */}
          <div className="card fade-in" style={{ marginBottom: '2rem', padding: '1rem', borderLeft: '4px solid var(--primary)', background: 'rgba(245, 158, 11, 0.1)' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
              <div className="flex items-center gap-2" style={{ fontWeight: 'bold' }}>
                <Megaphone size={20} color="var(--primary)" />
                Site Promotions (Billboard)
              </div>
              <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={menuData.promotions.isActive}
                  onChange={(e) => updatePromotion('isActive', e.target.checked)}
                  style={{ transform: 'scale(1.2)' }}
                />
                <span style={{ fontSize: '0.9rem' }}>Active</span>
              </label>
            </div>

            <div className="flex gap-4" style={{ flexDirection: 'column' }}>
              <div style={{ flexGrow: 1 }}>
                <input
                  className="input-transparent"
                  value={menuData.promotions.text.en}
                  onChange={(e) => updatePromotion('text', e.target.value)}
                  placeholder="Enter top marquee text (e.g. 50% Off Today!)..."
                  style={{ fontSize: '1.1rem', fontWeight: 500, width: '100%' }}
                />
              </div>

              <div className="flex gap-4 items-center" style={{ overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'thin' }}>
                {menuData.promotions.billboards.map((img, idx) => (
                  <div
                    key={idx}
                    style={{ width: 120, height: 120, background: '#222', borderRadius: 8, flexShrink: 0, position: 'relative', overflow: 'hidden', border: '1px solid var(--border)' }}
                  >
                    <img src={getImageUrl(img)} alt="Promo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} className="hover-promo-actions">
                      <button
                        className="btn-icon"
                        onClick={() => triggerUpload('promotions', idx)}
                        title="Change Image"
                      >
                        <Upload size={14} color="white" />
                      </button>
                      <button
                        className="btn-icon danger"
                        onClick={() => {
                          pushHistory();
                          const newData = { ...menuData };
                          newData.promotions.billboards.splice(idx, 1);
                          setMenuData(newData);
                        }}
                        title="Remove"
                      >
                        <Trash2 size={14} color="white" />
                      </button>
                    </div>
                    <style>{`.hover-promo-actions:hover { opacity: 1 !important; }`}</style>
                  </div>
                ))}

                {/* Add New Billboard Slot */}
                <div
                  style={{ width: 120, height: 120, background: 'rgba(255,255,255,0.05)', borderRadius: 8, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px dashed var(--border)', gap: '0.5rem', color: 'var(--text-muted)' }}
                  onClick={() => triggerUpload('promotions', menuData.promotions.billboards.length)}
                >
                  <Plus size={24} />
                  <span style={{ fontSize: '0.8rem' }}>Add Billboard</span>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Upload multiple billboard posters to display them in rotation on the main menu.
              </p>
            </div>
          </div>

          {activeCategory && (
            <div className="grid gap-4">
              <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <h2>{activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Items</h2>

                {/* Category Settings Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Category Settings</span>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--bg-input)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Color:</span>
                      <input
                        type="color"
                        value={menuData.categorySettings?.[activeCategory]?.color || '#000000'}
                        onChange={(e) => {
                          const newData = { ...menuData };
                          if (!newData.categorySettings) newData.categorySettings = {};
                          if (!newData.categorySettings[activeCategory]) newData.categorySettings[activeCategory] = {};
                          newData.categorySettings[activeCategory].color = e.target.value;
                          setMenuData(newData);
                        }}
                        style={{ border: 'none', width: '30px', height: '30px', cursor: 'pointer', background: 'none' }}
                        title="Category Theme Color"
                      />
                    </div>
                    <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Header:</span>
                      <div
                        role="button"
                        className="btn-sm btn-outline"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          triggerUpload('header', activeCategory);
                        }}
                        title="Upload Header Image"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                      >
                        <Upload size={14} />
                        {menuData.categorySettings?.[activeCategory]?.image ? 'Change' : 'Upload'}
                      </div>
                    </div>
                    {/* Title Translations */}
                    <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <input
                        className="input-transparent"
                        value={menuData.categorySettings?.[activeCategory]?.titles?.en || {
                          burgers: "Beef Burgers",
                          chicken: "Chicken Burgers",
                          sauces: "Sauces",
                          sides: "Sides",
                          extras: "Extras",
                          drinks: "Drinks"
                        }[activeCategory] || activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
                        onChange={(e) => {
                          const newData = { ...menuData };
                          if (!newData.categorySettings) newData.categorySettings = {};
                          if (!newData.categorySettings[activeCategory]) newData.categorySettings[activeCategory] = { titles: {} };
                          if (!newData.categorySettings[activeCategory].titles) newData.categorySettings[activeCategory].titles = { en: activeCategory };
                          newData.categorySettings[activeCategory].titles.en = e.target.value;
                          setMenuData(newData);
                        }}
                        style={{ fontSize: '0.85rem', fontWeight: 600, width: '100px' }}
                        placeholder="Title (EN)"
                      />
                      <div style={{ display: 'flex', gap: '2px' }}>
                        <input
                          className="input-transparent"
                          value={menuData.categorySettings?.[activeCategory]?.titles?.ar || ''}
                          onChange={(e) => {
                            const newData = { ...menuData };
                            if (!newData.categorySettings) newData.categorySettings = {};
                            if (!newData.categorySettings[activeCategory]) newData.categorySettings[activeCategory] = { titles: {} };
                            if (!newData.categorySettings[activeCategory].titles) newData.categorySettings[activeCategory].titles = { en: activeCategory };
                            newData.categorySettings[activeCategory].titles.ar = e.target.value;
                            setMenuData(newData);
                          }}
                          style={{ fontSize: '0.75rem', width: '60px', color: 'var(--text-muted)' }}
                          placeholder="🇸🇦 Ar"
                          dir="rtl"
                        />
                        <input
                          className="input-transparent"
                          value={menuData.categorySettings?.[activeCategory]?.titles?.tr || ''}
                          onChange={(e) => {
                            const newData = { ...menuData };
                            if (!newData.categorySettings) newData.categorySettings = {};
                            if (!newData.categorySettings[activeCategory]) newData.categorySettings[activeCategory] = { titles: {} };
                            if (!newData.categorySettings[activeCategory].titles) newData.categorySettings[activeCategory].titles = { en: activeCategory };
                            newData.categorySettings[activeCategory].titles.tr = e.target.value;
                            setMenuData(newData);
                          }}
                          style={{ fontSize: '0.75rem', width: '60px', color: 'var(--text-muted)' }}
                          placeholder="🇹🇷 Tr"
                        />
                      </div>
                    </div>
                    <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>
                    <div
                      role="button"
                      className="btn-icon danger"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (confirm(`Remove custom header image for "${activeCategory}"?`)) {
                          pushHistory();
                          const newData = { ...menuData };
                          if (newData.categorySettings && newData.categorySettings[activeCategory]) {
                            newData.categorySettings[activeCategory].image = ''; // Clear image only
                          }
                          setMenuData(newData);
                        }
                      }}
                      title="Remove Header Image"
                      style={{ padding: '0.25rem', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </div>
                  </div>
                </div>
              </div>

              {/* DESKTOP TABLE VIEW */}
              {!isMobile ? (
                <div className="table-container fade-in" style={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'rgba(128,128,128,0.05)' }}>
                        <th style={{ padding: '1rem' }}>Image</th>
                        <th style={{ padding: '1rem' }}>Name (English)</th>
                        <th style={{ padding: '1rem' }}>Price (Single)</th>
                        <th style={{ padding: '1rem' }}>Price (Double)</th>
                        <th style={{ padding: '1rem' }}>Kcal</th>
                        <th style={{ padding: '1rem' }}>Description</th>
                        <th style={{ padding: '1rem', width: '50px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuData[activeCategory].map((product, index) => (
                        <tr key={index} className="table-row" style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '1rem', width: '80px', verticalAlign: 'top' }}>
                            <div
                              style={{ position: 'relative', width: 64, height: 64, borderRadius: 6, overflow: 'hidden', background: '#222', marginBottom: '0.5rem', border: '1px solid var(--border)', cursor: 'pointer' }}
                              onClick={() => triggerUpload(activeCategory, index)}
                              title="Click to Upload Image"
                            >
                              <img key={product.image} src={getImageUrl(product.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
                              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} className="hover-upload">
                                <Upload size={16} color="white" />
                              </div>
                            </div>
                            {/* Hover effect helper */}
                            <style>{`.hover-upload:hover { opacity: 1 !important; }`}</style>


                          </td>
                          <td style={{ padding: '0.75rem', width: '25%', verticalAlign: 'top' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <input
                                  className="input-transparent"
                                  value={product.name?.en || ''}
                                  onChange={(e) => updateName(activeCategory, index, e.target.value)}
                                  style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)', width: '100%' }}
                                  placeholder="Name (English)"
                                />
                                <button className="btn-icon" onClick={() => autoTranslate(activeCategory, index)} title="Auto-Translate Empty Fields">
                                  <Globe size={16} color="var(--primary)" />
                                </button>
                              </div>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <input
                                  className="input-transparent"
                                  value={product.name?.ar || ''}
                                  onChange={(e) => {
                                    const newData = { ...menuData };
                                    if (!newData[activeCategory][index].name) newData[activeCategory][index].name = {};
                                    newData[activeCategory][index].name.ar = e.target.value;
                                    setMenuData(newData);
                                  }}
                                  style={{ fontSize: '0.8rem', color: 'var(--text-muted)', width: '50%' }}
                                  placeholder="🇸🇦 Arabic"
                                  dir="rtl"
                                />
                                <input
                                  className="input-transparent"
                                  value={product.name?.tr || ''}
                                  onChange={(e) => {
                                    const newData = { ...menuData };
                                    if (!newData[activeCategory][index].name) newData[activeCategory][index].name = {};
                                    newData[activeCategory][index].name.tr = e.target.value;
                                    setMenuData(newData);
                                  }}
                                  style={{ fontSize: '0.8rem', color: 'var(--text-muted)', width: '50%' }}
                                  placeholder="🇹🇷 Turkish"
                                />
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem', width: '100px', verticalAlign: 'top' }}>
                            <input
                              className="input-transparent"
                              value={product.price}
                              onChange={(e) => updateProduct(activeCategory, index, 'price', e.target.value)}
                              style={{ fontFamily: 'monospace', color: 'var(--primary)' }}
                              placeholder="0.00"
                            />
                          </td>
                          <td style={{ padding: '0.75rem', width: '100px', verticalAlign: 'top' }}>
                            <input
                              className="input-transparent"
                              value={product.priceDouble || ''}
                              onChange={(e) => updateProduct(activeCategory, index, 'priceDouble', e.target.value)}
                              style={{ fontFamily: 'monospace', color: 'var(--primary)' }}
                              placeholder="Opt."
                            />
                          </td>
                          <td style={{ padding: '0.75rem', width: '80px', verticalAlign: 'top' }}>
                            <input
                              className="input-transparent"
                              value={product.calories || ''}
                              onChange={(e) => updateProduct(activeCategory, index, 'calories', e.target.value)}
                              style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}
                              placeholder="Kcal"
                            />
                          </td>
                          <td style={{ padding: '0.75rem', verticalAlign: 'top' }}>
                            <textarea
                              className="input-transparent"
                              rows={2}
                              value={product.description?.en || ''}
                              onChange={(e) => {
                                const newData = { ...menuData };
                                if (!newData[activeCategory][index].description) newData[activeCategory][index].description = {};
                                newData[activeCategory][index].description.en = e.target.value;
                                setMenuData(newData);
                              }}
                              style={{ resize: 'none', lineHeight: '1.5', color: 'var(--text-muted)' }}
                              placeholder="Description..."
                            />
                          </td>
                          <td style={{ padding: '0.75rem', verticalAlign: 'top', textAlign: 'center' }}>
                            <button
                              className="btn-icon danger"
                              onClick={() => deleteItem(index)}
                              title="Delete Item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* MOBILE CARD VIEW */
                <div className="grid gap-4">
                  {menuData[activeCategory].map((product, index) => (
                    <div key={index} className="card fade-in" style={{ padding: '1rem' }}>
                      <div className="flex gap-4">
                        <div
                          style={{ width: 80, height: 80, flexShrink: 0, borderRadius: 8, overflow: 'hidden', background: '#333', position: 'relative' }}
                          onClick={() => triggerUpload(activeCategory, index)}
                        >
                          <img key={product.image} src={getImageUrl(product.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
                          <div style={{ position: 'absolute', bottom: 0, right: 0, padding: 4, background: 'rgba(0,0,0,0.6)', borderRadius: '4px 0 0 0' }}>
                            <Upload size={12} color="white" />
                          </div>
                        </div>
                        <div style={{ flexGrow: 1 }}>
                          <div className="flex justify-between">
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <input
                                  className="input-transparent"
                                  value={product.name?.en || ''}
                                  onChange={(e) => updateName(activeCategory, index, e.target.value)}
                                  style={{ fontWeight: 'bold', marginBottom: '0.25rem', fontSize: '1rem', width: '100%' }}
                                  placeholder="Name (EN)"
                                />
                                <button className="btn-icon" onClick={() => autoTranslate(activeCategory, index)} title="Auto-Translate">
                                  <Globe size={16} color="var(--primary)" />
                                </button>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input
                                  className="input-transparent"
                                  value={product.name?.ar || ''}
                                  onChange={(e) => {
                                    const newData = { ...menuData };
                                    if (!newData[activeCategory][index].name) newData[activeCategory][index].name = {};
                                    newData[activeCategory][index].name.ar = e.target.value;
                                    setMenuData(newData);
                                  }}
                                  style={{ fontSize: '0.85rem', color: 'var(--text-muted)', width: '50%', background: 'rgba(255,255,255,0.05)', padding: '2px 4px', borderRadius: 4 }}
                                  placeholder="🇸🇦 Arabic"
                                  dir="rtl"
                                />
                                <input
                                  className="input-transparent"
                                  value={product.name.tr || ''}
                                  onChange={(e) => {
                                    const newData = { ...menuData };
                                    newData[activeCategory][index].name.tr = e.target.value;
                                    setMenuData(newData);
                                  }}
                                  style={{ fontSize: '0.85rem', color: 'var(--text-muted)', width: '50%', background: 'rgba(255,255,255,0.05)', padding: '2px 4px', borderRadius: 4 }}
                                  placeholder="🇹🇷 Turkish"
                                />
                              </div>
                            </div>
                            <button className="btn-icon danger" onClick={() => deleteItem(index)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <input
                              className="input-transparent"
                              value={product.price}
                              onChange={(e) => updateProduct(activeCategory, index, 'price', e.target.value)}
                              placeholder="Single"
                              style={{ color: 'var(--primary)', flex: 1 }}
                            />
                            <input
                              className="input-transparent"
                              value={product.priceDouble || ''}
                              onChange={(e) => updateProduct(activeCategory, index, 'priceDouble', e.target.value)}
                              placeholder="Double"
                              style={{ color: 'var(--primary)', flex: 1 }}
                            />
                            <input
                              className="input-transparent"
                              value={product.calories || ''}
                              onChange={(e) => updateProduct(activeCategory, index, 'calories', e.target.value)}
                              placeholder="Kcal"
                              style={{ color: 'var(--text-muted)', width: '60px', textAlign: 'right' }}
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}

              {/* Add New Button */}
              <button
                className="btn dashed"
                style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', padding: '1rem' }}
                onClick={addNewItem}
              >
                <Plus size={18} /> Add New {activeCategory.slice(0, -1) || 'Item'}
              </button>
            </div>
          )}
        </main>
      </div>

      {
        showSettings && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div className="card fade-in" style={{ width: '90%', maxWidth: '400px', padding: '2rem', background: '#1e293b', border: '1px solid var(--border)' }}>
              <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={24} color="var(--primary)" />
                Account Settings
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Current Password</label>
                  <input
                    type="password"
                    className="input-transparent"
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', width: '100%', boxSizing: 'border-box' }}
                    value={passwords.current}
                    onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>New Password</label>
                  <input
                    type="password"
                    className="input-transparent"
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', width: '100%', boxSizing: 'border-box' }}
                    value={passwords.new}
                    onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Confirm New Password</label>
                  <input
                    type="password"
                    className="input-transparent"
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', width: '100%', boxSizing: 'border-box' }}
                    value={passwords.confirm}
                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowSettings(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleUpdatePassword}>
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

export default App;
