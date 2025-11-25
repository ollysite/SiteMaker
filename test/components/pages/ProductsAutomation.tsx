import { useState, useEffect } from "react";
import { SubPageHeader } from "../SubPageHeader";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import stockerImage2 from "figma:asset/3dfe4d4cd8a90981827004d1d36504d5e8bac00d.png";
import stockerImage3 from "figma:asset/a08fb45aca26b98c06ed1c75ee2e519811b0258b.png";
import stockerImage4 from "figma:asset/df03b9490ad9fdc20f18352acd3795b6b58e3d7d.png";
import stockerImage5 from "figma:asset/6223e9c83feb174f6d651aa2ea8549fac0e619d0.png";
import ohcvImage1 from "figma:asset/8827503793bd261da44975c7b56e8f32a2c0fac8.png";
import ohcvImage2 from "figma:asset/84a073b041f9b65a4ae0b50b59799946f6152c42.png";
import CassetteHandlingImage1 from "figma:asset/83c516b5fe126f38d8bd5e49513bfdf5dfae4a95.png";
import CassetteHandlingImage2 from "figma:asset/47fa87b73cd8510891e1090ad624a3e7d6edf5d7.png";
import cassetteImage from "figma:asset/6185407ee25554fb3ec998a59bc6f1733711fa54.png";
import lifterImage1 from "figma:asset/3261c91cb460a21bb7cb62fc3933bc2234e92cd8.png";
import lifterImage2 from "figma:asset/2c3c5fa54b3deeebace8d90c87b259bea160761b.png";
import lifterImage3 from "figma:asset/9ad952a00f6e41c74fe177fbf5e89d54482f6dbc.png";
import lifterImage4 from "figma:asset/6444d90a1411854c27743a1a5614450518cd0c3b.png";
import ohtImage1 from "figma:asset/8f7ff51820ca27e257ca64d3aafd19dd32adad46.png";
import ohtImage2 from "figma:asset/30e76de76d69899b2380a68e21ebff3e33adefce.png";
import ohtImage3 from "figma:asset/d0954424e1dee17154068b5f2b43f7d7a007f206.png";
import ohtImage4 from "figma:asset/b6027cddc8c8762e194d7a72beb75aec9826044f.png";
import amrImage1 from "figma:asset/d0447de6075ae3e4a89fcb5db9ae6592782bd1f7.png";
import amrImage2 from "figma:asset/6d06142e972dcff7907565b026d0425a938435e1.png";
import shuttleImage from "figma:asset/cbea354f9efad7d46189f4d5cad4711df7bc86ff.png";

