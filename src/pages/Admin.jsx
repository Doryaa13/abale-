import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, Plus, Trash2, Upload, X, Loader2, RotateCcw, Download, ChevronRight, ChevronLeft, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ADMIN_UID } from '../config/admin';
import {
    ARTICLE_IMAGES, BUNDLED_CONTENT, loadPublishedContent, publishContent,
    readDraft, saveDraft, clearDraft,
} from '../services/contentService';

// ── Content editor (/admin) ────────────────────────────────────────────────────
// Edits the weekly status + tasks and the monthly exams + articles. Changes are
// kept as a draft on this device (so nothing is lost on refresh) until you press
// "פרסם", which writes them to Firestore for every user. "תצוגה מקדימה" opens the
// real app in a phone frame, showing the draft.

const clone = (x) => JSON.parse(JSON.stringify(x));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const EXAM_TEMPLATE = 'מה זה: \nמתי: \nהתפקיד שלך: ';
const DEFAULT_AUTHOR = "צוות אבאל'ה";
const IMAGE_NAMES = Object.keys(ARTICLE_IMAGES);

const nextId = (items, prefix) => {
    const used = items.map((x) => parseInt(String(x.id).split('_').pop(), 10) || 0);
    return `${prefix}_${Math.max(0, ...used) + 1}`;
};

// Problems that would show up badly in the app — checked before publishing.
const validate = ({ weeks, guides }) => {
    const errors = [];
    weeks.forEach((w) => {
        if (!w.babySize.object.trim()) errors.push(`שבוע ${w.week}: חסר "גודל משוער"`);
        w.tasks.forEach((c) => {
            if (!c.category.trim()) errors.push(`שבוע ${w.week}: יש קטגוריית משימות בלי שם`);
            c.items.forEach((it) => { if (!it.text.trim()) errors.push(`שבוע ${w.week}: יש משימה בלי שם`); });
        });
    });
    guides.forEach((m) => {
        m.exams.forEach((e) => { if (!e.name.trim()) errors.push(`חודש ${m.month}: יש בדיקה בלי שם`); });
        const titles = new Set();
        m.articles.forEach((a) => {
            if (!a.title.trim()) errors.push(`חודש ${m.month}: יש מאמר בלי כותרת`);
            else if (titles.has(a.title.trim())) errors.push(`חודש ${m.month}: שני מאמרים עם אותה כותרת`);
            titles.add(a.title.trim());
        });
    });
    return errors;
};

// ── Small form pieces ──────────────────────────────────────────────────────────
const Field = ({ label, hint, children }) => (
    <label className="abl-admin-field">
        <span className="abl-admin-label">{label}</span>
        {children}
        {hint && <span className="abl-admin-hint">{hint}</span>}
    </label>
);

const TextInput = (props) => <input className="abl-admin-input" {...props} />;
const TextArea = ({ rows = 4, ...props }) => <textarea className="abl-admin-input" rows={rows} {...props} />;

// Tags are edited as one comma-separated line, committed when the field loses focus
// (so typing a comma doesn't immediately swallow the space after it).
const TagsInput = ({ value, onChange }) => {
    const [raw, setRaw] = useState(value.join(', '));
    useEffect(() => { setRaw(value.join(', ')); }, [value]);
    return (
        <TextInput
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            onBlur={() => onChange(raw.split(',').map((t) => t.trim()).filter(Boolean))}
            placeholder="עייפות, בחילות, צרבות"
        />
    );
};

const IconButton = ({ label, onClick, children, danger }) => (
    <button type="button" className="abl-admin-icon-btn" data-danger={!!danger} onClick={onClick} aria-label={label} title={label}>
        {children}
    </button>
);

const AddButton = ({ onClick, children }) => (
    <button type="button" className="abl-admin-add" onClick={onClick}>
        <Plus size={16} /> {children}
    </button>
);

const Stepper = ({ value, options, onChange, format }) => {
    const idx = options.indexOf(value);
    return (
        <div className="abl-admin-stepper">
            <IconButton label="הקודם" onClick={() => idx > 0 && onChange(options[idx - 1])}><ChevronRight size={18} /></IconButton>
            <select className="abl-admin-input" value={value} onChange={(e) => onChange(Number(e.target.value))}>
                {options.map((o) => <option key={o} value={o}>{format(o)}</option>)}
            </select>
            <IconButton label="הבא" onClick={() => idx < options.length - 1 && onChange(options[idx + 1])}><ChevronLeft size={18} /></IconButton>
        </div>
    );
};

