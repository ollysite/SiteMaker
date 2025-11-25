import {
  Mail,
  Send,
  Phone,
  MapPin,
  Clock,
  Building2,
  User,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import { SubPageHeader } from "../SubPageHeader";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner@2.0.3";
import { motion } from "motion/react";

export function SupportInquiry() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    category: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 실제 환경에서는 여기서 서버로 데이터를 전송합니다
    console.log("Form submitted:", formData);

    toast.success("문의가 성공적으로 접수되었습니다", {
      description:
        "담당자가 확인 후 1-2 영업일 내에 연락드리겠습니다.",
    });

    // 폼 초기화
    setFormData({
      name: "",
      company: "",
      email: "",
      phone: "",
      category: "",
      subject: "",
      message: "",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "전화 문의",
      content: "031-671-7170",
      description: "평일 08:30 - 17:30",
      link: "tel:031-671-7170",
    },
    {
      icon: Mail,
      title: "이메일 문의",
      content: "info@cfa.co.kr",
      description: "24시간 접수 가능",
      link: "mailto:info@cfa.co.kr",
    },
    {
      icon: MapPin,
      title: "방문 상담",
      content: "경기도 안성시 양성면 동항공단길 9",
      description: "사전 예약 필수",
      link: null,
    },
  ];

  const categories = [
    "제품 문의",
    "견적 요청",
    "기술 지원",
    "A/S 문의",
    "협력 제안",
    "기타",
  ];

  return (
    <div className="bg-white">
      <SubPageHeader
        subtitle="CONTACT"
        title="온라인 문의"
        description="CFA에 궁금하신 사항을 남겨주시면 신속하게 답변드리겠습니다"
        imageUrl="https://images.unsplash.com/photo-1758519290233-a03c1d17ecc9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b21lciUyMHNlcnZpY2UlMjBjb21tdW5pY2F0aW9ufGVufDF8fHx8MTc2MDQ0OTEwNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      />

      {/* Inquiry Form */}
      <section className="py-32 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-[1000px] mx-auto px-8 sm:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div
              className="inline-block px-6 py-2.5 bg-blue-50 border border-blue-100 text-blue-700 text-sm mb-8 uppercase tracking-wider rounded-full"
              style={{ fontWeight: 600 }}
            >
              INQUIRY FORM
            </div>
            <h2
              className="text-4xl sm:text-5xl text-slate-900 mb-6"
              style={{
                fontWeight: 600,
                letterSpacing: "-0.03em",
              }}
            >
              온라인 문의 양식
            </h2>
            <p
              className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
              style={{ fontWeight: 400 }}
            >
              아래 양식을 작성하여 문의해 주시면
              <br />
              담당자가 확인 후 신속하게 답변드리겠습니다
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="bg-white shadow-2xl p-12 sm:p-16"
          >
            {/* Personal Information */}
            <div className="mb-16 pb-16 border-b border-slate-200">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-blue-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h3
                  className="text-2xl text-slate-900"
                  style={{
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                  }}
                >
                  기본 정보
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label
                    className="block text-sm text-slate-700 mb-3 uppercase tracking-wide"
                    style={{ fontWeight: 600 }}
                  >
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="홍길동"
                    className="h-14 bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none focus:border-blue-600 focus:ring-0 px-4 text-lg"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm text-slate-700 mb-3 uppercase tracking-wide"
                    style={{ fontWeight: 600 }}
                  >
                    회사명
                  </label>
                  <Input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="(주)회사명"
                    className="h-14 bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none focus:border-blue-600 focus:ring-0 px-4 text-lg"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm text-slate-700 mb-3 uppercase tracking-wide"
                    style={{ fontWeight: 600 }}
                  >
                    이메일{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="example@email.com"
                    className="h-14 bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none focus:border-blue-600 focus:ring-0 px-4 text-lg"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm text-slate-700 mb-3 uppercase tracking-wide"
                    style={{ fontWeight: 600 }}
                  >
                    연락처{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="010-0000-0000"
                    className="h-14 bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none focus:border-blue-600 focus:ring-0 px-4 text-lg"
                  />
                </div>
              </div>
            </div>

            {/* Inquiry Details */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-blue-600 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h3
                  className="text-2xl text-slate-900"
                  style={{
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                  }}
                >
                  문의 내용
                </h3>
              </div>
              <div className="space-y-8">
                <div>
                  <label
                    className="block text-sm text-slate-700 mb-3 uppercase tracking-wide"
                    style={{ fontWeight: 600 }}
                  >
                    문의 유형{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        category: value,
                      })
                    }
                    required
                  >
                    <SelectTrigger className="h-14 bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none focus:border-blue-600 focus:ring-0 px-4 text-lg">
                      <SelectValue placeholder="문의 유형을 선택해주세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category}
                          value={category}
                        >
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label
                    className="block text-sm text-slate-700 mb-3 uppercase tracking-wide"
                    style={{ fontWeight: 600 }}
                  >
                    제목 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="문의 제목을 입력해주세요"
                    className="h-14 bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none focus:border-blue-600 focus:ring-0 px-4 text-lg"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm text-slate-700 mb-3 uppercase tracking-wide"
                    style={{ fontWeight: 600 }}
                  >
                    문의 내용{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="문의하실 내용을 상세히 입력해주세요"
                    rows={10}
                    className="bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none focus:border-blue-600 focus:ring-0 px-4 py-4 text-lg resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="bg-slate-100 p-8 border-l-4 border-blue-600">
              <p
                className="text-sm text-slate-700 leading-relaxed"
                style={{ fontWeight: 400 }}
              >
                <strong
                  className="text-blue-600 block mb-2"
                  style={{ fontWeight: 600 }}
                >
                  개인정보 수집 및 이용 안내
                </strong>
                CFA는 고객 문의 처리를 위해 최소한의
                개인정보(이름, 연락처, 이메일)를 수집하며,
                수집된 정보는 문의 답변 외의 용도로 사용되지
                않습니다. 문의 처리 완료 후 관련 법령에 따라
                일정 기간 보관 후 파기됩니다.
              </p>
            </div>

            {/* Submit Button */}
            <div className="mt-16 flex justify-center">
              <Button
                type="submit"
                className="px-16 py-6 bg-blue-600 hover:bg-blue-700 text-white text-lg shadow-2xl hover:shadow-blue-600/50 transition-all duration-300"
                style={{
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                }}
              >
                <Send className="w-5 h-5 mr-3" />
                문의 접수하기
              </Button>
            </div>
          </motion.form>
        </div>
      </section>

      {/* Contact Methods - Moved below form */}
      <section className="py-32 bg-gradient-to-br from-blue-50 via-white to-gray-50">
        <div className="max-w-[1600px] mx-auto px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2
              className="text-5xl text-gray-900 mb-6"
              style={{
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              다양한 연락 방법
            </h2>
            <p
              className="text-xl text-gray-700"
              style={{ fontWeight: 400 }}
            >
              편하신 방법으로 문의해 주세요
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
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
                  className="group bg-white border-2 border-gray-200 p-8 text-center shadow-md hover:border-blue-600 hover:shadow-2xl transition-all duration-500"
                >
                  <div className="w-20 h-20 bg-blue-50 group-hover:bg-blue-600 flex items-center justify-center mx-auto mb-6 transition-all duration-500">
                    <Icon className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors duration-500" />
                  </div>
                  <h3
                    className="text-xl text-gray-900 mb-3"
                    style={{ fontWeight: 700 }}
                  >
                    {info.title}
                  </h3>
                  {info.link ? (
                    <a
                      href={info.link}
                      className="text-lg text-blue-600 hover:text-blue-700 mb-2 block transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      {info.content}
                    </a>
                  ) : (
                    <div
                      className="text-lg text-gray-700 mb-2"
                      style={{ fontWeight: 600 }}
                    >
                      {info.content}
                    </div>
                  )}
                  <p className="text-sm text-gray-500">
                    {info.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-32 bg-gradient-to-br from-gray-900 to-blue-900 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        <div className="relative max-w-[1600px] mx-auto px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 p-10"
            >
              <Clock className="w-12 h-12 text-blue-400 mb-6" />
              <h3
                className="text-2xl text-white mb-6"
                style={{ fontWeight: 700 }}
              >
                응답 시간
              </h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                접수된 문의는 담당자 확인 후 1-2 영업일 내에
                답변드립니다. 긴급한 문의는 전화로 연락 주시면
                더 빠르게 도와드리겠습니다.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-2 h-2 bg-blue-400"></div>
                  <span>일반 문의: 1-2 영업일</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-2 h-2 bg-blue-400"></div>
                  <span>기술 지원: 당일 ~ 1 영업일</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-2 h-2 bg-blue-400"></div>
                  <span>긴급 문의: 전화 상담 권장</span>
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
              <Building2 className="w-12 h-12 text-blue-400 mb-6" />
              <h3
                className="text-2xl text-white mb-6"
                style={{ fontWeight: 700 }}
              >
                방문 상담
              </h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                직접 방문하셔서 상담을 원하시는 경우 사전 예약을
                통해 보다 원활한 상담이 가능합니다.
              </p>
              <div className="space-y-4 pt-6 border-t border-white/10">
                <div>
                  <div className="text-sm text-gray-400 mb-1">
                    주소
                  </div>
                  <div
                    className="text-white"
                    style={{ fontWeight: 600 }}
                  >
                    경기도 안성시 양성면 동항공단길 9
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">
                    운영 시간
                  </div>
                  <div
                    className="text-white"
                    style={{ fontWeight: 600 }}
                  >
                    평일 08:30 - 17:30 (주말 및 공휴일 휴무)
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}