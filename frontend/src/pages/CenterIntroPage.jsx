// src/pages/CenterIntroPage.jsx - 지도 버튼 수정 버전
import React, { useEffect, useRef, useCallback, useMemo } from "react";
import PublicHeader from "../components/layout/PublicHeader";
import Footer from "../components/layout/Footer";
import ChatbotButton from "../components/common/ChatbotButton";
import "../../public/css/CenterIntro.css";

// 상수 정의
const KNOU_COORDINATES = {
  lat: 37.5791954862382,
  lng: 127.003290880975
};

const MAP_CONFIG = {
  level: 3,
  infoWindowContent: '<div style="padding:5px;font-size:12px;text-align:center;">한국방송통신대학교</div>'
};

const KAKAO_LOAD_TIMEOUT = 10000;
const KAKAO_CHECK_INTERVAL = 100;

// 업무 데이터
const BUSINESS_DATA = [
  {
    emoji: "💬",
    title: "개인 심리 상담",
    description: "개인의 심리적 문제를 이해하고 지원하는 상담입니다. 정서적 어려움, 스트레스 관리 등 다양한 문제를 다룹니다."
  },
  {
    emoji: "📚",
    title: "학업 상담",
    description: "학업과 관련된 스트레스나 고민을 해결하는 상담입니다. 학업 계획, 성적 향상, 진로 문제 등을 지원합니다."
  },
  {
    emoji: "👥",
    title: "집단 상담",
    description: "집단 내 상호 지원을 통해 문제를 해결하고 개인적인 성장을 도모합니다. 그룹 활동과 워크숍이 포함됩니다."
  },
  {
    emoji: "🚨",
    title: "위기 개입",
    description: "위기 상황에서 즉각적인 지원을 제공합니다. 긴급 상황에서 필요한 개입과 도움을 신속하게 제공합니다."
  }
];

// 조직도 데이터
const ORG_DATA = {
  level1: [
    {
      emoji: "👤",
      title: "센터장",
      description: "센터의 전반적인 업무를 총괄합니다.",
      isCenter: true
    }
  ],
  level2: [
    {
      emoji: "💬",
      title: "상담원 1",
      description: "개인 심리 상담을 담당합니다."
    },
    {
      emoji: "📚",
      title: "상담원 2",
      description: "학업 상담을 담당합니다."
    },
    {
      emoji: "👥",
      title: "상담원 3",
      description: "집단 상담 및 워크숍을 담당합니다."
    }
  ],
  level3: [
    {
      emoji: "🚨",
      title: "상담원 4",
      description: "위기 개입을 담당합니다."
    },
    {
      emoji: "🛠️",
      title: "상담원 5",
      description: "상담원 1의 보조 역할을 수행합니다."
    },
    {
      emoji: "🛠️",
      title: "상담원 6",
      description: "상담원 2의 보조 역할을 수행합니다."
    }
  ]
};

// 업무 카드 컴포넌트
const BusinessCard = React.memo(({ emoji, title, description }) => (
  <div className="business-card">
    <h3>
      <span className="business-emoji">{emoji}</span>
      {title}
    </h3>
    <p>{description}</p>
  </div>
));

// 조직도 카드 컴포넌트
const OrgCard = React.memo(({ emoji, title, description, isCenter }) => (
  <div className={`org-card ${isCenter ? 'org-center' : ''}`}>
    <h3>
      <span className="org-emoji">{emoji}</span>
      {title}
    </h3>
    <p>{description}</p>
  </div>
));

