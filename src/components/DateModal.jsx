import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from 'lucide-react';

const DateModal = ({ isOpen, onClose, onSelect, initialDate }) => {
    const [currentDate, setCurrentDate] = useState(initialDate ? new Date(initialDate) : new Date());
    const [selectedDate, setSelectedDate] = useState(initialDate ? new Date(initialDate) : null);

    if (!isOpen) return null;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday

    const monthNames = [
        "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
        "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
    ];

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleDayClick = (day) => {
        const newDate = new Date(year, month, day);
        // Adjust for timezone offset to avoid "day before" issues when converting to string if needed,
        // but for local storage ISO string or YYYY-MM-DD is fine.
        // Let's stick to local date string for simplicity in this MVP: YYYY-MM-DD
        const offset = newDate.getTimezoneOffset();
        const localDate = new Date(newDate.getTime() - (offset * 60 * 1000));
        const dateString = localDate.toISOString().split('T')[0];

        setSelectedDate(newDate);
        onSelect(dateString);
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease'
        }}>
            <div className="card" style={{
                width: '90%',
                maxWidth: '350px',
                background: '#1e293b',
                padding: '20px',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        left: '15px',
                        background: 'transparent',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer'
                    }}
                >
                    <X size={24} />
                </button>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '10px' }}>
                    <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <CalendarIcon size={18} color="var(--primary)" />
                        מתי הבדיקה?
                    </h3>
                </div>

                {/* Month Nav */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 10px' }}>
                    <button onClick={handlePrevMonth} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><ChevronRight /></button>
                    <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{monthNames[month]} {year}</span>
                    <button onClick={handleNextMonth} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><ChevronLeft /></button>
                </div>

                {/* Days Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', textAlign: 'center', fontSize: '0.9rem' }}>
                    {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map(d => (
                        <div key={d} style={{ color: '#64748b', paddingBottom: '10px', fontSize: '0.8rem' }}>{d}</div>
                    ))}

                    {/* Empty slots */}
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}

                    {/* Days */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const isSelected = selectedDate &&
                            selectedDate.getDate() === day &&
                            selectedDate.getMonth() === month &&
                            selectedDate.getFullYear() === year;

                        const isToday = new Date().getDate() === day &&
                            new Date().getMonth() === month &&
                            new Date().getFullYear() === year;

                        return (
                            <button
                                key={day}
                                onClick={() => handleDayClick(day)}
                                style={{
                                    height: '40px',
                                    borderRadius: '50%',
                                    border: isToday ? '1px solid var(--primary)' : 'none',
                                    background: isSelected ? 'var(--primary)' : 'transparent',
                                    color: isSelected ? 'white' : 'var(--text-main)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: isSelected || isToday ? 700 : 400
                                }}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>

                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default DateModal;
