import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { WATERMARK_MARKER, PUBLIC_DIR, assertProductImage } from './watermark-utils.mjs';

if (!process.argv.includes('--confirm')) {
	throw new Error('Refusing metadata-only migration. Add --confirm after visual verification.');
}

const files = process.argv.slice(2).filter((name) => !name.startsWith('-'));
if (files.length === 0) throw new Error('Usage: pnpm watermark:mark-verified -- --confirm <file.webp> [...files]');

for (const fileName of files) {
	const inputPath = await assertProductImage(path.basename(fileName));
	const tempPath = `${inputPath}.marker.tmp`;
	const output = await sharp(inputPath)
		.withMetadata({ exif: { IFD0: { ImageDescription: WATERMARK_MARKER } } })
		.webp({ quality: 90, effort: 6, smartSubsample: true })
		.toBuffer();
	await fs.writeFile(tempPath, output);
	await fs.rm(inputPath);
	await fs.rename(tempPath, inputPath);
	console.log(`marked ${path.basename(inputPath)} marker=${WATERMARK_MARKER}`);
}
