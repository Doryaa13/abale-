import { useEffect, useRef, useState } from 'react';
import { CELLS, COMB_CENTER, TOTAL_WEEKS } from './combLayout';

// ── Week cells — the 3D hero on the home screen ────────────────────────────────
// A honeycomb of 40 hex cells, one per pregnancy week, charging like a battery:
// bottom row first, right to left. Weeks behind you glow with energy (cyan →
// blue → violet), weeks ahead are dark smoked glass with machined rims, and the
// current week is the white-hot cell that breathes. On load the comb charges up
// to today; it tilts toward the pointer, and a tap sends a shock wave across it.
//
// The whole comb is one fragment shader on a tilted plane, so it stays crisp at
// any size and costs one draw call. three.js is loaded lazily (its own chunk).
// Rendering pauses whenever the hero is off-screen or the app is in the
// background. If WebGL isn't available, `fallback` is rendered instead.

const hex = (h) => [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255];
const vec3 = (c) => `vec3(${c.map((v) => v.toFixed(4)).join(', ')})`;
const CYAN = hex(0x00e5ff);
const BLUE = hex(0x3b82f6);
const VIOLET = hex(0xa78bfa);
const HOT = hex(0xe8fdff);

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const FOV = 35;
const CAM_Z = 9;
const VISIBLE = 2 * CAM_Z * Math.tan((FOV / 2) * Math.PI / 180); // world units across the canvas
const PLANE = 5.86; // plane size in world units
const SPAN = 7.6;   // grid units across the plane

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const FRAG = /* glsl */ `
uniform float uTime;
uniform float uDisplayed;   // animated fill, in weeks
uniform float uCurrent;     // current week (1-based), 0 = none
uniform float uCurOn;       // 0..1 once the fill reached the current week
uniform vec2 uCurAt;        // current cell center (grid units)
uniform float uPulse;       // breathing of the current cell, 0..1
uniform float uWave;        // tap shock-wave radius (grid units)
uniform float uWaveOn;
uniform vec2 uWaveAt;
uniform float uAA;          // one pixel, in grid units
varying vec2 vUv;

const vec2 LATTICE = vec2(1.0, 1.7320508);
const vec2 CENTER = vec2(${COMB_CENTER[0].toFixed(4)}, ${COMB_CENTER[1].toFixed(4)});

// 0 at the cell center → 0.5 on its edge (pointy-top hex, 1 unit flat-to-flat)
float hexDist(vec2 p) {
  p = abs(p);
  return max(dot(p, vec2(0.5, 0.8660254)), p.x);
}

// Week (1..40) of the cell centered at id, or 0 outside the comb. Mirrors combLayout.js.
float weekAt(vec2 id) {
  float row = floor(id.y / 0.8660254 + 0.5);
  float col = floor(id.x - mod(row, 2.0) * 0.5 + 0.5);
  if (row < 0.0 || row > 6.0 || col < 0.0 || col > 5.0) return 0.0;
  if (row > 5.5) {
    if (col < 0.5 || col > 4.5) return 0.0;
    return 37.0 + (4.0 - col);
  }
  return row * 6.0 + (5.0 - col) + 1.0;
}

void main() {
  vec2 p = (vUv - 0.5) * ${SPAN.toFixed(2)} + CENTER;

  // nearest cell center on the hex lattice
  vec2 h = LATTICE * 0.5;
  vec2 a = mod(p, LATTICE) - h;
  vec2 b = mod(p - h, LATTICE) - h;
  vec2 gv = dot(a, a) < dot(b, b) ? a : b;
  vec2 id = p - gv;
  float wk = weekAt(id);
  float d = hexDist(gv);

  vec3 col = vec3(0.0);
  float alpha = 0.0;

  // Soft light spilling from the current cell onto its neighbours
  float pulse = uPulse;
  vec2 toCur = p - uCurAt;
  vec2 edge = smoothstep(0.0, 0.1, vUv) * smoothstep(1.0, 0.9, vUv);  // never clip at the plane's border
  vec3 spill = ${vec3(CYAN)} * exp(-dot(toCur, toCur) * 1.5) * (0.16 + 0.14 * pulse) * uCurOn * edge.x * edge.y;

  float wave = uWaveOn * exp(-pow((length(p - uWaveAt) - uWave) / 0.45, 2.0));

  if (wk > 0.0) {
    const float EDGE = 0.445;                       // leaves a thin seam between cells
    float body = 1.0 - smoothstep(EDGE - uAA, EDGE, d);
    float rim = smoothstep(EDGE - 0.07, EDGE - 0.035, d) * body;
    float bevel = smoothstep(0.30, EDGE, d) * body;
    float light = dot(normalize(gv + 1e-5), vec2(-0.45, 0.89));  // key light from top-left

    // How full this cell is: it charges from the bottom like a liquid level
    float k = clamp(uDisplayed - (wk - 1.0), 0.0, 1.0);
    float level = mix(-0.62, 0.62, k);
    float filled = k > 0.001 ? smoothstep(level + uAA, level - uAA, gv.y) : 0.0;
    float isCur = step(abs(wk - uCurrent), 0.1) * uCurOn;
    float charging = k * (1.0 - k) * 4.0;             // the cell being filled right now

    float t = (wk - 1.0) / ${(TOTAL_WEEKS - 1).toFixed(1)};
    vec3 energy = t < 0.5 ? mix(${vec3(CYAN)}, ${vec3(BLUE)}, t * 2.0)
                          : mix(${vec3(BLUE)}, ${vec3(VIOLET)}, (t - 0.5) * 2.0);

    // Smoked glass + machined rim (empty)
    float sheen = 0.5 + 0.5 * gv.y / 0.58;
    vec3 glass = vec3(0.035, 0.055, 0.08) + vec3(0.03, 0.045, 0.06) * sheen;
    glass += vec3(0.5, 0.62, 0.75) * bevel * max(light, 0.0) * 0.16;
    vec3 glassRim = vec3(0.24, 0.32, 0.42) * (0.55 + 0.45 * light);

    // Energy (filled): brighter at the bottom, slow plasma drifting inside
    float n = sin(p.x * 2.9 + uTime * 0.8) * sin(p.y * 2.3 - uTime * 0.6)
            + 0.6 * sin((p.x - p.y) * 1.9 + uTime * 0.45);
    float plasma = 0.78 + 0.16 * n;
    float grad = 1.05 - 0.4 * (gv.y / 0.58 * 0.5 + 0.5);
    // dim the middle a little so the week number stays readable on top
    float c = length((p - CENTER) * vec2(1.0, 1.25));
    float calm = mix(0.42, 1.0, smoothstep(0.8, 2.5, c));
    vec3 lit = energy * (0.52 * plasma * grad) * calm;
    lit += energy * smoothstep(0.2, EDGE, d) * 0.45 * calm;          // inner edge glow
    lit += vec3(1.0) * bevel * max(light, 0.0) * 0.12;
    vec3 litRim = mix(energy, vec3(1.0), 0.35) * (0.8 + 0.3 * light);

    // Current week: white-hot and breathing
    vec3 hot = mix(energy, ${vec3(HOT)}, 0.55 + 0.25 * pulse);
    lit = mix(lit, hot * (0.75 + 0.35 * pulse) * mix(0.75, 1.0, calm) + hot * smoothstep(0.15, EDGE, d) * 0.5, isCur);
    litRim = mix(litRim, vec3(1.0), isCur);

    lit += energy * charging * 0.8;
    // the current cell's core: an inner hex ring that breathes
    float core = smoothstep(0.035, 0.0, abs(d - (0.24 + 0.03 * pulse))) * isCur;
    lit += vec3(1.0) * core * 0.6;

    vec3 inner = mix(glass, lit, filled);
    vec3 rimC = mix(glassRim, litRim, max(filled, step(0.999, k)));
    inner = mix(inner, rimC, rim);
    inner += ${vec3(CYAN)} * wave * (0.25 + rim * 0.9);

    // light leaking through the seams around charged cells
    float seam = (1.0 - body) * step(0.999, k) * smoothstep(0.5, EDGE, d);
    col = inner * body + energy * seam * 0.35 * calm;
    alpha = body * mix(0.72, 0.96, filled);
  }

  // Premultiplied output: spill/wave light is added on top without darkening.
  gl_FragColor = vec4(col + spill * (1.0 - alpha * 0.6), alpha);
}`;

