import DynamicListings from "./dynamic-listings.js";


jQuery(document).ready(function( $ ){

	//-------------------FILTER EVENTS---------------------//
	$(document).on("ajaxSuccess",DynamicListings.onFirstRender);
	
	JetSmartFilters.events.subscribe('fiters/remove', DynamicListings.addListingToResetQueue);
	
	JetSmartFilters.events.subscribe('activeItems/change', DynamicListings.filtersApplyToListing);

	JetSmartFilters.events.subscribe('ajaxFilters/start-loading', DynamicListings.hideListing);
	
	JetSmartFilters.events.subscribe('ajaxFilters/end-loading', DynamicListings.showListing);
	
	
	//=========================================toggle button for filters(responsive)==================================//
	const toggleButtonContainerFilter = document.querySelector(".toggle-filters");
	const filtersContainer = document.querySelector(".main-filter-container");
	const toggleButton = document.querySelector(".toggle-filters [role=\"button\"]");

	toggleButtonContainerFilter.addEventListener("click",(e)=>{
		filtersContainer.classList.toggle("active-filter");
		toggleButton.classList.contains("active-button") ? toggleButton.innerText = "show\nfilters" : toggleButton.innerText = "hide\nfilters";
		toggleButton.classList.toggle("active-button");
	});
		
	//==============================removing empty filter from wall units, addons=====================================================//
	setTimeout(()=>{
		const counters = document.querySelectorAll(`[data-query-id="listing-grid-addons"] .jet-filter-row`);
		counters.forEach((counter)=>{
			console.log(counter)
			const count = Number(counter.querySelector(".value").innerText);
			if(count === 0){
				counter.classList.add('empty-filter');
			}else{
				counter.querySelector(".jet-filters-counter").style.display = "none";
			}
		})
	},9000);			 
});
