import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import catalog, {
	CATALOG_LAST_UPDATED,
	catalogCategories,
	getProductPath,
	SITE_URL,
	validateCatalog,
} from '../src/catalog.js';

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, '..', 'dist');
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const json = (value) => JSON.stringify(value, null, 2).replace(/</g, '\\u003c');
const absolute = (path) => `${SITE_URL}${path}`;

const htmlShell = ({ title, description, canonical, body, schema, styles = '' }) => `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="index, follow">
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<link rel="icon" type="image/svg+xml" href="/logoF.svg">
${styles ? `<link rel="stylesheet" href="${styles}">` : ''}
<title>${esc(title)}</title>
${schema ? `<script type="application/ld+json">${json(schema)}</script>` : ''}
</head>
<body>${body}</body>
</html>`;

const baseSchema = {
	'@context': 'https://schema.org',
	'@type': 'Bakery',
	name: '簡實新村 Simplicity & Honesty',
	url: absolute('/'),
	telephone: '02-2918-9345',
	address: {
		'@type': 'PostalAddress',
		streetAddress: '新北市新店區大豐路61號',
		addressLocality: 'Xindian District',
		addressRegion: 'New Taipei City',
		postalCode: '23142',
		addressCountry: 'TW',
	},
};

const renderCard = (item) => `<article class="catalog-item">
<a href="${getProductPath(item)}" aria-disabled="true" tabindex="-1" style="cursor:default;pointer-events:none">
<img src="${esc(item.image)}" alt="${esc(item.image_alt)}" loading="lazy">
<h2>${esc(item.name_zh)} <span>${esc(item.name_en)}</span></h2>
<p>${esc(item.type)}</p>
${item.description ? `<p>${esc(item.description)}</p>` : ''}
<p>${esc(item.production_label)}｜$ ${item.price} TWD</p>
</a>
</article>`;

const productSchema = (item) => ({
	'@context': 'https://schema.org',
	'@type': 'Product',
	name: item.name_zh,
	alternateName: item.name_en,
	description: item.description || `${item.name_zh}｜${item.name_en}`,
	image: absolute(item.image),
	brand: { '@type': 'Brand', name: '簡實新村 Simplicity & Honesty' },
	url: absolute(getProductPath(item)),
	offers: {
		'@type': 'Offer',
		priceCurrency: item.currency,
		price: item.price,
		url: absolute(getProductPath(item)),
	},
});

const renderProduct = (item, styles) => {
	const description = item.description || `${item.name_zh}｜${item.name_en}`;
	return htmlShell({
		title: `${item.name_zh}｜${item.name_en}｜簡實新村`,
		description,
		canonical: absolute(getProductPath(item)),
		styles,
		schema: productSchema(item),
		body: `<main class="product-page">
<nav><a href="/">簡實新村商品型錄</a></nav>
<article>
<img src="${esc(item.image)}" alt="${esc(item.image_alt)}">
<h1>${esc(item.name_zh)}</h1>
<p>${esc(item.name_en)}</p>
<p>價格：$ ${item.price} ${item.currency}</p>
<p>飲食分類：${esc(item.type)}</p>
${item.description ? `<p>商品說明：${esc(item.description)}</p>` : ''}
<p>製作安排：${esc(item.production_label)}</p>
<p>訂購方式：${esc(item.order_method)}</p>
</article>
</main>`,
	});
};

const write = async (path, content) => {
	await mkdir(dirname(path), { recursive: true });
	await writeFile(path, content, 'utf8');
};

const result = validateCatalog();
const index = await readFile(join(dist, 'index.html'), 'utf8');
const styleMatch = index.match(/<link[^>]+href="(\/assets\/[^\"]+\.css)"/);
const styles = styleMatch?.[1] || '';
const staticCatalog = `<main class="static-catalog" aria-label="簡實新村商品型錄"><h1>簡實新村老麵饅頭商品型錄</h1><p>新北市新店區簡實新村官方商品資料。</p><section>${catalog.map(renderCard).join('')}</section></main>`;
const home = index.replace('<div id="root"></div>', `<div id="root">${staticCatalog}</div>`);
await write(join(dist, 'index.html'), home);

for (const item of catalog) {
	await write(join(dist, getProductPath(item), 'index.html'), renderProduct(item, styles));
}

for (const category of catalogCategories) {
	const items = catalog.filter((item) => item.category === category);
	const slug = `category-${items[0].slug.split('-').slice(1, 3).join('-')}`;
	const path = `/category/${slug}`;
	const schema = {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: category,
		url: absolute(path),
		mainEntity: { '@type': 'ItemList', itemListElement: items.map((item, position) => ({ '@type': 'ListItem', position: position + 1, url: absolute(getProductPath(item)), name: item.name_zh })) },
	};
	await write(join(dist, path, 'index.html'), htmlShell({
		title: `${category}｜簡實新村`,
		description: `簡實新村${category}商品型錄。`,
		canonical: absolute(path),
		styles,
		schema,
		body: `<main class="category-page"><nav><a href="/">簡實新村商品型錄</a></nav><h1>${esc(category)}</h1><section>${items.map(renderCard).join('')}</section></main>`,
	}));
}

await write(join(dist, 'about', 'index.html'), htmlShell({
	title: '關於簡實新村｜簡實新村',
	description: '簡實新村 Simplicity & Honesty 的官方介紹。',
	canonical: absolute('/about'),
	styles,
	schema: { ...baseSchema, '@type': 'AboutPage', mainEntity: baseSchema },
	body: '<main class="about-page"><nav><a href="/">簡實新村商品型錄</a></nav><h1>關於簡實新村</h1><p>簡實新村提供新北市新店區的老麵饅頭商品型錄。</p></main>',
}));

