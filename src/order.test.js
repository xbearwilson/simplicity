import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	EMPTY_CUSTOMER,
	MAX_QTY,
	buildOrderText,
	buildOrderTsv,
	clampQty,
	missingFields,
	resolveCart,
	sanitizeCart,
	sanitizeCustomer,
	setCartQty,
	summarize,
} from './order.js';

const products = [
	{ id: 1, name: '芝麻包', price: 25 },
	{ id: 2, name: '黑糖饅頭', price: 25 },
	{ id: 3, name: '全麥吐司', price: 40 },
];
const priceOf = (p) => p.price + 2;

const deliveryCustomer = {
	method: 'delivery',
	name: '王小明',
	phone: '0912-345-678',
	address: '台北市信義路1號',
	note: '請下午送',
};

test('clampQty 轉整數並限制 0..MAX_QTY', () => {
	assert.equal(clampQty('3'), 3);
	assert.equal(clampQty('2.7'), 2);
	assert.equal(clampQty(''), 0);
	assert.equal(clampQty('abc'), 0);
	assert.equal(clampQty(-5), 0);
	assert.equal(clampQty(5000), MAX_QTY);
});

test('setCartQty 設定、移除且不改動原物件', () => {
	const a = setCartQty({}, 1, 1);
	assert.deepEqual(a, { 1: 1 });
	const b = setCartQty(a, 1, 0);
	assert.deepEqual(b, {});
	assert.deepEqual(a, { 1: 1 });
	assert.deepEqual(setCartQty({ 1: 2 }, 1, 1000), { 1: MAX_QTY });
});

test('resolveCart 依商品順序、略過不存在 id、計算小計', () => {
	const lines = resolveCart({ 3: 1, 1: 3, 99: 5 }, products, priceOf);
	assert.deepEqual(lines, [
		{ id: 1, name: '芝麻包', qty: 3, price: 27, subtotal: 81 },
		{ id: 3, name: '全麥吐司', qty: 1, price: 42, subtotal: 42 },
	]);
	assert.deepEqual(summarize(lines), { count: 2, qty: 4, total: 123 });
});

test('sanitizeCart 只保留有效 id 與正整數數量', () => {
	assert.deepEqual(sanitizeCart({ 1: 2, 2: 0, 99: 3, 3: 'x' }, [1, 2, 3]), { 1: 2 });
	assert.deepEqual(sanitizeCart(null, [1]), {});
	assert.deepEqual(sanitizeCart('bad', [1]), {});
});

test('sanitizeCustomer 補齊欄位並拒絕無效方式', () => {
	assert.deepEqual(sanitizeCustomer(null), EMPTY_CUSTOMER);
	assert.deepEqual(sanitizeCustomer({ method: 'hack', name: 3, phone: '09' }), { ...EMPTY_CUSTOMER, phone: '09' });
	assert.deepEqual(sanitizeCustomer(deliveryCustomer), deliveryCustomer);
});

test('missingFields：自取不需地址，宅配/冷凍需要地址，備註永不必填', () => {
	assert.deepEqual(missingFields(EMPTY_CUSTOMER), ['name', 'phone']);
	assert.deepEqual(missingFields({ ...EMPTY_CUSTOMER, method: 'frozen' }), ['name', 'phone', 'address']);
	assert.deepEqual(missingFields({ ...deliveryCustomer, name: '   ' }), ['name']);
	assert.deepEqual(missingFields(deliveryCustomer), []);
});

test('buildOrderText 宅配格式', () => {
	const lines = resolveCart({ 1: 3, 2: 2 }, products, priceOf);
	assert.equal(
		buildOrderText(lines, deliveryCustomer),
		[
			'【簡實新村 訂購單】',
			'方式：宅配',
			'姓名：王小明',
			'電話：0912-345-678',
			'地址：台北市信義路1號',
			'---',
			'芝麻包 x3　NT$81',
			'黑糖饅頭 x2　NT$54',
			'---',
			'合計 5 顆　NT$135',
			'備註：請下午送',
		].join('\n'),
	);
});

test('buildOrderText 自取省略地址；無備註省略備註行', () => {
	const lines = resolveCart({ 3: 1 }, products, priceOf);
	const text = buildOrderText(lines, { ...deliveryCustomer, method: 'pickup', note: '  ' });
	assert.ok(text.includes('方式：自取'));
	assert.ok(!text.includes('地址：'));
	assert.ok(!text.includes('備註：'));
});

test('buildOrderTsv 客戶列＋品項表，並移除欄位內的 Tab/換行', () => {
	const lines = resolveCart({ 1: 3, 2: 2 }, products, priceOf);
	const tsv = buildOrderTsv(lines, { ...deliveryCustomer, method: 'frozen', note: '第一行\n第二\t行' });
	assert.equal(
		tsv,
		[
			'方式\t姓名\t電話\t地址\t備註',
			'冷凍\t王小明\t0912-345-678\t台北市信義路1號\t第一行 第二 行',
			'',
			'品名\t數量\t單價\t小計',
			'芝麻包\t3\t27\t81',
			'黑糖饅頭\t2\t27\t54',
			'合計\t5\t\t135',
		].join('\n'),
	);
});

test('buildOrderTsv 自取時地址欄留空', () => {
	const lines = resolveCart({ 1: 1 }, products, priceOf);
	const row = buildOrderTsv(lines, { ...deliveryCustomer, method: 'pickup', note: '' }).split('\n')[1];
	assert.equal(row, '自取\t王小明\t0912-345-678\t\t');
});
