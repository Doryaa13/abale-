import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

// Date picker — a bottom sheet with a month grid.
// API unchanged: onSelect receives a local "YYYY-MM-DD" string.

const MONTH_NAMES = [
    "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
    "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
];
const DAY_NAMES = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

// "YYYY-MM-DD" → local Date (no UTC shift). Falls back to Date parsing for other formats.
const parseDate = (value) => {
    if (!value) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    const d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(value);
    return isNaN(d) ? null : d;
};
const sameDay = (a, b) => a && b
    && a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

const DateModal = ({ isOpen, onClose, onSelect, initialDate }) => {
    const [view, setView] = useState(() => {
        const d = parseDate(initialDate) || new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1);
    });
    const [selectedDate, setSelectedDate] = useState(() => parseDate(initialDate));
    const [direction, setDirection] = useState(0); // -1 = prev, 1 = next (drives the slide)
    const committing = useRef(false);

    // The picker stays mounted between exams — re-sync every time it opens.
    useEffect(() => {
        if (!isOpen) return;
        const d = parseDate(initialDate);
        const base = d || new Date();
        setSelectedDate(d);
        setView(new Date(base.getFullYear(), base.getMonth(), 1));
        setDirection(0);
        committing.current = false;
    }, [isOpen, initialDate]);

    if (!isOpen) return null;

    const year = view.getFullYear();
    const month = view.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const goMonth = (delta) => {
        setDirection(delta);
        setView(new Date(year, month + delta, 1));
    };

    const handleDayClick = (day) => {
        if (committing.current) return;
        committing.current = true;
        const newDate = new Date(year, month, day);
        // Local date string: YYYY-MM-DD
        const offset = newDate.getTimezoneOffset();
        const localDate = new Date(newDate.getTime() - (offset * 60 * 1000));
        const dateString = localDate.toISOString().split('T')[0];

        setSelectedDate(newDate);
        // A short beat so the selection animation is seen before the sheet closes.
        setTimeout(() => {
            onSelect(dateString);
            onClose();
        }, 280);
    };

    const selectedLabel = selectedDate
        ? selectedDate.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })
        : null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
            {/* Backdrop */}
            <div
                className="abl-backdrop"
                onClick={onClose}
                style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(3,7,14,0.72)',
                    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                }}
            />

            {/* Sheet */}
            <div className="abl-sheet" style={{
                position: 'absolute', left: 0, right: 0, bottom: 0,
                maxWidth: '480px', margin: '0 auto',
                padding: '10px 18px calc(20px + env(safe-area-inset-bottom))',
                borderRadius: '30px 30px 0 0',
                background: 'radial-gradient(120% 60% at 50% 0%, rgba(34,211,238,0.12), transparent 60%), linear-gradient(180deg, rgba(28,41,58,0.98), rgba(12,18,28,0.99))',
                borderTop: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 -24px 60px -20px rgba(0,0,0,0.9)',
            }}>
                {/* Grabber */}
                <div style={{ width: '42px', height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.18)', margin: '0 auto 16px' }} />

                {/* Title row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'white', fontFamily: 'inherit' }}>
                            מתי הבדיקה?
                        </h3>
                        {selectedLabel && (
                            <div style={{ marginTop: '4px', fontSize: '13px', fontWeight: 600, color: '#67e8f9' }}>
                                {selectedLabel}
                            </div>
                        )}
                    </div>
                    <button onClick={onClose} aria-label="סגירה" className="abl-cal-nav" style={{ width: '36px', height: '36px', borderRadius: '12px' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Month navigation */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <button className="abl-cal-nav" onClick={() => goMonth(-1)} aria-label="החודש הקודם">
                        <ChevronRight size={20} />
                    </button>
                    <div key={`${year}-${month}`} className={direction > 0 ? 'abl-cal-anim-next' : direction < 0 ? 'abl-cal-anim-prev' : ''}
                        style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', letterSpacing: '-0.01em' }}>{MONTH_NAMES[month]}</span>
                        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.05rem', fontWeight: 600, color: '#67e8f9' }}>{year}</span>
                    </div>
                    <button className="abl-cal-nav" onClick={() => goMonth(1)} aria-label="החודש הבא">
                        <ChevronLeft size={20} />
                    </button>
                </div>

                {/* Weekday names */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '6px' }}>
                    {DAY_NAMES.map((d, i) => (
                        <div key={d} style={{
                            textAlign: 'center', fontSize: '12px', fontWeight: 700, padding: '6px 0',
                            color: i === 6 ? 'rgba(167,139,250,0.85)' : '#64748b',
                        }}>{d}</div>
                    ))}
                </div>

                {/* Days grid */}
                <div
                    key={`grid-${year}-${month}`}
                    className={direction > 0 ? 'abl-cal-anim-next' : direction < 0 ? 'abl-cal-anim-prev' : ''}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}
                >
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const date = new Date(year, month, day);
                        return (
                            <button
                                key={day}
                                className="abl-cal-day"
                                onClick={() => handleDayClick(day)}
                                aria-pressed={sameDay(date, selectedDate)}
                                data-today={sameDay(date, today)}
                                data-past={date < todayStart}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DateModal;
