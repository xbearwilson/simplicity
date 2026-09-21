import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import inventory from '../src/inventory.js';

export const WATERMARK_MARKER = 'simplicity-watermark:v1';
export const PUBLIC_DIR = path.resolve('public');
export const WATERMARK_PATH = path.join(PUBLIC_DIR, 'watermark.webp');

sharp.cache(false);

export function getProductImageNames() {
	return [...new Set(inventory.map((item) => path.basename(item.pic)).filter((name) => /\.webp$/i.test(name)))].sort();
}

export async function hasWatermarkMarker(filePath) {
	const metadata = await sharp(filePath).metadata();
	return Boolean(metadata.exif?.toString('latin1').includes(WATERMARK_MARKER));
}

async function readGray(filePath) {
	return sharp(filePath).greyscale().raw().toBuffer({ resolveWithObject: true });
}

function normalizedCorrelation(image, imageWidth, template, templateWidth, templateHeight, left, top) {
	const count = templateWidth * templateHeight;
	let imageSum = 0;
	let templateSum = 0;
	for (let y = 0; y < templateHeight; y += 1) {
		for (let x = 0; x < templateWidth; x += 1) {
			imageSum += image[(top + y) * imageWidth + left + x];
			templateSum += template[y * templateWidth + x];
		}
	}
	const imageMean = imageSum / count;
	const templateMean = templateSum / count;
	let numerator = 0;
	let imageVariance = 0;
	let templateVariance = 0;
	for (let y = 0; y < templateHeight; y += 1) {
		for (let x = 0; x < templateWidth; x += 1) {
			const imageDelta = image[(top + y) * imageWidth + left + x] - imageMean;
			const templateDelta = template[y * templateWidth + x] - templateMean;
			numerator += imageDelta * templateDelta;
			imageVariance += imageDelta * imageDelta;
			templateVariance += templateDelta * templateDelta;
		}
	}
	return numerator / Math.sqrt(imageVariance * templateVariance || 1);
}

export async function detectLegacyWatermark(filePath) {
	const source = await sharp(filePath).metadata();
	const auditWidth = Math.min(source.width, 500);
	const { data: image, info } = await (auditWidth < source.width
		? sharp(filePath).resize({ width: auditWidth }).greyscale().raw().toBuffer({ resolveWithObject: true })
		: readGray(filePath));
	const candidates = [];
	const scales = [0.08, 0.1, 0.12, 0.13, 0.14, 0.16];
	const watermark = await readGray(WATERMARK_PATH);

	for (const scale of scales) {
		const templateWidth = Math.max(16, Math.round(info.width * scale));
		const resized = await sharp(WATERMARK_PATH)
			.resize({ width: templateWidth })
			.greyscale()
			.raw()
			.toBuffer({ resolveWithObject: true });
		const templateHeight = resized.info.height;
		const padding = Math.max(1, Math.round(info.width * 0.03));
		const regions = [
			{ corner: 'nw', baseX: padding, baseY: padding },
			{ corner: 'ne', baseX: info.width - templateWidth - padding, baseY: padding },
			{ corner: 'sw', baseX: padding, baseY: info.height - templateHeight - padding },
			{ corner: 'se', baseX: info.width - templateWidth - padding, baseY: info.height - templateHeight - padding },
		];

		for (const region of regions) {
			for (const yOffset of [-12, -6, 0, 6, 12]) {
				for (const xOffset of [-12, -6, 0, 6, 12]) {
					const top = Math.max(0, Math.min(info.height - templateHeight, region.baseY + yOffset));
					const left = Math.max(0, Math.min(info.width - templateWidth, region.baseX + xOffset));
					if (left + templateWidth > info.width || top + templateHeight > info.height) continue;
					const score = normalizedCorrelation(image, info.width, resized.data, templateWidth, templateHeight, left, top);
					candidates.push({ corner: region.corner, score, scale, left, top, width: templateWidth, height: templateHeight });
				}
			}
		}
	}

	const byCorner = ['nw', 'ne', 'sw', 'se']
		.map((corner) => candidates.filter((candidate) => candidate.corner === corner).sort((a, b) => b.score - a.score)[0])
		.filter(Boolean);
	const strong = byCorner.filter((candidate) => candidate.score >= 0.5).sort((a, b) => b.score - a.score);
	return {
		best: byCorner.sort((a, b) => b.score - a.score)[0] ?? null,
		strongCorners: strong.map((candidate) => candidate.corner),
		strongCandidates: strong,
	};
}

export async function inspectWatermark(filePath) {
	const marked = await hasWatermarkMarker(filePath);
	const detected = await detectLegacyWatermark(filePath);
	const duplicateSuspected = detected.strongCorners.length > 1;
	let status = 'ambiguous';
	if (duplicateSuspected) status = 'duplicate-suspected';
	else if (marked) status = 'marked';
	else if (detected.best?.score >= 0.5) status = 'legacy-watermarked';
	else if (detected.best?.score < 0.4) status = 'likely-missing';

	return {
		status,
		marker: marked,
		bestScore: detected.best ? Number(detected.best.score.toFixed(3)) : null,
		bestCorner: detected.best?.corner ?? null,
		strongCorners: detected.strongCorners,
	};
}

export async function assertProductImage(fileName) {
	const filePath = path.join(PUBLIC_DIR, fileName);
	await fs.access(filePath);
	return filePath;
}
