import { useEffect, useRef, useState } from 'react';

// ── "Life orb" — the 3D hero on the home screen ────────────────────────────────
// A slowly morphing glass orb wrapped in a ring of 40 beads (one per pregnancy
// week). Beads light up to the current week; the current one glows.
// It tilts toward the pointer and pulses on tap.
//
// three.js is loaded lazily (its own chunk) so it never slows the first paint.
// Rendering pauses whenever the orb is off-screen or the app is in the background.
// If WebGL isn't available, `fallback` is rendered instead.

const TOTAL_WEEKS = 40;

// Colors as sRGB 0..1 triplets, written straight to the shaders.
const hex = (h) => [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255];
const CYAN = hex(0x00e5ff);
const BLUE = hex(0x3b82f6);
const VIOLET = hex(0xa78bfa);
const SLATE = hex(0x475569);
const HOT = hex(0xe8fdff);
const PINK = hex(0xf472b6);

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const progressColor = (t) => (t < 0.5 ? mix3(CYAN, BLUE, t * 2) : mix3(BLUE, VIOLET, (t - 0.5) * 2));
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

// Ashima 3D simplex noise (MIT).
const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x - floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}`;

const ORB_VERT = /* glsl */ `
uniform float uTime;
uniform float uPulse;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
${NOISE}
void main() {
  float n = snoise(normal * 1.4 + vec3(0.0, uTime * 0.22, uTime * 0.12));
  vNoise = n;
  vec3 p = position + normal * (n * 0.065 + uPulse * 0.05);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vView = normalize(-mv.xyz);
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * mv;
}`;

const ORB_FRAG = /* glsl */ `
uniform float uTime;
uniform float uPulse;
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uC;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
void main() {
  float fres = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vView)), 0.0, 1.0), 2.8);
  float band = 0.5 + 0.5 * sin(vNoise * 5.0 + uTime * 0.7);
  vec3 col = mix(uA, uB, band);
  col = mix(col, uC, smoothstep(0.55, 1.0, fres) * 0.45);
  float glow = fres * (0.95 + uPulse * 0.6);
  vec3 c = col * glow;
  gl_FragColor = vec4(c, max(max(c.r, c.g), c.b));
}`;

const POINTS_VERT = /* glsl */ `
attribute float aSize;
attribute float aAlpha;
attribute vec3 aColor;
uniform float uDpr;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vColor = aColor;
  vAlpha = aAlpha;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * uDpr * (9.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}`;

const POINTS_FRAG = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float core = 1.0 - smoothstep(0.12, 0.2, d);
  float glow = exp(-d * d * 18.0);
  float a = (core + glow * 0.75) * vAlpha;
  vec3 c = vColor * a + core * 0.25 * vAlpha;
  gl_FragColor = vec4(c, max(max(c.r, c.g), c.b));
}`;

const HALO_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

