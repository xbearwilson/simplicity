import Lenis from '@studio-freight/lenis';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import './App.css';
import PlaceholderImage from './img/logo.svg';
import inventory, { categories } from './inventory.js';

export default function Simplicity() {
	const [data] = useState(inventory);
	const [list] = useState(categories);
	const [selected, setSelected] = useState('');
	const loadingRef = useRef();
	const AppRef = useRef();
	const topRef = useRef();
	const scrollBtnRef = useRef();
	const AllMenuRef = useRef();
	const ItemMenuRef = useRef();
	const [loading, setLoading] = useState(0);

	useLayoutEffect(() => {
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

			topRef.current.classList.toggle('sticky', window.scrollY >= 10);
		};

		document.addEventListener('scroll', scrollY);

		return () => window.removeEventListener('scroll', scrollY);
	}, []);

	const scrollToTop = () =>
		window.scroll({ top: 0, left: 0, behavior: 'smooth' });
	const MakeSelect = X => <option key={X}>{X}</option>;

	const handleChange = e => {
		// e.preventDefault();
		setSelected(e.target.value);
		if (e.target.value === '全部 All') {
			AllMenuRef.current.style.display = 'flex';
			ItemMenuRef.current.style.display = 'none';
			scrollToTop();
		} else {
			AllMenuRef.current.style.display = 'none';
			ItemMenuRef.current.style.display = 'flex';
			scrollToTop();
		}
	};

	const temp = data.filter(i => i.category === selected || i.type === selected);

	const Price = props => {
		const { value } = props;

		return (
			<p className='price'>
				<span>$&nbsp;</span>
				{value}
			</p>
		);
	};

	const Item = ({ name, price, desc, does, type, pic }) => {
		return (
			<div className='item'>
				<LazyLoadImage
					placeholderSrc={PlaceholderImage}
					className='img'
					src={pic}
					alt={name}
					loading='lazy'
				/>
				{type.length > 0 && <p className='type'>{type}</p>}
				<h3>{name}</h3>
				{desc.length > 0 && <p className='desc'>{desc}</p>}
				{does.length > 0 && <p className='does'>{does}</p>}
				<Price value={price + 2} />
			</div>
		);
	};

	const Main = () => {
		useLayoutEffect(() => {
			const lenis = new Lenis({
				// duration: 1.2,
				// easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
				// direction: 'vertical',
				// gestureDirection: 'vertical',
				// smooth: true,
				// smoothTouch: false,
				// touchMultiplier: 2,
			});
			function raf(time) {
				lenis.raf(time);
				requestAnimationFrame(raf);
			}
			requestAnimationFrame(raf);
			return () => lenis.destroy();
		}, []);

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
					<a href='#'>
						<img
							className='logo'
							src='./logo.svg'
							alt=''
						/>
					</a>
					{/* <h3>{selected}</h3> */}
					<div className='topSelect'>
						<select
							// autoFocus
							// defaultValue={'defaults'}
							onChange={handleChange}
						>
							<option
								// key='0'
								value='全部 All'
							>
								========== 全部 All ==========
							</option>
							{list.map(MakeSelect)}
						</select>
					</div>
				</div>

				<div className='main'>
					<div
						className='flex'
						ref={AllMenuRef}
					>
						{data.map(t => (
							<Item
								key={t.id}
								name={t.name}
								price={t.price}
								desc={t.description}
								type={t.type}
								pic={t.pic}
								does={t.do}
							/>
						))}
					</div>
					<div
						className='flex'
						ref={ItemMenuRef}
					>
						{temp.map(t => (
							<Item
								key={t.id}
								name={t.name}
								price={t.price}
								desc={t.description}
								type={t.type}
								pic={t.pic}
								does={t.do}
							/>
						))}
					</div>
				</div>

				<div className='foot'>
					<div className='foot_logo'>
						<a href='#'>
							<img
								src='./logo.svg'
								alt=''
							/>
						</a>
					</div>
					<div>
						<div>營業時間：Business Hours:</div>
						<div>週一~週三，週五~週六：12am-19pm</div>
						<div>Mon-Wed, Fri-Sat: 12am-19pm</div>
						<div>假日：11:30am-18pm</div>
						<div>Holiday: 11:30am-18pm</div>
					</div>
					<div>
						<div>地址：Address:</div>
						<div>新北市新店區大豐路61號</div>
						<div>No 61, Dafeng Rd, Xindian Dist, New Taipei City</div>
					</div>
					<div>
						<div>訂購專線：TEL:</div>
						<div>0963-593-096</div>
						<div>(02) 2918-9345</div>
						<div>(02) 2918-9148</div>
					</div>
				</div>
				<button
					ref={scrollBtnRef}
					type='button'
					onClick={scrollToTop}
					className='scroll-top'
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

	const Preloader = () => {
		const [pct, setPct] = useState(0);

		useEffect(() => {
			let currProgress = 10;
			let step = 1;

			const interval = setInterval(() => {
				currProgress += step;
				let progress =
					Math.round((Math.atan(currProgress) / (Math.PI / 2)) * 100 * 1000) /
					1000;
				setPct(parseFloat(progress.toPrecision(3)));
			}, 100);

			return () => clearInterval(interval);
		}, []);

		const Loading = () => {
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
								width: pct ? `${pct}%` : '10%',
								height: '3px',
								textAlign: 'right',
								fontSize: 'var(--smaller-font-size)',
								transition: 'all 0.3s',
							}}
						>
							{Math.round(pct)}%
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

		return <Loading />;
	};

	useEffect(() => {
		setLoading(1);
		setTimeout(() => {
			setLoading(0);
		}, 2000);
	}, []);

	return <>{loading ? <Preloader /> : <Main />}</>;
}
