import { execSync } from 'child_process';

const envs = {
    'VITE_FIREBASE_API_KEY': 'AIzaSyC26UyOg_c0zzmNohHTe4bpqoRaM341NL4',
    'VITE_FIREBASE_AUTH_DOMAIN': 'abale-3178b.firebaseapp.com',
    'VITE_FIREBASE_PROJECT_ID': 'abale-3178b',
    'VITE_FIREBASE_STORAGE_BUCKET': 'abale-3178b.firebasestorage.app',
    'VITE_FIREBASE_MESSAGING_SENDER_ID': '101170209718',
    'VITE_FIREBASE_APP_ID': '1:101170209718:web:f184bcede29944c9611717',
    'VITE_FIREBASE_MEASUREMENT_ID': 'G-L655BLJH93'
};

const targets = ['production', 'preview', 'development'];

console.log('Starting environment variable upload...');

for (const [key, value] of Object.entries(envs)) {
    for (const target of targets) {
        try {
            console.log(`Adding ${key} to ${target}...`);
            // execute synchronously
            execSync(`npx vercel env add ${key} ${target}`, {
                input: value,
                stdio: ['pipe', 'inherit', 'inherit']
            });
        } catch (e) {
            // Vercel CLI might exit with non-zero if variable exists or other error
            // We log it but continue
            console.error(`Failed to add ${key} to ${target}. It might already exist.`);
        }
    }
}
console.log('All done!');
