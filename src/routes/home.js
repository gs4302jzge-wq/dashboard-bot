const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>OSCORP Dashboard</title>
            <style>
                body { font-family: Arial, sans-serif; background: #0f172a; color: white; text-align: center; padding: 50px; }
                .card { background: #1e293b; padding: 30px; border-radius: 12px; display: inline-block; box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
                h1 { color: #38bdf8; }
                a { display: inline-block; margin-top: 15px; padding: 10px 20px; background: #5865F2; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>مرحباً بك في لوحة التحكم 👋</h1>
                <p>السيرفر وقاعدة البيانات يعملان بنجاح!</p>
                <a href="/login">تسجيل الدخول عبر Discord</a>
            </div>
        </body>
        </html>
    `);
});

// مسار تسجيل الدخول
router.get('/login', (req, res) => {
    const CLIENT_ID = process.env.CLIENT_ID || '';
    const REDIRECT_URI = encodeURIComponent(process.env.REDIRECT_URI || '');
    
    if (CLIENT_ID) {
        res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=identify%20guilds`);
    } else {
        res.send('رجاء قم بإضافة CLIENT_ID و REDIRECT_URI في متغيّرات البيئة داخل Render');
    }
});

// مسار استقبال الـ Callback بعد الموافقة في ديسكورد
router.get('/auth/discord/callback', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>تم تسجيل الدخول</title>
            <style>
                body { font-family: Arial, sans-serif; background: #0f172a; color: white; text-align: center; padding: 50px; }
                .card { background: #1e293b; padding: 30px; border-radius: 12px; display: inline-block; box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
                h1 { color: #22c55e; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>تم تسجيل الدخول بنجاح! 🎉</h1>
                <p>أهلاً بك في لوحة تحكم OSCORP</p>
            </div>
        </body>
        </html>
    `);
});

module.exports = router;
