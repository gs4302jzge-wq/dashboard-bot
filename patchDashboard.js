const fs = require('fs');
const path = require('path');

// 1. فحص وتحديث جميع ملفات الواجهة (EJS / HTML)
function patchUI(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!['node_modules', '.git', '.vscode'].includes(item)) patchUI(fullPath);
    } else if (item.endsWith('.ejs') || item.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // إذا كانت الصفحة تحتوي على خيارات الترحيب
      if (content.includes('Welcome') || content.includes('welcome') || content.includes('Background')) {
        console.log('Patching UI File:', fullPath);
        
        // تحويل النموذج ليدعم رفع الملفات
        content = content.replace(/<form/g, '<form enctype="multipart/form-data"');

        // إضافة عناصر التحكم الثابتة لرفع الصور والسلايدرز
        const controlsHTML = `
        <div style="background:#18191c; border:1px solid #2f3136; border-radius:8px; padding:15px; margin-top:15px; color:#fff;">
          <h3 style="margin-top:0; color:#5865F2;">إعدادات الخلفية والدائرة (Background & Avatar Controls)</h3>
          
          <div style="margin-bottom:12px;">
            <label style="display:block; font-weight:bold; margin-bottom:5px;">📁 رفع صورة خلفية جديدة (Upload Background):</label>
            <input type="file" name="bgImage" accept="image/*" style="background:#2b2d31; color:#fff; padding:8px; border-radius:4px; width:100%;">
          </div>

          <div style="margin-bottom:12px;">
            <label style="display:block; font-weight:bold; margin-bottom:5px;">↔️ موقع الدائرة أفقياً (Avatar X):</label>
            <input type="range" name="avatarX" min="0" max="800" value="400" style="width:100%;">
          </div>

          <div style="margin-bottom:12px;">
            <label style="display:block; font-weight:bold; margin-bottom:5px;">↕️ موقع الدائرة عمودياً (Avatar Y):</label>
            <input type="range" name="avatarY" min="0" max="360" value="120" style="width:100%;">
          </div>

          <div style="margin-bottom:12px;">
            <label style="display:block; font-weight:bold; margin-bottom:5px;">🔍 حجم الدائرة (Avatar Radius):</label>
            <input type="range" name="avatarRadius" min="20" max="150" value="60" style="width:100%;">
          </div>
        </div>
        `;

        if (!content.includes('bgImage')) {
          content = content.replace('</form>', controlsHTML + '\n</form>');
          fs.writeFileSync(fullPath, content);
          console.log('Successfully patched:', fullPath);
        }
      }
    }
  }
}

patchUI(__dirname);
