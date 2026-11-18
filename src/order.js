// 選品清單：純函式（無 DOM），供 App.jsx 使用並由 order.test.js 驗證。
// 輸出文字一律繁中，與介面語言無關。

export const MAX_QTY = 999;

export const METHODS = { pickup: '自取', delivery: '宅配', frozen: '冷凍' };

export const FIELD_LABELS = { name: '姓名', phone: '電話', date: '取貨日', address: '地址', note: '備註' };

export const EMPTY_CUSTOMER = { method: 'pickup', name: '', phone: '', date: '', address: '', note: '' };

export const clampQty = (value) => {
	const n = Math.trunc(Number(value));
	if (!Number.isFinite(n) || n <= 0) return 0;
	return Math.min(n, MAX_QTY);
};

export const setCartQty = (cart, id, qty) => {
	const next = { ...cart };
	const n = clampQty(qty);
	if (n > 0) next[id] = n;
	else delete next[id];
	return next;
};

// 依 products 順序輸出，略過已下架（不存在）的 id
export const resolveCart = (cart, products, priceOf) =>
	products
		.filter((p) => cart[p.id] > 0)
		.map((p) => {
			const qty = cart[p.id];
			const price = priceOf(p);
			return { id: p.id, name: p.name, qty, price, subtotal: price * qty };
		});

export const summarize = (lines) => ({
	count: lines.length,
	qty: lines.reduce((sum, l) => sum + l.qty, 0),
	total: lines.reduce((sum, l) => sum + l.subtotal, 0),
});

export const needsAddress = (method) => method === 'delivery' || method === 'frozen';

export const missingFields = (customer) => {
	const required = ['name', 'phone', 'date', ...(needsAddress(customer.method) ? ['address'] : [])];
	return required.filter((key) => !String(customer[key] ?? '').trim());
};

export const sanitizeCart = (raw, validIds) => {
	if (!raw || typeof raw !== 'object') return {};
	const valid = new Set(validIds.map(String));
	const cart = {};
	for (const [id, qty] of Object.entries(raw)) {
		const n = clampQty(qty);
		if (valid.has(id) && n > 0 && Number.isInteger(Number(qty))) cart[id] = n;
	}
	return cart;
};

export const sanitizeCustomer = (raw) => {
	const customer = { ...EMPTY_CUSTOMER };
	if (!raw || typeof raw !== 'object') return customer;
	if (Object.hasOwn(METHODS, raw.method)) customer.method = raw.method;
	for (const key of Object.keys(FIELD_LABELS)) {
		if (typeof raw[key] === 'string') customer[key] = raw[key];
	}
	return customer;
};

export const buildOrderText = (lines, customer) => {
	const { qty, total } = summarize(lines);
	const note = customer.note.trim();
	return [
		'【簡實新村 訂購單】',
		`方式：${METHODS[customer.method]}`,
		`姓名：${customer.name.trim()}`,
		`電話：${customer.phone.trim()}`,
		`取貨日：${customer.date}`,
		...(needsAddress(customer.method) ? [`地址：${customer.address.trim()}`] : []),
		'---',
		...lines.map((l) => `${l.name} x${l.qty}　NT$${l.subtotal}`),
		'---',
		`合計 ${qty} 顆　NT$${total}`,
		...(note ? [`備註：${note}`] : []),
	].join('\n');
};

// Tab/換行會破壞 Excel 分欄，一律換成空白
const cell = (value) => String(value ?? '').replace(/[\t\r\n]+/g, ' ').trim();

export const buildOrderTsv = (lines, customer) => {
	const { qty, total } = summarize(lines);
	const address = needsAddress(customer.method) ? customer.address : '';
	return [
		['方式', '姓名', '電話', '取貨日', '地址', '備註'],
		[METHODS[customer.method], customer.name, customer.phone, customer.date, address, customer.note].map(cell),
		[],
		['品名', '數量', '單價', '小計'],
		...lines.map((l) => [cell(l.name), l.qty, l.price, l.subtotal]),
		['合計', qty, '', total],
	]
		.map((row) => row.join('\t'))
		.join('\n');
};
