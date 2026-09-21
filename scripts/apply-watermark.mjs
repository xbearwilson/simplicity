import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { hasWatermarkMarker, inspectWatermark, WATERMARK_MARKER } from './watermark-utils.mjs';

const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, 'public');
const watermarkPath = path.join(publicDir, 'watermark.webp');
const inputNames = process.argv.slice(2).filter((name) => !name.startsWith('-'));
sharp.cache(false);

if (inputNames.length === 0) {
	console.error('Usage: pnpm watermark -- --confirm-missing <public-image.webp> [...files]');
	process.exit(2);
}

const confirmMissing = process.argv.includes('--confirm-missing');

const positions = ['nw', 'ne', 'sw', 'se'];
const watermarkBuffer = await fs.readFile(watermarkPath);

for (const inputName of inputNames) {
	const fileName = path.basename(inputName);
	if (fileName.toLowerCase() === 'watermark.webp' || !/\.webp$/i.test(fileName)) {
		throw new Error(`Only target WebP files are accepted: ${inputName}`);
	}

	const inputPath = path.join(publicDir, fileName);
	const tempPath = `${inputPath}.watermark.tmp`;
	const inspection = await inspectWatermark(inputPath);
	if (inspection.status !== 'likely-missing' || !confirmMissing) {
		throw new Error(`Refusing watermark overwrite for ${fileName}: status=${inspection.status} score=${inspection.bestScore}`);
	}
	if (await hasWatermarkMarker(inputPath)) {
		throw new Error(`Refusing duplicate watermark for ${fileName}: marker already exists`);
	}
	const metadata = await sharp(inputPath).metadata();
	if (!metadata.width || !metadata.height) {
		throw new Error(`Missing image dimensions: ${fileName}`);
	}

	const scale = 0.08 + Math.random() * 0.06;
	const watermark = await sharp(watermarkBuffer)
		.resize({ width: Math.max(21, Math.round(metadata.width * scale)) })
		.toBuffer();
	const watermarkMetadata = await sharp(watermark).metadata();
	const padding = Math.max(6, Math.round(metadata.width * 0.03));
	const position = positions[Math.floor(Math.random() * positions.length)];
	const left = position.endsWith('e')
		? Math.max(0, metadata.width - watermarkMetadata.width - padding)
		: padding;
	const top = position.startsWith('s')
		? Math.max(0, metadata.height - watermarkMetadata.height - padding)
		: padding;

	const outputBuffer = await sharp(inputPath)
		.composite([{ input: watermark, left, top }])
		.withMetadata({ exif: { IFD0: { ImageDescription: WATERMARK_MARKER } } })
		.webp({ quality: 90, effort: 6, smartSubsample: true })
		.toBuffer();
	await fs.writeFile(tempPath, outputBuffer);
	await fs.rm(inputPath);
	await fs.rename(tempPath, inputPath);
	console.log(`watermarked ${fileName} position=${position} scale=${scale.toFixed(4)} left=${left} top=${top}`);
}
