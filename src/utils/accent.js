// Accent-color helpers for the glass cards (tasks, exams).

export const hexToRgb = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const rgba = (hex, a) => `rgba(${hexToRgb(hex).join(',')},${a})`;

// CSS custom properties consumed by .abl-task-card / .abl-exam and friends.
export const accentVars = (accent) => ({
    '--accent': accent,
    '--accent-soft': rgba(accent, 0.2),
    '--accent-faint': rgba(accent, 0.07),
    '--accent-line': rgba(accent, 0.3),
    '--accent-glow': rgba(accent, 0.45),
});
