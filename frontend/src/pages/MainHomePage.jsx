// src/pages/MainHomePage.jsx
import React from 'react';
import PublicHeader from '../components/layout/PublicHeader';
import Footer from '../components/layout/Footer';
import CarouselBanner from '../components/common/CarouselBanner';
import HeroSection from '../components/common/HeroSection';
import NoticeSection from '../components/common/NoticeSection';
import ServiceCardsSection from '../components/common/ServiceCardsSection';
import ChatbotButton from '../components/common/ChatbotButton';

const MainHomePage = () => {
  return (
    <div>
      <PublicHeader />
      
      <main>
        <div>
          <CarouselBanner />
        </div>

        <div className="container_layout">
          <HeroSection />
          <NoticeSection />
          <ServiceCardsSection />
        </div>

        <ChatbotButton />
      </main>
      
      <Footer />
    </div>
  );
};

export default MainHomePage;