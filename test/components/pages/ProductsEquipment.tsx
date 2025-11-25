import { useState } from "react";
import { SubPageHeader } from "../SubPageHeader";
import { motion } from "motion/react";
import { Thermometer, Wind, Droplets } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import tempChamberImage from "figma:asset/6fd63b1adeb5fffc53b2d8d751aa6861faf90e1c.png";
import envChamberImage from "figma:asset/e3c2bdac764f0348645f010adf4b0904be3f5d44.png";
import expoChamberImage from "figma:asset/53e2b754694b55e5b918c14b0b83cf87a3b7f726.png";

export function ProductsEquipment() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      id: "env-chamber",
      title: "오븐챔버",
      fullTitle: "오븐 챔버",
      imageUrl: envChamberImage,
      equipment: {
        title: "기능",
        description: "OLED/유기 EL용 잉크젯, 임프린트의 주변 환경(온도, 습도, 먼지, 진동, 소음 등)을 제어하기 위한 장치로 PANEL Chamber와 공조기로 구성되어 있습니다."
      },
      specifications: [
        {
          icon: Thermometer,
          name: "온도범위",
          value: "+20℃ ~ +25℃ (정밀도: ±0.01℃)"
        },
        {
          icon: Droplets,
          name: "습도범위",
          value: "+40 ~ +60% RH (정밀도: ±0.1%RH)"
        },
        {
          icon: Wind,
          name: "소음",
          value: "75db 이하"
        },
        {
          icon: Droplets,
          name: "청정도",
          value: "CLASS 1"
        }
      ]
    },
    {
      id: "temp-chamber",
      title: "온조챔버",
      fullTitle: "온조 챔버",
      imageUrl: tempChamberImage,
      equipment: {
        title: "기능",
        description: "디스플레이 제조 공정 중 Photo 공정에서 노광기로 이동되는 Glass 온도를 일정하게 유지해 생산성 향상 및 제품의 품질 안정화에 필요한 장치입니다."
      },
      specifications: [
        {
          icon: Thermometer,
          name: "온도범위",
          value: "+23℃ ± 2℃ (정밀도: ±0.05℃)"
        },
        {
          icon: Thermometer,
          name: "온도분포",
          value: "설정온도 ±0.5℃"
        },
        {
          icon: Wind,
          name: "풍속",
          value: "0.3 ~ 0.5m/s"
        },
        {
          icon: Droplets,
          name: "청정도",
          value: "CLASS 1"
        }
      ]
    },
    {
      id: "expo-chamber",
      title: "노광기용 환경챔버",
      fullTitle: "노광기용 환경 챔버",
      imageUrl: expoChamberImage,
      equipment: {
        title: "기능",
        description: "OLED/유기 EL용 노광기의 주변 환경(온도, 습도, 먼지, 진동, 소음 등)을 제어하기 위한 장치로 PANEL Chamber와 공조기로 구성되어 있습니다."
      },
      specifications: [
        {
          icon: Thermometer,
          name: "온도범위",
          value: "+20℃ ~ +25℃ (정밀도: ±0.01℃)"
        },
        {
          icon: Wind,
          name: "소음",
          value: "75 db 이하"
        },
        {
          icon: Droplets,
          name: "청정도",
          value: "CLASS 1"
        }
      ]
    }
  ];

  return (
    <div className="bg-white">
      <SubPageHeader
        subtitle="PRODUCTS"
        title="환경제어장비부문"
        description="디스플레이 및 반도체 제조를 위한 정밀 환경 제어 장비"
        imageUrl="https://images.unsplash.com/photo-1720036236694-d0a231c52563?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW51ZmFjdHVyaW5nJTIwZXF1aXBtZW50JTIwY2xvc2V8ZW58MXx8fHwxNzYxNzAyODgzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
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

            {/* System Image */}
            {tabs[activeTab].imageUrl && (
              <div className="mb-16 flex justify-center">
                <div className="relative rounded-2xl overflow-hidden shadow-xl w-full max-w-2xl">
                  <ImageWithFallback
                    src={tabs[activeTab].imageUrl}
                    alt={tabs[activeTab].fullTitle}
                    className="rounded-2xl w-full"
                  />
                  <div className="image-gradient-overlay rounded-2xl"></div>
                </div>
              </div>
            )}

            {/* Specifications Section */}
            <div>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-2 h-8 bg-blue-600 flex-shrink-0 mt-1"></div>
                <h2 className="text-3xl text-gray-900" style={{ fontWeight: 700 }}>
                  주요 사양
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6">
                {tabs[activeTab].specifications.map((spec, index) => {
                  const Icon = spec.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-start gap-4 p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-blue-600 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="w-12 h-12 bg-blue-600/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-gray-900 mb-2" style={{ fontWeight: 600 }}>
                          {spec.name}
                        </div>
                        <div className="text-gray-600">
                          {spec.value}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-[1600px] mx-auto px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl text-gray-900 mb-6" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              기술적 우수성
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              CFA의 장비는 정밀한 환경 제어로 최상의 생산 품질을 보장합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 border border-gray-200 hover:border-blue-600 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-blue-600 text-white flex items-center justify-center mb-6 text-2xl" style={{ fontWeight: 700 }}>
                01
              </div>
              <h3 className="text-xl text-gray-900 mb-4" style={{ fontWeight: 700 }}>
                정밀 제어
              </h3>
              <p className="text-gray-600 leading-relaxed">
                온도, 습도, 청정도 등 모든 환경 요소를 정밀하게 제어하여 최적의 생산 환경을 제공합니다
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 border border-gray-200 hover:border-blue-600 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-blue-600 text-white flex items-center justify-center mb-6 text-2xl" style={{ fontWeight: 700 }}>
                02
              </div>
              <h3 className="text-xl text-gray-900 mb-4" style={{ fontWeight: 700 }}>
                안정성
              </h3>
              <p className="text-gray-600 leading-relaxed">
                장시간 연속 운전에도 안정적인 성능을 유지하며, 고장률이 낮아 생산 효율성을 극대화합니다
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-8 border border-gray-200 hover:border-blue-600 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-blue-600 text-white flex items-center justify-center mb-6 text-2xl" style={{ fontWeight: 700 }}>
                03
              </div>
              <h3 className="text-xl text-gray-900 mb-4" style={{ fontWeight: 700 }}>
                맞춤형 설계
              </h3>
              <p className="text-gray-600 leading-relaxed">
                고객의 생산 환경과 요구사항에 맞춘 맞춤형 설계로 최적화된 솔루션을 제공합니다
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        
        <div className="relative max-w-[1600px] mx-auto px-12 text-center">
          <h2 className="text-4xl text-white mb-6" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
            장비 도입 문의
          </h2>
          <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
            CFA의 정밀 환경 제어 장비로 생산 품질을 향상시키세요<br />
            전문 엔지니어가 최적의 솔루션을 제안해 드립니다
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