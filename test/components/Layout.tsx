import { Menu, X, ChevronDown, Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import cfaLogo from "figma:asset/e0e3571bc8f8f24d2e5035625297627ee261d5c7.png";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeMobileMenu, setActiveMobileMenu] = useState<string | null>(null);

  const menuItems = [
    {
      title: "회사소개",
      items: [
        { label: "인사말", page: "about-greeting" },
        { label: "회사연혁", page: "about-history" },
        { label: "회사비전", page: "about-vision" },
        { label: "인증현황", page: "about-certifications" },
        { label: "찾아오시는길", page: "about-location" },
      ],
    },
    {
      title: "제품소개",
      items: [
        { label: "물류자동화부문", page: "products-automation" },
        { label: "환경제어장비부문", page: "products-equipment" },
      ],
    },
    {
      title: "사업장소개",
      directPage: "facilities",
      items: [],
    },
    {
      title: "고객지원",
      items: [
        { label: "온라인문의", page: "support-inquiry" },
      ],
    },
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    setActiveMenu(null);
    setActiveMobileMenu(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm backdrop-blur-lg bg-white/95">
        <div className="max-w-[1920px] mx-auto">
          <div className="flex items-center justify-between h-20 px-6 lg:px-16">
            {/* Logo */}
            <button
              onClick={() => handleNavigate("home")}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <img src={cfaLogo} alt="CFA" className="h-14" />
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-8 2xl:gap-12">
              {menuItems.map((menu) => (
                <div
                  key={menu.title}
                  className="relative group"
                  onMouseEnter={() => !menu.directPage && setActiveMenu(menu.title)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <button 
                    onClick={() => menu.directPage && handleNavigate(menu.directPage)}
                    className="h-20 px-6 flex items-center gap-1 text-lg text-slate-700 hover:text-blue-600 transition-colors group-hover:text-blue-600" 
                    style={{ fontWeight: 600, letterSpacing: '-0.01em' }}
                  >
                    {menu.title}
                    {!menu.directPage && <ChevronDown className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />}
                  </button>

                  {/* Dropdown */}
                  {!menu.directPage && activeMenu === menu.title && menu.items.length > 0 && (
                    <div className="absolute left-0 top-full pt-0 min-w-[220px]">
                      <div className="bg-white border border-slate-200 shadow-2xl overflow-hidden">
                        {menu.items.map((item, idx) => (
                          <button
                            key={item.page}
                            onClick={() => handleNavigate(item.page)}
                            className={`block w-full text-left px-6 py-4 text-base text-slate-700 hover:bg-blue-600 hover:text-white transition-all duration-200 ${
                              idx !== menu.items.length - 1 ? 'border-b border-slate-100' : ''
                            }`}
                            style={{ fontWeight: 500 }}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* CTA Button */}
            <button
              onClick={() => handleNavigate("support-inquiry")}
              className="hidden lg:flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
              style={{ fontWeight: 600, letterSpacing: '-0.01em' }}
            >
              <Mail className="w-4 h-4" />
              온라인 문의
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-6">
              {menuItems.map((menu) => (
                <div key={menu.title} className="mb-2">
                  {menu.directPage ? (
                    <button
                      onClick={() => handleNavigate(menu.directPage)}
                      className="flex items-center justify-between w-full py-3 text-lg text-gray-900 hover:text-blue-600 transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      {menu.title}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setActiveMobileMenu(activeMobileMenu === menu.title ? null : menu.title)}
                        className="flex items-center justify-between w-full py-3 text-lg text-gray-900 hover:text-blue-600 transition-colors"
                        style={{ fontWeight: 600 }}
                      >
                        {menu.title}
                        <ChevronDown className={`w-4 h-4 transition-transform ${activeMobileMenu === menu.title ? 'rotate-180' : ''}`} />
                      </button>
                      {activeMobileMenu === menu.title && (
                        <div className="pl-4 space-y-1 pb-2">
                          {menu.items.map((item) => (
                            <button
                              key={item.page}
                              onClick={() => handleNavigate(item.page)}
                              className="block w-full text-left py-2 text-base text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-4 transition-colors"
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
              <button
                onClick={() => handleNavigate("support-inquiry")}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white mt-4"
                style={{ fontWeight: 600 }}
              >
                <Mail className="w-4 h-4" />
                온라인 문의
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '48px 48px'
        }} />
        
        <div className="relative max-w-[1920px] mx-auto px-6 lg:px-16 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <img src={cfaLogo} alt="CFA" className="h-10 brightness-0 invert mb-6" />
              <p className="text-slate-300 leading-relaxed mb-6" style={{ fontWeight: 400 }}>
                CFA는 2008년 설립 이래 디스플레이 및 반도체 제조 장비 전문기업으로<br className="hidden lg:block" />
                혁신적인 자동화 솔루션을 제공하며 글로벌 시장을 선도하고 있습니다.
              </p>
              <div className="flex items-center gap-2 text-base">
                <span className="px-3 py-1.5 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-full" style={{ fontWeight: 500 }}>ISO 9001:2015</span>
                <span className="px-3 py-1.5 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-full" style={{ fontWeight: 500 }}>ISO 14001:2015</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white mb-6 uppercase tracking-wider text-base" style={{ fontWeight: 700 }}>Quick Links</h3>
              <div className="space-y-3">
                <button
                  onClick={() => onNavigate('about-greeting')}
                  className="block text-slate-400 hover:text-white transition-colors"
                  style={{ fontWeight: 400 }}
                >
                  회사소개
                </button>
                <button
                  onClick={() => onNavigate('products-automation')}
                  className="block text-slate-400 hover:text-white transition-colors"
                  style={{ fontWeight: 400 }}
                >
                  제품소개
                </button>
                <button
                  onClick={() => onNavigate('facilities')}
                  className="block text-slate-400 hover:text-white transition-colors"
                  style={{ fontWeight: 400 }}
                >
                  사업장소개
                </button>
                <button
                  onClick={() => onNavigate('support-inquiry')}
                  className="block text-slate-400 hover:text-white transition-colors"
                  style={{ fontWeight: 400 }}
                >
                  고객지원
                </button>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white mb-6 uppercase tracking-wider text-base" style={{ fontWeight: 700 }}>Contact</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-slate-400" style={{ fontWeight: 400 }}>
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-400" />
                  <span>경기도 안성시 양성면<br />동항공단길 9</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400" style={{ fontWeight: 400 }}>
                  <Phone className="w-4 h-4 flex-shrink-0 text-blue-400" />
                  <span>031-671-7170</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400" style={{ fontWeight: 400 }}>
                  <Mail className="w-4 h-4 flex-shrink-0 text-blue-400" />
                  <span>info@cfa.co.kr</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-slate-500 text-base" style={{ fontWeight: 400 }}>
                © 2025 CFA Clean Factory Automation. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-slate-500 text-base">
                <button className="hover:text-white transition-colors" style={{ fontWeight: 400 }}>개인정보처리방침</button>
                <button className="hover:text-white transition-colors" style={{ fontWeight: 400 }}>이용약관</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}