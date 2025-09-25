/*
 * @Date: 2023-01-05 06:29:27
 * @LastEditTime: 2023-01-07 10:23:16
 * @Description:
 */
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
// import htmlPurge from 'vite-plugin-purgecss';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		{
			name: 'reload',
			configureServer(server) {
				const { ws, watcher } = server;
				watcher.on('change', (file) => {
					if (
						file.endsWith('.html') ||
						file.endsWith('.pug') ||
						file.endsWith('.css') ||
						file.endsWith('.sass') ||
						file.endsWith('.scss') ||
						file.endsWith('.styl') ||
						file.endsWith('.jsx') ||
						file.endsWith('.js')
					) {
						ws.send({
							type: 'full-reload',
						});
					}
				});
			},
		},
		react(),
		// htmlPurge([htmlPurge()]),
	],
	resolve: {
		alias: {
			'~': resolve(__dirname, './'),
			'@': resolve(__dirname, 'src'), // 设置 `@` 指向 `src` 目录
		},
		extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.mjs'],
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
