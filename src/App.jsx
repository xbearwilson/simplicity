import Lenis from 'lenis';
import { useEffect, useRef, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import './App.scss';
import inventory, { categories, NEW_DISPLAY_MONTHS } from './inventory.js';
import { getCurrentHolidayInfo } from './storeHoliday.js';
// PlaceholderImage 改用 public/logo.svg
const PlaceholderImage = '/logo.svg';

export default function Simplicity() {
	// 製作日分類狀態，預設 '天天有 Every day'
	const [makeDay, setMakeDay] = useState('天天有 Every day');
	// 使用 ResizeObserver 監聽 top 高度
	const [topHeight, setTopHeight] = useState(0);
	// 頁面初始預設狀態：預設顯示全部商品
	const [showAll, setShowAll] = useState(true);
	const resetTimeout = useRef();
	const [filterState, setFilterState] = useState({
		category: '品項分類',
		do: '',
	});

	const [data] = useState(inventory);
	// 取得所有 do 選項（去重、排序，空字串顯示「天天有 Every day」）
	const allDoOptions = Array.from(new Set(data.map((item) => item.do)));
	allDoOptions.sort((a, b) => {
		if (a === '') return -1;
		if (b === '') return 1;
		return a.localeCompare(b, 'zh-Hant');
	});
	const [list] = useState(categories);
	// 依據目前選擇的 category 動態取得 do 選項
	const filteredByCategory = data.filter(
		(item) =>
			filterState.category === '品項分類' ||
			item.category === filterState.category ||
			item.type === filterState.category
	);
	const doOptions = Array.from(new Set(filteredByCategory.map((item) => item.do)));
	const loadingRef = useRef();
	const AppRef = useRef();
	const topRef = useRef();
	const scrollBtnRef = useRef();
	const lenisRef = useRef();
	const [loading, setLoading] = useState(0);

	const updateTopHeight = () => {
		if (topRef.current) {
			const height = topRef.current.offsetHeight;
			setTopHeight(height); // 設置為數字，方便後續計算
			console.log('Top height updated:', height); // 調試信息
		}
	};

	// 強制初始狀態（component mount）
	// 伺服器與本地皆能即時偵測 top 高度
	useEffect(() => {
		setTimeout(() => updateTopHeight(), 0); // mount 時立即偵測
		let observer;
		if (topRef.current && window.ResizeObserver) {
			observer = new window.ResizeObserver(() => {
				updateTopHeight();
			});
			observer.observe(topRef.current);
		}
		window.addEventListener('resize', updateTopHeight);
		return () => {
			window.removeEventListener('resize', updateTopHeight);
			if (observer && topRef.current) observer.unobserve(topRef.current);
		};
	}, []);

	useEffect(() => {
		// 動態偵測top高度
		setTimeout(updateTopHeight, 0);
		// 不要在這裡 setShowAll(false)，讓首頁預設顯示全部商品
		setFilterState({ category: '品項分類', do: '' });
	}, []);

	// 自動選取<select>2第一個有資料的選項
	useEffect(() => {
		if (filterState.category !== '品項分類' && doOptions.length > 0) {
			// 若目前do不在可選範圍，則自動選第一個
			if (!doOptions.includes(filterState.do)) {
				setFilterState((prev) => ({ ...prev, do: doOptions[0] }));
			}
		}
	}, [filterState.category, doOptions]);

	useEffect(() => {
		const scrollY = () => {
			if (window.scrollY > 300) {
				scrollBtnRef.current.style.visibility = 'visible';
				scrollBtnRef.current.style.bottom = '25px';
				scrollBtnRef.current.style.opacity = '1';
			} else {
				scrollBtnRef.current.style.visibility = 'hidden';
				scrollBtnRef.current.style.bottom = '-50px';
				scrollBtnRef.current.style.opacity = '0';
			}
		};

		setTimeout(() => updateTopHeight(), 0);
		window.addEventListener('resize', updateTopHeight);
		document.addEventListener('scroll', scrollY);

		return () => {
			window.removeEventListener('resize', updateTopHeight);
			document.removeEventListener('scroll', scrollY);
		};
	}, []);

	const scrollToTop = () => lenisRef.current?.scrollTo(0);
	const MakeSelect = (X) => (
		<option
			key={X}
			value={X}
		>
			{X}
		</option>
	);

	// 判斷是否為新商品（根據 addedDate）
	const isNewProduct = (addedDate, monthsToShow = NEW_DISPLAY_MONTHS) => {
		if (!addedDate) return false;

		const added = new Date(addedDate);
		const now = new Date();
		const monthsDiff = (now.getFullYear() - added.getFullYear()) * 12 + (now.getMonth() - added.getMonth());

		return monthsDiff < monthsToShow;
	};

	// select 1: category, select 2: makeDay
	const handleSelectChange = (key, value) => {
		if (key === 'category') {
			if (value === '品項分類') {
				setShowAll(true);
				setFilterState({ category: '品項分類', do: '' });
				setMakeDay('天天有 Every day');
			} else {
				setShowAll(false);
				setFilterState({ category: value, do: '' });
				setMakeDay('製作日分類');
			}
		} else if (key === 'makeDay') {
			if (value === '天天有 Every day' || value === '製作日分類') {
				// 修正：只要回到預設或『製作日分類』預設值都顯示所有商品
				setShowAll(true);
				setFilterState({ category: '品項分類', do: '' });
				setMakeDay('天天有 Every day');
			} else {
				setShowAll(false);
				setMakeDay(value);
				setFilterState({ category: '品項分類', do: '' });
			}
		}
		scrollToTop();
		setTimeout(updateTopHeight, 0);
	};

	// 依據 category 與 do 過濾
	// 首頁預設顯示全部商品，showAll 為 true 時直接顯示 data
	// 商品顯示邏輯
	let itemsToShow = data;
	if (!showAll) {
		if (filterState.category === '新品項 New') {
			// 顯示所有有 addedDate 且在指定月份內的新商品
			itemsToShow = data.filter((item) => isNewProduct(item.addedDate, NEW_DISPLAY_MONTHS));
		} else if (filterState.category !== '品項分類') {
			// 只依 category 過濾
			itemsToShow = data.filter((item) => item.category === filterState.category || item.type === filterState.category);
		} else if (makeDay !== '天天有 Every day' && makeDay !== '製作日分類') {
			// 只依 makeDay 過濾
			itemsToShow = data.filter((item) => item.do === makeDay);
		} else {
			// 預設顯示 do=""（天天有）
			itemsToShow = data.filter((item) => item.do === '');
		}
	}

	// 無資料時自動重設select
	useEffect(() => {
		if (itemsToShow.length === 0 && (filterState.category !== '品項分類' || filterState.do !== '')) {
			resetTimeout.current = setTimeout(() => {
				setFilterState({ category: '品項分類', do: '' });
			}, 3500);
		} else {
			if (resetTimeout.current) clearTimeout(resetTimeout.current);
		}
	}, [itemsToShow, filterState.category, filterState.do]);

	const Price = (props) => {
		const { value } = props;

		return (
			<p className='price'>
				<span>$&nbsp;</span>
				{value}
			</p>
		);
	};

	const Item = ({ name, ename, price, desc, does, type, pic, addedDate }) => {
		const showNew = isNewProduct(addedDate, NEW_DISPLAY_MONTHS); // 根據設定月份顯示 NEW

		return (
			<div className='item'>
				<LazyLoadImage
					placeholderSrc={PlaceholderImage}
					className='img'
					src={pic}
					alt={`簡實新村|新店村::${name} ${ename}`}
					title={`簡實新村|新店村::${name} ${ename}`}
					loading='lazy'
				/>
				{/* NEW 標籤 */}
				{showNew && <div className='new-badge'>新 NEW</div>}

				{type.length > 0 && <p className='type'>{type}</p>}
				<h3>
					{name}
					<div className='ename'>{ename}</div>
				</h3>
				{desc.length > 0 && <p className='desc'>{desc}</p>}
				{does.length > 0 && <p className='does'>{does}</p>}
				<Price value={price + 2} />
			</div>
		);
	};

	const Main = () => {
		useEffect(() => {
			// 立即偵測一次高度（在 Main 組件掛載時）
			setTimeout(() => updateTopHeight(), 0);
			// 延遲再偵測一次，確保所有內容都已渲染
			setTimeout(() => updateTopHeight(), 100);
			setTimeout(() => updateTopHeight(), 300);

			const lenis = new Lenis();
			lenisRef.current = lenis;
			function raf(time) {
				lenis.raf(time);
				requestAnimationFrame(raf);
			}
			requestAnimationFrame(raf);
			return () => {
				lenis.destroy();
				lenisRef.current = null;
			};
		}, []);

		// 修正：在 Main 內部取得 holidayInfo
		const holidayInfos = getCurrentHolidayInfo();

		return (
			<div
				id='top'
				ref={AppRef}
				className='App'
			>
				<div
					ref={topRef}
					className='top'
				>
					<img
						onClick={scrollToTop}
						className='logo'
						src='/logo.svg'
						alt='簡實新村|新店村|Simplicity & Honesty Xindian Village Mantou Menu'
						title='簡實新村|新店村|Simplicity & Honesty Xindian Village Mantou Menu'
					/>
					<div className='topSelect'>
						{/* 特別店休日區塊 */}
						{holidayInfos &&
							holidayInfos.map((info, idx) => (
								<div
									className='storeHoliday'
									key={info.monthLabel + idx}
								>
									<span>{info.monthLabel}</span>
									<span>{info.holidays.join(', ')}</span>
								</div>
							))}
						{!showAll && (
							<button
								className='view-all'
								onClick={() => {
									setShowAll(true);
									setFilterState({ category: '品項分類', do: '' });
									setMakeDay('天天有 Every day');
									scrollToTop();
									setTimeout(updateTopHeight, 0);
								}}
							>
								所有品項
							</button>
						)}

						{/* 製作日分類下拉選單 */}
						<select
							value={makeDay}
							onChange={(e) => handleSelectChange('makeDay', e.target.value)}
						>
							<option value='製作日分類'>===== 製作日分類 =====</option>
							{allDoOptions
								.filter((opt) => opt !== '')
								.map((opt) => (
									<option
										key={opt}
										value={opt}
									>
										{opt}
									</option>
								))}
						</select>

						{/* 品項分類下拉選單 */}
						<select
							value={filterState.category}
							onChange={(e) => handleSelectChange('category', e.target.value)}
						>
							<option value='品項分類'>===== 品項分類 =====</option>
							<option value='新品項 New'>🌟 新品項 New</option>
							{list.map(MakeSelect)}
						</select>

						{/* 若分類不是全部但無 do 選項，顯示提示 */}
						{filterState.category !== '品項分類' && filterState.category !== '新品項 New' && doOptions.length === 0 && (
							<span style={{ color: '#888', marginLeft: '1rem' }}>目前暫無品項</span>
						)}
					</div>
				</div>

				<div
					className='main'
					style={{ marginTop: topHeight > 0 ? `${topHeight}px` : undefined }}
				>
					{/* 首頁預設顯示所有商品 */}
					<div className='flex'>
						{itemsToShow.length > 0 ? (
							itemsToShow.map((t) => (
								<Item
									key={t.id}
									name={t.name}
									ename={t.ename}
									price={t.price}
									desc={t.description}
									type={t.type}
									pic={t.pic}
									does={t.do}
									addedDate={t.addedDate}
								/>
							))
						) : (
							<span style={{ color: '#888', fontSize: '1.2rem' }}>目前暫無品項</span>
						)}
					</div>
				</div>

				<div className='foot'>
					<div
						className='foot_logo'
						onClick={scrollToTop}
					>
						<img
							src='/logo.svg'
							alt='簡實新村|新店村|Simplicity & Honesty Xindian Village Mantou Menu'
							title='簡實新村|新店村|Simplicity & Honesty Xindian Village Mantou Menu'
						/>
					</div>
					<div>
						<div>簡實新村|新店村|Simplicity & Honesty Xindian Village</div>
						<div>營業時間：Business Hours:</div>
						<div>週一~週三，週五~週六：12am-19pm</div>
						<div>Mon-Wed, Fri-Sat: 12am-19pm</div>
						<div>假日：11:30am-18pm</div>
						<div>Holiday: 11:30am-18pm</div>
						<div className='m point'>預約請於下午來電 (須提前 2 ~ 3 日)</div>
						<div className='m point'>固定店休日：每週 四、日 (如遇特別店休日將提前公告之)</div>
					</div>
					<div>
						<div>地址：Address:</div>
						<div
							alt='簡實新村|新店村|地址'
							title='簡實新村|新店村|地址'
							className='point'
							onClick={(e) => {
								e.preventDefault();
								window.location.href = 'https://srt.tw/GkXnzU';
								// window.open('https://tinyurl.com/22ap3wxv', '_blank');
							}}
						>
							23142 新北市新店區大豐路61號
						</div>
						<div
							alt='Simplicity & Honesty Xindian Village Address'
							title='Simplicity & Honesty Xindian Village Address'
							className='point'
							onClick={(e) => {
								e.preventDefault();
								window.location.href = 'https://srt.tw/GkXnzU';
								// window.open('https://tinyurl.com/22ap3wxv', '_blank');
							}}
						>
							No 61, Dafeng Rd, Xindian Dist, New Taipei City
						</div>
					</div>
					<div>
						<div>訂購專線：TEL:</div>
						<div
							alt='簡實新村|新店村|訂購專線|TEL'
							title='簡實新村|新店村|訂購專線|TEL'
							className='point'
							onClick={(e) => {
								e.preventDefault();
								window.location.href = 'tel:0963593096';
							}}
						>
							0963-593-096
						</div>
						<div
							alt='簡實新村|新店村|訂購專線|TEL'
							title='簡實新村|新店村|訂購專線|TEL'
							className='point'
							onClick={(e) => {
								e.preventDefault();
								window.location.href = 'tel:0229189345';
							}}
						>
							(02) 2918-9345
						</div>
						<div
							alt='簡實新村|新店村|訂購專線|TEL'
							title='簡實新村|新店村|訂購專線|TEL'
							className='point'
							onClick={(e) => {
								e.preventDefault();
								window.location.href = 'tel:0229189148';
							}}
						>
							(02) 2918-9148
						</div>
					</div>
				</div>
				<button
					ref={scrollBtnRef}
					type='button'
					onClick={scrollToTop}
					className='scroll-top'
					title='回上方 TOP'
				>
					<span
						role='img'
						aria-label='Hand'
					>
						☝️
					</span>
				</button>
			</div>
		);
	};

	const Preloader = ({ progress = 0 }) => {
		return (
			<div
				className='preloader'
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					gap: '.5rem',
				}}
			>
				<div
					className='progress-bar'
					style={{
						display: 'flex',
						flexDirection: 'column',
						width: '100%',
						alignItems: 'right',
					}}
				>
					<div
						className='progress'
						style={{
							background: 'var(--first-color)',
							color: 'var(--sec-color)',
							width: progress ? `${progress}%` : '0%',
							height: '3px',
							textAlign: 'right',
							fontSize: 'var(--smaller-font-size)',
							transition: 'all 0.3s',
						}}
					>
						{Math.round(progress)}%
					</div>
				</div>
				<div
					ref={loadingRef}
					className='loading'
				>
					<img
						className='logo'
						src='./logo.svg'
						alt=''
					/>
					<span>載入中 Loading</span>
				</div>
			</div>
		);
	};

	useEffect(() => {
		// 1. 檢查 sessionStorage - 是否在同一個瀏覽階段已經載入過
		const hasLoadedInSession = sessionStorage.getItem('simplicity_loaded');

		if (hasLoadedInSession) {
			// 同一瀏覽階段，直接跳過 loading，不顯示任何畫面
			setLoading(0);
			setTimeout(() => updateTopHeight(), 0);
			return;
		}

		// 2. 提取所有產品圖片 URL
		const imageUrls = data.map((item) => item.pic);
		const totalImages = imageUrls.length;
		let loadedCount = 0;
		let timeoutId;

		// 3. 預載入所有圖片
		const preloadImages = () => {
			imageUrls.forEach((url) => {
				const img = new Image();

				img.onload = () => {
					loadedCount++;
					const progress = (loadedCount / totalImages) * 100;
					setLoading(progress);

					if (loadedCount === totalImages) {
						// 所有圖片載入完成（此時進度已為 100%）
						clearTimeout(timeoutId);
						setTimeout(() => {
							setLoading(0); // 隱藏 Preloader，顯示主內容
							sessionStorage.setItem('simplicity_loaded', 'true');
						}, 300); // 延遲 300ms 讓用戶看到 100% 完成
					}
				};

				img.onerror = () => {
					// 載入失敗也計入進度（避免卡住）
					loadedCount++;
					const progress = (loadedCount / totalImages) * 100;
					setLoading(progress);

					if (loadedCount === totalImages) {
						clearTimeout(timeoutId);
						setTimeout(() => {
							setLoading(0);
							sessionStorage.setItem('simplicity_loaded', 'true');
						}, 300);
					}
				};

				img.src = url;
			});
		};

		// 4. Timeout 保護機制（最多10秒）
		timeoutId = setTimeout(() => {
			if (loadedCount < totalImages) {
				console.warn(`載入超時：已載入 ${loadedCount}/${totalImages} 張圖片`);
				setLoading(0);
				sessionStorage.setItem('simplicity_loaded', 'true');
			}
		}, 10000);

		// 開始預載入
		preloadImages();
		setLoading(1); // 設定初始進度 1% 以顯示 Preloader
		setTimeout(() => updateTopHeight(), 0);

		// Cleanup
		return () => {
			clearTimeout(timeoutId);
		};
	}, [data]);

	return <>{loading > 0 ? <Preloader progress={loading} /> : <Main />}</>;
}