// ── Week editor ────────────────────────────────────────────────────────────────
const WeekEditor = ({ week, onChange }) => {
    const update = (fn) => { const w = clone(week); fn(w); onChange(w); };
    return (
        <div className="abl-admin-stack">
            <section className="abl-admin-card">
                <h3>גודל העובר</h3>
                <div className="abl-admin-row">
                    <Field label="גודל משוער (למה הוא דומה)">
                        <TextInput value={week.babySize.object} onChange={(e) => update((w) => { w.babySize.object = e.target.value; })} />
                    </Field>
                    <Field label="משקל">
                        <TextInput value={week.babySize.weight} onChange={(e) => update((w) => { w.babySize.weight = e.target.value; })} />
                    </Field>
                </div>
            </section>

            <section className="abl-admin-card">
                <h3>מה קורה עם בת הזוג?</h3>
                <TextArea rows={7} value={week.partnerStatus.text} onChange={(e) => update((w) => { w.partnerStatus.text = e.target.value; })} />
                <Field label="תגיות" hint="מופרדות בפסיק">
                    <TagsInput value={week.partnerStatus.tags} onChange={(tags) => update((w) => { w.partnerStatus.tags = tags; })} />
                </Field>
            </section>

            <section className="abl-admin-card">
                <h3>מה קורה עם התינוק?</h3>
                <TextArea rows={7} value={week.babyStatus.text} onChange={(e) => update((w) => { w.babyStatus.text = e.target.value; })} />
            </section>

            <section className="abl-admin-card">
                <h3>משימות השבוע</h3>
                <p className="abl-admin-note">
                    סימוני "בוצע" של משתמשים נשמרים לפי המיקום של המשימה. אפשר לערוך טקסט בחופשיות, אבל מחיקה או הוספה באמצע קטגוריה תזיז את הסימונים של השבוע הזה.
                </p>
                {week.tasks.map((cat, ci) => (
                    <div key={ci} className="abl-admin-group">
                        <div className="abl-admin-group-head">
                            <TextInput value={cat.category} onChange={(e) => update((w) => { w.tasks[ci].category = e.target.value; })} aria-label="שם הקטגוריה" />
                            <IconButton label="מחק קטגוריה" danger onClick={() => {
                                if (window.confirm(`למחוק את הקטגוריה "${cat.category}" וכל המשימות בה?`)) update((w) => { w.tasks.splice(ci, 1); });
                            }}><Trash2 size={16} /></IconButton>
                        </div>
                        {cat.items.map((it, ii) => (
                            <div key={ii} className="abl-admin-item">
                                <div className="abl-admin-item-head">
                                    <TextInput value={it.text} placeholder="שם המשימה" onChange={(e) => update((w) => { w.tasks[ci].items[ii].text = e.target.value; })} />
                                    <IconButton label="מחק משימה" danger onClick={() => {
                                        if (window.confirm(`למחוק את המשימה "${it.text}"?`)) update((w) => { w.tasks[ci].items.splice(ii, 1); });
                                    }}><X size={16} /></IconButton>
                                </div>
                                <TextArea rows={2} value={it.description} placeholder="הסבר קצר" onChange={(e) => update((w) => { w.tasks[ci].items[ii].description = e.target.value; })} />
                            </div>
                        ))}
                        <AddButton onClick={() => update((w) => { w.tasks[ci].items.push({ text: '', description: '' }); })}>משימה</AddButton>
                    </div>
                ))}
                <AddButton onClick={() => update((w) => { w.tasks.push({ category: 'קטגוריה חדשה', items: [{ text: '', description: '' }] }); })}>קטגוריה</AddButton>
            </section>
        </div>
    );
};

