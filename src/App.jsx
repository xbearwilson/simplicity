import Lenis from "lenis";
import { useEffect, useRef, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "./App.css";
import PlaceholderImage from "./img/logo.svg";
import inventory, { categories } from "./inventory.js";
import { getCurrentHolidayInfo } from "./storeHoliday.js";

export default function Simplicity() {
  // 製作日分類狀態，預設 '天天有 Every day'
  const [makeDay, setMakeDay] = useState("天天有 Every day");
  // 使用 ResizeObserver 監聽 top 高度
  const [topHeight, setTopHeight] = useState(0);
  // 頁面初始預設狀態：預設顯示全部商品
  const [showAll, setShowAll] = useState(true);
  const resetTimeout = useRef();
  const [filterState, setFilterState] = useState({
    category: "品項分類",
    do: "",
  });

  // 初始狀態下顯示全部商品
  const isInitial = showAll;
  const [data] = useState(inventory);
  // 取得所有 do 選項（去重、排序，空字串顯示「天天有 Every day」）
  const allDoOptions = Array.from(new Set(data.map((item) => item.do)));
  allDoOptions.sort((a, b) => {
    if (a === "") return -1;
    if (b === "") return 1;
    return a.localeCompare(b, "zh-Hant");
  });
  const [list] = useState(categories);
  // 依據目前選擇的 category 動態取得 do 選項
  const filteredByCategory = data.filter(
    (item) =>
      filterState.category === "品項分類" ||
      item.category === filterState.category ||
      item.type === filterState.category
  );
  const doOptions = Array.from(
    new Set(filteredByCategory.map((item) => item.do))
  );
  const loadingRef = useRef();
  const AppRef = useRef();
  const topRef = useRef();
  const scrollBtnRef = useRef();
  const [loading, setLoading] = useState(0);

  useEffect(() => {
    setTopHeight("178px");
  }, []);

  const updateTopHeight = () => {
    if (topRef.current) setTopHeight(topRef.current.offsetHeight);
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
    window.addEventListener("resize", updateTopHeight);
    return () => {
      window.removeEventListener("resize", updateTopHeight);
      if (observer && topRef.current) observer.unobserve(topRef.current);
    };
  }, []);

  useEffect(() => {
    // 動態偵測top高度
    setTimeout(updateTopHeight, 0);
    // 不要在這裡 setShowAll(false)，讓首頁預設顯示全部商品
    setFilterState({ category: "品項分類", do: "" });
  }, []);

  // 自動選取<select>2第一個有資料的選項
  useEffect(() => {
    if (filterState.category !== "品項分類" && doOptions.length > 0) {
      // 若目前do不在可選範圍，則自動選第一個
      if (!doOptions.includes(filterState.do)) {
        setFilterState((prev) => ({ ...prev, do: doOptions[0] }));
      }
    }
  }, [filterState.category, doOptions]);

  useEffect(() => {
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
    };

    setTimeout(() => updateTopHeight(), 0);
    window.addEventListener("resize", updateTopHeight);
    document.addEventListener("scroll", scrollY);

    return () => {
      window.removeEventListener("resize", updateTopHeight);
      document.removeEventListener("scroll", scrollY);
    };
  }, []);

  const scrollToTop = () =>
    window.scroll({ top: 0, left: 0, behavior: "smooth" });
  const MakeSelect = (X) => (
    <option key={X} value={X}>
      {X}
    </option>
  );

  const handleSelectChange = (key, value) => {
    if (key === "category" && value === "品項分類") {
      setFilterState({ category: "品項分類", do: "" });
      setShowAll(false);
    } else {
      setFilterState((prev) => ({ ...prev, [key]: value }));
      setShowAll(false);
    }
    scrollToTop();
    setTimeout(updateTopHeight, 0);
  };

  // 依據 category 與 do 過濾
  // 首頁預設顯示全部商品，showAll 為 true 時直接顯示 data
  const itemsToShow = showAll
    ? data
    : data.filter((item) => {
        const matchCategory =
          filterState.category === "品項分類" ||
          item.category === filterState.category ||
          item.type === filterState.category;
        const matchDo =
          filterState.do === "" ? item.do === "" : item.do === filterState.do;
        return matchCategory && matchDo;
      });

  // 無資料時自動重設select
  useEffect(() => {
    if (
      itemsToShow.length === 0 &&
      (filterState.category !== "品項分類" || filterState.do !== "")
    ) {
      resetTimeout.current = setTimeout(() => {
        setFilterState({ category: "品項分類", do: "" });
      }, 3500);
    } else {
      if (resetTimeout.current) clearTimeout(resetTimeout.current);
    }
  }, [itemsToShow, filterState.category, filterState.do]);

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
    useEffect(() => {
      const lenis = new Lenis();
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
      return () => lenis.destroy();
    }, []);

    // 修正：在 Main 內部取得 holidayInfo
    const holidayInfos = getCurrentHolidayInfo();

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
            {/* 製作日分類下拉選單 */}
            <select
              value={makeDay}
              onChange={(e) => setMakeDay(e.target.value)}
            >
              <option value="製作日分類">
                ========== 製作日分類 ==========
              </option>
              {allDoOptions.map((opt) => (
                <option
                  key={opt || "everyday"}
                  value={opt === "" ? "天天有 Every day" : opt}
                >
                  {opt === "" ? "天天有 Every day" : opt}
                </option>
              ))}
            </select>
            {/* 其他原有選單與區塊 */}
            {holidayInfos &&
              holidayInfos.map((info, idx) => (
                <div className="storeHoliday" key={info.monthLabel + idx}>
                  <span>{info.monthLabel}</span>
                  <span>{info.holidays.join(", ")}</span>
                </div>
              ))}
            {!showAll && (
              <button
                className="view-all"
                onClick={() => {
                  setShowAll(true);
                  setFilterState({ category: "品項分類", do: "" });
                  setMakeDay("天天有 Every day");
                  scrollToTop();
                  setTimeout(updateTopHeight, 0);
                }}
              >
                所有品項
              </button>
            )}
            <select
              value={filterState.category}
              onChange={(e) => handleSelectChange("category", e.target.value)}
            >
              <option value="品項分類">========== 品項分類 ==========</option>
              {list.map(MakeSelect)}
            </select>
            {/* 初始狀態下 <select> 2 只顯示預設值 */}
            {isInitial ? (
              <select value="" disabled>
                <option value="">天天有 Every Day</option>
              </select>
            ) : (
              filterState.category !== "品項分類" &&
              doOptions.length > 0 && (
                <select
                  value={filterState.do}
                  onChange={(e) => handleSelectChange("do", e.target.value)}
                >
                  {doOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt === "" ? "天天有 Every Day" : opt}
                    </option>
                  ))}
                </select>
              )
            )}
            {/* 若分類不是全部但無 do 選項，顯示提示 */}
            {filterState.category !== "品項分類" && doOptions.length === 0 && (
              <span style={{ color: "#888", marginLeft: "1rem" }}>
                目前暫無品項
              </span>
            )}
            {/* 若分類為全部，提示先選分類 */}
            {filterState.category === "品項分類" && (
              <span style={{ color: "#888" }}>請先選擇品項分類</span>
            )}
          </div>
        </div>

        <div className="main" style={{ marginTop: `${topHeight + 16}px` }}>
          {/* 先顯示 do="" (天天有) 的商品 */}
          <div className="flex">
            {data
              .filter((item) => item.do === "")
              .map((t) => (
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
          {/* 再顯示符合 makeDay 的商品（排除 do=""） */}
          {makeDay !== "天天有 Every day" && makeDay !== "製作日分類" && (
            <div className="flex">
              {data
                .filter((item) => item.do === makeDay && item.do !== "")
                .map((t) => (
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
          )}
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

      setTimeout(() => updateTopHeight(), 0);
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
    }, 0);
    setTimeout(() => updateTopHeight(), 0);
  }, []);

  return <>{loading ? <Preloader /> : <Main />}</>;
}
