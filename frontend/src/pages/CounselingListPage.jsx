// src/pages/CounselingListPage.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import SearchFilter from '../components/common/SearchFilter';
import Pagination from '../components/common/Pagination';
import CounselingTable from '../components/counseling/CounselingTable';
import { useCounselingList } from '../hooks/useCounselingList.jsx';

const CounselingListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('모두보기');
  
  const {
    counselingData,
    totalCount,
    totalPages,
    loading,
    error,
    fetchCounselingList
  } = useCounselingList();

  const categories = ['배정전', '내 상담'];

  useEffect(() => {
    fetchCounselingList({
      page: currentPage,
      search: searchTerm,
      category: selectedCategory
    });
  }, [currentPage, searchTerm, selectedCategory]);

  const handleFilter = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  if (error) {
    return <div>오류가 발생했습니다: {error.message}</div>;
  }

  return (
    <>
      <Header />
      
      <article className="container_layout">
        <Sidebar />
        
        <section className="contents">
          <h4 className="board_title" style={{ textAlign: 'left' }}>
            상담 신청 리스트(총 {totalCount} 명)
          </h4>
          
          <SearchFilter 
            onFilter={handleFilter}
            onSearch={handleSearch}
            categories={categories}
          />
          
          <CounselingTable data={counselingData} loading={loading} 
		  onAssigned={() => {
		        fetchCounselingList({
		        page: currentPage,
		        search: searchTerm,
		        category: selectedCategory
		      });
		    }} />
          
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </section>
      </article>
      
      <Footer />
    </>
  );
};

export default CounselingListPage;