function buildScene(THREE, mount, weekRef, apiRef, onReady, onFail) {
    const {
        WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, PlaneGeometry,
        ShaderMaterial, Vector2,
        CustomBlending, AddEquation, OneFactor, OneMinusSrcAlphaFactor,
    } = THREE;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let renderer;
    try {
        renderer = new WebGLRenderer({ antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: 'low-power' });
    } catch {
        onFail();
        return () => {};
    }
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.touchAction = 'pan-y';
    mount.appendChild(canvas);

    const scene = new Scene();
    const camera = new PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.set(0, 0, CAM_Z);

    const tilt = new Group();
    scene.add(tilt);

    const uniforms = {
        uTime: { value: 0 },
        uDisplayed: { value: 0 },
        uCurrent: { value: 0 },
        uCurOn: { value: 0 },
        uCurAt: { value: new Vector2() },
        uPulse: { value: 0 },
        uWave: { value: 0 },
        uWaveOn: { value: 0 },
        uWaveAt: { value: new Vector2(...COMB_CENTER) },
        uAA: { value: 0.02 },
    };
    const material = new ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: CustomBlending,
        blendEquation: AddEquation,
        blendSrc: OneFactor,
        blendDst: OneMinusSrcAlphaFactor,
        blendSrcAlpha: OneFactor,
        blendDstAlpha: OneMinusSrcAlphaFactor,
    });
    const comb = new Mesh(new PlaneGeometry(PLANE, PLANE), material);
    tilt.add(comb);

    // ── State
    let t = 0;
    let last = performance.now();
    let displayed = reduced ? weekRef.current || 0 : 0;
    let fillFrom = displayed;
    let fillTo = weekRef.current || 0;
    let fillStart = performance.now() + 300;
    let fillDur = 1400 + fillTo * 22;
    let curX = 0, curY = 0, targetX = 0, targetY = 0;
    let waveStart = -1e9;

    apiRef.current = {
        setWeek(w) {
            fillFrom = displayed;
            fillTo = w || 0;
            fillStart = performance.now();
            fillDur = 600 + Math.abs(fillTo - fillFrom) * 30;
            if (!running) renderFrame(0);
        },
    };

    const renderFrame = (dt) => {
        t += dt;
        const now = performance.now();
        const k = clamp01((now - fillStart) / fillDur);
        displayed = reduced ? fillTo : lerp(fillFrom, fillTo, easeOutCubic(k));

        const total = Math.min(fillTo, TOTAL_WEEKS);
        const shown = Math.min(displayed, TOTAL_WEEKS);
        const cell = CELLS[Math.max(total, 1) - 1];
        uniforms.uTime.value = t;
        uniforms.uDisplayed.value = shown;
        uniforms.uCurrent.value = total;
        uniforms.uCurOn.value = total > 0 ? clamp01((shown - (total - 1)) / 0.8) : 0;
        uniforms.uCurAt.value.set(cell.x, cell.y);
        uniforms.uPulse.value = reduced ? 0.5 : 0.5 + 0.5 * Math.sin(t * 2.4);

        const wk = (now - waveStart) / 1100;
        uniforms.uWave.value = easeOutCubic(clamp01(wk)) * 6.5;
        uniforms.uWaveOn.value = wk >= 0 && wk < 1 ? 1 - wk : 0;

        curX = lerp(curX, targetX, 0.06);
        curY = lerp(curY, targetY, 0.06);
        const sway = reduced ? 0 : 1;
        tilt.rotation.x = -0.32 + curY * 0.16 + Math.sin(t * 0.3) * 0.025 * sway;
        tilt.rotation.y = curX * 0.28 + Math.sin(t * 0.23) * 0.05 * sway;

        renderer.render(scene, camera);
    };

    // ── Loop control: only run while visible on screen and app in foreground
    let raf = 0;
    let running = false;
    let onScreen = true;
    const tick = () => {
        if (!running) return;
        const now = performance.now();
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        renderFrame(dt);
        raf = requestAnimationFrame(tick);
    };
    const shouldRun = () => !reduced && onScreen && document.visibilityState === 'visible';
    const sync = () => {
        if (shouldRun() && !running) {
            running = true;
            last = performance.now();
            raf = requestAnimationFrame(tick);
        } else if (!shouldRun() && running) {
            running = false;
            cancelAnimationFrame(raf);
        }
    };

    const resize = () => {
        const w = mount.clientWidth;
        if (!w) return;
        renderer.setSize(w, w);
        // one device pixel, expressed in grid units (for anti-aliased edges)
        uniforms.uAA.value = (SPAN / (PLANE / VISIBLE)) / (w * dpr) * 1.4;
        if (!running) renderFrame(0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    const io = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; sync(); });
    io.observe(mount);
    document.addEventListener('visibilitychange', sync);

    // ── Interaction
    const onMove = (e) => {
        const r = mount.getBoundingClientRect();
        targetX = ((e.clientX - r.left) / r.width) * 2 - 1;
        targetY = ((e.clientY - r.top) / r.height) * 2 - 1;
    };
    const onLeave = () => { targetX = 0; targetY = 0; };
    const onDown = (e) => {
        // shock wave from where the comb was touched (approximate, ignores the tilt)
        const r = mount.getBoundingClientRect();
        const gx = ((e.clientX - r.left) / r.width - 0.5) * VISIBLE / PLANE * SPAN + COMB_CENTER[0];
        const gy = (0.5 - (e.clientY - r.top) / r.height) * VISIBLE / PLANE * SPAN + COMB_CENTER[1];
        uniforms.uWaveAt.value.set(gx, gy);
        waveStart = performance.now();
        if (!running) renderFrame(0);
    };
    mount.addEventListener('pointermove', onMove);
    mount.addEventListener('pointerleave', onLeave);
    mount.addEventListener('pointerdown', onDown);

    const onLost = (e) => { e.preventDefault(); onFail(); };
    canvas.addEventListener('webglcontextlost', onLost);

    renderFrame(0);
    onReady();
    sync();

    return () => {
        running = false;
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        document.removeEventListener('visibilitychange', sync);
        mount.removeEventListener('pointermove', onMove);
        mount.removeEventListener('pointerleave', onLeave);
        mount.removeEventListener('pointerdown', onDown);
        canvas.removeEventListener('webglcontextlost', onLost);
        comb.geometry.dispose();
        material.dispose();
        renderer.dispose();
        canvas.remove();
        apiRef.current = null;
    };
}

