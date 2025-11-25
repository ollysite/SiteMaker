import { motion } from "motion/react";
import { SubPageHeader } from "../SubPageHeader";
import { Factory, MapPin, Ruler, Wind, Users, Package, Zap, Maximize, Layers, Box, Settings, Gauge, ChevronLeft, ChevronRight, X } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import cfaFacilityImage from "figma:asset/74ac35049ae560115469d47e1cf12d9fc9566fd3.png";
import cleanRoomImage from "figma:asset/3fd0fb5e51dd1aff3b6e9af256ce875440729070.png";
import cleanRoomImage1 from "figma:asset/cfc4610d1609eeca0bc156c4d0aa466464774767.png";
import cleanRoomImage2 from "figma:asset/61d74addf4c65b049fe5ac3dd9cba51ab28c9a6c.png";
import laserCuttingImage from "figma:asset/e18f652564d01665ed1773319a20bc07093c4248.png";
import pressBrakeImage from "figma:asset/851a9007b2384ade9124fd923f5717fc98590550.png";
import laserWeldingImage from "figma:asset/595b1b9b1b6ab230970115f503cac26486ff3fc0.png";
import millingImage from "figma:asset/4b6b6291e25f292fc9cb657cb06d057661cf6d9b.png";
import cncImage from "figma:asset/458f40b1d6482f2e336f36e020a95a55570ed671.png";
import patternMachineImage from "figma:asset/a5340672126f48b79516f9c4f723d59bc2211532.png";
import testEquipmentImage1 from "figma:asset/a74b4ea064ae9d05c2c486ffe8404a95333eb17f.png";
import testEquipmentImage2 from "figma:asset/8dda2cc43b17eb0ec47cd6be92d5da5b3ef736b8.png";

