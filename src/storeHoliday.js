/**
 * @antigravity-audit
 * [CREATED]: 2026-01-30
 * [MODIFIED]: 2026-02-03 12:05:00
 * [VERSION]: 1.1.0
 * [SUMMARY]: 新增 custom 欄位支援純文字公告，並優化日期範圍判斷邏輯。
 * [DATE]: 2026-02-03
 */
// storeHoliday.js
// 設定每月店休日，並提供顯示邏輯

/**
 * 範例設定：
 * {
 *   '2025-09': [
 *     { date: '2025-09-29', label: '9/29(一)' },
 *     { date: '2025-09-15', label: '9/15(日)' }
 *   ],
 *   '2025-10': [
 *     { date: '2025-10-10', label: '10/10(五)' }
 *   ]
 * }
 */
export const storeHolidays = {
	'2025-09': [{ date: '2025-09-29', label: '9/29(一)' }],
	'2025-10': [
		{ date: '2025-10-06', label: '10/6(一)' },
		{ date: '2025-10-11', label: '10/11(六)' },
		{ date: '2025-10-25', label: '10/25(六)' },
	],
	custom: [
		{
			text: '敬祝春節萬事如意-店休：2/14(六) - 2/21(六)，2/23(一) 開工大吉',
			start: '2026-02-01',
			end: '2026-02-23',
		},
	],
};

/**
 * 取得要顯示的店休日資訊
 * @param {Date} now - 當前時間
 * @returns {null|Array<{monthLabel: string, holidays: string[], isCustom: boolean}>}
 */
export function getCurrentHolidayInfo(now = new Date()) {
	// 修正：補足時分秒以確保日期比較準確
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

	const results = [];

	// 1. 處理自定義文字內容
	if (storeHolidays.custom) {
		for (const item of storeHolidays.custom) {
			const startDate = new Date(item.start + 'T00:00:00');
			const endDate = new Date(item.end + 'T23:59:59');
			if (now >= startDate && now <= endDate) {
				results.push({
					isCustom: true,
					monthLabel: item.text,
					holidays: [],
				});
			}
		}
	}

	// 2. 處理月份店休日
	const allKeys = Object.keys(storeHolidays)
		.filter((key) => key.match(/^\d{4}-\d{2}$/))
		.sort();

	for (const key of allKeys) {
		const holidays = storeHolidays[key];
		if (!holidays || holidays.length === 0) continue;

		const holidayDates = holidays.map((h) => new Date(h.date));
		const firstDay = new Date(key + '-01T00:00:00');
		const showStart = new Date(firstDay);
		showStart.setMonth(showStart.getMonth() - 1);
		showStart.setDate(1);

		const maxDate = new Date(Math.max(...holidayDates.map((d) => d.getTime())));
		const showEnd = new Date(maxDate);
		showEnd.setHours(23, 59, 59, 999);

		const validHolidays = holidays.filter((h) => now <= new Date(h.date + 'T23:59:59'));

		if (now >= showStart && now <= showEnd && validHolidays.length > 0) {
			const monthLabel = key.split('-')[1].replace(/^0/, '') + '月特別店休日：';
			results.push({
				isCustom: false,
				monthLabel,
				holidays: validHolidays.map((h) => h.label),
			});
		}
	}

	return results.length > 0 ? results : null;
}
