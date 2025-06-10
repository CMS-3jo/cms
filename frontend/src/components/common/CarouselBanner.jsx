// src/components/common/CarouselBanner.jsx
import React from 'react';

const CarouselBanner = () => {
  return (
    <div id="carouselExampleCaptions" className="carousel slide" data-ride="carousel">
      <ol className="carousel-indicators">
        <li data-target="#carouselExampleCaptions" data-slide-to="0" className="active"></li>
      </ol>
      <div className="carousel-inner">
        <div className="carousel-item active">
          <img src="./images/user/campus.jpg" alt="" />
        </div>
      </div>
      <button className="carousel-control-prev" type="button" data-target="#carouselExampleCaptions" data-slide="prev">
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="sr-only">Previous</span>
      </button>
      <button className="carousel-control-next" type="button" data-target="#carouselExampleCaptions" data-slide="next">
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="sr-only">Next</span>
      </button>
    </div>
  );
};

export default CarouselBanner;