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
};

/**
 * 取得要顯示的店休日資訊
 * @param {Date} now - 當前時間
 * @returns {null|{monthLabel: string, holidays: string[]}}
 */
export function getCurrentHolidayInfo(now = new Date()) {
	// 回傳所有有未過期店休日的月份
	const pad = (n) => n.toString().padStart(2, '0');
	const allKeys = Object.keys(storeHolidays).sort();
	const results = [];
	for (const key of allKeys) {
		const holidays = storeHolidays[key];
		if (!holidays || holidays.length === 0) continue;
		const holidayDates = holidays.map((h) => new Date(h.date));
		const firstDay = new Date(key + '-01T00:00:00');
		const showStart = new Date(firstDay);
		showStart.setMonth(showStart.getMonth() - 1);
		showStart.setDate(1);
		// 取該月所有店休日的最大日期（避免順序影響）
		const maxDate = new Date(Math.max(...holidayDates.map((d) => d.getTime())));
		const showEnd = new Date(maxDate);
		showEnd.setHours(23, 59, 59, 999);
		const validHolidays = holidays.filter((h) => now <= new Date(h.date + 'T23:59:59'));
		if (now >= showStart && now <= showEnd && validHolidays.length > 0) {
			const monthLabel = key.split('-')[1].replace(/^0/, '') + '月特別店休日：';
			results.push({ monthLabel, holidays: validHolidays.map((h) => h.label) });
		}
	}
	return results.length > 0 ? results : null;
}
