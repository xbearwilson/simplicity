module.exports = {
	plugins: {
		cssnano: {
			preset: 'default',
		},
		// https://github.com/postcss/postcss-easings
		'postcss-import': {},
		'postcss-easings': {},
		'postcss-nested': {},
		// 兼容浏览器，添加前缀
		'postcss-pxtorem': {},
		'postcss-assets': {},
		'postcss-combine-duplicated-selectors': {},
		'postcss-combine-media-query': {},
		autoprefixer: {
			// overrideBrowserslist: [
			//   "Android 4.1",
			//   "iOS 7.1",
			//   "Chrome > 31",
			//   "ff > 31",
			//   "ie >= 8",
			//   "last 10 versions", // 所有主流浏览器最近10版本用
			// ],
			overrideBrowserslist: [
				'last 2 versions', // 所有主流浏览器最近10版本用
			],
			grid: false,
		},
		// 'postcss-pxtorem': {
		// 	// Vant 官方根字体大小是 37.5
		// 	rootValue: 10,
		// 	// rootValue: 16,
		// 	//是一个存储哪些将被转换的属性列表，这里设置为['*']全部，假设需要仅对边框进行设置，可以写['*', '!border*']
		// 	propList: ['*'],
		// 	// 过滤掉.norem-开头的class，不进行rem转换
		// 	selectorBlackList: ['.norem'],
		// 	unitPrecision: 5, //保留rem小数点多少位
		// 	mediaQuery: false, // 媒体查询( @media screen 之类的)中不生效
		// 	minPixelValue: 1 // px小于12的不会被转换
		// },
		'postcss-preset-env': {
			stage: 2,
			features: { 'nesting-rules': true },
		},
		//! 20250919 precss 會報錯，先移除
		// precss: {}, // 使用類似 SASS 的功能，例如：變數、標記和分級
		...(process.env.NODE_ENV === 'production'
			? {
					// cssnano: {}
			  }
			: {}),
	},
};
