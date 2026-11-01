import assert from 'node:assert/strict';
import inventory from '../src/inventory.js';
import { japaneseProducts, translateProduction, translateHoliday } from '../src/japanese.js';

for (const item of inventory) {
	const translated = japaneseProducts[item.id];
	assert.ok(translated?.name, `Missing Japanese name: ${item.id}`);
	if (item.description) assert.ok(translated.description, `Missing Japanese description: ${item.id}`);
}
assert.equal(translateProduction('天天有'), '毎日製造');
assert.equal(translateProduction('製作日：1, 3'), '製造日：1, 3');
assert.equal(translateProduction('須預訂：5'), '要予約：5');
assert.equal(translateHoliday({ isCustom: true, monthLabel: '臨時店休', holidays: [] }).monthLabel, '臨時店休（日本語訳未対応）');
assert.equal(translateHoliday({ isCustom: true, monthLabel: '臨時店休', japaneseText: '臨時休業', holidays: [] }).monthLabel, '臨時休業');
assert.deepEqual(translateHoliday({ isCustom: false, monthLabel: '10月特別店休日：', holidays: ['10/10(六)', '10/23(五) 颱風'], openNotes: [] }).holidays, ['10/10(六)', '10/23(五) 颱風（日本語訳未対応）']);
console.log(`japanese_ok products=${inventory.length}`);
