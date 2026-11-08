import { access } from 'node:fs/promises';
import { join } from 'node:path';

// Not referenced by src/ (used by external links/marketing). Never delete as "unused".
// Deleted by mistake in b14b493 and 0984e6f.
export const protectedAssets = [
	'A3_1.webp', 'A3_2.webp', 'A3_3.webp', 'A3_4.webp', 'newItem.webp',
	'post.webp', 'hot.webp',
];

const missing = [];
for (const name of protectedAssets) {
	try { await access(join('public', name)); } catch { missing.push(name); }
}
if (missing.length) {
	console.error(`Protected public assets missing: ${missing.join(', ')}\nRestore: git checkout 0984e6f^ -- ${missing.map((n) => `public/${n}`).join(' ')}`);
	process.exit(1);
}
