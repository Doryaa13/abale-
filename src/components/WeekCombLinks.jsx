import React from 'react';
import { Link } from 'react-router-dom';
import { CELLS, COMB_CENTER, HEX_R } from './combLayout';

// The honeycomb of 40 weeks as navigation: every cell links to that week's page.
// Same layout as the home-screen hero (week 1 bottom-right, week 40 at the top).
// Weeks without content (1–2) stay as dark, inactive cells.

const HEX_POINTS = Array.from({ length: 6 }, (_, i) => {
    const a = Math.PI / 6 + (i * Math.PI) / 3;
    return [Math.cos(a) * HEX_R * 0.9, Math.sin(a) * HEX_R * 0.9];
});

const colorFor = (week) => {
    const t = (week - 1) / 39;
    if (t < 0.5) return t < 0.25 ? '#00e5ff' : '#22d3ee';
    return t < 0.75 ? '#3b82f6' : '#a78bfa';
};

const WeekCombLinks = ({ firstWeek = 3 }) => {
    const [cx, cy] = COMB_CENTER;
    return (
        <svg className="abl-pub-comb" viewBox="-3.45 -3.3 6.9 6.6" role="group" aria-label="בחירת שבוע בהיריון">
            {CELLS.map((cell) => {
                const x = cell.x - cx;
                const y = cy - cell.y;
                const points = HEX_POINTS.map(([px, py]) => `${(x + px).toFixed(3)},${(y + py).toFixed(3)}`).join(' ');
                if (cell.week < firstWeek) {
                    return <polygon key={cell.week} points={points} className="abl-pub-comb-off" />;
                }
                return (
                    <Link key={cell.week} to={`/weeks/${cell.week}`} className="abl-pub-comb-cell" style={{ '--c': colorFor(cell.week) }} aria-label={`שבוע ${cell.week}`}>
                        <polygon points={points} />
                        <text x={x} y={y} dy="0.12">{cell.week}</text>
                    </Link>
                );
            })}
        </svg>
    );
};

export default WeekCombLinks;