const CenterIntroPage = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const loadingTimeoutRef = useRef(null);
  const checkIntervalRef = useRef(null);

  // 카카오맵 초기화 함수
  const initializeMap = useCallback(() => {
    if (!window.kakao?.maps || !mapRef.current) return;

    try {
      const mapOption = {
        center: new window.kakao.maps.LatLng(KNOU_COORDINATES.lat, KNOU_COORDINATES.lng),
        level: MAP_CONFIG.level
      };

      const map = new window.kakao.maps.Map(mapRef.current, mapOption);
      mapInstanceRef.current = map;

      // 마커 생성 및 설정
      const markerPosition = new window.kakao.maps.LatLng(KNOU_COORDINATES.lat, KNOU_COORDINATES.lng);
      const marker = new window.kakao.maps.Marker({ position: markerPosition });
      marker.setMap(map);

      // 인포윈도우 생성 및 설정
      const infowindow = new window.kakao.maps.InfoWindow({
        content: MAP_CONFIG.infoWindowContent
      });
      infowindow.open(map, marker);

      console.log('카카오맵 초기화 완료');
    } catch (error) {
      console.error('카카오맵 초기화 오류:', error);
    }
  }, []);

  // 카카오맵 로드 체크 함수
  const checkAndInitializeMap = useCallback(() => {
    checkIntervalRef.current = setInterval(() => {
      if (window.kakao?.maps) {
        clearInterval(checkIntervalRef.current);
        clearTimeout(loadingTimeoutRef.current);
        initializeMap();
      }
    }, KAKAO_CHECK_INTERVAL);

    // 타임아웃 설정
    loadingTimeoutRef.current = setTimeout(() => {
      clearInterval(checkIntervalRef.current);
      console.error('카카오맵 로드 타임아웃');
    }, KAKAO_LOAD_TIMEOUT);
  }, [initializeMap]);

  // 지도 확대/축소 함수
  const zoomIn = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setLevel(mapInstanceRef.current.getLevel() - 1);
    }
  }, []);

  const zoomOut = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setLevel(mapInstanceRef.current.getLevel() + 1);
    }
  }, []);

  // 렌더링된 컴포넌트들 메모이제이션
  const businessCards = useMemo(() => 
    BUSINESS_DATA.map((business, index) => (
      <BusinessCard 
        key={`business-${index}`}
        emoji={business.emoji}
        title={business.title}
        description={business.description}
      />
    )), []
  );

  const orgChartLevels = useMemo(() => [
    {
      className: "org-level org-level-1",
      cards: ORG_DATA.level1
    },
    {
      className: "org-level org-level-2", 
      cards: ORG_DATA.level2
    },
    {
      className: "org-level org-level-3",
      cards: ORG_DATA.level3
    }
  ], []);

  // 사이드바 네비게이션 메모이제이션
  const sideNavigation = useMemo(() => (
    <nav className="side_navbar" style={{ position: "sticky", top: "20px" }}>
      <p className="title">센터소개</p>
      <ul>
        <li><a href="#intro">센터소개</a></li>
        <li><a href="#business">업무소개</a></li>
        <li><a href="#organization">조직도</a></li>
        <li><a href="#location">찾아오는길</a></li>
      </ul>
    </nav>
  ), []);

  // 줌 컨트롤 스타일 메모이제이션
  const zoomControlStyles = useMemo(() => ({
    zoomControl: {
      position: 'absolute',
      top: '15px',
      right: '15px',
      zIndex: 999999,
      background: 'white',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      width: '40px',
      height: '76px',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)'
    },
    zoomButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '38px',
      cursor: 'pointer',
      background: 'white',
      transition: 'all 0.2s ease',
      color: '#555'
    }
  }), []);

  // Effect: 카카오맵 초기화
  useEffect(() => {
    const timer = setTimeout(checkAndInitializeMap, 500);

    return () => {
      clearTimeout(timer);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    };
  }, [checkAndInitializeMap]);

  return (
    <div>
      <PublicHeader />

      <main>
        <header >
          <div className="hero-content">
            {/* <h1>센터 소개</h1> */}
          </div>
        </header>

        <article className="container_layout">
          {sideNavigation}

          <section className="contents">
            {/* 센터 소개 */}
            <section id="intro" className="content-section intro-section">
              <div className="section-header">
                <h2 className="section-title">센터 소개</h2>
              </div>

              <div className="intro-content">
                <div className="intro-main-card">
                  <h3>한국방송통신대학교 CMS</h3>
                  <p className="intro-description">
                    한국방송통신대학교는 혁신적이고 실용적인 정보기술 교육을 통해 미래의
                    IT 리더를 양성하는 것을 목표로 하고 있습니다. 우리 공대는 최첨단
                    기술과 연구에 기반한 교육을 제공하며, 학생들에게 실무 중심의 교육을
                    통해 글로벌 IT 산업의 요구에 부응할 수 있는 역량을 키워주고
                    있습니다.
                  </p>
                </div>

                <div className="intro-main-card">
                  <h3>학생상담센터의 역할</h3>
                  <p className="intro-description">
                    학생상담센터는 공대 내 모든 학생들에게 심리적, 정서적 지원을
                    제공하는 중요한 역할을 하고 있습니다. 우리는 학생들이 학업과 개인적
                    도전에 효과적으로 대처할 수 있도록 다양한 상담 서비스와 지원
                    프로그램을 운영하고 있습니다.
                  </p>
                </div>

                <div className="intro-mission-card">
                  <div className="mission-content">
                    <h3>우리의 목표</h3>
                    <p>
                      여러분이 우리 센터에서 제공하는 서비스를 통해 더욱 건강하고
                      만족스러운 대학 생활을 영위하시길 바랍니다.
                    </p>
                  </div>
                  <div className="mission-stats">
                    <div className="stat-item">
                      <div className="stat-number">24/7</div>
                      <div className="stat-label">상담 지원</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">100%</div>
                      <div className="stat-label">비밀보장</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">전문</div>
                      <div className="stat-label">상담사</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 업무 소개 */}
            <section id="business" className="content-section business-section">
              <div className="section-header">
                <h2 className="section-title">업무 소개</h2>
              </div>

              <div className="business-content">
                <div className="business-grid">
                  {businessCards}
                </div>
              </div>
            </section>

            {/* 조직도 */}
            <section id="organization" className="content-section organization-section">
              <div className="section-header">
                <h2 className="section-title">조직도</h2>
              </div>

              <div className="org-content">
                <div className="org-chart-container">
                  {orgChartLevels.map((level, levelIndex) => (
                    <div key={`level-${levelIndex}`} className={level.className}>
                      {level.cards.map((card, cardIndex) => (
                        <OrgCard
                          key={`${levelIndex}-${cardIndex}`}
                          emoji={card.emoji}
                          title={card.title}
                          description={card.description}
                          isCenter={card.isCenter}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 찾아오는 길 */}
            <section id="location" className="content-section location-section">
              <div className="section-header">
                <h2 className="section-title">찾아오는 길</h2>
              </div>

              <div className="location-content">
                <div className="location-card">
                  <div className="location-description">
                    <div className="map_wrap">
                      <div
                        ref={mapRef}
                        id="map"
                        style={{
                          width: "100%",
                          height: "400px",
                          position: "relative",
                          overflow: "hidden"
                        }}
                      />

                      {/* 줌 컨트롤 */}
                      <div className="custom_zoomcontrol" style={zoomControlStyles.zoomControl}>
                        <span 
                          onClick={zoomIn}
                          style={{
                            ...zoomControlStyles.zoomButton,
                            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                            borderRadius: '8px 8px 0 0'
                          }}
                        >
                          <img
                            src="https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/ico_plus.png"
                            alt="확대"
                            style={{ width: '16px', height: '16px', opacity: 0.7 }}
                          />
                        </span>
                        <span 
                          onClick={zoomOut}
                          style={{
                            ...zoomControlStyles.zoomButton,
                            borderRadius: '0 0 8px 8px'
                          }}
                        >
                          <img
                            src="https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/ico_minus.png"
                            alt="축소"
                            style={{ width: '16px', height: '16px', opacity: 0.7 }}
                          />
                        </span>
                      </div>
                    </div>
                    
                    {/* 주소 정보 */}
                    <div className="address-info" style={{marginTop: "20px", textAlign: "center"}}>
                      <div style={{fontSize: "1rem", fontWeight: "bold", marginBottom: "10px"}}>
                        상세 정보
                      </div>
                      <div style={{fontSize: "0.9rem", lineHeight: "1.6", color: "#6c757d"}}>
                        <strong>주소:</strong> 서울특별시 종로구 대학로 86<br/>
                        <strong>기관:</strong> 한국방송통신대학교<br/>
                        <strong>교통:</strong> 지하철 4호선 혜화역 1번 출구 도보 10분<br/>
                        <strong>버스:</strong> 혜화동, 대학로 정류장 하차<br/>
                        <strong>전화:</strong> 02-3668-4114
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </section>
        </article>

        <ChatbotButton />
      </main>

      <Footer />
    </div>
  );
};

export default CenterIntroPage;