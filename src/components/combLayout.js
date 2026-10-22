// ── Week cells layout — the honeycomb of 40 weeks on the home hero ─────────────
// Pointy-top hexes, 1 unit flat-to-flat. 7 rows of 6 (odd rows shifted half a
// cell); the top row drops its two corners, so 6×6 + 4 = 40 cells.
// Cells charge bottom → top, and right → left inside a row (RTL).
// WeekCells' shader computes the same mapping; keep the two in sync.

export const TOTAL_WEEKS = 40;
export const ROW_H = Math.sqrt(3) / 2;            // vertical distance between rows
export const HEX_R = 1 / Math.sqrt(3);            // circumradius (center → corner)
export const COMB_CENTER = [2.75, 3 * ROW_H];     // middle of the comb, in grid units

// [{ week, x, y }] with y pointing up
export const CELLS = (() => {
    const cells = [];
    for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 6; col++) {
            if (row === 6 && (col === 0 || col === 5)) continue;
            const week = row < 6 ? row * 6 + (5 - col) + 1 : 37 + (4 - col);
            cells.push({ week, x: col + (row % 2) * 0.5, y: row * ROW_H });
        }
    }
    return cells.sort((a, b) => a.week - b.week);
})();
