/**
 * Comprime uma imagem usando Canvas antes de salvar como base64.
 * Reduz a resolução e qualidade para ficar abaixo de ~500KB (seguro para Firestore).
 */
export function comprimirImagem(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.6
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Redimensionar mantendo proporção
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível criar canvas'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Converter para base64 comprimido (JPEG)
        const base64 = canvas.toDataURL('image/jpeg', quality);
        resolve(base64);
      };
      img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}
