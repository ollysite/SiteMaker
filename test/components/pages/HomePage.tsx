import { motion } from "motion/react";
import {
  ArrowRight,
  Factory,
  Cpu,
  Gauge,
  Shield,
  Award,
  Users,
  Globe,
  ChevronRight,
  Play,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import boeLogo from "figma:asset/a380796a39b20c2ed56d975a97eb2f10af788e33.png";
import csotLogo from "figma:asset/1cb7dd5bcf7e28885fc79e16c1718b458213d585.png";
import lgDisplayLogo from "figma:asset/a4aad674e71326b3e96038475333c653c225b0d5.png";
import poscoLogo from "figma:asset/abe5607c7744148f28e90bd9ec58df9ea43a64cf.png";
import tianmaLogo from "figma:asset/8d7956d99f207d7f72c99b9ad21722aa1a93b0ab.png";
import kepcoLogo from "figma:asset/a7abdba4f9f1d54f01c900bdc42b01eabc248135.png";
import shinsungFaLogo from "figma:asset/3b0af72a93eb592866f866c1bf710a759d6a0e25.png";
import hkcLogo from "figma:asset/a59af12e0ae9bcd6cd3ba44788a7c41a8180cbf8.png";
import amkorLogo from "figma:asset/27cb6c510b7472a62c4ba3dd9710710cc2afad2b.png";
import stockerImage3 from "figma:asset/a08fb45aca26b98c06ed1c75ee2e519811b0258b.png";
import ohcvImage2 from "figma:asset/84a073b041f9b65a4ae0b50b59799946f6152c42.png";
import CassetteHandlingImage1 from "figma:asset/83c516b5fe126f38d8bd5e49513bfdf5dfae4a95.png";
import cassetteImage from "figma:asset/6185407ee25554fb3ec998a59bc6f1733711fa54.png";
import lifterImage1 from "figma:asset/3261c91cb460a21bb7cb62fc3933bc2234e92cd8.png";
import ohtImage1 from "figma:asset/8f7ff51820ca27e257ca64d3aafd19dd32adad46.png";
import amrImage1 from "figma:asset/d0447de6075ae3e4a89fcb5db9ae6592782bd1f7.png";
import shuttleImage from "figma:asset/cbea354f9efad7d46189f4d5cad4711df7bc86ff.png";
import millingImage from "figma:asset/4b6b6291e25f292fc9cb657cb06d057661cf6d9b.png";
import certificationStampImage from "figma:asset/38266f2506325d46a717e1f4077d06af3c86439c.png";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const clients = [
    { name: "LG Display", logo: lgDisplayLogo },
    { name: "BOE", logo: boeLogo },
    { name: "CSOT", logo: csotLogo },
    { name: "Tianma", logo: tianmaLogo },
    { name: "HKC", logo: hkcLogo },
    { name: "Amkor Technology", logo: amkorLogo },
    { name: "POSCO", logo: poscoLogo },
    { name: "KEPCO", logo: kepcoLogo },
    { name: "Shinsung FA", logo: shinsungFaLogo },
    { name: "Samsung Display", logo: null },
    { name: "Visionox", logo: null },
  ];

  const businesses = [
    {
      icon: Factory,
      title: "Display AMHS",
      subtitle: "디스플레이 자동화",
      description:
        "LCD, OLED 사업장의 물류 자동화 설계부터 Setup까지 Total Solution 제공",
      features: [
        "Stocker System",
        "OHCV/OHT",
        "Cassette Handling",
        "Lifter System",
      ],
      gradient: "from-blue-600 to-blue-800",
    },
    {
      icon: Cpu,
      title: "반도체 AMHS",
      subtitle: "반도체 자동화",
      description:
        "반도체 사업장의 물류 자동화 설계부터 Setup까지 Total Solution 제공",
      features: [
        "OHT System",
        "N2 Stocker",
        "Bank Stocker",
        "첨단 AMR",
      ],
      gradient: "from-gray-700 to-gray-900",
    },
    {
      icon: Gauge,
      title: "환경 제어 장비",
      subtitle: "특수 장비",
      description: "Photo 공정용 온조 챔버와 환경 챔버 공급",
      features: [
        "온조 Chamber",
        "환경 Chamber",
        "정밀 온·습도 제어",
        "CLASS 1 청정도",
      ],
      gradient: "from-blue-700 to-blue-900",
    },
  ];

  const coreValues = [
    {
      step: "01",
      title: "Layout 설계",
      subtitle: "최적화 설계",
      points: [
        "고객 니즈 반영",
        "초기 Concept 설계",
        "최적 공정 흐름 설계",
        "공정 Simulation 검증",
      ],
    },
    {
      step: "02",
      title: "원가 절감 장비 설계",
      subtitle: "표준화 설계",
      points: [
        "시스템 요구 및 스펙 적용",
        "모듈화, 표준화 설계",
        "2D, 3D CAD 설계",
        "구조해석(FEA) 검증",
      ],
    },
    {
      step: "03",
      title: "제작",
      subtitle: "Cost 경쟁력",
      points: [
        "자체 가공 Shop 운영",
        "제조 공정 표준화",
        "현장 제작, 설치 지원",
        "포장, 출하 관리",
      ],
    },
    {
      step: "04",
      title: "Setup",
      subtitle: "안전, 납기준수",
      points: [
        "일정, 비용 관리",
        "위험성 평가 및 안전 교육",
        "설치 전, 후 품질 검증",
        "운영자 교육 및 매뉴얼 배포",
      ],
    },
  ];

  const stats = [
    {
      value: "2008",
      label: "설립연도",
      suffix: "년",
      icon: Award,
    },
    {
      value: "17",
      label: "사업 경력",
      suffix: "년",
      icon: Users,
    },
    {
      value: "11",
      label: "글로벌 고객사",
      suffix: "+",
      icon: Globe,
    },
    {
      value: "100",
      label: "프로젝트 수행",
      suffix: "+",
      icon: Shield,
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section - Full Screen Impact */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="https://cdn01.nxcloud.biz/web/1/meditor_item_html/690ad182b0281.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/65 via-gray-900/55 to-blue-900/45"></div>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-[1920px] mx-auto px-6 lg:px-16 w-full">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <div
                className="text-2xl lg:text-3xl text-blue-300 mb-6"
                style={{
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                }}
              >
                인간과 협력하는 AI의 시대
              </div>
              
              <h1
                className="text-5xl lg:text-7xl text-white mb-8 leading-[1.1]"
                style={{
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                }}
              >
                스마트팩토리를 선도하는
                <br />
                물류자동화 기업
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg lg:text-xl text-gray-300 mb-12 leading-relaxed max-w-3xl"
              style={{ fontWeight: 400 }}
            >
              디스플레이 및 반도체 물류 자동화 장비 전문기업 CFA는<br />혁신적인 자동화 솔루션으로 글로벌 시장을 선도합니다
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4"
            >
              <button
                onClick={() => onNavigate("products-automation")}
                className="group px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-2xl hover:shadow-blue-600/50 transition-all duration-300 flex items-center gap-3"
                style={{ fontWeight: 500 }}
              >
                제품 둘러보기
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => onNavigate("about-greeting")}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl backdrop-blur-sm transition-all duration-300 flex items-center gap-3"
                style={{ fontWeight: 500 }}
              >
                회사 소개
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/60 flex flex-col items-center gap-3"
        >
          <span style={{ fontWeight: 400 }}>Scroll Down</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2"
          >
            <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section - Apple/Tesla Style */}
      <section className="relative py-32 bg-white overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-20">
            {stats.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  viewport={{ once: true }}
                  className="group text-center"
                >
                  {/* Icon */}
                  <div className="mb-6 flex justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-out shadow-lg shadow-blue-600/20">
                      <Icon
                        className="w-8 h-8 text-white"
                        strokeWidth={1.5}
                      />
                    </div>
                  </div>

                  {/* Value */}
                  <div className="mb-3">
                    <span
                      className="text-6xl lg:text-7xl text-gray-900 tracking-tight"
                      style={{
                        fontWeight: 600,
                        letterSpacing: "-0.04em",
                      }}
                    >
                      {stat.value}
                    </span>
                    <span
                      className="text-4xl lg:text-5xl text-blue-600 ml-1"
                      style={{ fontWeight: 600 }}
                    >
                      {stat.suffix}
                    </span>
                  </div>

                  {/* Label */}
                  <div
                    className="text-gray-500"
                    style={{
                      fontWeight: 400,
                      fontSize: "17px",
                    }}
                  >
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Business Areas - Refined Cards */}
      <section className="py-32 bg-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div
              className="inline-block px-5 py-2 bg-blue-600/10 text-blue-600 text-sm rounded-full mb-8"
              style={{ fontWeight: 500 }}
            >
              BUSINESS
            </div>
            <h2
              className="text-5xl lg:text-6xl text-gray-900 mb-6 tracking-tight"
              style={{
                fontWeight: 600,
                letterSpacing: "-0.03em",
              }}
            >
              주요 사업 영역
            </h2>
            <p
              className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
              style={{ fontWeight: 400 }}
            >
              디스플레이, 반도체, 특수장비 3대 사업 부문에서 Total
              Solution을 제공합니다
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {businesses.map((business, index) => {
              const Icon = business.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                  }}
                  viewport={{ once: true }}
                  className="group relative overflow-hidden bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-200"
                >
                  {/* Gradient Background on Hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${business.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  ></div>

                  <div className="relative p-10">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl group-hover:bg-white/20 flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 shadow-lg shadow-blue-600/20">
                      <Icon
                        className="w-8 h-8 text-white"
                        strokeWidth={1.5}
                      />
                    </div>

                    <div
                      className="text-sm text-blue-600 group-hover:text-blue-200 mb-3 uppercase tracking-wide transition-colors duration-500"
                      style={{ fontWeight: 500 }}
                    >
                      {business.subtitle}
                    </div>

                    <h3
                      className="text-3xl text-gray-900 group-hover:text-white mb-4 transition-colors duration-500 tracking-tight"
                      style={{ fontWeight: 600 }}
                    >
                      {business.title}
                    </h3>

                    <p
                      className="text-gray-700 group-hover:text-gray-200 mb-8 leading-relaxed transition-colors duration-500"
                      style={{ fontWeight: 400 }}
                    >
                      {business.description}
                    </p>

                    <div className="space-y-3 mb-8">
                      {business.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3"
                        >
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full group-hover:bg-white transition-colors duration-500"></div>
                          <span
                            className="text-sm text-gray-700 group-hover:text-white transition-colors duration-500"
                            style={{ fontWeight: 400 }}
                          >
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Technology */}
      <section className="py-32 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div
              className="inline-block px-5 py-2 bg-blue-600/10 text-blue-600 text-sm rounded-full mb-8"
              style={{ fontWeight: 500 }}
            >
              CORE TECHNOLOGY
            </div>
            <h2
              className="text-5xl lg:text-6xl text-gray-900 mb-6 tracking-tight"
              style={{
                fontWeight: 600,
                letterSpacing: "-0.03em",
              }}
            >
              핵심 기술 프로세스
            </h2>
            <p
              className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
              style={{ fontWeight: 400 }}
            >
              설계부터 Setup까지, 체계적인 4단계 프로세스로
              최고의 품질을 보장합니다
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 group hover:-translate-y-1 border border-gray-200"
              >
                <div
                  className="text-7xl text-blue-600/40 group-hover:text-blue-600/60 mb-6 transition-colors duration-300 tracking-tight"
                  style={{
                    fontWeight: 700,
                    letterSpacing: "-0.05em",
                  }}
                >
                  {value.step}
                </div>

                <h3
                  className="text-2xl text-gray-900 mb-2 tracking-tight"
                  style={{ fontWeight: 600 }}
                >
                  {value.title}
                </h3>

                <div
                  className="text-sm text-blue-600 mb-6 uppercase tracking-wide"
                  style={{ fontWeight: 500 }}
                >
                  {value.subtitle}
                </div>

                <div className="space-y-2">
                  {value.points.map((point, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-gray-700"
                    >
                      <div className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span style={{ fontWeight: 400 }}>
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Showcase */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div
              className="inline-block px-5 py-2 bg-blue-600/10 text-blue-600 text-sm rounded-full mb-8"
              style={{ fontWeight: 500 }}
            >
              PRODUCTS
            </div>
            <h2
              className="text-5xl lg:text-6xl text-gray-900 mb-6 tracking-tight"
              style={{
                fontWeight: 600,
                letterSpacing: "-0.03em",
              }}
            >
              주요 제품
            </h2>
            <p
              className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
              style={{ fontWeight: 400 }}
            >
              디스플레이 및 반도체 제조에 특화된 첨단 장비를 공급합니다
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "Stocker System", image: stockerImage3, category: "물류자동화" },
              { name: "OHCV", image: ohcvImage2, category: "물류자동화" },
              { name: "Transfer System", image: CassetteHandlingImage1, category: "물류자동화" },
              { name: "Cassette Handling", image: cassetteImage, category: "물류자동화" },
              { name: "Lifter System", image: lifterImage1, category: "물류자동화" },
              { name: "OHT", image: ohtImage1, category: "물류자동화" },
              { name: "AMR", image: amrImage1, category: "물류자동화" },
              { name: "4Way Shuttle", image: shuttleImage, category: "물류자동화" },
            ].map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                }}
                viewport={{ once: true }}
                className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="image-gradient-overlay"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <div className="p-6">
                  <div
                    className="text-sm text-blue-600 mb-2 uppercase tracking-wide"
                    style={{ fontWeight: 500 }}
                  >
                    {product.category}
                  </div>
                  <h3
                    className="text-xl text-gray-900 tracking-tight"
                    style={{ fontWeight: 600 }}
                  >
                    {product.name}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <button
              onClick={() => onNavigate("products-automation")}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              style={{ fontWeight: 500 }}
            >
              전체 제품 보기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-32 bg-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div
                className="inline-block px-5 py-2 bg-blue-600/10 text-blue-600 text-sm rounded-full mb-8"
                style={{ fontWeight: 500 }}
              >
                CERTIFICATIONS
              </div>
              <h2
                className="text-5xl lg:text-6xl text-gray-900 mb-8 tracking-tight"
                style={{
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                }}
              >
                글로벌 인증 및<br />
                기술력 인정
              </h2>
              <p
                className="text-xl text-gray-700 mb-12 leading-relaxed"
                style={{ fontWeight: 400 }}
              >
                ISO 품질 인증과 다수의 특허 기술을 보유하여
                신뢰할 수 있는 기술력을 입증합니다
              </p>

              <div className="grid grid-cols-2 gap-6">
                {[
                  {
                    title: "ISO 9001:2015",
                    subtitle: "품질경영시스템",
                  },
                  {
                    title: "ISO 14001:2015",
                    subtitle: "환경경영시스템",
                  },
                  {
                    title: "특허 제 10-2146170호",
                    subtitle: "독점시연장치 기술",
                  },
                  {
                    title: "기업부설연구소",
                    subtitle: "기술개발 역량",
                  },
                ].map((cert, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                    }}
                    viewport={{ once: true }}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200"
                  >
                    <Shield
                      className="w-8 h-8 text-blue-600 mb-3"
                      strokeWidth={1.5}
                    />
                    <div
                      className="text-lg text-gray-900 mb-1 tracking-tight"
                      style={{ fontWeight: 600 }}
                    >
                      {cert.title}
                    </div>
                    <div
                      className="text-gray-700"
                      style={{ fontWeight: 400 }}
                    >
                      {cert.subtitle}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative h-[600px] rounded-3xl overflow-hidden"
            >
              <ImageWithFallback
                src={certificationStampImage}
                alt="CFA Quality Certifications and Standards"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 to-transparent"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="py-32 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div
              className="inline-block px-5 py-2 bg-blue-600/10 text-blue-600 text-sm rounded-full mb-8"
              style={{ fontWeight: 500 }}
            >
              GLOBAL CLIENTS
            </div>
            <h2
              className="text-5xl lg:text-6xl text-gray-900 mb-6 tracking-tight"
              style={{
                fontWeight: 600,
                letterSpacing: "-0.03em",
              }}
            >
              주요 고객사
            </h2>
            <p
              className="text-xl text-gray-700"
              style={{ fontWeight: 400 }}
            >
              글로벌 선도기업들이 CFA를 신뢰합니다
            </p>
          </motion.div>

          <div className="relative overflow-hidden py-8">
            <motion.div
              className="flex gap-12"
              animate={{
                x: [0, -2688],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 40,
                  ease: "linear",
                },
              }}
            >
              {/* First set of logos */}
              {clients
                .filter((client) => client.logo)
                .map((client, index) => (
                  <div
                    key={`first-${index}`}
                    className="flex-shrink-0 w-64 h-40 rounded-2xl bg-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-200"
                  >
                    <img
                      src={client.logo}
                      alt={client.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ))}
              {/* Second set of logos for seamless loop */}
              {clients
                .filter((client) => client.logo)
                .map((client, index) => (
                  <div
                    key={`second-${index}`}
                    className="flex-shrink-0 w-64 h-40 rounded-2xl bg-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-200"
                  >
                    <img
                      src={client.logo}
                      alt={client.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2
                className="text-5xl lg:text-6xl text-white mb-6 tracking-tight"
                style={{
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.2
                }}
              >
                CFA와 함께
                <br />
                미래를 만들어갑니다
              </h2>
              <p
                className="text-xl text-blue-100 mb-10 leading-relaxed"
                style={{ fontWeight: 400 }}
              >
                최첨단 자동화 솔루션으로 귀사의 생산성을
                혁신하겠습니다
              </p>
              <button
                onClick={() => onNavigate("support-inquiry")}
                className="px-10 py-4 bg-white hover:bg-gray-100 text-blue-600 rounded-xl shadow-2xl transition-all duration-300 inline-flex items-center gap-3"
                style={{ fontWeight: 500 }}
              >
                프로젝트 문의하기
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-6"
            >
              {[
                {
                  icon: Factory,
                  title: "설계 & 제작",
                  desc: "맞춤형 설계",
                },
                {
                  icon: Cpu,
                  title: "자동화 시스템",
                  desc: "Total Solution",
                },
                {
                  icon: Shield,
                  title: "품질 보증",
                  desc: "ISO 인증",
                },
                {
                  icon: Users,
                  title: "전문 지원",
                  desc: "평일 08:30~17:30 Support",
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                    }}
                    viewport={{ once: true }}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300"
                  >
                    <Icon
                      className="w-10 h-10 text-white mb-4"
                      strokeWidth={1.5}
                    />
                    <div
                      className="text-lg text-white mb-1 tracking-tight"
                      style={{ fontWeight: 600 }}
                    >
                      {item.title}
                    </div>
                    <div
                      className="text-blue-100"
                      style={{ fontWeight: 400 }}
                    >
                      {item.desc}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}