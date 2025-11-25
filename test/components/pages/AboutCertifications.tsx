import { motion } from "motion/react";
import { SubPageHeader } from "../SubPageHeader";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { AspectRatio } from "../ui/aspect-ratio";
import patentCert from "figma:asset/9acf5fd157f68a1b480fce0c04fc4d4fcb434921.png";
import iso9001Cert from "figma:asset/0a79d8f667d259d21dc0d307bef8dd230bcc6ec6.png";
import iso14001Cert from "figma:asset/f0d237858b1476d5930afef1224b26e7692cec05.png";
import researchCert from "figma:asset/42eca7ec7e4d8e920a31ee1f3565a36c8b0d6069.png";

export function AboutCertifications() {
  const certificates = [
    {
      id: "iso9001",
      title: "ISO 9001:2015",
      subtitle: "품질경영시스템",
      image: iso9001Cert,
      badge: "Quality Management",
      date: "2017.12",
      organization: "ICR",
      scope: "반도체장비",
      color: "blue"
    },
    {
      id: "iso14001",
      title: "ISO 14001:2015",
      subtitle: "환경경영시스템",
      image: iso14001Cert,
      badge: "Environmental Management",
      date: "2017.12",
      organization: "ICR",
      scope: "반도체장비",
      color: "green"
    },
    {
      id: "research",
      title: "기업부설연구소 인정서",
      subtitle: "한국산업기술진흥협회",
      image: researchCert,
      badge: "R&D Center",
      date: "2016.12",
      organization: "KOITA",
      scope: "제20161126호",
      color: "indigo"
    },
    {
      id: "patent",
      title: "특허 제 10-2146170호",
      subtitle: "독점시연장치 기술",
      image: patentCert,
      badge: "Patent",
      date: "2020.08",
      organization: "특허청",
      scope: "기술특허",
      color: "orange"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: "from-blue-50/50 to-white",
        badge: "bg-blue-500/10 text-blue-700 border-blue-200",
        accent: "text-blue-600"
      },
      green: {
        bg: "from-green-50/50 to-white",
        badge: "bg-green-500/10 text-green-700 border-green-200",
        accent: "text-green-600"
      },
      indigo: {
        bg: "from-indigo-50/50 to-white",
        badge: "bg-indigo-500/10 text-indigo-700 border-indigo-200",
        accent: "text-indigo-600"
      },
      orange: {
        bg: "from-orange-50/50 to-white",
        badge: "bg-orange-500/10 text-orange-700 border-orange-200",
        accent: "text-orange-600"
      }
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="bg-white">
      <SubPageHeader
        subtitle="COMPANY"
        title="인증현황"
        description="국제 표준 인증과 기술력으로 입증된 CFA의 신뢰성"
        imageUrl="https://images.unsplash.com/photo-1617149897850-9b0dea0a2705?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJ0aWZpY2F0ZSUyMGF3YXJkJTIwcXVhbGl0eSUyMGJ1c2luZXNzZXNzZW50JTIwZGV2ZWxvcG1lbnR8ZW58MHx8fDE3NjA0OTY2MDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      />

      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-[1400px] mx-auto px-8 sm:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 
              className="text-5xl sm:text-6xl lg:text-7xl text-gray-900 mb-8"
              style={{ fontWeight: 400, letterSpacing: '0.03em', lineHeight: 1.2 }}
            >
              글로벌 최고수준의
              <br />
              <span style={{ fontWeight: 600 }}>품질 인증</span>
            </h2>
            <p 
              className="text-xl sm:text-2xl text-gray-700 leading-relaxed"
              style={{ fontWeight: 400 }}
            >
              ISO 국제 표준 인증, 기업부설연구소, 특허 기술을 보유하여<br className="hidden sm:block" />
              CFA의 기술력과 신뢰성을 입증합니다
            </p>
          </motion.div>
        </div>
      </section>

      {/* Certifications Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-8 sm:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {certificates.map((cert, index) => {
              const colorClasses = getColorClasses(cert.color);
              return (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`bg-gradient-to-br ${colorClasses.bg} rounded-3xl p-8 sm:p-10 lg:p-12 border border-gray-200 shadow-md hover:shadow-2xl transition-shadow duration-500`}
                >
                  {/* Badge */}
                  <div className="mb-6">
                    <span 
                      className={`inline-block px-4 py-2 ${colorClasses.badge} border text-base rounded-full tracking-wide`}
                      style={{ fontWeight: 500 }}
                    >
                      {cert.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 
                    className="text-2xl sm:text-3xl lg:text-4xl text-gray-900 mb-2"
                    style={{ fontWeight: 600, letterSpacing: '-0.02em' }}
                  >
                    {cert.title}
                  </h3>
                  <p 
                    className="text-lg sm:text-xl text-gray-700 mb-8"
                    style={{ fontWeight: 400 }}
                  >
                    {cert.subtitle}
                  </p>

                  {/* Certificate Image */}
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-200 hover:shadow-xl transition-shadow duration-500">
                    <AspectRatio ratio={1 / 1.414}>
                      <ImageWithFallback
                        src={cert.image}
                        alt={`${cert.title} ${cert.subtitle} 인증서`}
                        className="w-full h-full object-cover"
                      />
                    </AspectRatio>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200">
                      <div 
                        className={`text-base sm:text-lg lg:text-xl ${colorClasses.accent} mb-1`}
                        style={{ fontWeight: 600 }}
                      >
                        {cert.date}
                      </div>
                      <div 
                        className="text-base text-gray-600"
                        style={{ fontWeight: 500 }}
                      >
                        취득/등록일
                      </div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200">
                      <div 
                        className={`text-base sm:text-lg lg:text-xl ${colorClasses.accent} mb-1`}
                        style={{ fontWeight: 600 }}
                      >
                        {cert.organization}
                      </div>
                      <div 
                        className="text-base text-gray-600"
                        style={{ fontWeight: 500 }}
                      >
                        발급기관
                      </div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200">
                      <div 
                        className={`text-base sm:text-lg lg:text-xl ${colorClasses.accent} mb-1 truncate`}
                        style={{ fontWeight: 600 }}
                        title={cert.scope}
                      >
                        {cert.scope}
                      </div>
                      <div 
                        className="text-base text-gray-600"
                        style={{ fontWeight: 500 }}
                      >
                        범위/번호
                      </div>
                    </div>
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