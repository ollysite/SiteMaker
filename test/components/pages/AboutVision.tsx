import { motion } from "motion/react";
import { SubPageHeader } from "../SubPageHeader";
import { Target, Lightbulb, TrendingUp, Users, Rocket, Shield } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import robotImage from "figma:asset/c0a7763237d4726c3731c961e7b9ae82e9ee5e16.png";

export function AboutVision() {
  const visionPillars = [
    {
      icon: Lightbulb,
      title: "기술 개발",
      description: "끊임없는 연구개발을 통해 차별화된 기술력을 확보하고 업계 선도적 위치를 구축합니다",
      color: "blue"
    },
    {
      icon: Shield,
      title: "내실 경영",
      description: "안정적이고 체계적인 경영으로 지속 가능한 성장 기반을 구축합니다",
      color: "gray"
    },
    {
      icon: Rocket,
      title: "미래 창조",
      description: "혁신적인 자동화 기술로 스마트 팩토리 시대를 선도하며 미래를 창조합니다",
      color: "blue"
    }
  ];

  const goals = [
    {
      year: "2025",
      title: "Physical AI 기술 개발",
      description: "인간과 협력하는 지능형 로봇 시스템 상용화",
      icon: Rocket
    },
    {
      year: "2027",
      title: "글로벌 시장 확대",
      description: "아시아 및 유럽 시장 진출 확대",
      icon: TrendingUp
    },
    {
      year: "2030",
      title: "Smart Factory 혁신",
      description: "완전 자동화 스마트 팩토리 솔루션 구축",
      icon: Target
    }
  ];

  return (
    <div className="bg-white">
      <SubPageHeader
        subtitle="COMPANY"
        title="회사비전"
        description="미래를 향한 CFA의 비전과 핵심 가치"
        imageUrl="https://images.unsplash.com/photo-1568952433726-3896e3881c65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwaW5ub3ZhdGlvbnxlbnwxfHx8fDE3NjE2OTQxNTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      />

      {/* Vision Statement */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-50"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0,102,204,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,102,204,0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        
        <div className="relative max-w-[1600px] mx-auto px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-block px-6 py-2 bg-blue-600 text-white text-base mb-8 uppercase tracking-wider rounded-lg" style={{ fontWeight: 600 }}>
              Vision 2030
            </div>
            <h2 className="text-6xl text-gray-900 mb-8 leading-tight" style={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
              Smart Factory<br />
              선도 기업
            </h2>
            <p className="text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed" style={{ fontWeight: 400 }}>
              CFA는 첨단 자동화 기술과 혁신적인 솔루션으로<br />
              글로벌 스마트 팩토리 시대를 선도하는 기업이 되겠습니다
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {visionPillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative bg-white border-2 border-gray-200 p-10 shadow-lg hover:border-blue-600 hover:shadow-2xl transition-all duration-500 rounded-2xl"
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top"></div>
                  
                  <div className="w-20 h-20 bg-blue-50 group-hover:bg-blue-600 flex items-center justify-center mb-8 transition-all duration-500 rounded-lg">
                    <Icon className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors duration-500" />
                  </div>

                  <h3 className="text-3xl text-gray-900 mb-6" style={{ fontWeight: 700 }}>
                    {pillar.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed text-lg">
                    {pillar.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Physical AI Vision */}
      <section className="py-32 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        
        <div className="relative max-w-[1600px] mx-auto px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-end">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="inline-block px-4 py-2 bg-blue-600/30 border border-blue-400/30 text-blue-300 text-base mb-8 rounded-lg" style={{ fontWeight: 600 }}>
                FUTURE VISION
              </div>
              
              <div className="text-xl text-blue-300 mb-4" style={{ fontWeight: 500, letterSpacing: '-0.01em' }}>
                스마트팩토리 선두기업 인간과 협력하는 아시아의 시대
              </div>
              
              <h2 className="text-5xl text-white mb-8 leading-tight" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                스마트팩토리를 선도하는<br />
                물류자동화 기업
              </h2>

              <p className="text-xl text-gray-300 leading-relaxed mb-12" style={{ fontWeight: 400 }}>
                CFA는 Physical AI 기술을 기반으로 인간과 협력하는 지능형 로봇 시스템을 개발하여,
                제조 현장의 생산성과 안전성을 혁신적으로 향상시킵니다.
              </p>

              <div className="space-y-6">
                {[
                  { label: "자율 판단 시스템", desc: "AI 기반 실시간 의사결정" },
                  { label: "협업 로봇 기술", desc: "인간과의 안전한 협업 환경" },
                  { label: "예측 유지보수", desc: "데이터 분석을 통한 사전 예방" },
                  { label: "최적화 알고리즘", desc: "생산 효율 극대화" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 rounded-lg"
                  >
                    <div className="w-12 h-12 bg-blue-600 flex items-center justify-center text-white text-lg rounded-lg" style={{ fontWeight: 700 }}>
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <div className="text-white text-lg mb-1" style={{ fontWeight: 600 }}>
                        {item.label}
                      </div>
                      <div className="text-gray-400 text-base">
                        {item.desc}
                      </div>
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
              className="relative h-[700px]"
            >
              <ImageWithFallback
                src={robotImage}
                alt="Semiconductor Technology"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
              <div className="absolute inset-0 bg-blue-600/10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-32 bg-white">
        <div className="max-w-[1600px] mx-auto px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-block px-4 py-2 bg-blue-50 text-blue-600 text-base mb-6 uppercase tracking-wider rounded-lg" style={{ fontWeight: 600 }}>
              ROADMAP
            </div>
            <h2 className="text-5xl text-gray-900 mb-6" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              미래를 향한 여정
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto" style={{ fontWeight: 400 }}>
              체계적인 계획과 실행으로 비전을 실현합니다
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {goals.map((goal, index) => {
              const Icon = goal.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  {/* Connector Line */}
                  {index < goals.length - 1 && (
                    <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-blue-600 to-blue-300 transform translate-y-1/2"></div>
                  )}

                  <div className="relative bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 p-10 shadow-lg hover:border-blue-600 hover:shadow-2xl transition-all duration-500 group rounded-2xl">
                    <div className="w-20 h-20 bg-blue-600 group-hover:bg-gray-900 flex items-center justify-center mb-8 transition-all duration-500 rounded-lg">
                      <Icon className="w-10 h-10 text-white" />
                    </div>

                    <div className="text-base text-blue-600 mb-4 uppercase tracking-wider" style={{ fontWeight: 700 }}>
                      {goal.year}
                    </div>

                    <h3 className="text-2xl text-gray-900 mb-4 leading-tight" style={{ fontWeight: 700 }}>
                      {goal.title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed">
                      {goal.description}
                    </p>

                    <div className="absolute top-8 right-8 text-7xl text-blue-600/20 group-hover:text-blue-600/30 transition-colors duration-500" style={{ fontWeight: 800 }}>
                      {String(index + 1).padStart(2, '0')}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Values Detail */}
      <section className="py-32 bg-gray-100">
        <div className="max-w-[1600px] mx-auto px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-block px-4 py-2 bg-blue-50 text-blue-600 text-base mb-6 uppercase tracking-wider rounded-lg" style={{ fontWeight: 600 }}>
              CORE VALUES
            </div>
            <h2 className="text-5xl text-gray-900 mb-6" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              CFA의 핵심 가치
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "고객 중심",
                description: "고객의 성공이 곧 우리의 성공입니다. 고객의 요구사항을 정확히 파악하고 최적의 솔루션을 제공합니다.",
                icon: Users,
                stats: ["만족도 100%", "11개 글로벌 고객사", "24/7 지원"]
              },
              {
                title: "기술 혁신",
                description: "끊임없는 연구개발로 차별화된 기술력을 확보하고, 업계 선도적 위치를 유지합니다.",
                icon: Rocket,
                stats: ["기업부설연구소", "다수 특허 보유", "신기술 개발"]
              },
              {
                title: "품질 최우선",
                description: "ISO 인증 품질경영시스템을 통해 최고 수준의 제품과 서비스를 제공합니다.",
                icon: Shield,
                stats: ["ISO 9001", "ISO 14001", "ISO 45001"]
              },
              {
                title: "지속 성장",
                description: "안정적인 성장과 함께 사회적 책임을 다하며, 지속 가능한 미래를 만들어갑니다.",
                icon: TrendingUp,
                stats: ["17년 경력", "연평균 성장", "환경경영 실천"]
              }
            ].map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white border border-gray-200 p-10 shadow-lg hover:border-blue-600 hover:shadow-xl transition-all duration-500 group rounded-2xl"
                >
                  <div className="flex items-start gap-6 mb-6">
                    <div className="w-16 h-16 bg-blue-50 group-hover:bg-blue-600 flex items-center justify-center flex-shrink-0 transition-all duration-500 rounded-lg">
                      <Icon className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl text-gray-900 mb-3" style={{ fontWeight: 700 }}>
                        {value.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                    {value.stats.map((stat, idx) => (
                      <div key={idx} className="px-4 py-2 bg-blue-50 text-blue-600 text-base rounded-lg" style={{ fontWeight: 600 }}>
                        {stat}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}