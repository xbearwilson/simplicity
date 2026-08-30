import { access, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(projectRoot, 'dist');
const read = (path) => readFile(join(dist, path), 'utf8');
const productJson = JSON.parse(await read('products.json'));
const faqJson = JSON.parse(await read('faq.json'));
const sitemap = await read('sitemap.xml');
const home = await read('index.html');
const samplePath = join(dist, 'products', productJson[0].slug, 'index.html');
const sample = await readFile(samplePath, 'utf8');

if (productJson.length !== 87) throw new Error(`Expected 87 products, got ${productJson.length}`);
if (faqJson.length === 0) throw new Error('Expected machine FAQ entries');
if ((sitemap.match(/<loc>/g) || []).length !== 95) throw new Error('Unexpected sitemap URL count');
if (!home.includes('static-catalog') || !home.includes('白饅頭')) throw new Error('Homepage is not pre-rendered');
if (!sample.includes('"@type": "Product"') || !sample.includes(`${productJson[0].price} TWD`)) throw new Error('Product page is incomplete');
if (sample.includes('FAQPage') || sample.includes('尚未提供') || sample.includes('請訂購前確認')) throw new Error('Forbidden FAQ or unknown-data copy found');
for (const path of ['about/index.html', 'visit/index.html', 'catalog.json', 'products.json', 'categories.json', 'faq.json', 'llms.txt', 'sitemap.xml']) await access(join(dist, path));
console.log(`static_verify_ok products=${productJson.length} faq=${faqJson.length} sitemap_urls=95`);
