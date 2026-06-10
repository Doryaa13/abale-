import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Camera, Upload, Trash2, X, Download, Share2, Play, Loader } from 'lucide-react';

// ---- Confirm Modal ----
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
                    <button onClick={onCancel} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', fontSize: '0.95rem' }}>
                        ביטול
                    </button>
                    <button onClick={onConfirm} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: confirmColor, border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 'bold' }}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

const BellyGrowth = ({ currentWeek }) => {
    // Photos stored as { weekNumber: base64String }
    const [photos, setPhotos] = useState(() => {
        try {
            const saved = localStorage.getItem('abale_belly_photos');
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    });

    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraWeek, setCameraWeek] = useState(null);
    const [viewingWeek, setViewingWeek] = useState(null);
    const [generatingGif, setGeneratingGif] = useState(false);
    const [gifProgress, setGifProgress] = useState(0);
    const [gifBlob, setGifBlob] = useState(null);
    const [showGifPreview, setShowGifPreview] = useState(false);
    const [confirmState, setConfirmState] = useState({ open: false, week: null });
    const gifPreviewUrlRef = useRef(null);

    const fileInputRef = useRef(null);
    const uploadWeekRef = useRef(null);

    const photoCount = Object.keys(photos).length;

    // Save photos to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('abale_belly_photos', JSON.stringify(photos));
        } catch (e) {
            console.error('Storage full:', e);
            alert('הזיכרון מלא! נסה למחוק תמונות ישנות.');
        }
    }, [photos]);

    // Resize image to max width to save storage
    const resizeImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 600;
                    const scale = Math.min(1, MAX_WIDTH / img.width);
                    canvas.width = img.width * scale;
                    canvas.height = img.height * scale;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    // Handle file upload
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const base64 = await resizeImage(file);
        const week = uploadWeekRef.current;
        setPhotos(prev => ({ ...prev, [week]: base64 }));
        fileInputRef.current.value = '';
    };

    // Open upload dialog for a specific week
    const openUpload = (week) => {
        uploadWeekRef.current = week;
        fileInputRef.current.click();
    };

    // Delete photo for a week
    const deletePhoto = (week) => {
        setConfirmState({ open: true, week });
    };

    const confirmDeletePhoto = () => {
        const week = confirmState.week;
        setPhotos(prev => {
            const copy = { ...prev };
            delete copy[week];
            return copy;
        });
        setViewingWeek(null);
        setConfirmState({ open: false, week: null });
    };

    // ---- GIF Generation ----
    const generateGif = async () => {
        const sortedWeeks = Object.keys(photos).map(Number).sort((a, b) => a - b);
        if (sortedWeeks.length < 2) return;

        setGeneratingGif(true);
        setGifProgress(0);

        try {
            // Load gif.js from CDN dynamically
            const GIF = await loadGifJs();

            const gif = new GIF({
                workers: 2,
                quality: 10,
                width: 400,
                height: 400,
                workerScript: await getWorkerBlobUrl()
            });

            // Load all images as Image elements
            for (let i = 0; i < sortedWeeks.length; i++) {
                const week = sortedWeeks[i];
                const img = await loadImage(photos[week]);

                // Draw on canvas with week label
                const canvas = document.createElement('canvas');
                canvas.width = 400;
                canvas.height = 400;
                const ctx = canvas.getContext('2d');

                // Fill black background
                ctx.fillStyle = '#111921';
                ctx.fillRect(0, 0, 400, 400);

                // Draw image centered/covered
                const scale = Math.max(400 / img.width, 400 / img.height);
                const w = img.width * scale;
                const h = img.height * scale;
                ctx.drawImage(img, (400 - w) / 2, (400 - h) / 2, w, h);

                // Week label
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(0, 360, 400, 40);
                ctx.fillStyle = 'white';
                ctx.font = 'bold 18px Heebo, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(`שבוע ${week}`, 200, 386);

                gif.addFrame(canvas, { delay: 800 });
                setGifProgress(Math.round(((i + 1) / sortedWeeks.length) * 50));
            }

            gif.on('progress', (p) => {
                setGifProgress(50 + Math.round(p * 50));
            });

            gif.on('finished', (blob) => {
                // Revoke old preview URL if any
                if (gifPreviewUrlRef.current) {
                    URL.revokeObjectURL(gifPreviewUrlRef.current);
                    gifPreviewUrlRef.current = null;
                }
                setGifBlob(blob);
                setGeneratingGif(false);
                setShowGifPreview(true);
            });

            gif.render();
        } catch (err) {
            console.error('GIF generation failed:', err);
            setGeneratingGif(false);
            alert('שגיאה ביצירת ה-GIF. נסה שוב.');
        }
    };

    const loadImage = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    };

    const loadGifJs = () => {
        return new Promise((resolve, reject) => {
            if (window.GIF) { resolve(window.GIF); return; }
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js';
            script.onload = () => resolve(window.GIF);
            script.onerror = reject;
            document.head.appendChild(script);
        });
    };

    const getWorkerBlobUrl = async () => {
        const response = await fetch('https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js');
        const text = await response.text();
        const blob = new Blob([text], { type: 'application/javascript' });
        return URL.createObjectURL(blob);
    };

    const downloadGif = () => {
        if (!gifBlob) return;
        const url = URL.createObjectURL(gifBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'belly-growth.gif';
        a.click();
        URL.revokeObjectURL(url);
    };

    const shareGif = async () => {
        if (!gifBlob) return;
        const file = new File([gifBlob], 'belly-growth.gif', { type: 'image/gif' });
        if (navigator.share && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'מעקב בטן 🤰',
                    text: 'תראו איך הבטן גדלה!'
                });
            } catch (err) {
                if (err.name !== 'AbortError') downloadGif();
            }
        } else {
            downloadGif();
        }
    };

    // ---- Week Grid ----
    const weeks = Array.from({ length: 40 }, (_, i) => i + 1);

    return (
        <div style={{
            minHeight: '100dvh',
            background: 'var(--bg-core)',
            color: 'white',
            padding: '20px',
            paddingBottom: '40px'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link to="/" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                        <ArrowRight size={24} />
                    </Link>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            📸 מעקב בטן
                        </h2>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {photoCount}/40 תמונות • צלם כל שבוע באותה פוזה
                        </p>
                    </div>
                </div>

                {/* GIF Button */}
                <button
                    onClick={generateGif}
                    disabled={photoCount < 2 || generatingGif}
                    style={{
                        background: photoCount >= 2 ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'rgba(255,255,255,0.05)',
                        border: 'none',
                        color: photoCount >= 2 ? 'white' : '#64748b',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        cursor: photoCount >= 2 ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: photoCount >= 2 ? '0 4px 15px rgba(139, 92, 246, 0.3)' : 'none'
                    }}
                >
                    {generatingGif ? <Loader size={16} className="animate-spin" /> : <Play size={16} />}
                    {generatingGif ? `${gifProgress}%` : 'צור GIF'}
                </button>
            </div>

            {/* Progress Bar during generation */}
            {generatingGif && (
                <div style={{
                    width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)',
                    borderRadius: '2px', marginBottom: '20px', overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${gifProgress}%`, height: '100%',
                        background: 'linear-gradient(90deg, #8b5cf6, #6366f1)',
                        transition: 'width 0.3s', borderRadius: '2px'
                    }} />
                </div>
            )}

            {/* Photo Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px'
            }}>
                {weeks.map(week => {
                    const hasPhoto = !!photos[week];
                    const isCurrentWeek = week === currentWeek;

                    return (
                        <div
                            key={week}
                            onClick={() => {
                                if (hasPhoto) {
                                    setViewingWeek(week);
                                } else {
                                    // Show action choices
                                    setCameraWeek(week);
                                }
                            }}
                            style={{
                                aspectRatio: '3/4',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: isCurrentWeek
                                    ? '2px solid var(--primary)'
                                    : hasPhoto
                                        ? '1px solid rgba(255,255,255,0.15)'
                                        : '1px solid rgba(255,255,255,0.05)',
                                background: hasPhoto ? 'transparent' : 'rgba(255,255,255,0.03)',
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'all 0.2s',
                                boxShadow: isCurrentWeek ? '0 0 15px rgba(25, 127, 230, 0.3)' : 'none'
                            }}
                        >
                            {hasPhoto ? (
                                <img
                                    src={photos[week]}
                                    alt={`שבוע ${week}`}
                                    style={{
                                        width: '100%', height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '100%', height: '100%',
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    gap: '4px'
                                }}>
                                    <Camera size={16} color={isCurrentWeek ? 'var(--primary)' : '#475569'} />
                                </div>
                            )}

                            {/* Week label */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0, left: 0, right: 0,
                                background: hasPhoto
                                    ? 'linear-gradient(transparent, rgba(0,0,0,0.7))'
                                    : 'transparent',
                                padding: '4px',
                                textAlign: 'center',
                                fontSize: '0.7rem',
                                fontWeight: isCurrentWeek ? 'bold' : 'normal',
                                color: isCurrentWeek ? 'var(--primary)' : (hasPhoto ? 'white' : '#475569')
                            }}>
                                {week}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Hidden file input */}
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileUpload}
                style={{ display: 'none' }}
            />

            {/* ---- Action Sheet: Choose Camera or Upload ---- */}
            {cameraWeek && !cameraOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
                    <div onClick={() => setCameraWeek(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        background: '#1a2632',
                        borderRadius: '24px 24px 0 0',
                        padding: '24px', paddingBottom: '40px',
                        zIndex: 201
                    }}>
                        <div style={{ width: '40px', height: '4px', background: '#334155', borderRadius: '2px', margin: '0 auto 20px' }} />
                        <h3 style={{ margin: '0 0 20px', textAlign: 'center' }}>שבוע {cameraWeek}</h3>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setCameraOpen(true)}
                                style={{
                                    flex: 1, padding: '16px', borderRadius: '16px',
                                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                    border: 'none', color: 'white', fontSize: '1rem', fontWeight: 'bold',
                                    cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', gap: '8px',
                                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                                }}
                            >
                                <Camera size={28} />
                                צלם תמונה
                            </button>
                            <button
                                onClick={() => { openUpload(cameraWeek); setCameraWeek(null); }}
                                style={{
                                    flex: 1, padding: '16px', borderRadius: '16px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white', fontSize: '1rem', fontWeight: 'bold',
                                    cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', gap: '8px'
                                }}
                            >
                                <Upload size={28} />
                                העלה מגלריה
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ---- Camera Mode ---- */}
            {cameraOpen && (
                <CameraOverlay
                    week={cameraWeek}
                    onCapture={(base64) => {
                        setPhotos(prev => ({ ...prev, [cameraWeek]: base64 }));
                        setCameraOpen(false);
                        setCameraWeek(null);
                    }}
                    onClose={() => { setCameraOpen(false); setCameraWeek(null); }}
                />
            )}

            {/* ---- Photo Viewer ---- */}
            {viewingWeek && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                        <button onClick={() => setViewingWeek(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <X size={28} />
                        </button>
                        <h3 style={{ margin: 0 }}>שבוע {viewingWeek}</h3>
                        <button
                            onClick={() => deletePhoto(viewingWeek)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                            <Trash2 size={22} />
                        </button>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <img
                            src={photos[viewingWeek]}
                            alt={`שבוע ${viewingWeek}`}
                            style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '16px', objectFit: 'contain' }}
                        />
                    </div>
                    {/* Retake */}
                    <div style={{ padding: '16px 20px 30px', display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => { setViewingWeek(null); setCameraWeek(viewingWeek); }}
                            style={{
                                flex: 1, padding: '14px', borderRadius: '12px',
                                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white', fontSize: '0.95rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            <Camera size={18} /> צלם מחדש
                        </button>
                    </div>
                </div>
            )}

            {/* ---- GIF Preview Modal ---- */}
            {showGifPreview && gifBlob && (() => {
                // Create/reuse stable preview URL
                if (!gifPreviewUrlRef.current) {
                    gifPreviewUrlRef.current = URL.createObjectURL(gifBlob);
                }
                return (
                <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <button onClick={() => {
                        setShowGifPreview(false);
                        setGifBlob(null);
                        if (gifPreviewUrlRef.current) {
                            URL.revokeObjectURL(gifPreviewUrlRef.current);
                            gifPreviewUrlRef.current = null;
                        }
                    }} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                        <X size={28} />
                    </button>

                    <h3 style={{ margin: '0 0 20px', fontSize: '1.3rem' }}>🎬 ה-GIF מוכן!</h3>
                    <img
                        src={gifPreviewUrlRef.current}
                        alt="Belly Growth GIF"
                        style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.1)', marginBottom: '30px' }}
                    />

                    <div style={{ display: 'flex', gap: '16px', width: '100%', maxWidth: '320px' }}>
                        <button
                            onClick={downloadGif}
                            style={{
                                flex: 1, padding: '14px', borderRadius: '14px',
                                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                                color: 'white', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            <Download size={20} /> הורד
                        </button>
                        <button
                            onClick={shareGif}
                            style={{
                                flex: 1, padding: '14px', borderRadius: '14px',
                                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                                border: 'none',
                                color: 'white', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)'
                            }}
                        >
                            <Share2 size={20} /> שתף
                        </button>
                    </div>
                </div>
                );
            })()}

            {/* ---- Confirm Delete Modal ---- */}
            <ConfirmModal
                isOpen={confirmState.open}
                title={`למחוק תמונה של שבוע ${confirmState.week}?`}
                message="לא ניתן לשחזר אחרי המחיקה"
                onConfirm={confirmDeletePhoto}
                onCancel={() => setConfirmState({ open: false, week: null })}
                confirmLabel="מחק"
            />
        </div>
    );
};


// ---- Camera Overlay Component ----
const CameraOverlay = ({ week, onCapture, onClose }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 1920 } }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => setReady(true);
            }
        } catch (err) {
            console.error('Camera error:', err);
            setError('לא הצלחנו לפתוח את המצלמה. בדוק הרשאות.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
        }
    };

    const capture = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Set canvas to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        // Resize to 600px wide
        const MAX_W = 600;
        const scale = Math.min(1, MAX_W / canvas.width);
        const resizeCanvas = document.createElement('canvas');
        resizeCanvas.width = canvas.width * scale;
        resizeCanvas.height = canvas.height * scale;
        const rCtx = resizeCanvas.getContext('2d');
        rCtx.drawImage(canvas, 0, 0, resizeCanvas.width, resizeCanvas.height);

        const base64 = resizeCanvas.toDataURL('image/jpeg', 0.75);
        stopCamera();
        onCapture(base64);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'black', display: 'flex', flexDirection: 'column' }}>
            {/* Top bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 310, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                <button onClick={() => { stopCamera(); onClose(); }} style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={24} />
                </button>
                <span style={{ background: 'rgba(0,0,0,0.5)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>שבוע {week}</span>
            </div>

            {error ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', padding: '40px' }}>
                    <Camera size={48} color="#64748b" />
                    <p style={{ color: '#94a3b8', textAlign: 'center' }}>{error}</p>
                    <button onClick={() => { stopCamera(); onClose(); }} style={{ padding: '12px 24px', borderRadius: '12px', background: 'var(--primary)', border: 'none', color: 'white', cursor: 'pointer' }}>
                        חזור
                    </button>
                </div>
            ) : (
                <>
                    {/* Video Feed */}
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />

                    {/* Silhouette Overlay */}
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: 305,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        pointerEvents: 'none'
                    }}>
                        <img
                            src="/images/silhouette.png"
                            alt=""
                            style={{
                                height: '70%',
                                opacity: 0.3,
                                filter: 'brightness(2)',
                                objectFit: 'contain'
                            }}
                        />
                    </div>

                    {/* Guide Text */}
                    <div style={{
                        position: 'absolute', top: '80px', left: 0, right: 0,
                        textAlign: 'center', zIndex: 306, pointerEvents: 'none'
                    }}>
                        <span style={{
                            background: 'rgba(0,0,0,0.5)',
                            padding: '6px 16px',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            color: 'rgba(255,255,255,0.8)'
                        }}>
                            מקמו אותה לפי הצללית 👆
                        </span>
                    </div>

                    {/* Capture Button */}
                    <div style={{
                        position: 'absolute', bottom: '40px', left: 0, right: 0,
                        display: 'flex', justifyContent: 'center', zIndex: 310
                    }}>
                        <button
                            onClick={capture}
                            disabled={!ready}
                            style={{
                                width: '72px', height: '72px', borderRadius: '50%',
                                background: 'white',
                                border: '4px solid rgba(255,255,255,0.3)',
                                cursor: ready ? 'pointer' : 'wait',
                                boxShadow: '0 0 30px rgba(255,255,255,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                outline: '3px solid rgba(255,255,255,0.1)',
                                outlineOffset: '6px'
                            }}
                        >
                            <div style={{ width: '58px', height: '58px', borderRadius: '50%', background: 'white' }} />
                        </button>
                    </div>
                </>
            )}

            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default BellyGrowth;
