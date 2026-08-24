const fs = require('fs');
const path = require('path');

// البحث عن ملفات العرض في المشروع وتحديث واجهة الترحيب
function updateViews(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git')) {
        updateViews(fullPath);
      }
    } else if (file.endsWith('.ejs') || file.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('Background') && content.includes('Avatar')) {
        console.log('Injecting Controls to:', fullPath);
        
        // الكود المضاف للتحكم في الواجهة
        const injectedUI = `
        <script>
        window.addEventListener('DOMContentLoaded', () => {
          const bgBtn = Array.from(document.querySelectorAll('button, div')).find(e => e.innerText && e.innerText.trim() === 'Background');
          const avatarBtn = Array.from(document.querySelectorAll('button, div')).find(e => e.innerText && e.innerText.trim() === 'Avatar');
          const textBtn = Array.from(document.querySelectorAll('button, div')).find(e => e.innerText && e.innerText.trim() === 'Text' || e.innerText.trim() === 'Username');
          
          const textInputBox = document.querySelector('input[name="textOverlay"]') || document.querySelector('.TEXT_CONTENT')?.parentElement;

          if (textInputBox) {
            let customControls = document.getElementById('custom-welcome-controls');
            if (!customControls) {
              customControls = document.createElement('div');
              customControls.id = 'custom-welcome-controls';
              customControls.style.marginTop = '15px';
              textInputBox.parentNode.insertBefore(customControls, textInputBox.nextSibling);
            }

            const showBg = () => {
              customControls.innerHTML = \`
                <div style="background:#18191c; padding:12px; border-radius:8px; border:1px solid #2f3136;">
                  <label style="color:#fff; font-weight:bold; display:block; margin-bottom:6px;">Upload Background Image:</label>
                  <input type="file" id="bgFileInput" accept="image/*" style="color:#fff; margin-bottom:10px;">
                  <label style="color:#b9bbbe; display:block; margin-bottom:4px;">Or Image URL:</label>
                  <input type="text" name="bgUrl" placeholder="https://..." style="width:100%; padding:8px; background:#2f3136; color:#fff; border:none; border-radius:4px;">
                </div>
              \`;
            };

            const showAvatar = () => {
              customControls.innerHTML = \`
                <div style="background:#18191c; padding:12px; border-radius:8px; border:1px solid #2f3136; color:#fff;">
                  <label style="display:block; margin-bottom:8px;">Avatar X Position: <input type="range" name="avatarX" min="0" max="800" value="400" style="width:100%;"></label>
                  <label style="display:block; margin-bottom:8px;">Avatar Y Position: <input type="range" name="avatarY" min="0" max="360" value="120" style="width:100%;"></label>
                  <label style="display:block;">Avatar Radius (Size): <input type="range" name="avatarRadius" min="20" max="160" value="60" style="width:100%;"></label>
                </div>
              \`;
            };

            if (bgBtn) bgBtn.onclick = (e) => { e.preventDefault(); showBg(); };
            if (avatarBtn) avatarBtn.onclick = (e) => { e.preventDefault(); showAvatar(); };
            
            showBg(); // الافتراضي
          }
        });
        </script>
        `;

        if (!content.includes('custom-welcome-controls')) {
          content += injectedUI;
          fs.writeFileSync(fullPath, content);
        }
      }
    }
  }
}

updateViews(__dirname);
