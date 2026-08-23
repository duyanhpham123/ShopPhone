// Search btn
$(document).ready(function() {
    $('.header__bottom-search').click(function() {
        $('.header__box').fadeToggle();
        $('.header__box').click(function(e) {
            e.stopPropagation();
        });
    });
    $('.header__bottom-cart').click(function() {
        $('.header__box-cart').fadeToggle();
        $('.header__box-cart').click(function(e) {
            e.stopPropagation();
        });
    });
});

// Sticky header
var height = $('.header__top').height ();
$(window).scroll(function () {
   if ($(this).scrollTop() > height){
         $('.header__bottom').addClass('sticky');
   }else{
          $('.header__bottom').removeClass ('sticky');
        }
});

// Scroll
$(document).ready(function(){
    $(window).scroll(function(){
      if($(this).scrollTop() > 400){
            $('.scroll__top').fadeIn();
        } 
        else{
            $('.scroll__top').fadeOut();
        }
    });
   $('.scroll__top').click(function(){
       $('html, body').animate({scrollTop : 0}, 100);
   })
});

// <!-- Slider -->

    var swiper = new Swiper(".mySwiper", {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        autoplay: {
            delay: 2000,
        },
        navigation: {
            nextEl: ".next",
            prevEl: ".prev",
        },
    });


// <!-- slider-product -->

    var swiper2 = new Swiper(".myProduct", {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        }
    });


//  Slide Related 
    var swiper3 = new Swiper(".myRelated", {
        slidesPerView: 3,
        spaceBetween: 30,
        slidesPerGroup: 3,
        loop: true,
        loopFillGroupWithBlank: true,
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
        breakpoints: {
            // when window width is >= 320px
            320: {
              slidesPerView: 1,
              spaceBetween: 20
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 30
            },
            // when window width is >= 640px
            1200: {
              slidesPerView: 3,
              spaceBetween: 40
            }
          }
      });


// ScrollReveal

var sr = ScrollReveal({
    origin: 'bottom',
    distance: '60px',
    duration: 2000,
    delay: 250
})

sr.reveal(".main__products-hot, .main__products, .main__products-sale, .main__accessory, .main__news, .main__bottom, .footer__top, .main__customer ,.main__map");





