jQuery(document).ready(function( $ ){
    const toggleButtonContainerMenu = document.querySelector(".toggle-menu");
	const menuCollections = document.querySelector(".menu-price-list-container");

	toggleButtonContainerMenu.addEventListener("click",(e)=>{
		menuCollections.classList.toggle("menu-active");
	})
});