// ── Month editor (exams + articles) ────────────────────────────────────────────
const MonthEditor = ({ month, onChange }) => {
    const update = (fn) => { const m = clone(month); fn(m); onChange(m); };
    return (
        <div className="abl-admin-stack">
            <section className="abl-admin-card">
                <h3>בדיקות החודש</h3>
                <p className="abl-admin-note">כדאי לשמור על המבנה "מה זה / מתי / התפקיד שלך", שורה לכל אחד.</p>
                {month.exams.map((exam, ei) => (
                    <div key={exam.id} className="abl-admin-item">
                        <div className="abl-admin-item-head">
                            <TextInput value={exam.name} placeholder="שם הבדיקה" onChange={(e) => update((m) => { m.exams[ei].name = e.target.value; })} />
                            <IconButton label="מחק בדיקה" danger onClick={() => {
                                if (window.confirm(`למחוק את "${exam.name}"?`)) update((m) => { m.exams.splice(ei, 1); });
                            }}><X size={16} /></IconButton>
                        </div>
                        <TextArea rows={4} value={exam.info} onChange={(e) => update((m) => { m.exams[ei].info = e.target.value; })} />
                    </div>
                ))}
                <AddButton onClick={() => update((m) => { m.exams.push({ id: nextId(m.exams, `test_${m.month}`), name: '', info: EXAM_TEMPLATE }); })}>בדיקה</AddButton>
            </section>

            <section className="abl-admin-card">
                <h3>מאמרים</h3>
                <p className="abl-admin-note">מאמרים שמורים אצל משתמשים מזוהים לפי הכותרת. שינוי כותרת יעלים את השמירה אצל מי ששמר את המאמר.</p>
                {month.articles.map((article, ai) => (
                    <div key={article.id} className="abl-admin-item">
                        <div className="abl-admin-item-head">
                            <TextInput value={article.title} placeholder="כותרת" onChange={(e) => update((m) => { m.articles[ai].title = e.target.value; })} />
                            <IconButton label="מחק מאמר" danger onClick={() => {
                                if (window.confirm(`למחוק את המאמר "${article.title}"?`)) update((m) => { m.articles.splice(ai, 1); });
                            }}><X size={16} /></IconButton>
                        </div>
                        <Field label="כותב">
                            <TextInput value={article.author} onChange={(e) => update((m) => { m.articles[ai].author = e.target.value; })} />
                        </Field>
                        <Field label="תוכן" hint="שורה ריקה = פסקה חדשה">
                            <TextArea rows={10} value={article.content} onChange={(e) => update((m) => { m.articles[ai].content = e.target.value; })} />
                        </Field>
                        <div className="abl-admin-field">
                            <span className="abl-admin-label">תמונה</span>
                            <div className="abl-admin-images">
                                <button type="button" className="abl-admin-image" data-selected={!article.photo}
                                    onClick={() => update((m) => { m.articles[ai].photo = null; })}>
                                    <span>אוטומטי</span>
                                </button>
                                {IMAGE_NAMES.map((name) => (
                                    <button key={name} type="button" className="abl-admin-image" data-selected={article.photo === name}
                                        onClick={() => update((m) => { m.articles[ai].photo = name; })} aria-label={name}>
                                        <img src={ARTICLE_IMAGES[name]} alt="" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
                <AddButton onClick={() => update((m) => {
                    m.articles.push({ id: nextId(m.articles, `article_${m.month}`), title: '', author: DEFAULT_AUTHOR, content: '', photo: null });
                })}>מאמר</AddButton>
            </section>
        </div>
    );
};

// ── Phone-frame preview of the real app, showing the draft ────────────────────
const Preview = ({ src, onClose }) => (
    <div className="abl-admin-preview" role="dialog" aria-label="תצוגה מקדימה">
        <div className="abl-admin-preview-bar">
            <span>תצוגה מקדימה (טיוטה, עוד לא פורסם)</span>
            <IconButton label="סגירה" onClick={onClose}><X size={18} /></IconButton>
        </div>
        <iframe title="תצוגה מקדימה" src={src} className="abl-admin-phone" />
    </div>
);

// ── Login / permission gate ────────────────────────────────────────────────────
const GoogleG = () => (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-2.6-11.3-7l-6.5 5C9.6 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.6l6.3 5.2C41.6 35.8 44 30.4 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
);

const Gate = ({ children }) => (
    <div className="abl-admin-gate">
        <div className="abl-admin-card" style={{ maxWidth: '360px', width: '100%' }}>
            <div className="abl-admin-gate-icon"><Lock size={24} /></div>
            {children}
        </div>
    </div>
);

const LoginForm = () => {
    const { login, loginWithGoogle } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const run = async (fn, failMessage) => {
        setBusy(true);
        setError('');
        try {
            await fn();
        } catch (e) {
            if (e?.code !== 'auth/popup-closed-by-user' && e?.code !== 'auth/cancelled-popup-request') setError(failMessage);
        } finally {
            setBusy(false);
        }
    };
    const submit = (e) => {
        e.preventDefault();
        run(() => login(email.trim(), password), 'אימייל או סיסמה שגויים.');
    };
    return (
        <Gate>
            <h2>עריכת תוכן</h2>
            <button type="button" className="abl-admin-google" disabled={busy}
                onClick={() => run(loginWithGoogle, 'ההתחברות עם Google נכשלה. נסה שוב.')}>
                <GoogleG /> המשך עם Google
            </button>
            <div className="abl-admin-or"><span>או עם אימייל וסיסמה</span></div>
            <form onSubmit={submit} className="abl-admin-stack">
                <TextInput type="email" dir="ltr" placeholder="אימייל" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
                <TextInput type="password" dir="ltr" placeholder="סיסמה" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
                {error && <p className="abl-admin-error">{error}</p>}
                <button type="submit" className="abl-cta" disabled={busy || !email || !password}>
                    {busy ? <Loader2 size={18} className="abl-admin-spin" /> : 'התחברות'}
                </button>
            </form>
        </Gate>
    );
};

// ── Page ───────────────────────────────────────────────────────────────────────
const Admin = () => {
    const { user, loading, logout } = useAuth();
    const isAdmin = user?.uid === ADMIN_UID;

    const [published, setPublished] = useState(null);   // { weeks, guides, updatedAt, isBundled }
    const [draft, setDraft] = useState(null);
    const [loadError, setLoadError] = useState('');
    const [resumedDraft, setResumedDraft] = useState(false);
    const [tab, setTab] = useState('weeks');
    const [weekNum, setWeekNum] = useState(18);
    const [monthNum, setMonthNum] = useState(4);
    const [preview, setPreview] = useState(null);
    const [busy, setBusy] = useState(false);
    const [toast, setToast] = useState('');

    useEffect(() => {
        if (!isAdmin) return;
        let cancelled = false;
        loadPublishedContent()
            .then((p) => {
                if (cancelled) return;
                const base = {
                    weeks: p.weeks || BUNDLED_CONTENT.weeks,
                    guides: p.guides || BUNDLED_CONTENT.guides,
                    updatedAt: p.updatedAt,
                    isBundled: !p.weeks || !p.guides,
                };
                setPublished(base);
                const saved = readDraft();
                const baseContent = { weeks: base.weeks, guides: base.guides };
                if (saved?.weeks && saved?.guides && !same(saved, baseContent)) {
                    setDraft(saved);
                    setResumedDraft(true);
                } else {
                    setDraft(clone(baseContent));
                }
            })
            .catch((e) => setLoadError(e?.code === 'permission-denied'
                ? 'אין הרשאה לקרוא את התוכן. בדוק את חוקי Firestore.'
                : 'לא הצלחנו לטעון את התוכן. בדוק את החיבור לאינטרנט ונסה שוב.'));
        return () => { cancelled = true; };
    }, [isAdmin]);

    const dirty = useMemo(
        () => !!(published && draft) && !same(draft, { weeks: published.weeks, guides: published.guides }),
        [published, draft],
    );

    // Keep the draft on this device so a refresh (or a preview) never loses work.
    useEffect(() => {
        if (!draft) return;
        if (dirty) saveDraft(draft); else clearDraft();
    }, [draft, dirty]);

    const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

    if (loading) return <Gate><Loader2 size={22} className="abl-admin-spin" /></Gate>;
    if (!user) return <LoginForm />;
    if (!isAdmin) {
        return (
            <Gate>
                <h2>אין הרשאה</h2>
                <p className="abl-admin-note">החשבון {user.email} לא מורשה לערוך תוכן.</p>
                <button type="button" className="abl-ghost-btn" onClick={() => logout()}>התנתקות</button>
            </Gate>
        );
    }
    if (loadError) return <Gate><p className="abl-admin-error">{loadError}</p></Gate>;
    if (!draft) return <Gate><Loader2 size={22} className="abl-admin-spin" /></Gate>;

    const weekOptions = draft.weeks.map((w) => w.week);
    const monthOptions = draft.guides.map((m) => m.month);
    const week = draft.weeks.find((w) => w.week === weekNum) || draft.weeks[0];
    const month = draft.guides.find((m) => m.month === monthNum) || draft.guides[0];

    const setWeek = (w) => setDraft((d) => ({ ...d, weeks: d.weeks.map((x) => (x.week === w.week ? w : x)) }));
    const setMonth = (m) => setDraft((d) => ({ ...d, guides: d.guides.map((x) => (x.month === m.month ? m : x)) }));

    const openPreview = () => {
        saveDraft(draft);
        const firstWeekOfMonth = draft.weeks.find((w) => w.month === month.month)?.week || 18;
        const src = tab === 'weeks'
            ? `/?preview=1&week=${week.week}&t=${Date.now()}`
            : `/tests?preview=1&week=${firstWeekOfMonth}&t=${Date.now()}`;
        setPreview(src);
    };

    const publish = async () => {
        const errors = validate(draft);
        if (errors.length) {
            window.alert(`יש כמה דברים לתקן לפני פרסום:\n\n${errors.slice(0, 8).join('\n')}${errors.length > 8 ? `\n...ועוד ${errors.length - 8}` : ''}`);
            return;
        }
        if (!window.confirm('לפרסם את השינויים לכל המשתמשים?')) return;
        setBusy(true);
        try {
            await publishContent(draft, user.uid);
            setPublished({ ...clone(draft), updatedAt: new Date(), isBundled: false });
            clearDraft();
            setResumedDraft(false);
            flash('פורסם! המשתמשים יראו את השינויים בפתיחה הבאה של האפליקציה.');
        } catch (e) {
            window.alert(e?.code === 'permission-denied'
                ? 'אין הרשאה לפרסם. בדוק שחוקי Firestore כוללים את ה-UID שלך.'
                : 'הפרסום נכשל. בדוק את החיבור לאינטרנט ונסה שוב.');
        } finally {
            setBusy(false);
        }
    };

    const discard = () => {
        if (!window.confirm('לבטל את כל השינויים שלא פורסמו?')) return;
        setDraft(clone({ weeks: published.weeks, guides: published.guides }));
        setResumedDraft(false);
    };

    const restoreBundled = () => {
        if (!window.confirm('לטעון לטיוטה את התוכן המקורי שבקוד? (זה ייכנס לתוקף רק אחרי פרסום)')) return;
        setDraft(clone(BUNDLED_CONTENT));
    };

    const downloadBackup = () => {
        const blob = new Blob([JSON.stringify(draft, null, 1)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `abale-content-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
    };

    const statusLine = dirty
        ? 'יש שינויים שעוד לא פורסמו'
        : published.isBundled
            ? 'מוצג התוכן המקורי מהקוד (עוד לא פורסם מכאן)'
            : `פורסם${published.updatedAt ? ` ב-${published.updatedAt.toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })}` : ''}`;

    return (
        <div className="abl-admin" dir="rtl">
            <header className="abl-admin-top">
                <div className="abl-admin-top-row">
                    <Link to="/" className="abl-admin-back" aria-label="חזרה לאפליקציה"><ArrowRight size={20} /></Link>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h1>עריכת תוכן</h1>
                        <p className="abl-admin-status" data-dirty={dirty}>{statusLine}</p>
                    </div>
                    <div className="abl-admin-actions">
                        <button type="button" className="abl-admin-btn" onClick={openPreview}><Eye size={16} /> תצוגה מקדימה</button>
                        <button type="button" className="abl-admin-btn" data-primary onClick={publish} disabled={!dirty || busy}>
                            {busy ? <Loader2 size={16} className="abl-admin-spin" /> : <Upload size={16} />} פרסם
                        </button>
                    </div>
                </div>
                <div className="abl-admin-tabs" role="tablist">
                    <button type="button" role="tab" aria-selected={tab === 'weeks'} onClick={() => setTab('weeks')}>שבועות</button>
                    <button type="button" role="tab" aria-selected={tab === 'months'} onClick={() => setTab('months')}>בדיקות ומאמרים</button>
                </div>
            </header>

            <main className="abl-admin-main">
                {resumedDraft && dirty && (
                    <div className="abl-admin-banner">
                        המשכת מטיוטה ששמרת במכשיר הזה ועוד לא פורסמה.
                        <button type="button" onClick={discard}>מחק טיוטה</button>
                    </div>
                )}

                {tab === 'weeks' ? (
                    <>
                        <Stepper value={week.week} options={weekOptions} onChange={setWeekNum}
                            format={(n) => { const w = draft.weeks.find((x) => x.week === n); return `שבוע ${n} (חודש ${w.month})`; }} />
                        <WeekEditor key={week.week} week={week} onChange={setWeek} />
                    </>
                ) : (
                    <>
                        <Stepper value={month.month} options={monthOptions} onChange={setMonthNum} format={(n) => `חודש ${n}`} />
                        <MonthEditor key={month.month} month={month} onChange={setMonth} />
                    </>
                )}

                <section className="abl-admin-card abl-admin-tools">
                    <button type="button" className="abl-admin-btn" onClick={discard} disabled={!dirty}><RotateCcw size={16} /> בטל שינויים</button>
                    <button type="button" className="abl-admin-btn" onClick={downloadBackup}><Download size={16} /> הורד גיבוי</button>
                    <button type="button" className="abl-admin-btn" onClick={restoreBundled}>טען את התוכן המקורי</button>
                    <button type="button" className="abl-admin-btn" onClick={() => logout()}>התנתקות</button>
                </section>
            </main>

            {toast && <div className="abl-admin-toast" role="status">{toast}</div>}
            {preview && <Preview src={preview} onClose={() => setPreview(null)} />}
        </div>
    );
};

export default Admin;
