import React from 'react';
import { ArrowRight, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

// Contact address shown to users and required by Google AdSense.
// Change this to a dedicated address if you prefer not to use a personal inbox.
const CONTACT_EMAIL = 'doryaa13@gmail.com';

const Section = ({ title, children }) => (
    <div style={{ marginBottom: '26px' }}>
        <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px' }}>{title}</h3>
        <div style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.7 }}>{children}</div>
    </div>
);

const PrivacyPolicy = () => {
    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', color: '#fff', minHeight: '100dvh' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <Link to="/" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    <ArrowRight size={24} />
                </Link>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Shield color="var(--primary)" />
                    מדיניות פרטיות
                </h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '28px' }}>
                עודכן לאחרונה: יוני 2026
            </p>

            <Section title="כללי">
                אפליקציית "אבאל'ה" (להלן "האפליקציה") מסייעת להורים לעקוב אחר ההריון שבוע
                אחר שבוע. אנו מכבדים את פרטיותך, ומדיניות זו מסבירה אילו נתונים נאספים, כיצד
                נעשה בהם שימוש, וכיצד הם מאוחסנים.
            </Section>

            <Section title="אילו נתונים אנחנו אוספים">
                <ul style={{ margin: 0, paddingInlineStart: '20px' }}>
                    <li>פרטים שאתה מזין: שם ההורה, שבוע ההריון, ותאריך תחילת השימוש.</li>
                    <li>נתוני התקדמות שאתה יוצר: משימות שסומנו, מאמרים שנשמרו, רשימת תיק הלידה,
                        תזכורות ותיעוד צירים.</li>
                    <li>אם בחרת להירשם (גוגל או אימייל/סיסמה): כתובת האימייל והשם המשויכים לחשבון.</li>
                </ul>
                <p style={{ marginTop: '10px' }}>
                    איננו אוספים מידע רפואי רגיש מעבר לשבוע ההריון, ואיננו מבקשים פרטי תשלום.
                </p>
            </Section>

            <Section title="כיצד הנתונים מאוחסנים">
                כברירת מחדל, כל הנתונים נשמרים מקומית על המכשיר שלך בלבד (אחסון מקומי בדפדפן).
                אם בחרת להירשם, הנתונים מגובים ומסונכרנים גם בשירות הענן Firebase של Google,
                כדי לאפשר לך לשחזר את ההתקדמות ולעבור בין מכשירים. השימוש ב-Firebase כפוף
                גם למדיניות הפרטיות של Google.
            </Section>

            <Section title="עוגיות (Cookies) ופרסומות">
                האפליקציה משתמשת באחסון מקומי כדי לשמור את ההעדפות וההתקדמות שלך. בנוסף,
                אנו מציגים פרסומות באמצעות שירות Google AdSense. ספקים צד-שלישי, ובהם Google,
                עושים שימוש בעוגיות כדי להציג מודעות בהתאם לביקורים קודמים שלך באתרים שונים.
                באפשרותך לבטל פרסום מותאם אישית דרך{' '}
                <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer"
                   style={{ color: '#60a5fa' }}>הגדרות המודעות של Google</a>, או ללמוד עוד על
                שימוש בעוגיות על ידי ספקים ב-{' '}
                <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer"
                   style={{ color: '#60a5fa' }}>www.aboutads.info</a>.
            </Section>

            <Section title="דיוור ועדכונים">
                בעת ההרשמה תוכל לאשר קבלת עדכונים וטיפים בדואר אלקטרוני. ההסכמה היא בבחירתך
                בלבד (opt-in), ותוכל לבטל אותה בכל עת על ידי פנייה אלינו בכתובת המופיעה למטה.
            </Section>

            <Section title="מחיקת נתונים">
                באפשרותך למחוק את כל הנתונים השמורים על המכשיר בכל רגע, דרך התפריט →
                "מחק נתונים". אם נרשמת וברצונך למחוק גם את הנתונים המגובים בענן, פנה אלינו
                בכתובת המופיעה למטה ונטפל בכך.
            </Section>

            <Section title="פרטיות ילדים">
                האפליקציה מיועדת למבוגרים (הורים) ואינה פונה לילדים מתחת לגיל 13, ואיננו
                אוספים ביודעין מידע על קטינים.
            </Section>

            <Section title="שינויים במדיניות">
                ייתכן שנעדכן מדיניות זו מעת לעת. שינויים מהותיים יוצגו בעמוד זה עם תאריך עדכון
                מעודכן.
            </Section>

            <Section title="יצירת קשר">
                לשאלות בנושא פרטיות או בקשות למחיקת נתונים, ניתן לפנות אלינו בדואר אלקטרוני:{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#60a5fa' }} dir="ltr">{CONTACT_EMAIL}</a>
            </Section>

            <div style={{ height: '40px' }} />
        </div>
    );
};

export default PrivacyPolicy;
