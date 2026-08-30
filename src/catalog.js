import inventory from './inventory.js';

export const SITE_URL = 'https://simplicity-coral.vercel.app';
export const PRICE_ADJUSTMENT = 2;
export const CATALOG_LAST_UPDATED = '2026-08-30';

const slugify = (value) =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

const getAvailability = (item) => {
	const source = `${item.description || ''} ${item.do || ''}`;
	if (source.includes('夏季限定') || source.includes('季節限定')) return 'seasonal';
	if (source.includes('需預訂')) return 'preorder';
	if ((item.do || '').startsWith('製作日')) return 'scheduled';
	return 'regular';
};

const getProductionDays = (item) => {
	if (getAvailability(item) === 'regular') return ['daily'];
	const match = (item.do || '').match(/製作日：(.+)/);
	return match ? match[1].split(/[,，、\s]+/).filter(Boolean) : [];
};

const getPublicLabel = (item) => {
	if (getAvailability(item) === 'regular') return '天天有製作 Every day';
	return item.do || item.description || '';
};

export const getPublicPrice = (item) => item.price + PRICE_ADJUSTMENT;
export const getProductPath = (item) => `/products/${item.slug}`;

export const catalog = inventory.map((item) => ({
	...item,
	slug: `${item.id}-${slugify(item.ename || item.name)}`,
	name_zh: item.name,
	name_en: item.ename,
	base_price: item.price,
	price: getPublicPrice(item),
	currency: 'TWD',
	availability: getAvailability(item),
	production_days: getProductionDays(item),
	production_label: getPublicLabel(item),
	image: item.pic.replace(/^\.\//, '/'),
	image_alt: `簡實新村 ${item.name} ${item.ename}`,
	order_method: '請依網站公布方式，以電話或店家指定方式訂購。',
	last_updated: CATALOG_LAST_UPDATED,
	data_status: 'confirmed',
	// These fields are intentionally not inferred from names or images.
	allergens: 'unknown',
	contains_milk: 'unknown',
	contains_nuts: 'unknown',
	contains_sesame: 'unknown',
	contains_meat: 'unknown',
}));

export const catalogCategories = [...new Set(catalog.map((item) => item.category))];

export const validateCatalog = () => {
	const ids = new Set();
	const slugs = new Set();
	for (const item of catalog) {
		if (ids.has(item.id)) throw new Error(`Duplicate product id: ${item.id}`);
		if (slugs.has(item.slug)) throw new Error(`Duplicate product slug: ${item.slug}`);
		if (item.base_price < 0 || item.price < 0) throw new Error(`Invalid price: ${item.slug}`);
		if (!['regular', 'scheduled', 'preorder', 'seasonal'].includes(item.availability)) {
			throw new Error(`Invalid availability: ${item.slug}`);
		}
		if (item.data_status !== 'confirmed') throw new Error(`Unconfirmed product: ${item.slug}`);
		ids.add(item.id);
		slugs.add(item.slug);
	}
	return { count: catalog.length, categories: catalogCategories.length };
};

export default catalog;
