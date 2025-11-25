import { Bell, Calendar, Eye } from "lucide-react";
import { useState } from "react";
import { SubPageHeader } from "../SubPageHeader";

export function SupportNotice() {
  const [selectedNotice, setSelectedNotice] = useState<number | null>(null);

  const notices = [
    {
      id: 1,
      title: "2025년 설 연휴 휴무 안내",
      date: "2025.01.20",
      views: 245,
      content:
        "2025년 설 연휴 기간 동안의 휴무 일정을 안내드립니다.\n\n휴무 기간: 2025년 1월 28일(화) ~ 2월 2일(일)\n정상 영업: 2025년 2월 3일(월)부터\n\n휴무 기간 중 긴급 문의사항은 고객지원 이메일로 남겨주시면 영업일 기준 순차적으로 답변드리겠습니다.\n\n감사합니다.",
    },
    {
      id: 2,
      title: "신제품 출시 안내 - 차세대 환경 챔버",
      date: "2025.01.10",
      views: 412,
      content:
        "CFA의 신제품 차세대 환경 챔버를 출시합니다.\n\n주요 개선사항:\n- 온도 정밀도 향상 (±0.005℃)\n- 에너지 효율 30% 개선\n- AI 기반 예측 유지보수 기능\n- 실시간 원격 모니터링\n\n자세한 사항은 영업팀으로 문의해 주시기 바랍니다.\n\nTEL: 031-671-7170",
    },
    {
      id: 3,
      title: "ISO 인증 갱신 완료",
      date: "2024.12.15",
      views: 328,
      content:
        "CFA는 2024년 12월 ISO 9001:2015, ISO 14001:2015, ISO 45001:2018 인증 갱신을 성공적으로 완료하였습니다.\n\n이는 CFA의 품질 경영, 환경 경영, 안전보건 경영 시스템이 국제 표준에 부합함을 인정받은 것입니다.\n\n앞으로도 지속적인 품질 개선을 통해 고객 만족도를 높이기 위해 노력하겠습니다.",
    },
    {
      id: 4,
      title: "2024년 하반기 정기 점검 일정 안내",
      date: "2024.11.28",
      views: 189,
      content:
        "고객 여러분께,\n\n2024년 하반기 정기 점검 일정을 안내드립니다.\n\n점검 기간: 2024년 12월 중\n점검 내용: 장비 성능 점검 및 소모품 교체\n\n담당자가 개별 연락을 드릴 예정이며, 일정 조율이 필요하신 경우 고객지원팀으로 연락 주시기 바랍니다.\n\n감사합니다.",
    },
    {
      id: 5,
      title: "홈페이지 리뉴얼 안내",
      date: "2024.11.01",
      views: 567,
      content:
        "CFA 홈페이지가 새롭게 단장하였습니다.\n\n주요 개선사항:\n- 모바일 최적화\n- 제품 정보 강화\n- 온라인 문의 기능 개선\n- 사용자 경험 개선\n\n새로운 홈페이지를 통해 더욱 편리하게 CFA의 제품과 서비스를 확인하실 수 있습니다.\n\n많은 이용 부탁드립니다.",
    },
  ];

  return (
    <div className="bg-white">
      <SubPageHeader
        subtitle="SUPPORT"
        title="공지사항"
        description="CFA의 새로운 소식과 중요 안내사항을 확인하세요"
        imageUrl="https://images.unsplash.com/photo-1760201797006-b4de6ebc823b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXdzJTIwYW5ub3VuY2VtZW50JTIwbm90aWZpY2F0aW9ufGVufDF8fHx8MTc2MDQ5NjU5Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      />

      {/* Content */}
      <section className="py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-8 sm:px-12 lg:px-16">
          {selectedNotice === null ? (
            /* Notice List */
            <div>
              <div className="flex items-center gap-3 mb-12">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <Bell className="text-blue-600" size={20} />
                </div>
                <div>
                  <h2 
                    className="text-2xl text-gray-900"
                    style={{ fontWeight: 600, letterSpacing: '-0.02em' }}
                  >
                    전체 공지사항
                  </h2>
                  <p className="text-gray-600" style={{ fontWeight: 400 }}>
                    총 {notices.length}개의 공지사항
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {notices.map((notice, index) => (
                  <button
                    key={notice.id}
                    onClick={() => setSelectedNotice(notice.id)}
                    className="w-full bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg hover:border-blue-200 transition-all duration-300 text-left group"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span 
                            className="text-sm text-blue-600 px-3 py-1 bg-blue-50 rounded-full"
                            style={{ fontWeight: 500 }}
                          >
                            NEW
                          </span>
                          {index === 0 && (
                            <span 
                              className="text-xs text-orange-600 px-2 py-1 bg-orange-50 rounded-full"
                              style={{ fontWeight: 500 }}
                            >
                              공지
                            </span>
                          )}
                        </div>
                        <h3 
                          className="text-xl text-gray-900 mb-4 group-hover:text-blue-600 transition-colors"
                          style={{ fontWeight: 600, letterSpacing: '-0.01em' }}
                        >
                          {notice.title}
                        </h3>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span className="flex items-center gap-2">
                            <Calendar size={16} />
                            {notice.date}
                          </span>
                          <span className="flex items-center gap-2">
                            <Eye size={16} />
                            {notice.views}
                          </span>
                        </div>
                      </div>
                      <div className="text-gray-400 group-hover:text-blue-600 transition-colors text-2xl">
                        →
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Notice Detail */
            <div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="text-blue-600 hover:text-blue-700 mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors"
                style={{ fontWeight: 500 }}
              >
                ← 목록으로
              </button>

              {notices
                .filter((n) => n.id === selectedNotice)
                .map((notice) => (
                  <div key={notice.id} className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-lg">
                    <div className="p-10 sm:p-12 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white">
                      <h2 
                        className="text-3xl sm:text-4xl text-gray-900 mb-6"
                        style={{ fontWeight: 600, letterSpacing: '-0.02em' }}
                      >
                        {notice.title}
                      </h2>
                      <div className="flex items-center gap-6 text-gray-700">
                        <span className="flex items-center gap-2">
                          <Calendar size={16} />
                          {notice.date}
                        </span>
                        <span className="flex items-center gap-2">
                          <Eye size={16} />
                          조회 {notice.views}
                        </span>
                      </div>
                    </div>
                    <div className="p-10 sm:p-12">
                      <div 
                        className="whitespace-pre-line text-gray-700 leading-relaxed text-lg"
                        style={{ fontWeight: 400 }}
                      >
                        {notice.content}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
