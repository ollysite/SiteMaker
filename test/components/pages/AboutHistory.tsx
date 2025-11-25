import { motion } from "motion/react";
import { SubPageHeader } from "../SubPageHeader";
import { Calendar, Award, TrendingUp, Rocket, Trophy } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import exportTowerImage1 from "figma:asset/9a2743e73d22521d090924e64d0bb1ab42ba0025.png";
import exportTowerImage2 from "figma:asset/63fef36168505a5341e6a8329bc57f160cc57995.png";

export function AboutHistory() {
  const timeline = [
    {
      year: "2025",
      events: [
        { title: "반도체 OHT 시스템 개발, 설치", type: "tech" },
        { title: "Physical AI 기반 스마트 팩토리", type: "tech" }
      ]
    },
    {
      year: "2023",
      events: [
        { title: "반도체 Stocker 기술 개발", type: "tech" },
        { title: "OLED OHT System 개발, 설치", type: "tech" }
      ]
    },
    {
      year: "2022",
      events: [
        { title: "AMR 기술 개발", type: "tech" }
      ]
    },
    {
      year: "2021",
      events: [
        { title: "ISO 45001 인증", type: "cert" }
      ]
    },
    {
      year: "2019",
      events: [
        { title: "천만불 수출의 탑 수상", type: "award" }
      ]
    },
    {
      year: "2018",
      events: [
        { title: "CSOT 협력업체 등록", type: "business" }
      ]
    },
    {
      year: "2017",
      events: [
        { title: "LG Display 협력업체 등록", type: "business" },
        { title: "ISO 9001, 14001, K-OHSMS18001 인증", type: "cert" },
        { title: "특수장비사업 진출 (환경제어장비 사업 인수)", type: "business" }
      ]
    },
    {
      year: "2008",
      events: [
        { title: "씨에프에이(CFA) 설립 (클린룸 자동화 사업 진출)", type: "founding" }
      ]
    }
  ];

  const getEventColor = (type: string) => {
    switch (type) {
      case "founding":
        return "bg-blue-600 text-white border-blue-600";
      case "tech":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "cert":
        return "bg-gray-50 text-gray-700 border-gray-200";
      case "award":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "business":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "founding":
        return Rocket;
      case "tech":
        return TrendingUp;
      case "cert":
      case "award":
        return Award;
      default:
        return Calendar;
    }
  };

  const milestones = [
    {
      year: "2008",
      title: "설립",
      description: "클린룸 자동화 사업으로 시작"
    },
    {
      year: "2017",
      title: "사업 확장",
      description: "특수장비 사업 진출 및 ISO 인증"
    },
    {
      year: "2023",
      title: "기술 혁신",
      description: "디스플레이/반도체 자동화 기술 고도화"
    },
    {
      year: "2025",
      title: "미래 준비",
      description: "Physical AI 기반 스마트 팩토리"
    }
  ];

  return (
    <div className="bg-white">
      <SubPageHeader
        subtitle="COMPANY"
        title="회사연혁"
        description="2008년 설립 이래 지속적인 성장을 이어온 CFA의 역사"
        imageUrl="https://images.unsplash.com/photo-1693423362454-7db6c8e07a5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncm93dGglMjB0aW1lbGluZSUyMHN1Y2Nlc3N8ZW58MXx8fHwxNzYwNDk2NTkzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      />

      {/* Overview Section */}
      <section className="py-32 bg-gradient-to-br from-blue-50 via-white to-gray-50">
        <div className="max-w-[1600px] mx-auto px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl text-gray-900 mb-6" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              17년간의 혁신과 성장
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto" style={{ fontWeight: 400 }}>
              2008년 설립 이래 디스플레이 및 반도체 제조 장비 전문기업으로<br />
              지속적인 기술 개발과 혁신을 통해 성장해왔습니다
            </p>
          </motion.div>

          {/* Milestone Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative bg-white border-2 border-gray-200 p-8 hover:border-blue-600 shadow-lg hover:shadow-xl transition-all duration-500 group rounded-lg"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                
                <div className="text-4xl text-blue-600 mb-4" style={{ fontWeight: 800 }}>
                  {milestone.year}
                </div>
                <div className="text-xl text-gray-900 mb-3" style={{ fontWeight: 700 }}>
                  {milestone.title}
                </div>
                <div className="text-gray-600">
                  {milestone.description}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-block px-4 py-2 bg-blue-50 text-blue-600 text-base mb-6 uppercase tracking-wider rounded-lg" style={{ fontWeight: 600 }}>
              TIMELINE
            </div>
            <h2 className="text-5xl text-gray-900 mb-6" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              주요 연혁
            </h2>
          </motion.div>

          <div className="relative">
            {/* Timeline Line - Mobile: left, Tablet+: center */}
            <div className="absolute left-12 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-px bg-gray-300"></div>

            {/* Timeline Items */}
            <div className="space-y-10 md:space-y-12 lg:space-y-16">
              {timeline.map((yearGroup, groupIndex) => {
                const isLeft = groupIndex % 2 === 0;
                
                return (
                  <motion.div
                    key={yearGroup.year}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: groupIndex * 0.1 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                    {/* Dot - aligned with year */}
                    <div className="absolute left-12 md:left-1/2 transform -translate-x-1/2" style={{ top: '1.4rem' }}>
                      <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-600 rounded-full border-3 md:border-4 border-white shadow-md"></div>
                    </div>

                    {/* Mobile: Horizontal Line from dot to year */}
                    <div className="md:hidden absolute h-px bg-gray-300 w-16" style={{ top: '1.775rem', left: '4.375rem' }}></div>

                    {/* Tablet & Desktop: alternating left/right layout */}
                    <div className="hidden md:grid md:grid-cols-2 md:gap-0">
                      {isLeft ? (
                        <>
                          {/* Left Side - Year and Events */}
                          <div className="pr-8 md:pr-12 lg:pr-24 text-right">
                            {/* Year with Horizontal Line (Desktop only) */}
                            <div className="mb-6 relative inline-block">
                              <h3 className="text-5xl lg:text-6xl text-blue-600" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                                {yearGroup.year}
                              </h3>
                              {/* Horizontal Line - Desktop only */}
                              <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-4 h-px bg-gray-300 w-16"></div>
                            </div>
                            
                            {/* Events */}
                            <div className="space-y-3">
                              {yearGroup.events.map((event, eventIndex) => (
                                <motion.div
                                  key={eventIndex}
                                  initial={{ opacity: 0, x: -30 }}
                                  whileInView={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.5, delay: eventIndex * 0.1 }}
                                  viewport={{ once: true }}
                                  className="flex items-start gap-3 justify-end"
                                >
                                  <span className="text-lg text-gray-700 leading-relaxed">
                                    {event.title}
                                  </span>
                                  <div className="w-1.5 h-1.5 bg-gray-600 rounded-full flex-shrink-0" style={{ marginTop: '0.6em' }}></div>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* Right Side - Empty */}
                          <div></div>
                        </>
                      ) : (
                        <>
                          {/* Left Side - Empty */}
                          <div></div>

                          {/* Right Side - Year and Events */}
                          <div className="pl-8 md:pl-12 lg:pl-24">
                            {/* Year with Horizontal Line (Desktop only) */}
                            <div className="mb-6 relative inline-block">
                              <h3 className="text-5xl lg:text-6xl text-blue-600" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                                {yearGroup.year}
                              </h3>
                              {/* Horizontal Line - Desktop only */}
                              <div className="hidden lg:block absolute right-full top-1/2 -translate-y-1/2 mr-4 h-px bg-gray-300 w-16"></div>
                            </div>
                            
                            {/* Events */}
                            <div className="space-y-3">
                              {yearGroup.events.map((event, eventIndex) => (
                                <motion.div
                                  key={eventIndex}
                                  initial={{ opacity: 0, x: 30 }}
                                  whileInView={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.5, delay: eventIndex * 0.1 }}
                                  viewport={{ once: true }}
                                  className="flex items-start gap-3"
                                >
                                  <div className="w-1.5 h-1.5 bg-gray-600 rounded-full flex-shrink-0" style={{ marginTop: '0.6em' }}></div>
                                  <span className="text-lg text-gray-700 leading-relaxed">
                                    {event.title}
                                  </span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Mobile: all content on right side */}
                    <div className="md:hidden pl-[9.375rem]">
                      {/* Year */}
                      <div className="mb-4">
                        <h3 className="text-4xl md:text-5xl text-blue-600" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                          {yearGroup.year}
                        </h3>
                      </div>
                      
                      {/* Events */}
                      <div className="space-y-2.5 md:space-y-3">
                        {yearGroup.events.map((event, eventIndex) => (
                          <motion.div
                            key={eventIndex}
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: eventIndex * 0.1 }}
                            viewport={{ once: true }}
                            className="flex items-start gap-2.5 md:gap-3"
                          >
                            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full flex-shrink-0" style={{ marginTop: '0.6em' }}></div>
                            <span className="text-gray-700 leading-relaxed text-base md:text-lg">
                              {event.title}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
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
            <h2 className="text-5xl text-white mb-6" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              CFA의 성과
            </h2>
            <p className="text-xl text-gray-300" style={{ fontWeight: 400 }}>
              숫자로 보는 CFA의 성장
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "17+", label: "Years", desc: "사업 경력" },
              { value: "11+", label: "Clients", desc: "글로벌 고객사" },
              { value: "100+", label: "Projects", desc: "프로젝트 수행" },
              { value: "6", label: "Certifications", desc: "ISO 인증 및 특허" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-8 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 rounded-lg"
              >
                <div className="text-6xl text-white mb-4" style={{ fontWeight: 800 }}>
                  {stat.value}
                </div>
                <div className="text-blue-300 uppercase tracking-wider text-base mb-2" style={{ fontWeight: 600 }}>
                  {stat.label}
                </div>
                <div className="text-gray-400 text-base">
                  {stat.desc}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Export Achievement Section */}
      <section className="py-32 bg-gradient-to-br from-blue-50 via-white to-gray-50">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="inline-block px-5 py-2 bg-blue-600/10 text-blue-600 text-sm rounded-full mb-8" style={{ fontWeight: 500 }}>
                ACHIEVEMENT
              </div>
              <h2 className="text-5xl lg:text-6xl text-gray-900 mb-8 tracking-tight" style={{ fontWeight: 600, letterSpacing: '-0.03em' }}>
                천만불 수출의 탑
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed mb-8" style={{ fontWeight: 400 }}>
                CFA는 대한민국 수출 진흥에 기여한 공로를 인정받아<br />
                천만불 수출의 탑을 수상했습니다.<br />
                이는 우리 기술력의 국제적 경쟁력을 입증하는 쾌거입니다.
              </p>

              <div className="space-y-4">
                {[
                  "글로벌 시장에서 인정받는 기술력",
                  "지속적인 수출 성과 달성",
                  "대한민국 산업 발전에 기여",
                  "고품질 제품으로 고객 신뢰 구축"
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <div className="relative h-[600px] scale-[0.65] sm:scale-[0.75] md:scale-[0.85] lg:scale-75 xl:scale-90 2xl:scale-100 origin-left lg:mt-36">
              {/* Second Image - Background (with rotation and animation) */}
              <motion.div
                initial={{ rotate: 2, x: 20, scale: 0.8 }}
                whileInView={{ rotate: 12, x: 240, scale: 0.9 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, amount: 0.3 }}
                className="absolute top-8 left-8 w-[400px] h-[500px] z-10"
              >
                <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src={exportTowerImage2}
                    alt="천만불 수출의 탑"
                    className="w-full h-full object-cover"
                  />
                  <div className="image-gradient-overlay"></div>
                </div>
              </motion.div>

              {/* First Image - Foreground (with scale animation) */}
              <motion.div
                initial={{ scale: 0.9 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true, amount: 0.3 }}
                className="relative w-[400px] h-[500px] z-20"
              >
                <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src={exportTowerImage1}
                    alt="천만불 수출의 탑 수상"
                    className="w-full h-full object-cover"
                  />
                  <div className="image-gradient-overlay"></div>
                </div>
              </motion.div>
              
              {/* Decorative element */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Future Vision */}
      <section className="py-32 bg-white">
        <div className="max-w-[1600px] mx-auto px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="inline-block px-4 py-2 bg-blue-50 text-blue-600 text-base mb-6 uppercase tracking-wider rounded-lg" style={{ fontWeight: 600 }}>
                FUTURE
              </div>
              <h2 className="text-5xl text-gray-900 mb-8 leading-tight" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                계속되는<br />
                혁신의 여정
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed mb-8" style={{ fontWeight: 400 }}>
                CFA는 과거의 성과에 안주하지 않고,<br />
                끊임없는 기술 개발과 혁신을 통해<br />
                미래 스마트 팩토리 시대를 선도하겠습니다.
              </p>

              <div className="space-y-4">
                {[
                  "Physical AI 기반 지능형 로봇 시스템 개발",
                  "글로벌 시장 진출 확대",
                  "차세대 반도체 제조 장비 기술 개발",
                  "지속 가능한 친환경 제조 솔루션"
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-2 h-2 bg-blue-600 rounded-sm"></div>
                    <span className="text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-600 to-blue-800 p-12 text-white rounded-2xl"
            >
              <Rocket className="w-16 h-16 mb-8 text-white/80" />
              <h3 className="text-3xl mb-6" style={{ fontWeight: 700 }}>
                Vision 2030
              </h3>
              <p className="text-2xl text-blue-100 leading-relaxed mb-8">
                Smart Factory 선도 기업으로서<br />
                글로벌 시장에서 인정받는 혁신 기업이 되겠습니다.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}