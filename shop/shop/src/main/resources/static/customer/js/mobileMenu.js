
// mobile

const mobileMenu = document.querySelector(".mobile__menu-wrapper");
const mobileMenuBtn = document.querySelector(".header__bottom-mobilemenu");
const mobileMenuClose = document.querySelector(".mobile__btn-close");
const mobileMenuBody = document.querySelector(".mobile__menu-body");

 function showMobileMenu(){
     mobileMenu.classList.add("open");

}
function hideMobileMenu(){
    mobileMenu.classList.remove("open");
}
mobileMenuBtn.addEventListener("click", showMobileMenu);
mobileMenuClose.addEventListener("click", hideMobileMenu);
mobileMenu.addEventListener("click", hideMobileMenu);
mobileMenuBody.addEventListener("click", (e) => {
    e.stopPropagation();
});