// ====================================================
// images.js — сжатие картинок через canvas → base64
// Сохраняется прямо в Firestore, без сторонних сервисов
// ====================================================

const MAX_SIZE = 128;   // px, максимальная сторона
const QUALITY  = 0.75;  // качество jpeg

// ── Сжать файл → base64 строка ───────────────────────
export function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Считаем новые размеры с сохранением пропорций
      let { width, height } = img;
      if (width > height) {
        if (width > MAX_SIZE) { height = Math.round(height * MAX_SIZE / width); width = MAX_SIZE; }
      } else {
        if (height > MAX_SIZE) { width = Math.round(width * MAX_SIZE / height); height = MAX_SIZE; }
      }

      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

// Сохраняем PNG с прозрачностью, остальное — jpeg
const format = (file.type === 'image/png' || file.type === 'image/webp') ? 'image/png' : 'image/jpeg';
const base64 = canvas.toDataURL(format, format === 'image/jpeg' ? QUALITY : undefined);
      resolve(base64);
    };

    img.onerror = () => reject(new Error("Не удалось загрузить картинку"));
    img.src = url;
  });
}

// ── Открыть диалог выбора файла ──────────────────────
export function pickFile() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type   = "file";
    input.accept = "image/webp,image/png,image/jpeg";
    input.onchange = () => resolve(input.files[0] || null);
    input.oncancel = () => resolve(null);
    input.click();
  });
}

// ── Выбрать файл + показать превью + вернуть base64 ──
// Использование в форме:
//   const base64 = await pickAndCompress(previewImgEl);
export async function pickAndCompress(previewEl) {
  const file = await pickFile();
  if (!file) return null;

  const base64 = await compressImage(file);

  if (previewEl) {
    previewEl.src = base64;
    previewEl.classList.remove("hidden");
  }

  return base64;
}

// ── Показать картинку из Firestore (base64 или URL) ──
export function setItemImage(imgEl, imageData) {
  if (!imgEl) return;
  if (imageData) {
    imgEl.src = imageData;
  } else {
    // Плейсхолдер если картинки нет
    imgEl.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' rx='8' fill='%231e2333'/%3E%3Ctext x='32' y='40' text-anchor='middle' font-size='24' fill='%237a8399'%3E%3F%3C/text%3E%3C/svg%3E";
  }
}
