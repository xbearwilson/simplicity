import fs from 'node:fs/promises';
import path from 'node:path';
import {
	PUBLIC_DIR,
	getProductImageNames,
	inspectWatermark,
} from './watermark-utils.mjs';

const names = getProductImageNames();
const results = [];
for (const name of names) {
	const filePath = path.join(PUBLIC_DIR, name);
	try {
		results.push({ file: name, ...(await inspectWatermark(filePath)) });
	} catch (error) {
		results.push({ file: name, status: 'missing-file', error: error.message });
	}
}

const counts = Object.fromEntries(
	[...new Set(results.map((result) => result.status))].map((status) => [status, results.filter((result) => result.status === status).length])
);
const blockers = results.filter((result) => !['marked', 'legacy-watermarked'].includes(result.status));
const report = { productImages: names.length, counts, results };
if (process.argv.includes('--counts-only')) {
	console.log(JSON.stringify({ productImages: names.length, counts, blockerCount: blockers.length }));
} else if (process.argv.includes('--summary')) {
	console.log(JSON.stringify({ productImages: names.length, counts, blockers: blockers.map(({ file, status, bestScore, bestCorner, strongCorners }) => ({ file, status, bestScore, bestCorner, strongCorners })) }, null, 2));
} else {
	console.log(JSON.stringify(report, null, 2));
}
if (blockers.length > 0) {
	console.error(`watermark_audit_failed blockers=${blockers.length}`);
	process.exitCode = 1;
} else {
	console.log(`watermark_audit_ok productImages=${names.length}`);
}
