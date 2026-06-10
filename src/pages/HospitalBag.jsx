import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'מחק', confirmColor = '#ef4444' }) => {
    if (!isOpen) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div onClick={onCancel} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} />
            <div style={{
                position: 'relative', zIndex: 1000, background: '#1a2632',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
                padding: '28px 24px', maxWidth: '300px', width: '100%', textAlign: 'center'
            }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>{title}</p>
                {message && <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '24px' }}>{message}</p>}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onCancel} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', fontSize: '0.95rem' }}>ביטול</button>
                    <button onClick={onConfirm} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: confirmColor, border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 'bold' }}>{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
};

const INITIAL_ITEMS = {
    'מסמכים חשובים': [
        { id: 'doc1', text: 'תיק מעקב הריון', checked: false },
        { id: 'doc2', text: 'תעודות זהות', checked: false },
        { id: 'doc3', text: 'תוכנית לידה (אם יש)', checked: false },
        { id: 'doc4', text: 'ארנק וכסף קטן', checked: false },
    ],
    'בשבילה (חדר לידה)': [
        { id: 'her1', text: 'שפתון לחות (חובה!)', checked: false },
        { id: 'her2', text: 'גומיות לשיער', checked: false },
        { id: 'her3', text: 'בקבוק מים עם פקק ספורט', checked: false },
        { id: 'her4', text: 'גרביים חמים', checked: false },
        { id: 'her5', text: 'כפכפים למקלחת', checked: false },
        { id: 'her6', text: 'חטיפים וסוכריות מציצה', checked: false },
    ],
    'בשבילך (המלווה)': [
        { id: 'him1', text: 'מטען לטלפון (כבל ארוך!)', checked: false },
        { id: 'him2', text: 'סווטשירט (קפוא שם)', checked: false },
        { id: 'him3', text: 'נעליים נוחות (אתה תעמוד הרבה)', checked: false },
        { id: 'him4', text: 'כריך ושתייה', checked: false },
        { id: 'him5', text: 'תרופות אם אתה לוקח', checked: false },
    ],
    'למחלקה (אחרי הלידה)': [
        { id: 'room1', text: 'בגדים נוחים לה', checked: false },
        { id: 'room2', text: 'מוצרי היגיינה (שמפו, סבון)', checked: false },
        { id: 'room3', text: 'תחתונים חד פעמיים', checked: false },
        { id: 'room4', text: 'בגדים ראשונים לתינוק', checked: false },
        { id: 'room5', text: 'סלקל (באוטו)', checked: false },
    ]
};

const HospitalBag = () => {
    const [categories, setCategories] = useState(() => {
        const saved = localStorage.getItem('abale_hospital_bag');
        return saved ? JSON.parse(saved) : INITIAL_ITEMS;
    });

    useEffect(() => {
        localStorage.setItem('abale_hospital_bag', JSON.stringify(categories));
    }, [categories]);

    const toggleItem = (category, itemId) => {
        setCategories(prev => ({
            ...prev,
            [category]: prev[category].map(item =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
            )
        }));
    };

    const calculateProgress = () => {
        let total = 0;
        let checked = 0;
        Object.values(categories).forEach(list => {
            list.forEach(item => {
                total++;
                if (item.checked) checked++;
            });
        });
        return total === 0 ? 0 : Math.round((checked / total) * 100);
    };

    const progress = calculateProgress();

    const [newItemText, setNewItemText] = useState('');
    const [confirmDelete, setConfirmDelete] = useState({ open: false, category: null, itemId: null });

    const addItem = () => {
        if (!newItemText.trim()) return;
        const category = 'רשימה אישית';
        const newItem = {
            id: `custom_${Date.now()}`,
            text: newItemText,
            checked: false
        };

        setCategories(prev => ({
            ...prev,
            [category]: [...(prev[category] || []), newItem]
        }));
        setNewItemText('');
    };

    const deleteItem = (category, itemId) => {
        setConfirmDelete({ open: true, category, itemId });
    };

    const confirmDeleteItem = () => {
        const { category, itemId } = confirmDelete;
        setCategories(prev => ({
            ...prev,
            [category]: prev[category].filter(item => item.id !== itemId)
        }));
        setConfirmDelete({ open: false, category: null, itemId: null });
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <Link to="/" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    <ArrowRight size={24} />
                </Link>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShoppingBag color="var(--primary)" />
                    תיק לחדר לידה
                </h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '25px' }}>
                משבוע 38 מומלץ להכין תיק לידה שיחכה ליד הדלת.
                לפעמים יוצאים ברוגע, ולפעמים צריך לטוס שם. הכי טוב שתהיה מוכן להכל.
            </p>

            {/* Progress Bar */}
            <div style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                    <span>התקדמות אריזה</span>
                    <span>{progress}%</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: 'var(--primary)',
                        transition: 'width 0.5s ease'
                    }} />
                </div>
            </div>



            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {Object.entries(categories).map(([categoryName, items]) => (
                    <div key={categoryName} style={{
                        background: 'var(--bg-card)',
                        borderRadius: '12px',
                        padding: '15px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.1rem', color: 'var(--primary)' }}>
                            {categoryName}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {items.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => toggleItem(categoryName, item.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        background: item.checked ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                        transition: 'all 0.2s',
                                        opacity: item.checked ? 0.6 : 1
                                    }}
                                >
                                    {item.checked ?
                                        <CheckSquare size={20} color="#10b981" /> :
                                        <Square size={20} color="var(--text-muted)" />
                                    }
                                    <span style={{
                                        textDecoration: item.checked ? 'line-through' : 'none',
                                        color: item.checked ? 'var(--text-muted)' : 'var(--text-main)',
                                        flex: 1
                                    }}>
                                        {item.text}
                                    </span>
                                    {categoryName === 'רשימה אישית' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteItem(categoryName, item.id);
                                            }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#ef4444',
                                                padding: '4px',
                                                cursor: 'pointer',
                                                opacity: 0.7,
                                                display: 'flex'
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add New Item */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder="הוסף פריט לרשימה..."
                    style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-card)',
                        color: 'white'
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && addItem()}
                />
                <button
                    onClick={addItem}
                    style={{
                        padding: '0 20px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'var(--primary)',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    הוסף
                </button>
            </div>

            <ConfirmModal
                isOpen={confirmDelete.open}
                title="למחוק את הפריט?"
                onConfirm={confirmDeleteItem}
                onCancel={() => setConfirmDelete({ open: false, category: null, itemId: null })}
                confirmLabel="מחק"
            />
        </div>
    );
};

export default HospitalBag;
