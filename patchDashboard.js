@workspace I need to fix the Welcome System in this dashboard bot. 

Please analyze the whole project (EJS view files, Express routes, welcomeService.js, and welcomeConfig.json) and generate the full fixed code for us:

1. Frontend UI (EJS Views):
- Fix the Welcome Settings page UI tabs (Background, Avatar, Text) so they correctly toggle their options.
- Ensure the main welcome form has `enctype="multipart/form-data"` enabled.
- Add an <input type="file" name="bgImage" accept="image/*"> in the Background tab to allow uploading local background images, plus a text input for URL.
- Add input range sliders for Avatar position and size:
  - avatarX (min 0, max 800)
    - avatarY (min 0, max 360)
      - avatarRadius (min 20, max 160)
      
      2. Backend Routes:
      - Update the POST welcome settings route using `multer` to handle uploaded background images.
      - Save the uploaded image path (or bgUrl), avatarX, avatarY, and avatarRadius into `welcomeConfig.json`.
      
      3. Welcome Service (`welcomeService.js`):
      - Read `welcomeConfig.json` on member join.
      - Use Canvas to render the uploaded background image (or URL), and draw the user's avatar circle according to avatarX, avatarY, and avatarRadius.
      - Send the generated image to the welcome channel.
      
      Show me the exact updated code or files to apply.
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
        content = content.replace(/<form enctype="multipart/form-data"/g, '<form enctype="multipart/form-data" enctype="multipart/form-data"');

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
          content = content.replace('
      <!-- WELCOME_CONTROLS_V2 -->
      <div style="background:#18191c; border:2px solid #5865F2; border-radius:8px; padding:15px; margin:20px 0; color:#fff;">
        <h3 style="color:#5865F2; margin-top:0;">🎨 إعدادات الترحب والصورة</h3>
        <div style="margin-bottom:10px;">
          <label style="display:block; font-weight:bold;">📁 رفع صورة خلفية جديدة:</label>
          <input type="file" name="bgImage" accept="image/*" style="background:#2b2d31; color:#fff; padding:6px; width:100%; border-radius:4px;">
        </div>
        <div style="margin-bottom:10px;">
          <label style="display:block; font-weight:bold;">↔️ موقع الأفاتار X:</label>
          <input type="range" name="avatarX" min="0" max="800" value="400" style="width:100%;">
        </div>
        <div style="margin-bottom:10px;">
          <label style="display:block; font-weight:bold;">↕️ موقع الأفاتار Y:</label>
          <input type="range" name="avatarY" min="0" max="360" value="120" style="width:100%;">
        </div>
        <div style="margin-bottom:10px;">
          <label style="display:block; font-weight:bold;">🔍 حجم الأفاتار:</label>
          <input type="range" name="avatarRadius" min="20" max="150" value="60" style="width:100%;">
        </div>
      </div>
      
</form>', controlsHTML + '\n</form>');
          fs.writeFileSync(fullPath, content);
          console.log('Successfully patched:', fullPath);
        }
      }
    }
  }
}

patchUI(__dirname);