// Soft ring of light hugging the orb's edge + a faint fill — keeps the center dark
// so the week number on top stays readable.
const HALO_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;
varying vec2 vUv;
void main() {
  float d = distance(vUv, vec2(0.5));
  const float EDGE = 0.205; // orb silhouette radius in uv space (1.55 / 7.4)
  float outer = d > EDGE ? exp(-(d - EDGE) / 0.045) : exp(-(EDGE - d) / 0.018);
  float fill = (1.0 - smoothstep(0.0, 0.5, d)) * 0.03;
  float g = outer * 0.42 * uIntensity + fill;
  vec3 c = uColor * g;
  gl_FragColor = vec4(c, max(max(c.r, c.g), c.b));
}`;

function buildScene(THREE, mount, weekRef, apiRef, onReady, onFail) {
    const {
        WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, Points, Line, LineLoop,
        SphereGeometry, PlaneGeometry, BufferGeometry, BufferAttribute,
        ShaderMaterial, LineBasicMaterial, AdditiveBlending, Vector3,
        CustomBlending, AddEquation, OneFactor,
    } = THREE;

    // Pure light-adding blend. The shaders write alpha = brightness, so dark areas
    // stay see-through and the canvas melts into the page behind it.
    const additive = {
        transparent: true,
        depthWrite: false,
        blending: CustomBlending,
        blendEquation: AddEquation,
        blendSrc: OneFactor,
        blendDst: OneFactor,
        blendSrcAlpha: OneFactor,
        blendDstAlpha: OneFactor,
    };

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let renderer;
    try {
        renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
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
    const camera = new PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    const root = new Group();
    scene.add(root);

    // ── Halo (in scene, not root, so it always faces the camera)
    const haloMat = new ShaderMaterial({
        vertexShader: HALO_VERT,
        fragmentShader: HALO_FRAG,
        uniforms: { uColor: { value: new Vector3(...CYAN) }, uIntensity: { value: 1 } },
        ...additive,
    });
    const halo = new Mesh(new PlaneGeometry(7.4, 7.4), haloMat);
    scene.add(halo);

    // ── Orb
    const orbMat = new ShaderMaterial({
        vertexShader: ORB_VERT,
        fragmentShader: ORB_FRAG,
        uniforms: {
            uTime: { value: 0 },
            uPulse: { value: 0 },
            uA: { value: new Vector3(...CYAN) },
            uB: { value: new Vector3(...VIOLET) },
            uC: { value: new Vector3(...PINK) },
        },
        ...additive,
    });
    const orb = new Mesh(new SphereGeometry(1.55, 96, 96), orbMat);
    root.add(orb);

    // Shared point-sprite material factory
    const pointsMaterial = () => new ShaderMaterial({
        vertexShader: POINTS_VERT,
        fragmentShader: POINTS_FRAG,
        uniforms: { uDpr: { value: dpr } },
        ...additive,
    });
    const makePoints = (count, fill) => {
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const size = new Float32Array(count);
        const alpha = new Float32Array(count);
        for (let i = 0; i < count; i++) fill(i, pos, col, size, alpha);
        const geo = new BufferGeometry();
        geo.setAttribute('position', new BufferAttribute(pos, 3));
        geo.setAttribute('aColor', new BufferAttribute(col, 3));
        geo.setAttribute('aSize', new BufferAttribute(size, 1));
        geo.setAttribute('aAlpha', new BufferAttribute(alpha, 1));
        return new Points(geo, pointsMaterial());
    };
    const palette = [CYAN, BLUE, VIOLET, HOT];

    // ── Nebula inside the orb
    const nebula = makePoints(90, (i, pos, col, size, alpha) => {
        const r = 1.25 * Math.cbrt(Math.random());
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        pos.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], i * 3);
        col.set(palette[i % 3], i * 3);
        size[i] = 2 + Math.random() * 3;
        alpha[i] = 0.12 + Math.random() * 0.18;
    });
    root.add(nebula);

    // ── Dust around everything
    const dust = makePoints(220, (i, pos, col, size, alpha) => {
        const r = 2.1 + Math.random() * 2.2;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        pos.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) * 0.8, r * Math.sin(ph) * Math.sin(th)], i * 3);
        col.set(palette[i % palette.length], i * 3);
        size[i] = 1.2 + Math.random() * 2.4;
        alpha[i] = 0.12 + Math.random() * 0.4;
    });
    scene.add(dust);

    // ── Week ring: tilted group → spinning group → track, progress arc, beads
    const RING_R = 2.45;
    const START = Math.PI / 2;
    const ringTilt = new Group();
    ringTilt.rotation.set(-1.0, 0, 0.28);
    root.add(ringTilt);
    const spinner = new Group();
    ringTilt.add(spinner);

    const circlePoints = (segments, sweep) => {
        const arr = new Float32Array((segments + 1) * 3);
        for (let k = 0; k <= segments; k++) {
            const a = START - (k / segments) * sweep;
            arr.set([Math.cos(a) * RING_R, Math.sin(a) * RING_R, 0], k * 3);
        }
        return arr;
    };

    const trackGeo = new BufferGeometry();
    trackGeo.setAttribute('position', new BufferAttribute(circlePoints(160, Math.PI * 2), 3));
    const track = new LineLoop(trackGeo, new LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.28 }));
    spinner.add(track);

    const ARC_SEGMENTS = TOTAL_WEEKS * 10;
    const arcGeo = new BufferGeometry();
    arcGeo.setAttribute('position', new BufferAttribute(circlePoints(ARC_SEGMENTS, Math.PI * 2), 3));
    const arc = new Line(arcGeo, new LineBasicMaterial({
        color: 0x00e5ff, transparent: true, opacity: 0.75, blending: AdditiveBlending, depthWrite: false,
    }));
    spinner.add(arc);

    const beads = makePoints(TOTAL_WEEKS, (i, pos) => {
        const a = START - (i / TOTAL_WEEKS) * Math.PI * 2;
        pos.set([Math.cos(a) * RING_R, Math.sin(a) * RING_R, 0], i * 3);
    });
    spinner.add(beads);
    const beadCol = beads.geometry.getAttribute('aColor');
    const beadSize = beads.geometry.getAttribute('aSize');
    const beadAlpha = beads.geometry.getAttribute('aAlpha');

    // ── State
    let t = 0;
    let last = performance.now();
    let displayed = reduced ? weekRef.current || 0 : 0;
    let fillFrom = displayed;
    let fillTo = weekRef.current || 0;
    let fillStart = performance.now() + 250;
    let fillDur = 1900;
    let curX = 0, curY = 0, targetX = 0, targetY = 0;
    let burst = 0;
    let spinAngle = 0;

    apiRef.current = {
        setWeek(w) {
            fillFrom = displayed;
            fillTo = w || 0;
            fillStart = performance.now();
            fillDur = 700 + Math.abs(fillTo - fillFrom) * 35;
            if (!running) renderFrame(0);
        },
    };

    const updateBeads = () => {
        const target = fillTo;
        for (let i = 0; i < TOTAL_WEEKS; i++) {
            const lit = clamp01(displayed - i);
            const isCurrent = i + 1 === target && displayed >= target - 0.001;
            const c = isCurrent ? HOT : mix3(SLATE, progressColor(i / (TOTAL_WEEKS - 1)), lit);
            beadCol.setXYZ(i, c[0], c[1], c[2]);
            beadSize.setX(i, isCurrent ? 18 + burst * 8 : lerp(5, 10, lit) + burst * 3 * lit);
            beadAlpha.setX(i, isCurrent ? 1 : lerp(0.45, 1, lit));
        }
        beadCol.needsUpdate = true;
        beadSize.needsUpdate = true;
        beadAlpha.needsUpdate = true;
        const arcCount = displayed >= 1 ? Math.round((displayed - 1) * 10) + 1 : 0;
        arcGeo.setDrawRange(0, arcCount);
    };

    const renderFrame = (dt) => {
        t += dt;
        const now = performance.now();
        const k = clamp01((now - fillStart) / fillDur);
        displayed = reduced ? fillTo : lerp(fillFrom, fillTo, easeOutCubic(k));

        // The only "pulse" left is the one the user triggers by tapping the orb.
        burst = Math.max(0, burst - dt * 1.4);
        const b = easeOutCubic(burst);

        orbMat.uniforms.uTime.value = t;
        orbMat.uniforms.uPulse.value = b * 1.5;
        orb.scale.setScalar(1 + b * 0.12);
        haloMat.uniforms.uIntensity.value = 1 + b * 1.2;

        curX = lerp(curX, targetX, 0.06);
        curY = lerp(curY, targetY, 0.06);
        root.rotation.y = curX * 0.45 + Math.sin(t * 0.35) * 0.12;
        root.rotation.x = curY * 0.3 + Math.sin(t * 0.27) * 0.05;

        spinAngle += dt * (0.14 + b * 2.2);
        spinner.rotation.z = spinAngle;
        nebula.rotation.y = -t * 0.18;
        nebula.rotation.x = t * 0.07;
        dust.rotation.y = t * 0.035;

        updateBeads();
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
    const onDown = () => {
        burst = 1;
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
        scene.traverse((obj) => {
            obj.geometry?.dispose();
            obj.material?.dispose();
        });
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

const LifeOrb = ({ week, fallback }) => {
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
                transform: ready ? 'scale(1)' : 'scale(0.92)',
                transition: 'opacity 1s ease, transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                cursor: 'pointer',
            }}
        />
    );
};

export default LifeOrb;
