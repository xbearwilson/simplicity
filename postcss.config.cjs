module.exports = {
	plugins: {
		// 1. Import resolution - must be first
		'postcss-import': {},

		// 2. CSS nesting support
		'postcss-nested': {},

		// 3. Modern CSS features (stage 2 = widely supported)
		'postcss-preset-env': {
			stage: 2,
			features: {
				'nesting-rules': true,
				'custom-media-queries': true,
			},
		},

		// 4. Custom easing functions
		'postcss-easings': {},

		// 5. Browser prefixes
		autoprefixer: {
			overrideBrowserslist: ['last 2 versions', '> 1%', 'not dead'],
			grid: false,
		},

		// 6. Combine duplicate selectors for cleaner CSS
		'postcss-combine-duplicated-selectors': {
			removeDuplicatedProperties: true,
		},

		// 7. Sort and optimize media queries (desktop-first: desktopFirst: true, mobile-first: false)
		'postcss-sort-media-queries': {
			sort: 'desktop-first', // Change to 'mobile-first' if needed
		},

		// 8. Production-only minification
		...(process.env.NODE_ENV === 'production'
			? {
					cssnano: {
						preset: [
							'default',
							{
								discardComments: {
									removeAll: true,
								},
								normalizeWhitespace: true,
								colormin: true,
								minifyFontValues: true,
								minifySelectors: true,
							},
						],
					},
			  }
			: {}),
	},
};
