$(document).ready(function(){
    $('.carousel').slick({
      autoplay: true,
      arrows: false,
      dots: false,
      autoplaySpeed: 1500,
      variableWidth:true,
      pauseOnFocus:false,
      pauseOnHover:false,
    });
  });

  window.onload = (function(){
    $('.single-product__text-container__text').elimore({
      maxLength: 395,
      moreText: "Показать полностью...",
      lessText: "Скрыть"
    })
  });