export function ProductsAutomation() {
  const [activeTab, setActiveTab] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState<string[]>([]);

  const openLightbox = (images: string[], index: number) => {
    setCurrentImages(images);
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
  };

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!lightboxOpen) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
  };

  // Add keyboard listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const tabs = [
    {
      id: "stocker",
      title: "Stocker System",
      images: [stockerImage5, stockerImage2, stockerImage3, stockerImage4],
      equipment: {
        title: "본 설비",
        description: "Cassette 적재를 위한 설비로서 Cassette를 공급받아 보관을 주요 기능으로 하는 System입니다."
      },
      components: {
        title: "주 구성 설비",
        items: ["Cassette 보관을 위한 Shelf", "외부 마감을 위한 Partition"]
      }
    },
    {
      id: "ohcv",
      title: "OHCV",
      images: [ohcvImage2, ohcvImage1],
      imagePositions: ["50% 35%", "50% 20%"],
      equipment: {
        title: "본 설비",
        description: "STK와 STK간의 물류 이송을 목적으로 한 설비로서 하부 공간을 효율적으로 활용하기 위하여 Fab內 천정에 설치하여 STK간 Cassette 이송을 주요 기능으로 하는 System입니다."
      },
      components: {
        title: "주 구성 설비",
        items: ["Carriage", "주행용 Rail", "Frame", "상부 고정용 Hanger", "진동에 대비한 고정용 Leg", "Buffer", "외부 미관을 위한 Partition"]
      }
    },
    {
      id: "Cassette",
      title: "Cassette Handling System",
      images: [CassetteHandlingImage1, CassetteHandlingImage2, cassetteImage],
      equipment: {
        title: "본 설비",
        description: "STK의 Shelf內에 설치되어 STK와 AGV간 물류 이송을 목적으로 한 설비로서 STK Rack Master 및 AGV 대응 Cassette 이송을 주요 기능으로 하는 System입니다."
      },
      components: {
        title: "주 구성 설비",
        items: ["Carriage", "주행용 Rail", "Frame"]
      }
    },
    {
      id: "lifter",
      title: "Lifter System",
      images: [lifterImage1, lifterImage2, lifterImage3, lifterImage4],
      equipment: {
        title: "본 장비",
        description: "Cassette나 Box를 단차구간 이송하는 것을 주요 기능으로 하는 System입니다."
      },
      components: {
        title: "주 구성 설비",
        items: ["Loading Unit", "Cage", "Up/Down Unit"]
      }
    },
    {
      id: "oht",
      title: "OHT",
      images: [ohtImage4, ohtImage2, ohtImage1, ohtImage3],
      equipment: {
        title: "본 설비",
        description: "STK와 STK간의 물류 이송을 목적으로 한 설비로서 하부 공간을 효율적으로 활용하기 위하여 Fab內 천정에 설치하여 STK간 Cassette 이송을 주요 기능으로 하는 System입니다."
      },
      components: {
        title: "주 구성 설비",
        items: ["Carriage", "주행용 Rail", "Frame", "상부 고정용 Hanger", "진동에 대비한 고정용 Leg", "Buffer", "외부 미관을 위한 Partition"]
      }
    },
    {
      id: "amr",
      title: "AMR",
      images: [amrImage1, amrImage2],
      equipment: {
        title: "본 설비",
        description: "자율주행 로봇을 활용한 유연한 물류 이송 시스템으로, 생산라인 간 효율적인 물자 이동을 담당합니다."
      },
      components: {
        title: "주 구성 설비",
        items: ["자율주행 로봇", "충전 스테이션", "관제 시스템", "안전 센서"]
      }
    },
    {
      id: "shuttle",
      title: "4-Way Shuttle",
      imageUrl: shuttleImage,
      equipment: {
        title: "본 설비",
        description: "랙 구조 내에서 4방향(전후좌우) 자유로운 이동이 가능한 자동 보관 시스템으로, 고밀도 입출고 작업과 공간 효율성을 극대화하는 첨단 물류 설비입니다. 다층 랙 시스템에서 화물을 신속하게 적재 및 출고할 수 있어 반도체 및 디스플레이 제조 라인의 효율적인 재고 관리를 담당합니다."
      },
      components: {
        title: "주 구성 설비",
        items: ["4방향 이동 셔틀", "승강 리프트", "다층 랙 구조", "적재 플랫폼", "제어 시스템", "위치 센서", "안전 장치"]
      }
    }
  ];

  return (
    <div className="bg-white">
      <SubPageHeader
        subtitle="PRODUCTS"
        title="물류자동화부문"
        description="디스플레이 및 반도체 생산라인을 위한 첨단 자동화 시스템"
        imageUrl="https://images.unsplash.com/photo-1759159091728-e2c87b9d9315?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwbWFjaGluZXJ5JTIwZXF1aXBtZW50fGVufDF8fHx8MTc2MTY0NDUxNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      />

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-40 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-8 sm:px-12">
          <div className="flex gap-3 overflow-x-auto py-4">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(index)}
                className={`relative px-8 py-4 whitespace-nowrap transition-all duration-300 rounded-xl ${
                  activeTab === index
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                }`}
                style={{ fontWeight: 600, letterSpacing: '-0.01em' }}
              >
                {tab.title}
                {activeTab === index && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-blue-600 rotate-45" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <section className="py-24">
        <div className="max-w-[1600px] mx-auto px-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Equipment Section */}
              <div className="mb-16">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-2 h-8 bg-blue-600 flex-shrink-0 mt-1"></div>
                  <h2 className="text-3xl text-gray-900" style={{ fontWeight: 700 }}>
                    {tabs[activeTab].equipment.title}
                  </h2>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed pl-6 border-l-2 border-gray-200">
                  {tabs[activeTab].equipment.description}
                </p>
              </div>

              {/* System Image(s) */}
              {tabs[activeTab].images ? (
                tabs[activeTab].id === "stocker" ? (
                  // Special layout for StockerSystem - 2-column grid with square aspect ratio
                  <div className="mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {tabs[activeTab].images.map((image, index) => (
                        <div 
                          key={index} 
                          className="relative rounded-2xl overflow-hidden shadow-xl cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 group aspect-square"
                          onClick={() => openLightbox(tabs[activeTab].images, index)}
                        >
                          <ImageWithFallback
                            src={image}
                            alt={`${tabs[activeTab].title} ${index + 1}`}
                            className="rounded-2xl w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-all duration-300 flex items-center justify-center">
                            <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : tabs[activeTab].id === "amr" ? (
                  // Special layout for AMR - 2-column grid with square aspect ratio
                  <div className="mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {tabs[activeTab].images.map((image, index) => (
                        <div 
                          key={index} 
                          className="relative rounded-2xl overflow-hidden shadow-xl cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 group aspect-square"
                          onClick={() => openLightbox(tabs[activeTab].images, index)}
                        >
                          <ImageWithFallback
                            src={image}
                            alt={`${tabs[activeTab].title} ${index + 1}`}
                            className="rounded-2xl w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-all duration-300 flex items-center justify-center">
                            <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Standard layout for other tabs
                  <div className={`mb-16 grid gap-8 ${
                    tabs[activeTab].id === "lifter"
                      ? "grid-cols-1 md:grid-cols-4" 
                      : tabs[activeTab].id === "Cassette"
                      ? "grid-cols-1 md:grid-cols-3"
                      : "grid-cols-1 md:grid-cols-2"
                  }`}>
                    {tabs[activeTab].images.map((image, index) => (
                      <div 
                        key={index} 
                        className="relative rounded-2xl overflow-hidden shadow-xl cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                        style={tabs[activeTab].id === "ohcv" ? { aspectRatio: "16/9" } : undefined}
                        onClick={() => openLightbox(tabs[activeTab].images, index)}
                      >
                        <ImageWithFallback
                          src={image}
                          alt={`${tabs[activeTab].title} ${index + 1}`}
                          className="rounded-2xl w-full h-full object-cover"
                          style={tabs[activeTab].id === "ohcv" ? { objectPosition: tabs[activeTab].imagePositions[index] } : undefined}
                        />
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-all duration-300 flex items-center justify-center">
                          <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : tabs[activeTab].imageUrl && (
                <div className="mb-16 flex justify-center">
                  <div 
                    className={`relative rounded-2xl overflow-hidden shadow-xl cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group ${
                      tabs[activeTab].id === "shuttle" ? "w-full max-w-2xl" : "w-full max-w-5xl"
                    }`}
                    onClick={() => openLightbox([tabs[activeTab].imageUrl], 0)}
                  >
                    <ImageWithFallback
                      src={tabs[activeTab].imageUrl}
                      alt={tabs[activeTab].title}
                      className="rounded-2xl w-full"
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-all duration-300 flex items-center justify-center">
                      <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Components Section */}
              <div>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-2 h-8 bg-blue-600 flex-shrink-0 mt-1"></div>
                  <h2 className="text-3xl text-gray-900" style={{ fontWeight: 700 }}>
                    {tabs[activeTab].components.title}
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-6">
                  {tabs[activeTab].components.items.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 hover:border-blue-600 hover:bg-white transition-all duration-300"
                    >
                      <div className="w-2 h-2 bg-blue-600 flex-shrink-0"></div>
                      <span className="text-gray-800">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.90)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <div className="relative w-full max-w-7xl max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
                onClick={closeLightbox}
              >
                <X size={32} />
              </button>
              
              {/* Image Counter */}
              {currentImages.length > 1 && (
                <div className="absolute top-4 left-4 z-10 text-white bg-black bg-opacity-50 rounded-full px-4 py-2">
                  {currentImageIndex + 1} / {currentImages.length}
                </div>
              )}

              <div className="flex items-center justify-center w-full h-full gap-4">
                {/* Previous Button */}
                {currentImages.length > 1 && (
                  <button
                    className="text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70"
                    onClick={prevImage}
                  >
                    <ChevronLeft size={40} />
                  </button>
                )}

                {/* Image */}
                <div className="flex-1 flex items-center justify-center max-h-[90vh]">
                  <ImageWithFallback
                    src={currentImages[currentImageIndex]}
                    alt={`Image ${currentImageIndex + 1}`}
                    className="rounded-lg max-w-full max-h-[90vh] object-contain"
                  />
                </div>

                {/* Next Button */}
                {currentImages.length > 1 && (
                  <button
                    className="text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70"
                    onClick={nextImage}
                  >
                    <ChevronRight size={40} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        
        <div className="relative max-w-[1600px] mx-auto px-12 text-center">
          <h2 className="text-4xl text-white mb-6" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
            물류 자동화 시스템 도입 문의
          </h2>
          <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
            CFA의 물류 자동화 솔루션으로 생산 효율성을 극대화하세요<br />
            전문 엔지니어가 최적의 시스템을 제안해 드립니다
          </p>
          <button className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 inline-flex items-center gap-3 shadow-xl" style={{ fontWeight: 600 }}>
            견적 문의하기
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  );
}