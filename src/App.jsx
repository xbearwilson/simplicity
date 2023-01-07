import { useEffect, useRef, useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import './App.css'
import PlaceholderImage from './img/logo.svg'
import inventory, { categories } from './inventory.js'

export default function Simplicity() {
	const [data] = useState(inventory)
	const [list] = useState(categories)
	const [selected, setSelected] = useState('')
	// const App = document.querySelector('.App')
	// const top = document.querySelector('.top')

	// const loading = document.querySelector('.loading')
	const AppRef = useRef()
	const topRef = useRef()
	const loadingRef = useRef()
	const scrollBtnRef = useRef()
	const AllMenuRef = useRef()
	const ItemMenuRef = useRef()

	useEffect(() => {
		setTimeout(() => {
			loadingRef.current.style.display = 'none'
			AppRef.current.style.display = 'flex'
		}, 9000)

		document.addEventListener('scroll', () => {
			if (window.scrollY > 300) {
				scrollBtnRef.current.style.visibility = 'visible'
				scrollBtnRef.current.style.bottom = '25px'
				scrollBtnRef.current.style.opacity = '1'
			} else {
				scrollBtnRef.current.style.visibility = 'hidden'
				scrollBtnRef.current.style.bottom = '-50px'
				scrollBtnRef.current.style.opacity = '0'
			}

			if (window.scrollY > 0) {
				topRef.current.classList.add('sticky')
			} else {
				topRef.current.classList.remove('sticky')
			}
		})
	}, [])

	const scrollToTop = () => window.scroll({ top: 0, left: 0, behavior: 'smooth' })
	const MakeSelect = X => <option key={X}>{X}</option>
	const handleChange = e => {
		setSelected(e.target.value)
		if (e.target.value === '全部 All') {
			AllMenuRef.current.style.display = 'flex'
			ItemMenuRef.current.style.display = 'none'
			scrollToTop()
		} else {
			AllMenuRef.current.style.display = 'none'
			ItemMenuRef.current.style.display = 'flex'
			scrollToTop()
		}
	}
	const temp = data.filter(i => i.category.replace('\n', '') === selected || i.type.replace('\n', '') === selected)

	const Price = props => {
		const { value } = props

		return (
			<p className='price'>
				<span>$&nbsp;</span>
				{value}
			</p>
		)
	}

	const Item = ({ name, price, desc, type, pic }) => {
		return (
			<div className='item'>
				<LazyLoadImage PlaceholderSrc={PlaceholderImage} className='img' src={pic} alt={name} loading='lazy' />
				{type.length > 0 && <p className='type'>{type}</p>}
				<h3>{name}</h3>
				{desc.length > 0 && <p className='desc'>{desc}</p>}
				<Price value={price} />
			</div>
		)
	}

	return (
		<>
			<div ref={loadingRef} className='loading'>
				<img className='logo' src='./logo.svg' alt='' />
				<span>載入中 Loading ...</span>
			</div>

			<div ref={AppRef} className='App'>
				<div ref={topRef} className='top'>
					<img className='logo' src='./logo.svg' alt='' />
					<h3>{selected}</h3>
					<div className='topSelect'>
						<select defaultValue={'defaults'} onChange={handleChange}>
							<option key='0' value='全部 All'>
								========== 全部 All ==========
							</option>
							{list.map(MakeSelect)}
						</select>
					</div>
				</div>

				<div className='main'>
					<div className='flex' ref={AllMenuRef}>
						{data.map(t => (
							<Item key={t.id} name={t.name} price={t.price} desc={t.description} type={t.type} pic={t.pic} />
						))}
					</div>
					<div className='flex' ref={ItemMenuRef}>
						{temp.map(t => (
							<Item key={t.id} name={t.name} price={t.price} desc={t.description} type={t.type} pic={t.pic} />
						))}
					</div>
				</div>

				<div className='foot'>
					<div className='foot_logo'>
						<img src='./logo.svg' alt='' />
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
				<button ref={scrollBtnRef} type='button' onClick={scrollToTop} className='scroll-top'>
					<span role='img' aria-label='Hand'>
						☝️
					</span>
				</button>
			</div>
		</>
	)
}
