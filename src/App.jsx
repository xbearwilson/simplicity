import Lenis from "@studio-freight/lenis";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "./App.css";
import PlaceholderImage from "./img/logo.svg";
import inventory, { categories } from "./inventory.js";

export default function Simplicity() {
  const [data] = useState(inventory);
  const [list] = useState(categories);
  // 取得所有 do 欄位的唯一值（含空字串）
  const doOptions = Array.from(new Set(data.map((item) => item.do)));
  // 可擴充多條件
  // do select 預設值設為空字串，對應 do: ''
  const [filterState, setFilterState] = useState({
    category: "全部 All",
    do: "",
  });
  const loadingRef = useRef();
  const AppRef = useRef();
  const topRef = useRef();
  const scrollBtnRef = useRef();
  const [loading, setLoading] = useState(0);

  useLayoutEffect(() => {
    const scrollY = () => {
      if (window.scrollY > 300) {
        scrollBtnRef.current.style.visibility = "visible";
        scrollBtnRef.current.style.bottom = "25px";
        scrollBtnRef.current.style.opacity = "1";
      } else {
        scrollBtnRef.current.style.visibility = "hidden";
        scrollBtnRef.current.style.bottom = "-50px";
        scrollBtnRef.current.style.opacity = "0";
      }

      topRef.current.classList.toggle("sticky", window.scrollY >= 10);
    };

    document.addEventListener("scroll", scrollY);

    return () => window.removeEventListener("scroll", scrollY);
  }, []);

  const scrollToTop = () =>
    window.scroll({ top: 0, left: 0, behavior: "smooth" });
  const MakeSelect = (X) => (
    <option key={X} value={X}>
      {X}
    </option>
  );

  const handleSelectChange = (key, value) => {
    setFilterState((prev) => ({ ...prev, [key]: value }));
    scrollToTop();
  };

  const filteredData = data.filter((item) => {
    // category 條件
    const matchCategory =
      filterState.category === "全部 All" ||
      item.category === filterState.category ||
      item.type === filterState.category;
    // do 條件
    const matchDo =
      filterState.do === ""
        ? item.do === ""
        : filterState.do === undefined
        ? true
        : item.do === filterState.do;
    return matchCategory && matchDo;
  });

  // 若預設為全部 All + 天天有 Every day 時，顯示所有 do 為空字串的 Item
  const showAllEveryday =
    filterState.category === "全部 All" && filterState.do === "";
  const itemsToShow = showAllEveryday
    ? data.filter((item) => item.do === "")
    : filteredData;

  const Price = (props) => {
    const { value } = props;

    return (
      <p className="price">
        <span>$&nbsp;</span>
        {value}
      </p>
    );
  };

  const Item = ({ name, price, desc, does, type, pic }) => {
    return (
      <div className="item">
        <LazyLoadImage
          placeholderSrc={PlaceholderImage}
          className="img"
          src={pic}
          alt={name}
          loading="lazy"
        />
        {type.length > 0 && <p className="type">{type}</p>}
        <h3>{name}</h3>
        {desc.length > 0 && <p className="desc">{desc}</p>}
        {does.length > 0 && <p className="does">{does}</p>}
        <Price value={price + 2} />
      </div>
    );
  };

  const Main = () => {
    useLayoutEffect(() => {
      const lenis = new Lenis();
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
      return () => lenis.destroy();
    }, []);

    return (
      <div id="top" ref={AppRef} className="App">
        <div ref={topRef} className="top">
          <img
            onClick={scrollToTop}
            className="logo"
            src="./logo.svg"
            alt="簡實新村|新店村|Simplicity & Honesty Xindian Village Mantou Menu"
          />
          <div className="topSelect" style={{ display: "flex", gap: "1rem" }}>
            <select
              value={filterState.category}
              onChange={(e) => handleSelectChange("category", e.target.value)}
            >
              <option value="全部 All">========== 全部 All ==========</option>
              {list.map(MakeSelect)}
            </select>
            <select
              value={filterState.do}
              onChange={(e) => handleSelectChange("do", e.target.value)}
            >
              <option value="">========== 天天有 Every day ==========</option>
              {doOptions
                .filter((opt) => opt !== "")
                .map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="main">
          <div className="flex">
            {itemsToShow.map((t) => (
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

        <div className="foot">
          <div className="foot_logo" onClick={scrollToTop}>
            {/* <a href='#'> */}
            <img
              src="./logo.svg"
              alt="簡實新村|新店村|Simplicity & Honesty Xindian Village Mantou Menu"
            />
            {/* </a> */}
          </div>
          <div>
            <div>簡實新村|新店村|Simplicity & Honesty Xindian Village</div>
            <div>營業時間：Business Hours:</div>
            <div>週一~週三，週五~週六：12am-19pm</div>
            <div>Mon-Wed, Fri-Sat: 12am-19pm</div>
            <div>假日：11:30am-18pm</div>
            <div>Holiday: 11:30am-18pm</div>
            <div>預約請於下午來電 (須提前 2 ~ 3 日)</div>
            <div>固定店休日：每週 四、日 (如遇特別店休日將提前公告之)</div>
          </div>
          <div>
            <div>地址：Address:</div>
            <div
              className="point"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "https://tinyurl.com/22ap3wxv";
                // window.open('https://tinyurl.com/22ap3wxv', '_blank');
              }}
            >
              23142 新北市新店區大豐路61號
            </div>
            <div
              className="point"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "https://tinyurl.com/22ap3wxv";
                // window.open('https://tinyurl.com/22ap3wxv', '_blank');
              }}
            >
              No 61, Dafeng Rd, Xindian Dist, New Taipei City
            </div>
          </div>
          <div>
            <div>訂購專線：TEL:</div>
            <div
              className="point"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "tel:0963593096";
              }}
            >
              0963-593-096
            </div>
            <div
              className="point"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "tel:0229189345";
              }}
            >
              (02) 2918-9345
            </div>
            <div
              className="point"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "tel:0229189148";
              }}
            >
              (02) 2918-9148
            </div>
          </div>
        </div>
        <button
          ref={scrollBtnRef}
          type="button"
          onClick={scrollToTop}
          className="scroll-top"
        >
          <span role="img" aria-label="Hand">
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
          className="preloader"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: ".5rem",
          }}
        >
          <div
            className="progress-bar"
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              alignItems: "right",
            }}
          >
            <div
              className="progress"
              style={{
                background: "var(--first-color)",
                color: "var(--sec-color)",
                width: pct ? `${pct}%` : "10%",
                height: "3px",
                textAlign: "right",
                fontSize: "var(--smaller-font-size)",
                transition: "all 0.3s",
              }}
            >
              {Math.round(pct)}%
            </div>
          </div>
          <div ref={loadingRef} className="loading">
            <img className="logo" src="./logo.svg" alt="" />
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
    }, 800);
  }, []);

  return <>{loading ? <Preloader /> : <Main />}</>;
}
