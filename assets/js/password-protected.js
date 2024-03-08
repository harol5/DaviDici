jQuery(document).ready(function( $ ){
	const form = document.querySelector(".post-password-form");
	const formContent = document.querySelector(".post-password-form").innerHTML;
	const wrappingDiv = "<div id='wrapping-div'>" + formContent + "</div>"
	form.innerHTML = wrappingDiv;
	
	const logoImg = document.createElement("img");
	logoImg.src = "https://www.staging2.davidici.com/wp-content/uploads/2023/11/logo-password-protected-page.svg";
	logoImg.id = "logo-img";
	form.insertBefore(logoImg, form.firstChild);
	
	const logoImgCorner = document.createElement("img");
	logoImgCorner.src = "https://www.staging2.davidici.com/wp-content/uploads/2020/02/Davidici-Hi-Res-Logo_clipped-no-text-VECTORIZED-INDEX-BACKGROUND-01.svg";
	logoImgCorner.id = "logo-img-corner";
	form.insertBefore(logoImgCorner, form.firstChild);
	
});