export function Facilities() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [currentImageTitle, setCurrentImageTitle] = useState("");

  const openLightbox = (imageUrl: string, title: string) => {
    setCurrentImage(imageUrl);
    setCurrentImageTitle(title);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!lightboxOpen) return;
    if (e.key === "Escape") closeLightbox();
  };

  // Add keyboard listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen]);

  const facilityInfo = [
    {
      icon: Ruler,
      title: "대지",
      value: "6,000㎡",
      subtitle: "약 1,800평"
    },
    {
      icon: Factory,
      title: "조립/Test",
      value: "2,000㎡",
      subtitle: "1,2공장 약 600평"
    },
    {
      icon: Wind,
      title: "Clean Room",
      value: "350㎡",
      subtitle: "CLASS 10,000"
    },
    {
      icon: Users,
      title: "전문 인력",
      value: "50+",
      subtitle: "숙련된 기술인력"
    }
  ];

  const features = [
    {
      icon: Factory,
      title: "자체 가공 Shop 운영",
      description: "제조부터 조립까지 일관된 품질 관리로 최고 수준의 제품을 생산합니다",
      benefits: ["정밀 가공", "품질 관리", "납기 준수", "원가 절감"]
    },
    {
      icon: Wind,
      title: "CLASS 10,000 Clean Room",
      description: "첨단 클린룸 시설에서 반도체 및 디스플레이 장비를 조립하고 테스트합니다",
      benefits: ["청정 환경", "품질 보증", "정밀 조립", "성능 테스트"]
    }
  ];

  const address = {
    korean: "경기도 안성시 양성면 동항공단길 9",
    english: "9, Donghang Industrial Complex-gil, Yangseong-myeon, Anseong-si, Gyeonggi-do, Republic of Korea",
    tel: "031-671-7170",
    fax: "031-671-7175",
    email: "info@cfa.co.kr"
  };

  return (
    <div className="bg-white">
      <SubPageHeader
        subtitle="FACILITIES"
        title="사업장소개"
        description="최첨단 시설과 숙련된 기술 인력으로 최고의 제품을 생산합니다"
        imageUrl="https://images.unsplash.com/photo-1758159234965-9d259875cf35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwaGFyZHdhcmUlMjBhc3NlbWJseXxlbnwxfHx8fDE3NjE3MDI4ODN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      />

      {/* Overview with Image */}
      <section className="py-32 bg-white">
        <div className="max-w-[1600px] mx-auto px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-end mb-32">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative h-[600px] overflow-hidden rounded-lg"
            >
              <ImageWithFallback
                src={cfaFacilityImage}
                alt="CFA Building"
                className="w-full h-full object-fill rounded-lg"
                style={{ 
                  transform: 'scaleX(1)',
                  transformOrigin: 'left center'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent rounded-lg"></div>
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-white/95 backdrop-blur-sm p-6 border border-gray-200 rounded-lg">
                  <h3 className="text-2xl text-gray-900 mb-2" style={{ fontWeight: 700 }}>
                    CFA 본사
                  </h3>
                  <p className="text-gray-600">
                    경기도 안성시 양성면 동항공단길 9
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="inline-block px-4 py-2 bg-blue-50 text-blue-600 text-sm mb-6 uppercase tracking-wider rounded-lg" style={{ fontWeight: 600 }}>
                HEADQUARTERS
              </div>
              <h2 className="text-5xl text-gray-900 mb-8 leading-tight" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                첨단 제조 시설과<br />
                전문 인력
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed mb-12" style={{ fontWeight: 400 }}>
                CFA 본사는 총 6,000㎡ 규모의 최첨단 제조 시설을 갖추고 있으며,
                CLASS 10,000 클린룸에서 반도체 및 디스플레이 제조 장비를 생산합니다.
              </p>

              <div className="grid grid-cols-2 gap-6">
                {facilityInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 p-6 hover:border-blue-600 hover:shadow-lg transition-all duration-300 rounded-lg"
                    >
                      <Icon className="w-8 h-8 text-blue-600 mb-4" />
                      <div className="text-gray-700 mb-1">
                        {info.title}
                      </div>
                      <div className="text-3xl text-gray-900 mb-1" style={{ fontWeight: 700 }}>
                        {info.value}
                      </div>
                      <div className="text-xs text-gray-500">
                        {info.subtitle}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Clean Room Section */}
      <section className="py-32" style={{ backgroundColor: '#F9FAFC' }}>
        <div className="max-w-[1600px] mx-auto px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-sm mb-6" style={{ fontWeight: 600 }}>
              <Wind className="w-4 h-4" />
              CLEAN ROOM
            </div>
            <h2 className="text-5xl text-gray-900 mb-8 leading-tight" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              CLASS 10,000<br />
              클린룸
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed mb-12" style={{ fontWeight: 400 }}>
              350㎡ 규모의 CLASS 10,000 클린룸에서<br />
              반도체 및 디스플레이 제조 장비를 조립하고 테스트합니다.
            </p>
          </motion.div>

          {/* Images */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative h-[400px] overflow-hidden rounded-lg"
            >
              <ImageWithFallback
                src={cleanRoomImage1}
                alt="Clean Room Interior 1"
                className="w-full h-full object-cover rounded-lg"
                onClick={() => openLightbox(cleanRoomImage1, "Clean Room Interior 1")}
                style={{ cursor: 'pointer' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent rounded-lg"></div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative h-[400px] overflow-hidden rounded-lg"
            >
              <ImageWithFallback
                src={cleanRoomImage2}
                alt="Clean Room Interior 2"
                className="w-full h-full object-cover rounded-lg"
                onClick={() => openLightbox(cleanRoomImage2, "Clean Room Interior 2")}
                style={{ cursor: 'pointer' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent rounded-lg"></div>
            </motion.div>
          </div>

          {/* Info Cards in 2x2 Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              { label: "청정도", value: "CLASS 10,000", desc: "입자 제어" },
              { label: "온습도 관리", value: "정밀 제어", desc: "최적 환경 유지" },
              { label: "조립 공간", value: "350㎡", desc: "안전 작업" },
              { label: "품질 검증", value: "일관 생산 가능", desc: "출하 전 테스트" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-6 p-6 bg-gray-50 border border-gray-200 hover:border-blue-600 hover:bg-white rounded-lg transition-all duration-300"
              >
                <div className="w-16 h-16 bg-blue-600 text-white flex items-center justify-center text-2xl flex-shrink-0 rounded-lg" style={{ fontWeight: 700 }}>
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className="flex-1">
                  <div className="text-gray-700 mb-1">
                    {item.label}
                  </div>
                  <div className="text-xl text-gray-900 mb-1" style={{ fontWeight: 700 }}>
                    {item.value}
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.desc}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Machining Shop Equipment Section */}
      <section className="py-32 bg-white">
        <div className="max-w-[1600px] mx-auto px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-sm mb-6" style={{ fontWeight: 600 }}>
              <Factory className="w-4 h-4" />
              MACHINING SHOP
            </div>
            <h2 className="text-5xl text-gray-900 mb-8 leading-tight" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              자체 가공 Shop<br />
              운영 장비
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto" style={{ fontWeight: 400 }}>
              최첨단 가공 장비를 통해 정밀한 부품 제작과<br />
              일관된 품질 관리를 실현합니다
            </p>
          </motion.div>

          {/* Equipment Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Laser Cutting Machine */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0 }}
              viewport={{ once: true }}
              className="bg-white border-2 border-gray-200 shadow-md hover:border-blue-600 hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group"
            >
              {/* Image */}
              <div 
                className="relative h-128 overflow-hidden cursor-pointer"
                onClick={() => openLightbox(laserCuttingImage, "레이저 가공 기계")}
              >
                <ImageWithFallback
                  src={laserCuttingImage}
                  alt="레이저 가공 기계"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-2xl text-white mb-2" style={{ fontWeight: 700 }}>
                    레이저 가공 기계
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <p className="text-gray-700 leading-relaxed mb-6">
                  고출력 레이저를 이용하여 철, 스테인리스, 알루미늄 등 다양한 금속 소재를 정밀하게 절단하는 장비입니다. 넓은 작업 범위와 뛰어난 절단 능력으로 다양한 두께의 금속 가공이 가능합니다.
                </p>

                {/* Specifications */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Zap className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-600">출력</span>
                      <div className="text-gray-900" style={{ fontWeight: 600 }}>12,000W</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Layers className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-600">철 절단능력</span>
                      <div className="text-gray-900" style={{ fontWeight: 600 }}>30mm 이하</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Maximize className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-600">작업범위</span>
                      <div className="text-gray-900" style={{ fontWeight: 600 }}>2,000 x 4,000mm</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Press Brake */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white border-2 border-gray-200 shadow-md hover:border-blue-600 hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group"
            >
              {/* Image */}
              <div 
                className="relative h-128 overflow-hidden cursor-pointer"
                onClick={() => openLightbox(pressBrakeImage, "절곡기")}
              >
                <ImageWithFallback
                  src={pressBrakeImage}
                  alt="절곡기"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-2xl text-white mb-2" style={{ fontWeight: 700 }}>
                    절곡기
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <p className="text-gray-700 leading-relaxed mb-6">
                  금속 판재를 원하는 각도로 정밀하게 절곡하는 장비로, 높은 압력과 긴 절곡 길이로 대형 부품 가공이 가능합니다. 다양한 금속 소재의 절곡 작업에 활용됩니다.
                </p>

                {/* Specifications */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Layers className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-600">최대절곡 두께</span>
                      <div className="text-gray-900" style={{ fontWeight: 600 }}>12mm</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Zap className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-600">절곡 압력</span>
                      <div className="text-gray-900" style={{ fontWeight: 600 }}>150 ton</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Maximize className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-600">절곡 길이</span>
                      <div className="text-gray-900" style={{ fontWeight: 600 }}>3,200mm</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Laser Welding */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white border-2 border-gray-200 shadow-md hover:border-blue-600 hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group"
            >
              {/* Image */}
              <div 
                className="relative h-128 overflow-hidden cursor-pointer"
                onClick={() => openLightbox(laserWeldingImage, "레이저 용접기")}
              >
                <ImageWithFallback
                  src={laserWeldingImage}
                  alt="레이저 용접기"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-2xl text-white mb-2" style={{ fontWeight: 700 }}>
                    레이저 용접기
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <p className="text-gray-700 leading-relaxed mb-6">
                  고출력 레이저를 이용하여 스테인리스, 알루미늄, 철 등 다양한 금속 소재를 정밀하게 용접하는 장비입니다. 깨끗한 용접면과 뛰어난 작업 효율성을 제공합니다.
                </p>

                {/* Specifications */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Zap className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-600">출력</span>
                      <div className="text-gray-900" style={{ fontWeight: 600 }}>3,000W</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Layers className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-600">작업 범위</span>
                      <div className="text-gray-900" style={{ fontWeight: 600 }}>모재 두께 14mm 이하</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Box className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-600">용접 가능 소재</span>
                      <div className="text-gray-900" style={{ fontWeight: 600 }}>스테인리스, 알루미늄, 철</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CNC Machine */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white border-2 border-gray-200 shadow-md hover:border-blue-600 hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group"
            >
              {/* Image */}
              <div 
                className="relative h-128 overflow-hidden cursor-pointer"
                onClick={() => openLightbox(cncImage, "CNC 가공기")}
              >
                <ImageWithFallback
                  src={cncImage}
                  alt="CNC 가공기"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-2xl text-white mb-2" style={{ fontWeight: 700 }}>
                    CNC 가공기
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <p className="text-gray-700 leading-relaxed mb-6">
                  컴퓨터 수치 제어를 통해 복잡한 형상의 부품을 정밀하게 가공하는 CNC 장비입니다. 6m 이상의 긴 가공 길이와 3축 구성으로 대형 부품의 정밀 가공이 가능합니다.
                </p>

                {/* Specifications */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Maximize className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-600">가공 길이</span>
                      <div className="text-gray-900" style={{ fontWeight: 600 }}>6m 이상</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Settings className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-600">축 구성</span>
                      <div className="text-gray-900" style={{ fontWeight: 600 }}>3축</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Gauge className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-600">스핀들</span>
                      <div className="text-gray-900" style={{ fontWeight: 600 }}>12,000~24,000rpm</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Pattern Processing Machine */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white border-2 border-gray-200 shadow-md hover:border-blue-600 hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden group"
            >
              {/* Image */}
              <div 
                className="relative h-128 overflow-hidden cursor-pointer"
                onClick={() => openLightbox(patternMachineImage, "패턴 가공기계")}
              >
                <ImageWithFallback
                  src={patternMachineImage}
                  alt="패턴 가공기계"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-2xl text-white mb-2" style={{ fontWeight: 700 }}>
                    패턴 가공기계
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <p className="text-gray-700 leading-relaxed mb-6">
                  복잡한 패턴과 형상을 정밀하게 가공하는 전문 장비입니다. 강력한 벤딩 포스와 넓은 가공 길이로 대형 금속 판재의 패턴 가공과 성형 작업을 수행합니다.
                </p>

                {/* Specifications */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Zap className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-600">Bending Force</span>
                      <div className="text-gray-900" style={{ fontWeight: 600 }}>800~3,200 kN</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Maximize className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-600">가공(접힘) 길이</span>
                      <div className="text-gray-900" style={{ fontWeight: 600 }}>2,500~5,100mm</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Layers className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-600">스로트 깊이</span>
                      <div className="text-gray-900" style={{ fontWeight: 600 }}>300~450mm</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Test & Verification Section */}
      <section className="py-32" style={{ backgroundColor: '#F9FAFC' }}>
        <div className="max-w-[1600px] mx-auto px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-sm mb-6" style={{ fontWeight: 600 }}>
              <Package className="w-4 h-4" />
              TEST & VERIFICATION
            </div>
            <h2 className="text-5xl text-gray-900 mb-8 leading-tight" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              Test & Verification
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto" style={{ fontWeight: 400 }}>
              체계적인 테스트 절차로 제품의 성능과 품질을 철저하게 검증합니다
            </p>
          </motion.div>

          {/* Test Equipment Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative h-[400px] overflow-hidden rounded-lg shadow-md"
            >
              <ImageWithFallback
                src={testEquipmentImage1}
                alt="3차원 측정기"
                className="w-full h-full object-contain bg-white"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative h-[400px] overflow-hidden rounded-lg shadow-md"
            >
              <ImageWithFallback
                src={testEquipmentImage2}
                alt="정밀 측정 테이블"
                className="w-full h-full object-contain bg-white"
              />
            </motion.div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "성능 검증", desc: "제품의 핵심 성능을 다각도로 테스트하고 검증합니다" },
              { title: "품질 시험", desc: "엄격한 품질 기준을 통과한 제품만 출하합니다" },
              { title: "안전성 확보", desc: "안전 기준을 철저히 준수하여 신뢰성을 보장합니다" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-blue-50 to-white border-2 border-gray-200 shadow-md hover:border-blue-600 hover:shadow-xl transition-all duration-500 p-8 rounded-2xl group"
              >
                <div className="w-14 h-14 bg-blue-600 group-hover:bg-blue-700 text-white flex items-center justify-center mb-6 text-xl rounded-lg transition-all duration-500" style={{ fontWeight: 700 }}>
                  {String(index + 1).padStart(2, '0')}
                </div>
                <h3 className="text-xl text-gray-900 mb-3" style={{ fontWeight: 700 }}>
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Location & Contact */}
      <section className="py-32 bg-gradient-to-br from-gray-900 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        
        <div className="relative max-w-[1600px] mx-auto px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/30 border border-blue-400/30 text-blue-300 text-sm mb-8" style={{ fontWeight: 600 }}>
              <MapPin className="w-4 h-4" />
              LOCATION & CONTACT
            </div>
            <h2 className="text-5xl text-white mb-6" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              찾아오시는 길
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 p-10"
            >
              <MapPin className="w-12 h-12 text-blue-400 mb-6" />
              <h3 className="text-2xl text-white mb-8" style={{ fontWeight: 700 }}>
                주소 및 연락처
              </h3>

              <div className="space-y-6">
                <div>
                  <div className="text-sm text-gray-400 mb-2">주소</div>
                  <div className="text-lg text-white mb-2" style={{ fontWeight: 600 }}>
                    {address.korean}
                  </div>
                  <div className="text-sm text-gray-400">
                    {address.english}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-6 border-t border-white/10">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">전화</div>
                    <a href={`tel:${address.tel}`} className="text-lg text-white hover:text-blue-400 transition-colors" style={{ fontWeight: 600 }}>
                      {address.tel}
                    </a>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">팩스</div>
                    <div className="text-lg text-white" style={{ fontWeight: 600 }}>
                      {address.fax}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">이메일</div>
                    <a href={`mailto:${address.email}`} className="text-lg text-white hover:text-blue-400 transition-colors" style={{ fontWeight: 600 }}>
                      {address.email}
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 p-10"
            >
              <div className="text-2xl text-white mb-8" style={{ fontWeight: 700 }}>
                운영 시간
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start justify-between py-4 border-b border-white/10">
                  <span className="text-gray-400">평일</span>
                  <span className="text-white text-lg" style={{ fontWeight: 600 }}>08:30 - 17:30</span>
                </div>
                <div className="flex items-start justify-between py-4 border-b border-white/10">
                  <span className="text-gray-400">점심시간</span>
                  <span className="text-white text-lg" style={{ fontWeight: 600 }}>12:00 - 13:00</span>
                </div>
                <div className="flex items-start justify-between py-4 border-b border-white/10">
                  <span className="text-gray-400">주말 및 공휴일</span>
                  <span className="text-white text-lg" style={{ fontWeight: 600 }}>휴무</span>
                </div>
              </div>

              <div className="mt-12 p-8 bg-gradient-to-br from-blue-600/20 via-blue-500/15 to-blue-600/20 border border-blue-400/40 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 flex items-center">
                    <p className="text-blue-100 m-0" style={{ fontWeight: 500, lineHeight: '1.5' }}>
                      방문 전 사전 예약을 통해 보다 원활한 상담이 가능합니다.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={closeLightbox}
        >
          <div 
            className="relative max-w-4xl max-h-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <ImageWithFallback
              src={currentImage}
              alt={currentImageTitle}
              className="w-full h-full object-contain"
            />
            <button
              className="absolute top-4 right-4 cursor-pointer bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
              onClick={closeLightbox}
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}