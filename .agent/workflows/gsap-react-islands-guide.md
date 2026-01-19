---
description: GSAP + React Islands 開發規範與最佳實踐
---

# GSAP + React Islands 開發規範

## 📋 目錄

1. [2025 重要更新：GSAP 全面免費化](#2025-重要更新gsap-全面免費化)
2. [基本設定](#基本設定)
3. [正確的寫法](#正確的寫法)
4. [常見錯誤](#常見錯誤)
5. [動畫類型範例](#動畫類型範例)
6. [進階技巧：Layout 轉場 (GSAP Flip)](#進階技巧layout-轉場-gsap-flip)
7. [在 Astro 頁面中的整合實作](#在-astro-頁面中的整合實作)
8. [效能最佳化](#效能最佳化)

---

## 2025 重要更新：GSAP 全面免費化

自 **2025 年 4 月 30 日** 起（由 Webflow 收購後），GSAP 已正式將所有先前需付費的 **Club GSAP Premium Plugins** 全部開放為 **100% 免費** 使用（包含商業授權）。

### 🚀 現在你可以免費使用的強大 Plugins：

- **ScrollSmoother**（平滑滾動）、**SplitText**（文字拆解動畫）
- **MorphSVG**（向量形變）、**DrawSVG**（描邊動畫）
- **Flip**（佈局轉場）、**Inertia**（慣性動畫）

這意味著在我們的專案中，無需考慮 Club 會員身份，即可直接引入並使用最高階的 GSAP 功能。

---

## 基本設定

### 1. 全域設定（Layout.astro）

在 `src/layouts/Layout.astro` 中已全域引入 GSAP：

```astro
<script>
	import gsap from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';

	gsap.registerPlugin(ScrollTrigger);

	// 全域暴露（可選，方便在 Astro 頁面中使用）
	window.gsap = gsap;
	window.ScrollTrigger = ScrollTrigger;
</script>
```

### 2. React Island 元件設定

在 React 元件中的正確引入方式：

#### 情況 A：只使用 scrollTrigger 配置物件（最常見）

```tsx
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

// ✅ 無需 import ScrollTrigger
// 因為只使用 scrollTrigger 配置物件，不直接調用 ScrollTrigger 類別方法

useGSAP(() => {
	gsap.from(box.current, {
		scrollTrigger: {
			// 小寫的配置物件
			trigger: box.current,
			start: 'top 80%',
		},
		x: 100,
	});
});
```

#### 情況 B：需要使用 ScrollTrigger 類別方法（進階用法）

```tsx
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger'; // ✅ 需要 import
import { useRef } from 'react';

// 當你需要直接調用 ScrollTrigger 的方法時才需要 import
useGSAP(() => {
	// 使用 ScrollTrigger.create()
	ScrollTrigger.create({
		trigger: box.current,
		onEnter: () => console.log('entered'),
	});

	// 或使用其他 ScrollTrigger 方法
	ScrollTrigger.refresh();
});
```

#### ⚠️ 重要提醒

```tsx
// ❌ 錯誤：不要重複註冊（會導致 "registerPlugin is not a function" 錯誤）
gsap.registerPlugin(ScrollTrigger); // Layout.astro 已註冊！

// ❌ 錯誤：useGSAP 不是 plugin，是 React Hook
gsap.registerPlugin(useGSAP);
```

**如果你在獨立的 React 專案中使用（非 Astro）：**

```tsx
// ✅ 在純 React 專案中才需要註冊
gsap.registerPlugin(ScrollTrigger);
```

---

## 正確的寫法

### ✅ 使用 Ref 而非 Class 選擇器

**推薦做法：**

```tsx
export default function MyComponent() {
	const container = useRef<HTMLDivElement>(null);
	const box = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			if (!box.current) return; // 安全檢查

			gsap.to(box.current, {
				x: 100,
				duration: 1,
			});
		},
		{ scope: container } // 限制動畫範圍
	);

	return (
		<div ref={container}>
			<div ref={box}>Animated Box</div>
		</div>
	);
}
```

**為什麼不用 class 選擇器？**

- ❌ `gsap.to('.box', {...})` - 可能影響頁面上所有 `.box` 元素
- ✅ `gsap.to(box.current, {...})` - 只影響當前元件的元素
- 在 React Islands 架構中，多個相同元件可能同時存在

---

## 常見錯誤

### ❌ 錯誤 1：重複註冊 Plugin

```tsx
// ❌ 錯誤：在 Astro + React Islands 中重複註冊
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger); // Layout.astro 已註冊！
```

**錯誤訊息：**

```
__vite_ssr_import_2__.default.registerPlugin is not a function
```

**原因：** Layout.astro 已全域註冊，React 元件中再次註冊會衝突

**正確做法：**

```tsx
// ✅ 正確：只 import 不註冊
import { ScrollTrigger } from 'gsap/ScrollTrigger';
// 直接使用，無需 registerPlugin
```

---

### ❌ 錯誤 2：將 useGSAP 當作 plugin

```tsx
// ❌ 錯誤
import { useGSAP } from '@gsap/react';
gsap.registerPlugin(useGSAP);
```

**原因：** `useGSAP` 是 React Hook，不是 GSAP plugin

**正確做法：**

```tsx
// ✅ 正確
import { useGSAP } from '@gsap/react';
// useGSAP 是 hook，直接使用即可
```

---

### ❌ 錯誤 3：使用 class 選擇器

```tsx
// ❌ 錯誤：可能影響其他元件
useGSAP(() => {
	gsap.to('.box', { x: 100 });
});
```

**正確做法：**

```tsx
// ✅ 正確：使用 ref
const box = useRef(null);
useGSAP(
	() => {
		gsap.to(box.current, { x: 100 });
	},
	{ scope: container }
);
```

---

### ❌ 錯誤 4：忘記 null 檢查

```tsx
// ❌ 錯誤：可能在元素尚未掛載時執行
useGSAP(() => {
	gsap.to(box.current, { x: 100 }); // box.current 可能是 null
});
```

**正確做法：**

```tsx
// ✅ 正確：加入安全檢查
useGSAP(() => {
	if (!box.current) return;
	gsap.to(box.current, { x: 100 });
});
```

---

## 動畫類型範例

### 1️⃣ 基礎動畫（自動執行）

```tsx
const box = useRef<HTMLDivElement>(null);

useGSAP(
	() => {
		if (!box.current) return;

		// 進入動畫
		gsap.from(box.current, {
			opacity: 0,
			y: 50,
			duration: 1,
			ease: 'power3.out',
		});

		// 循環動畫
		gsap.to(box.current, {
			rotation: 360,
			duration: 2,
			repeat: -1, // 無限循環
			ease: 'linear',
		});
	},
	{ scope: container }
);
```

---

### 2️⃣ ScrollTrigger 動畫（滾動觸發）

```tsx
const box = useRef<HTMLDivElement>(null);

useGSAP(
	() => {
		if (!box.current) return;

		gsap.from(box.current, {
			scrollTrigger: {
				trigger: box.current,
				start: 'top 80%', // 元素頂部到達視窗 80% 時
				end: 'top 20%', // 元素頂部到達視窗 20% 時
				toggleActions: 'play none none reverse',
				// markers: true,    // 開發時可開啟，顯示觸發點
				scrub: true, // 跟隨滾動進度（可選）
			},
			x: -100,
			opacity: 0,
			duration: 1,
		});
	},
	{ scope: container, dependencies: [] }
);
```

**ScrollTrigger 參數說明：**

- `trigger`: 觸發元素
- `start`: 開始位置（格式：`"trigger視窗位置 viewport位置"`）
- `end`: 結束位置
- `toggleActions`: 控制動畫行為（`"onEnter onLeave onEnterBack onLeaveBack"`）
  - `play`: 播放
  - `pause`: 暫停
  - `resume`: 繼續
  - `reverse`: 反轉
  - `restart`: 重新開始
  - `reset`: 重置
  - `none`: 無動作
- `scrub`: 是否跟隨滾動進度（`true` 或數字表示延遲秒數）

---

### 3️⃣ 互動式動畫（事件觸發）

```tsx
const box = useRef<HTMLDivElement>(null);
const [isAnimating, setIsAnimating] = useState(false);

const handleClick = () => {
	if (!box.current || isAnimating) return;

	setIsAnimating(true);

	gsap.to(box.current, {
		x: 200,
		rotation: 360,
		scale: 1.5,
		duration: 0.8,
		ease: 'back.out(1.7)',
		onComplete: () => {
			// 動畫完成後的回調
			gsap.to(box.current, {
				x: 0,
				rotation: 0,
				scale: 1,
				duration: 0.8,
				onComplete: () => setIsAnimating(false),
			});
		},
	});
};

return (
	<div ref={box} onClick={handleClick}>
		Click Me
	</div>
);
```

---

### 4️⃣ Timeline 動畫（序列動畫）

```tsx
const box1 = useRef<HTMLDivElement>(null);
const box2 = useRef<HTMLDivElement>(null);
const box3 = useRef<HTMLDivElement>(null);

useGSAP(
	() => {
		const tl = gsap.timeline({ repeat: -1, yoyo: true });

		tl.to(box1.current, { x: 100, duration: 1 })
			.to(box2.current, { x: 100, duration: 1 }, '-=0.5') // 提前 0.5 秒開始
			.to(box3.current, { x: 100, duration: 1 }, '<'); // 與上一個同時開始
	},
	{ scope: container }
);
```

---

### 5️⃣ Stagger 動畫（交錯動畫）

```tsx
const items = useRef<HTMLDivElement[]>([]);

useGSAP(
	() => {
		gsap.from(items.current, {
			opacity: 0,
			y: 50,
			stagger: 0.1, // 每個元素延遲 0.1 秒
			duration: 0.8,
			ease: 'power3.out',
		});
	},
	{ scope: container }
);

return (
	<div ref={container}>
		{[1, 2, 3, 4, 5].map((i) => (
			<div key={i} ref={(el) => (items.current[i - 1] = el!)}>
				Item {i}
			</div>
		))}
	</div>
);
```

---

## 進階技巧：Layout 轉場 (GSAP Flip)

當元素需要在不同狀態/頁面間切換佈局時（例如 Logo 從居中變到側邊），`Flip` 是最強大的工具。

### 核心流程 (GSAP Flip)

1. **Get State**: 紀錄元素原始狀態。
2. **Change Style**: 改變 CSS 類別或直接修改 DOM 樣式/位置。
3. **Flip**: 執行過渡動畫。

```javascript
import { Flip } from 'gsap/Flip';
gsap.registerPlugin(Flip);

const state = Flip.getState('.element');
// 修改 DOM 佈局 (例如切換 parent 或修改 flex-justify)
element.parentElement.style.justifyContent = 'center';
Flip.from(state, { duration: 0.6, ease: 'power2.inOut' });
```

---

## 在 Astro 頁面中的整合實作

在 Astro + ViewTransitions 架構中，GSAP 需處理「頁面持久化」與「狀態記憶」。

### ⚡ 最佳實務範本 (`Nav.astro` 範例)

```astro
<script>
	import { gsap } from 'gsap';
	import { Flip } from 'gsap/Flip';
	gsap.registerPlugin(Flip);

	function initNav() {
		const navbar = document.getElementById('navbar');
		const navLogo = document.querySelector('.nav-logo') as HTMLElement;
		const isHome = window.location.pathname === '/';

		// 1. 狀態持久化 (防止初次載入就跑轉場)
		const wasHome = navbar.dataset.wasHome;
		const shouldAnimate = wasHome !== undefined && wasHome !== String(isHome);
		navbar.dataset.wasHome = String(isHome);

		if (shouldAnimate && navLogo) {
			const state = Flip.getState(navLogo);

			// 2. 根據路徑變更佈局
			if (isHome) {
				navbar.classList.add('is-home');
			} else {
				navbar.classList.remove('is-home');
			}

			// 3. 執行流暢轉場
			Flip.from(state, {
				duration: 0.8,
				ease: 'power2.inOut',
			});
		}
	}

	// 配合 Astro ViewTransitions 生命週期
	document.addEventListener('astro:page-load', initNav);
</script>
```

---

### 1. 使用 `will-change` CSS 屬性

```tsx
<div
	ref={box}
	style={{ willChange: 'transform' }} // 提示瀏覽器優化
>
	Animated Element
</div>
```

### 2. 優先使用 transform 和 opacity

```tsx
// ✅ 高效能：使用 transform
gsap.to(box.current, {
	x: 100, // transform: translateX(100px)
	y: 50, // transform: translateY(50px)
	rotation: 45, // transform: rotate(45deg)
	scale: 1.5, // transform: scale(1.5)
	opacity: 0.5,
});

// ❌ 低效能：避免動畫這些屬性
gsap.to(box.current, {
	width: 200, // 觸發 layout
	height: 200, // 觸發 layout
	top: 100, // 觸發 layout
	left: 100, // 觸發 layout
});
```

### 3. 清理動畫（useGSAP 自動處理）

```tsx
// useGSAP 會自動清理動畫，無需手動處理
useGSAP(
	() => {
		gsap.to(box.current, { x: 100 });
		// 元件卸載時會自動 kill 動畫
	},
	{ scope: container }
);
```

### 4. 使用 dependencies 控制重新執行

```tsx
const [count, setCount] = useState(0);

useGSAP(
	() => {
		gsap.to(box.current, { x: count * 10 });
	},
	{
		scope: container,
		dependencies: [count], // 只在 count 改變時重新執行
	}
);
```

---

## 常用 Easing 函數

```tsx
// 基礎
ease: 'none'; // 線性
ease: 'power1.out'; // 緩出
ease: 'power1.in'; // 緩入
ease: 'power1.inOut'; // 緩入緩出

// 彈性
ease: 'elastic.out(1, 0.3)'; // 彈性效果
ease: 'back.out(1.7)'; // 回彈效果
ease: 'bounce.out'; // 彈跳效果

// 進階
ease: 'steps(12)'; // 階梯式
ease: 'circ.inOut'; // 圓形曲線
```

---

## 在 Astro 頁面中使用 GSAP

如果你需要在 `.astro` 頁面中使用 GSAP（非 React 元件）：

```astro
---
// Astro 頁面
---

<div class="my-box">Hello</div>

<script>
	import gsap from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';

	gsap.registerPlugin(ScrollTrigger);

	// 直接使用 GSAP
	gsap.to('.my-box', {
		scrollTrigger: {
			trigger: '.my-box',
			start: 'top 80%',
		},
		x: 100,
		duration: 1,
	});
</script>
```

---

## 總結：React Islands 中的 GSAP 最佳實踐

✅ **DO（推薦做法）：**

1. 使用 `useGSAP()` hook
2. 使用 `ref` 而非 class 選擇器
3. 加入 `null` 安全檢查
4. 使用 `scope` 限制動畫範圍
5. 優先使用 `transform` 和 `opacity`
6. 使用 `dependencies` 控制重新執行
7. **在 Astro + React Islands 中，不要重複註冊 plugins**

❌ **DON'T（避免做法）：**

1. 不要 `registerPlugin(useGSAP)`
2. **不要在 React 元件中重複 `registerPlugin(ScrollTrigger)`**
3. 不要使用全域 class 選擇器
4. 不要忘記 null 檢查
5. 不要動畫 `width`、`height`、`top`、`left` 等會觸發 layout 的屬性
6. 不要在 `useEffect` 中使用 GSAP（使用 `useGSAP` 代替）

---

## 2025 現代化 Plugin 引入範例 (Astro + UI)

### 1️⃣ 文字動畫 (SplitText) - 現在免費！

```astro
<script>
	import { gsap } from 'gsap';
	import { SplitText } from 'gsap/SplitText';
	gsap.registerPlugin(SplitText);

	const split = new SplitText('.title', { type: 'chars' });
	gsap.from(split.chars, { opacity: 0, y: 20, stagger: 0.05 });
</script>
```

### 2️⃣ 極致平滑滾動 (ScrollSmoother)

```astro
<script>
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { ScrollSmoother } from 'gsap/ScrollSmoother';

	gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

	ScrollSmoother.create({
		smooth: 2, // 滾動平滑度
		effects: true, // 啟用 data-lag, data-speed
		smoothTouch: 0.1, // 手機端也保持流暢
	});
</script>
```

---

## 參考資源

- [GSAP 官方文檔 (Webflow Era)](https://gsap.com/docs/)
- [@gsap/react 官方文檔](https://gsap.com/docs/v3/React/)
- [GSAP License 2.0 (Free for everyone)](https://gsap.com/standard-license)
