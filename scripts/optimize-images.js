import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');

async function optimizeImages() {
	try {
		const files = await fs.readdir(publicDir);

		for (const file of files) {
			const filePath = path.join(publicDir, file);
			const ext = path.extname(file).toLowerCase();

			if (['.jpg', '.jpeg', '.png'].includes(ext)) {
				console.log(`Converting: ${file}`);

				const buffer = await fs.readFile(filePath);
				const webpPath = filePath.replace(ext, '.webp');

				const optimizedBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();

				await fs.writeFile(webpPath, optimizedBuffer);

				// Delete original file
				await fs.unlink(filePath);

				const originalSize = buffer.length;
				const newSize = optimizedBuffer.length;
				const savings = (((originalSize - newSize) / originalSize) * 100).toFixed(2);
				console.log(
					`  Converted to WebP: ${savings}% saved (${(originalSize / 1024).toFixed(2)}KB -> ${(newSize / 1024).toFixed(
						2
					)}KB)`
				);
			}
		}
		console.log('Image optimization complete!');
	} catch (error) {
		console.error('Error optimizing images:', error);
	}
}

optimizeImages();
