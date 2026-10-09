import path from 'node:path';

const excludedFiles = new Set([
	'og.webp', 'a3_1.webp', 'a3_2.webp', 'a3_3.webp', 'a3_4.webp',
	'hot.webp', 'post.webp', 'newitem.webp', 'watermark.webp',
]);

export function isWatermarkExcluded(fileName) {
	return excludedFiles.has(path.basename(fileName).toLowerCase());
}
