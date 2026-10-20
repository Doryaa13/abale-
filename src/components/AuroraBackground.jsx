// Ambient page background: slowly drifting soft lights + a faint dot grid at the top.
// Render it as the first child of a `position: relative` page root; it clips itself,
// so the page root doesn't need overflow:hidden (which would break position:sticky).

const DEFAULT_BLOBS = [
    'rgba(0,229,255,0.17)',
    'rgba(139,92,246,0.15)',
    'rgba(244,114,182,0.10)',
];

const AuroraBackground = ({ blobs = DEFAULT_BLOBS }) => (
    <div className="abl-aurora" aria-hidden="true">
        <div className="abl-grid" />
        <span className="abl-blob" style={{
            top: '-140px', right: '-150px', width: '440px', height: '440px',
            background: `radial-gradient(circle, ${blobs[0]}, transparent 62%)`,
            animationDuration: '19s',
        }} />
        <span className="abl-blob" style={{
            top: '200px', left: '-190px', width: '470px', height: '470px',
            background: `radial-gradient(circle, ${blobs[1]}, transparent 62%)`,
            animationDuration: '24s', animationDelay: '-7s',
        }} />
        <span className="abl-blob" style={{
            top: '680px', right: '-170px', width: '430px', height: '430px',
            background: `radial-gradient(circle, ${blobs[2]}, transparent 62%)`,
            animationDuration: '28s', animationDelay: '-13s',
        }} />
    </div>
);

export default AuroraBackground;