await write(join(dist, 'visit', 'index.html'), htmlShell({
	title: '前往簡實新村｜簡實新村',
	description: '簡實新村地址、電話與營業資訊。',
	canonical: absolute('/visit'),
	styles,
	schema: { ...baseSchema, '@type': 'Bakery', mainEntityOfPage: absolute('/visit') },
	body: '<main class="visit-page"><nav><a href="/">簡實新村商品型錄</a></nav><h1>前往簡實新村</h1><p>地址：新北市新店區大豐路61號</p><p>電話：02-2918-9345</p><p>營業資訊請以網站公告與店家提供資訊為準。</p></main>',
}));

const productJson = catalog.map((item) => ({
	slug: item.slug,
	name: item.name_zh,
	nameEn: item.name_en,
	price: item.price,
	currency: item.currency,
	dietaryType: item.type,
	category: item.category,
	availability: item.availability,
	productionDays: item.production_days,
	description: item.description || null,
	allergens: item.allergens,
	containsMilk: item.contains_milk,
	containsNuts: item.contains_nuts,
	containsSesame: item.contains_sesame,
	containsMeat: item.contains_meat,
	url: absolute(getProductPath(item)),
	lastUpdated: item.last_updated,
	dataStatus: item.data_status,
	source: 'official-catalog',
}));

const faq = [
	{ question: '哪些商品是 Vegan？', answer: '請以 products.json 中 dietaryType 標示為「素 Vegan」的商品為準。', sourceUrls: catalog.filter((item) => item.type.includes('Vegan')).map((item) => absolute(getProductPath(item))) },
	{ question: '哪些商品是奶素？', answer: '請以 products.json 中 dietaryType 標示為「奶素 Lacto-Vegetarian」的商品為準。', sourceUrls: catalog.filter((item) => item.type.includes('Lacto')).map((item) => absolute(getProductPath(item))) },
	{ question: '哪些商品天天有製作？', answer: 'availability 為 regular 的商品代表天天有製作，不代表即時庫存或剩餘數量。', sourceUrls: catalog.filter((item) => item.availability === 'regular').map((item) => absolute(getProductPath(item))) },
	{ question: '哪些商品有指定製作日？', answer: '請以 products.json 中 availability 為 scheduled 的商品及其 productionDays 為準。', sourceUrls: catalog.filter((item) => item.availability === 'scheduled').map((item) => absolute(getProductPath(item))) },
	{ question: '哪些商品需要預訂或屬於季節限定？', answer: '請以 products.json 中 availability 為 preorder 或 seasonal 的商品為準。', sourceUrls: catalog.filter((item) => ['preorder', 'seasonal'].includes(item.availability)).map((item) => absolute(getProductPath(item))) },
].map((item) => ({ ...item, lastUpdated: CATALOG_LAST_UPDATED, source: 'official-catalog' }));

const categoriesJson = catalogCategories.map((name) => ({ name, url: absolute(`/category/category-${catalog.find((item) => item.category === name).slug.split('-').slice(1, 3).join('-')}`), productCount: catalog.filter((item) => item.category === name).length }));
const machineFiles = {
	'/catalog.json': { generatedAt: CATALOG_LAST_UPDATED, source: 'official-catalog', priceRule: 'public price = base price + 2 TWD', products: productJson },
	'/products.json': productJson,
	'/categories.json': categoriesJson,
	'/faq.json': faq,
};
for (const [path, data] of Object.entries(machineFiles)) await write(join(dist, path), json(data));

const urls = [absolute('/') , ...catalog.map((item) => absolute(getProductPath(item))), ...categoriesJson.map((item) => item.url), absolute('/about'), absolute('/visit')];
await write(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `\t<url><loc>${url}</loc><lastmod>${CATALOG_LAST_UPDATED}</lastmod></url>`).join('\n')}\n</urlset>\n`);

const llms = `# 簡實新村 Simplicity & Honesty\n\n官方新北市新店區老麵饅頭商品型錄。以下機器資料由確認過的官方商品主檔於建置時產生。\n\n## Machine-readable catalog\n- [商品完整資料](${absolute('/products.json')}): 價格、分類、飲食類型、製作安排與正式商品 URL。\n- [商品型錄摘要](${absolute('/catalog.json')}): 商品資料與價格規則。\n- [分類資料](${absolute('/categories.json')}): 分類與商品頁對應。\n- [AI 問答資料](${absolute('/faq.json')}): 只提供由官方商品資料生成的查詢答案。\n\n## Rules\n- 價格為 base price 加上全站調整值 2 TWD。\n- 「天天有」表示天天有製作，不表示庫存或剩餘數量。\n- availability 只表示製作安排：regular、scheduled、preorder、seasonal。\n- 過敏原、奶類、堅果、芝麻與肉類不可由名稱、圖片或文字自行推論。\n- 優先引用正式商品頁 URL；不確定時不得創造庫存、付款、配送或健康承諾。\n- 最後資料更新：${CATALOG_LAST_UPDATED}\n`;
await write(join(dist, 'llms.txt'), llms);
console.log(`static_catalog_ok products=${result.count} categories=${result.categories} product_pages=${catalog.length} machine_files=${Object.keys(machineFiles).length}`);
