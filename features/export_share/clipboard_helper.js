/**
 * Clipboard Image Helper
 */
export async function copyCanvasToClipboard(canvas) {
  try {
    return new Promise((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error('کینوس سے تصویر بنانے میں مسئلہ پیش آیا۔'));
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          resolve(true);
        } catch (err) {
          reject(err);
        }
      }, 'image/png');
    });
  } catch (err) {
    throw err;
  }
}
