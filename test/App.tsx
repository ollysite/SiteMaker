import { useState, useEffect } from "react";
import { Layout } from "./components/Layout";
import { HomePage } from "./components/pages/HomePage";
import { AboutGreeting } from "./components/pages/AboutGreeting";
import { AboutHistory } from "./components/pages/AboutHistory";
import { AboutVision } from "./components/pages/AboutVision";
import { AboutCertifications } from "./components/pages/AboutCertifications";
import { AboutLocation } from "./components/pages/AboutLocation";
import { ProductsEquipment } from "./components/pages/ProductsEquipment";
import { ProductsAutomation } from "./components/pages/ProductsAutomation";
import { Facilities } from "./components/pages/Facilities";
import { SupportNotice } from "./components/pages/SupportNotice";
import { SupportInquiry } from "./components/pages/SupportInquiry";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onNavigate={setCurrentPage} />;
      case "about-greeting":
        return <AboutGreeting />;
      case "about-history":
        return <AboutHistory />;
      case "about-vision":
        return <AboutVision />;
      case "about-certifications":
        return <AboutCertifications />;
      case "about-location":
        return <AboutLocation />;
      case "products-equipment":
        return <ProductsEquipment />;
      case "products-automation":
        return <ProductsAutomation />;
      case "facilities":
        return <Facilities />;
      case "support-notice":
        return <SupportNotice />;
      case "support-inquiry":
        return <SupportInquiry />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </Layout>
      <Toaster />
    </>
  );
}
