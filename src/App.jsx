import Lenis from "@studio-freight/lenis";
import { useEffect, useRef, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "./App.css";
import PlaceholderImage from "./img/logo.svg";
import inventory, { categories } from "./inventory.js";

export default function Simplicity() {
  const updateTopHeight = () => {
    if (topRef.current) setTopHeight(topRef.current.offsetHeight);
  };
  const [topHeight, setTopHeight] = useState(0);
  // 頁面初始預設狀態
  const [showAll, setShowAll] = useState(false);
  const resetTimeout = useRef();
  const [filterState, setFilterState] = useState({
    category: "全部 All",
    do: "",
  });

  // 初始狀態下只顯示 do === "" 的品項
  const isInitial =
    filterState.category === "全部 All" && filterState.do === "" && !showAll;
  const [data] = useState(inventory);
  const [list] = useState(categories);
  // 依據目前選擇的 category 動態取得 do 選項
  const filteredByCategory = data.filter(
    (item) =>
      filterState.category === "全部 All" ||
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

  // 強制初始狀態（component mount）
  useEffect(() => {
    // 動態偵測top高度
    window.addEventListener("load", () => {
      setTimeout(updateTopHeight, 0);
    });
    return () => {
      window.removeEventListener("load", () => {
        setTimeout(updateTopHeight, 0);
      });
    };
  }, []);

  useEffect(() => {
    // 動態偵測top高度
    setTimeout(updateTopHeight, 0);
    setShowAll(false);
    setFilterState({ category: "全部 All", do: "" });
  }, []);

  // 自動選取<select>2第一個有資料的選項
  useEffect(() => {
    if (filterState.category !== "全部 All" && doOptions.length > 0) {
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

    updateTopHeight();
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
    if (key === "category" && value === "全部 All") {
      setFilterState({ category: "全部 All", do: "" });
      setShowAll(false);
    } else {
      setFilterState((prev) => ({ ...prev, [key]: value }));
      setShowAll(false);
    }
    scrollToTop();
    setTimeout(updateTopHeight, 0);
  };

  // 依據 category 與 do 過濾
  const itemsToShow = showAll
    ? data
    : isInitial
    ? data.filter((item) => item.do === "")
    : data.filter((item) => {
        const matchCategory =
          filterState.category === "全部 All" ||
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
      (filterState.category !== "全部 All" || filterState.do !== "")
    ) {
      resetTimeout.current = setTimeout(() => {
        setFilterState({ category: "全部 All", do: "" });
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
            {!showAll && (
              <button
                className="view-all"
                onClick={() => {
                  setShowAll(true);
                  setFilterState({ category: "全部 All", do: "" });
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
              <option value="全部 All">========== 全部 All ==========</option>
              {list.map(MakeSelect)}
            </select>
            {/* 初始狀態下 <select> 2 只顯示預設值 */}
            {isInitial ? (
              <select value="" disabled>
                <option value="">天天有 Every Day</option>
              </select>
            ) : (
              filterState.category !== "全部 All" &&
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
            {filterState.category !== "全部 All" && doOptions.length === 0 && (
              <span style={{ color: "#888", marginLeft: "1rem" }}>
                目前暫無品項
              </span>
            )}
            {/* 若分類為全部，提示先選分類 */}
            {filterState.category === "全部 All" && (
              <span style={{ color: "#888" }}>請先選擇品項分類</span>
            )}
          </div>
        </div>

        <div className="main" style={{ marginTop: `${topHeight + 16}px` }}>
          <div className="flex">
            {itemsToShow.length === 0 ? (
              <div
                style={{
                  color: "#888",
                  width: "100%",
                  textAlign: "center",
                  padding: "2rem",
                }}
              >
                目前暫無品項，3秒後自動回到預設分類
              </div>
            ) : (
              itemsToShow.map((t) => (
                <Item
                  key={t.id}
                  name={t.name}
                  price={t.price}
                  desc={t.description}
                  type={t.type}
                  pic={t.pic}
                  does={t.do}
                />
              ))
            )}
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