const hasWebGL = () => {
    try {
        const c = document.createElement('canvas');
        return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
        return false;
    }
};

const WeekCells = ({ week, fallback }) => {
    const mountRef = useRef(null);
    const weekRef = useRef(week);
    const apiRef = useRef(null);
    const [ready, setReady] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        weekRef.current = week;
        apiRef.current?.setWeek(week);
    }, [week]);

    useEffect(() => {
        if (!hasWebGL()) {
            setFailed(true);
            return;
        }
        let disposed = false;
        let cleanup = () => {};
        import('three')
            .then((THREE) => {
                if (disposed || !mountRef.current) return;
                cleanup = buildScene(THREE, mountRef.current, weekRef, apiRef,
                    () => setReady(true),
                    () => setFailed(true));
            })
            .catch(() => setFailed(true));
        return () => {
            disposed = true;
            cleanup();
        };
    }, []);

    if (failed) return fallback;

    return (
        <div
            ref={mountRef}
            aria-hidden="true"
            style={{
                position: 'absolute', inset: 0,
                opacity: ready ? 1 : 0,
                transform: ready ? 'scale(1)' : 'scale(0.94)',
                transition: 'opacity 0.9s ease, transform 1.1s cubic-bezier(0.2, 0.8, 0.2, 1)',
                cursor: 'pointer',
            }}
        />
    );
};

export default WeekCells;
