import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { SubPageHeader } from "../SubPageHeader";

export function AboutLocation() {
  return (
    <div>
      {/* Page Header */}
      <SubPageHeader
        subtitle="COMPANY"
        title="찾아오시는길"
        description="CFA 본사 위치 및 찾아오시는 길 안내"
        imageUrl="https://images.unsplash.com/photo-1694702740570-0a31ee1525c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBidWlsZGluZ3xlbnwxfHx8fDE3NjAzOTM2ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      />

      {/* Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white border border-border shadow-md rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-blue-600" size={24} />
              </div>
              <h4 className="mb-2">주소</h4>
              <p className="text-gray-700">
                경기도 안성시 양성면<br />
                동항공단길 9
              </p>
            </div>

            <div className="bg-white border border-border shadow-md rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="text-blue-600" size={24} />
              </div>
              <h4 className="mb-2">전화</h4>
              <p className="text-gray-700">
                031-671-7170
              </p>
            </div>

            <div className="bg-white border border-border shadow-md rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="text-blue-600" size={24} />
              </div>
              <h4 className="mb-2">이메일</h4>
              <p className="text-gray-700">
                info@cfa.ne.kr
              </p>
            </div>

            <div className="bg-white border border-border shadow-md rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-blue-600" size={24} />
              </div>
              <h4 className="mb-2">업무시간</h4>
              <p className="text-gray-700">
                평일 08:30 - 17:30<br />
                (주말 및 공휴일 휴무)
              </p>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8 flex justify-center">
            <div style={{ font: "normal normal 400 12px/normal dotum, sans-serif", width: "100%", maxWidth: "1280px", color: "#333", position: "relative" }}>
              <div style={{ height: "720px" }}>
                <a 
                  href="https://map.kakao.com/?urlX=540506&urlY=990335.0000000035&name=%EA%B2%BD%EA%B8%B0%20%EC%95%88%EC%84%B1%EC%8B%9C%20%EC%96%91%EC%84%B1%EB%A9%B4%20%EB%8F%99%ED%95%AD%EA%B3%B5%EB%8B%A0%EA%B8%B8%209&map_type=TYPE_MAP&from=roughmap" 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img 
                    className="map" 
                    src="http://t1.daumcdn.net/roughmap/imgmap/74ecbc294dbb48d6ed1206a8ce656656aafcd40793e564305c3aa2b2436a38c8" 
                    width="1278" 
                    height="718" 
                    style={{ border: "1px solid #ccc", maxWidth: "100%", height: "auto" }}
                    alt="카카오맵 - CFA 위치"
                  />
                </a>
              </div>
              <div style={{ overflow: "hidden", padding: "7px 11px", border: "1px solid rgba(0, 0, 0, 0.1)", borderRadius: "0px 0px 2px 2px", backgroundColor: "rgb(249, 249, 249)" }}>
                <a href="https://map.kakao.com" target="_blank" rel="noopener noreferrer" style={{ float: "left" }}>
                  <img 
                    src="//t1.daumcdn.net/localimg/localimages/07/2018/pc/common/logo_kakaomap.png" 
                    width="72" 
                    height="16" 
                    alt="카카오맵" 
                    style={{ display: "block", width: "72px", height: "16px" }}
                  />
                </a>
                <div style={{ float: "right", position: "relative", top: "1px", fontSize: "11px" }}>
                  <a 
                    target="_blank" 
                    rel="noopener noreferrer"
                    href="https://map.kakao.com/?from=roughmap&eName=%EA%B2%BD%EA%B8%B0%20%EC%95%88%EC%84%B1%EC%8B%9C%20%EC%96%91%EC%84%B1%EB%A9%B4%20%EB%8F%99%ED%95%AD%EA%B3%B5%EB%8B%A0%EA%B8%B8%209&eX=540506&eY=990335.0000000035" 
                    style={{ float: "left", height: "15px", paddingTop: "1px", lineHeight: "15px", color: "#000", textDecoration: "none" }}
                  >
                    길찾기
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Directions */}
          <div className="bg-blue-50 rounded-lg p-8">
            <h2 className="mb-6">오시는 길</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="mb-4 text-blue-600">자가용 이용시</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>경부고속도로 안성IC → 38번 국도 양성방면</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>양성삼거리에서 우회전 → 동항산업단지</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>네비게이션: 경기도 안성시 양성면 동항공단길 9</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-4 text-blue-600">대중교통 이용시</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>서울남부터미널 → 안성터미널 (고속버스)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>안성터미널 → 양성행 버스 이용</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span>동항산업단지 정류장 하차 후 도보 5분</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Parking Information */}
          <div className="mt-8 p-6 border border-border rounded-lg">
            <h3 className="mb-3">주차 안내</h3>
            <p className="text-gray-700">
              본사 건물 내 방문객 전용 주차장이 마련되어 있습니다. 
              주차 공간이 부족할 경우 안내 데스크에 문의해 주시기 바랍니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}