/*
 * @Date: 2023-01-05 06:29:27
 * @LastEditTime: 2023-01-07 10:23:16
 * @Description:
 */
import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import htmlPurge from 'vite-plugin-purgecss';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), htmlPurge([htmlPurge()])],
	resolve: {
		alias: {
			'~': resolve(__dirname, './'),
			'@': resolve(__dirname, 'src'), // 设置 `@` 指向 `src` 目录
		},
		extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.mjs'],
	},
	css: {
		postcss: {
			plugins: [
				autoprefixer({
					// overrideBrowserslist: [
					//   "Android 4.1",
					//   "iOS 7.1",
					//   "Chrome > 31",
					//   "ff > 31",
					//   "ie >= 8",
					//   "last 10 versions", // 所有主流浏览器最近10版本用
					// ],
					overrideBrowserslist: [
						'last 10 versions', // 所有主流浏览器最近10版本用
					],
					grid: true,
				}), // add options if needed
			],
		},
	},
	server: {
		// host: '0.0.0.0',
		// port: 3000,
		open: true,
		//! 20241026 add for fix pug’s not hot reload  https://tinyurl.com/24zssqcx
		watch: {
			usePolling: true,
		},
	},
});
