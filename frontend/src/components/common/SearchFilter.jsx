// src/components/common/SearchFilter.jsx
import React, { useState } from 'react';

const SearchFilter = ({ onFilter, onSearch, categories = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState('모두보기');
  const [searchTerm, setSearchTerm] = useState('');

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    onFilter(category);
  };

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="cate_search_container">
      <select id="category" value={selectedCategory} onChange={handleCategoryChange}>
        <option>모두보기</option>
        {categories.map((category, index) => (
          <option key={index} value={category}>{category}</option>
        ))}
      </select>
      <div>
        <input 
          type="text" 
          placeholder="이름을 입력하세요."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button id="search_button" className="search_button" onClick={handleSearch}>
          <img src="/search.svg" alt="검색" />
        </button>
      </div>
    </div>
  );
};

export default SearchFilter;