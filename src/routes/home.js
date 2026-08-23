const express = require('express');
const router = express.Router();
const path = require('path');

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

module.exports = router;
