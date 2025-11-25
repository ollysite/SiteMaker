import { SubPageHeader } from "../SubPageHeader";
import {
  Target,
  TrendingUp,
  Lightbulb,
  Users,
  Award,
  Rocket,
} from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import ceoSignatureImage from "figma:asset/f97bea811682b5fbf10f2ef32a033569dfef2648.png";

export function AboutGreeting() {
  return (
    <div className="bg-white">
      {/* Page Header */}
      <SubPageHeader
        title="CEO 인사말"
        subtitle="COMPANY"
        description="Clean Factory Automation을 선도하는 기술 혁신 기업"
        imageUrl="https://images.unsplash.com/photo-1716191300006-ea66bf47e2b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXRvbWF0ZWQlMjBmYWN0b3J5JTIwZXF1aXBtZW50fGVufDF8fHx8MTc2MzAxNjcxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      />

      {/* Hero Statement */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg mb-8">
              <span className="text-sm uppercase tracking-wider" style={{ fontWeight: 600 }}>
                CEO Message
              </span>
            </div>
            
            <h1 className="text-6xl text-gray-900 mb-8" style={{ fontWeight: 900, letterSpacing: '-0.02em', lineHeight: '1.1' }}>
              고객의 성공을 위한
              <br />
              <span className="text-blue-600">혁신의 파트너</span>
            </h1>

            <div className="w-24 h-1 bg-blue-600 mx-auto mb-12"></div>
          </motion.div>
        </div>
      </section>

      {/* Main Message */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="space-y-10 text-gray-700 leading-relaxed text-xl">
              <p>
                (주)씨에프에이는{" "}
                <strong className="text-gray-900" style={{ fontWeight: 700 }}>
                  Clean Factory Automation
                </strong>
                을 추구하는 물류 자동화 전문 기업입니다.
              </p>
              <p>
                2008년 설립 이래, 디스플레이와 반도체 산업의
                물류 자동화 설계부터 설치까지 Total Solution을
                제공하며 고객의 신뢰를 쌓아왔습니다.
              </p>
              <p>
                특히 OLED, LCD, 반도체 사업장의 Stocker, OHT,
                OHCV, AGV 등 자동화 시스템과 Photo 공정용 특수
                챔버 장비에서 독보적인 기술력을 보유하고
                있습니다.
              </p>
              <p>
                LG디스플레이, 삼성전자, BOE, CSOT 등 국내외
                유수 기업들과의 협력을 통해 축적한 경험과
                노하우를 바탕으로,
              </p>
              <p>
                {" "}
                <strong className="text-gray-900" style={{ fontWeight: 700 }}>
                Physical AI
                </strong>
                를 구현하고{" "}
                <strong className="text-gray-900" style={{ fontWeight: 700 }}>
                  Smart Factory
                </strong>
                를 선도하는 기업으로 도약하겠습니다.
              </p>

              <div className="pt-12 mt-12 border-t-2 border-gray-200">
                <p className="text-2xl text-gray-900" style={{ fontWeight: 700, lineHeight: '1.5' }}>
                  앞으로도 지속적인 기술 혁신과 내실 경영으로
                  새로운 미래를 창조하는 기업이 되겠습니다.
                </p>
                <p className="mt-8 text-xl text-gray-600">
                  감사합니다.
                </p>
                <div className="mt-12 text-right">
                  <div className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>
                    (주)씨에프에이
                  </div>
                  <div className="text-xl text-blue-600 mt-2" style={{ fontWeight: 600 }}>
                    <ImageWithFallback
                      src={ceoSignatureImage}
                      alt="대표이사 서명"
                      className="h-10 object-contain ml-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg mb-6">
                <span className="text-sm uppercase tracking-wider" style={{ fontWeight: 600 }}>
                  Core Values
                </span>
              </div>
              <h2 className="text-5xl text-gray-900 mb-6" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                경영 이념
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                기술력 확보로 Smart Factory 산업을 선도합니다
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="group"
              >
                <div className="bg-white border-2 border-gray-200 hover:border-blue-500 shadow-md rounded-lg p-10 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                  <div className="w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                    <Lightbulb className="text-white" size={40} />
                  </div>
                  <h3 className="text-2xl text-gray-900 mb-4" style={{ fontWeight: 700 }}>
                    기술 혁신
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    지속적인 연구 개발을 통한 기술력 확보로
                    산업을 선도합니다
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="group"
              >
                <div className="bg-white border-2 border-gray-200 hover:border-blue-500 shadow-md rounded-lg p-10 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                  <div className="w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="text-white" size={40} />
                  </div>
                  <h3 className="text-2xl text-gray-900 mb-4" style={{ fontWeight: 700 }}>
                    내실 경영
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    안정적이고 효율적인 경영을 통한 지속 가능한
                    성장을 추구합니다
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="group"
              >
                <div className="bg-white border-2 border-gray-200 hover:border-blue-500 shadow-md rounded-lg p-10 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                  <div className="w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                    <Rocket className="text-white" size={40} />
                  </div>
                  <h3 className="text-2xl text-gray-900 mb-4" style={{ fontWeight: 700 }}>
                    미래 창조
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    혁신적인 기술로 새로운 가치와 <br />미래 시장을
                    개척합니다
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Company Goal */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white shadow-md rounded-lg p-16 lg:p-24">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `
                      linear-gradient(white 2px, transparent 2px),
                      linear-gradient(90deg, white 2px, transparent 2px)
                    `,
                    backgroundSize: "60px 60px",
                  }}
                />
              </div>

              <div className="relative max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg mb-8">
                  <span className="text-sm uppercase tracking-wider text-blue-100" style={{ fontWeight: 600 }}>
                    Our Vision
                  </span>
                </div>
                
                <h2 className="text-5xl mb-10" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                  우리의 비전
                </h2>
                
                <p className="text-3xl leading-relaxed mb-12" style={{ fontWeight: 600 }}>
                  인간과 협력하는 지능형 로봇의 시대를
                  <br />
                  열어가는 기업
                </p>
                
                <div className="w-24 h-1 bg-white/40 mx-auto mb-12"></div>
                
                <p className="text-xl leading-relaxed text-blue-50">
                  CFA는 최첨단 자동화 기술과 스마트 솔루션으로
                  <br />
                  고객의 생산성 향상과 산업 발전에 기여하겠습니다
                </p>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Achievements */}
      <section className="py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg mb-6">
                <span className="text-sm uppercase tracking-wider" style={{ fontWeight: 600 }}>
                  Achievements
                </span>
              </div>
              <h2 className="text-5xl text-gray-900" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                CFA의 강점
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="bg-white border-2 border-gray-200 shadow-md rounded-lg p-10 text-center h-full">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <Award className="text-blue-600" size={32} />
                  </div>
                  <div className="text-5xl text-blue-600 mb-4" style={{ fontWeight: 800 }}>
                    17+
                  </div>
                  <div className="text-xl text-gray-900 mb-3" style={{ fontWeight: 600 }}>
                    축적된 경험
                  </div>
                  <p className="text-gray-600 text-lg">
                    2008년부터 쌓아온
                    <br />
                    물류 자동화 노하우
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="bg-white border-2 border-gray-200 shadow-md rounded-lg p-10 text-center h-full">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <Users className="text-blue-600" size={32} />
                  </div>
                  <div className="text-5xl text-blue-600 mb-4" style={{ fontWeight: 800 }}>
                    100+
                  </div>
                  <div className="text-xl text-gray-900 mb-3" style={{ fontWeight: 600 }}>
                    프로젝트 수행
                  </div>
                  <p className="text-gray-600 text-lg">
                    국내외 주요 기업과의
                    <br />
                    성공적인 협력 실적
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-white border-2 border-gray-200 shadow-md rounded-lg p-10 text-center h-full">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <Target className="text-blue-600" size={32} />
                  </div>
                  <div className="text-5xl text-blue-600 mb-4" style={{ fontWeight: 800 }}>
                    Total
                  </div>
                  <div className="text-xl text-gray-900 mb-3" style={{ fontWeight: 600 }}>
                    토탈 솔루션
                  </div>
                  <p className="text-gray-600 text-lg">
                    설계부터 설치까지
                    <br />
                    원스톱 서비스 제공
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}