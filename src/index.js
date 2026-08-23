const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ربط جميع الملفات والموجهات الموجودة في مشروعك
app.use('/', require('./routes/home'));

try { app.use('/settings', require('./routes/settings')); } catch(e) {}
try { app.use('/plugins', require('./routes/plugins')); } catch(e) {}
try { app.use('/api', require('./routes/api')); } catch(e) {}
try { app.use('/dashboard', require('./routes/dashboard')); } catch(e) {}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
