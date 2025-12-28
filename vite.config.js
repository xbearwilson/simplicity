/*
 * @Date: 2023-01-05 06:29:27
 * @LastEditTime: 2025-12-03 17:26:00
 * @Description: React + CSS + JS Development Environment with WebP Image Optimization
 */
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

// Custom Plugin to generate WebP images and update references
const generateWebp = () => {
	return {
		name: 'generate-webp',
		apply: 'build',
		writeBundle: async (options, bundle) => {
			const sharp = (await import('sharp')).default;
			const fs = await import('fs');
			const path = await import('path');
			const outDir = options.dir || 'dist';

			const imagesToProcess = [];
			const filesToUpdate = [];

			// Watermark setup
			const watermarkPath = path.resolve('public/watermark.webp');
			const hasWatermark = fs.existsSync(watermarkPath);
			if (hasWatermark) {
				console.log(`Watermark found at: ${watermarkPath}`);
			} else {
				console.warn(`Watermark NOT found at: ${watermarkPath}`);
			}

			const processDirectory = (dir) => {
				const entries = fs.readdirSync(dir, { withFileTypes: true });
				for (const entry of entries) {
					const fullPath = path.join(dir, entry.name);
					if (entry.isDirectory()) {
						processDirectory(fullPath);
					} else {
						// Include GIF and existing WebP files in the conversion process
						// BUT exclude watermark.webp and logo files from being processed
						if (/\.(png|jpe?g|gif|webp)$/i.test(entry.name)) {
							// Skip watermark and logo files
							if (!/^(watermark|logo)/i.test(entry.name)) {
								imagesToProcess.push(fullPath);
							} else {
								console.log(`Skipping watermark/logo file: ${entry.name}`);
							}
						} else if (/\.(html|css|js|json)$/i.test(entry.name)) {
							filesToUpdate.push(fullPath);
						}
					}
				}
			};

			console.log('Scanning dist for images and references...');
			processDirectory(path.resolve(outDir));

			const replacements = [];

			console.log(`Found ${imagesToProcess.length} images to convert.`);

			for (const imgPath of imagesToProcess) {
				const ext = path.extname(imgPath);
				const webpPath = imgPath.replace(new RegExp(ext + '$', 'i'), '.webp');
				const fileName = path.basename(imgPath);
				const webpFileName = path.basename(webpPath);

				try {
					// Watermark logic
					let pipeline = sharp(imgPath);

					if (hasWatermark) {
						try {
							const metadata = await pipeline.metadata();
							if (metadata.width) {
								const watermarkWidth = Math.round(metadata.width * 0.35); // 35% of image width
								const padding = Math.round(metadata.width * 0.03); // 3% padding

								if (watermarkWidth > 20) {
									const watermarkBuffer = await sharp(watermarkPath).resize({ width: watermarkWidth }).toBuffer();

									const wmInfo = await sharp(watermarkBuffer).metadata();

									// Random Position Logic
									const positions = ['nw', 'ne', 'sw', 'se'];
									const pos = positions[Math.floor(Math.random() * positions.length)];
									let top, left;
									const paddingVal = padding;

									switch (pos) {
										case 'nw': // Top-Left
											top = paddingVal;
											left = paddingVal;
											break;
										case 'ne': // Top-Right
											top = paddingVal;
											left = metadata.width - wmInfo.width - paddingVal;
											break;
										case 'sw': // Bottom-Left
											top = metadata.height - wmInfo.height - paddingVal;
											left = paddingVal;
											break;
										case 'se': // Bottom-Right
										default:
											top = metadata.height - wmInfo.height - paddingVal;
											left = metadata.width - wmInfo.width - paddingVal;
											break;
									}

									// Ensure coordinates are non-negative
									top = Math.max(0, Math.round(top));
									left = Math.max(0, Math.round(left));

									const positionNames = {
										nw: '左上角 Top-Left',
										ne: '右上角 Top-Right',
										sw: '左下角 Bottom-Left',
										se: '右下角 Bottom-Right',
									};

									console.log(`✓ 浮水印已加入: ${fileName} | 位置: ${positionNames[pos]} (top:${top}, left:${left})`);

									pipeline = pipeline.composite([
										{
											input: watermarkBuffer,
											top: top,
											left: left,
										},
									]);
								} else {
									console.log(`⊗ 圖片太小，跳過浮水印: ${fileName}`);
								}
							}
						} catch (wmErr) {
							console.warn(`✗ 浮水印加入失敗 ${fileName}:`, wmErr.message);
						}
					}

					// Convert and optimize with better quality settings
					const isAlreadyWebp = imgPath === webpPath;

					if (isAlreadyWebp) {
						// For WebP files, use buffer to avoid file locking
						const buffer = await pipeline.webp({ quality: 85, effort: 6, smartSubsample: true }).toBuffer();
						await fs.promises.writeFile(webpPath, buffer);
						console.log(`✓ 已更新: ${fileName} (浮水印已加入)`);
					} else {
						// For other formats, convert to WebP
						await pipeline.webp({ quality: 85, effort: 6, smartSubsample: true }).toFile(webpPath);
						console.log(`✓ 已轉換: ${fileName} -> ${webpFileName}`);
						// Delete original non-WebP file
						await new Promise((resolve) => setTimeout(resolve, 100));
						try {
							await fs.promises.unlink(imgPath);
						} catch (e) {
							console.warn(`⚠ 無法刪除原檔: ${fileName}`);
						}
					}

					replacements.push({ from: fileName, to: webpFileName });
				} catch (err) {
					console.error(`Error converting ${fileName}:`, err);
				}
			}

			// Sort replacements by length (descending) to avoid partial matches
			replacements.sort((a, b) => b.from.length - a.from.length);

			console.log(`Updating references in ${filesToUpdate.length} files...`);

			for (const filePath of filesToUpdate) {
				try {
					let content = fs.readFileSync(filePath, 'utf-8');
					let changed = false;

					for (const { from, to } of replacements) {
						if (content.indexOf(from) !== -1) {
							// Global replace
							content = content.split(from).join(to);
							changed = true;
						}
					}

					if (changed) {
						fs.writeFileSync(filePath, content);
						console.log(`Updated references in: ${path.basename(filePath)}`);
					}
				} catch (err) {
					console.error(`Error updating references in ${path.basename(filePath)}:`, err);
				}
			}
		},
	};
};

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
		generateWebp(), // Add WebP image optimization on build
	],
	resolve: {
		alias: {
			'~': resolve(__dirname, './'),
			'@': resolve(__dirname, 'src'), // 设置 `@` 指向 `src` 目录
		},
		extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.mjs'],
	},
	build: {
		target: 'esnext',
		minify: 'esbuild',
		assetsInlineLimit: 4096,
		emptyOutDir: true,
		rollupOptions: {
			output: {
				// Optimize chunk file naming
				chunkFileNames: 'assets/js/[name]-[hash].js',
				entryFileNames: 'assets/js/[name]-[hash].js',
				assetFileNames: (assetInfo) => {
					const ext = assetInfo.name.split('.').pop();
					if (/css/i.test(ext)) return 'assets/css/[name]-[hash][extname]';
					if (/png|jpe?g|svg|gif|webp|avif/i.test(ext)) return 'assets/img/[name]-[hash][extname]';
					return 'assets/[name]-[hash][extname]';
				},
			},
		},
	},
	server: {
		// host: '0.0.0.0',
		// port: 3000,
		open: true,
		//! 20241026 add for fix pug's not hot reload  https://tinyurl.com/24zssqcx
		watch: {
			usePolling: true,
		},
	},
});
