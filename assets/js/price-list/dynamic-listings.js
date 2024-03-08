export default class DynamicListings {
	static resetedFiltersQueue = [];
	static cache = {};
	static currentFilteredListings = [];
	static NumOfActiveListingFilters = {};
	static isFirstRender = true;
	static messageRef;

	static onFirstRender(event,xhr, settings){

		//creates and adds message on first load.
		if(DynamicListings.isFirstRender){
			const mainContainer = document.querySelector("#listing-templates-container");

			const message = document.createElement("h1");
			message.classList.add("message");
			message.innerText = "<-- Please use the filters to see products available";
			mainContainer.appendChild(message);

			DynamicListings.messageRef = message;	
			DynamicListings.isFirstRender = false;
		}

		//DISABLES INPUT AND BUTTON IF ITEM IS ON SHOPPING CART ON FIRST LOAD ONLY.
		const isListing = settings.url.includes("express-program");
		if(isListing){
			const listingSelector = xhr.responseJSON.data.indexer_data.provider.split("/")[1];
			const listing = document.querySelector("#" + listingSelector);
			const item = listingSelector.split("-")[2];
			const loadingSpinner = document.querySelector(`#loading-spinner-${item}`);
			const listingContainer = `${item}-container`;
			const listingContainerRef = document.querySelector(`.${listingContainer}`);

			const listingObj = {
				item: item,
				listingContainerClass: listingContainer,
				listingContainerRef: listingContainerRef,
				domRef: listing,
				loadingSpinnerDomRef: loadingSpinner,
			}

			listingContainerRef.style.display = "none";
			DynamicListings.cache[listingSelector] = listingObj;
			DynamicListings.disabledButtonAndInput(listing);
		}

		//applies size filter if page is washbasin and vanities and/or side units have being selected.
		const isWashbasin = settings.url.includes("washbasins");
		if(isWashbasin){
			const e = new Event("change",{ bubbles: true });
			let sizeFilter;
			let sizeAsString = "";
			let sizeSum = 0;

			const suggestedWashbasinSize = shoppingCart.getSuggestedWashbasinSize();
			const vanitieSizes = suggestedWashbasinSize["vanities price list"];
			const sideUnitSizes = suggestedWashbasinSize["Side Units price list"];
			const allSizes = vanitieSizes.concat(sideUnitSizes);

			//return if no sizes or no vanities selected. (because allSizes might have only side units).
			if(allSizes.length === 0 || vanitieSizes.length === 0) return;

			//rearranges the position of the array to match value on attribute selector.
			if(allSizes.length > 2){
				const firstSize = allSizes.shift();
				allSizes.push(firstSize);
			}

			//sums all size in a string and a number.
			for(const size of allSizes){
				sizeSum += Number(size);
				sizeAsString += `${size}+`;
			}

			console.log("on first render: ", sizeSum,sizeAsString);
			if(vanitieSizes.length === 1 && sideUnitSizes.length === 0){
				sizeFilter = document.querySelector(`[data-label="${sizeSum}"]`);
			}else{
				sizeFilter = document.querySelector(`[data-label="${sizeAsString.slice(0,-1)}(${sizeSum})"]`);
			}

			if(!sizeFilter) sizeFilter = document.querySelector(`[data-label="CUSTOM"]`);
			sizeFilter.checked = true;
			sizeFilter.dispatchEvent(e);
			
			
		}
	}

	static addListingToResetQueue(resetButton){
		let filter = resetButton.queryId;
		let item = filter.split("-")[2];
		DynamicListings.resetedFiltersQueue.push(`${item}-container`);
	}

	static filtersApplyToListing(activedFilters,type,listingSelector){
		//this adds the num of filters apply per listing on each ajax requets.
		let item = listingSelector.split("-")[2];
		DynamicListings.NumOfActiveListingFilters[`${item}-container`] = activedFilters.length;
	}

	static hideListing(type,listingSelector){
		const {domRef,item,loadingSpinnerDomRef}  = DynamicListings.cache[listingSelector];
		DynamicListings.addOverlayWithLoadingSpinnerToFilter(item,loadingSpinnerDomRef);
	
		//----adds class of filtered container to current filtered containers array.
		if(!DynamicListings.currentFilteredListings.includes(`${item}-container`)) DynamicListings.currentFilteredListings.push(`${item}-container`);
		DynamicListings.hideUnfilteredListingContainers();
		
		//-----------------------------------
		DynamicListings.messageRef.style.display = "none";
		domRef.style.display = "none";
		loadingSpinnerDomRef.style.display = "flex";
	}

	static showListing(type,listingSelector){
		const {domRef,item,loadingSpinnerDomRef}  = DynamicListings.cache[listingSelector];
		DynamicListings.disabledButtonAndInput(domRef);

		//-----------filters------------------
		let overlay = document.querySelector("#loading-overlay");
		overlay.remove();
		//-------------listing----------------
		domRef.style.display = "";
		loadingSpinnerDomRef.style.display = "none";
		
		//---change order of container
		if(DynamicListings.resetedFiltersQueue.length !== 0){
			let containerSelectorResetButton = document.querySelector(`.${DynamicListings.resetedFiltersQueue.shift()}`);
			containerSelectorResetButton.style.order = 1;
		}else if(DynamicListings.NumOfActiveListingFilters[`${item}-container`] === 0){
			let containerSelectorResetButton = document.querySelector(`.${item}-container`);
			containerSelectorResetButton.style.order = 1;	 
		}else{
			let itemContainer = document.querySelector(`.${item}-container`);
			itemContainer.style.order = 0;	
		}
		
		if(DynamicListings.currentFilteredListings.length === 0) DynamicListings.messageRef.style.display = "block";
		
	}

	static hideUnfilteredListingContainers(){
		for(const key in DynamicListings.cache){
			const listingContainer = DynamicListings.cache[key].listingContainerRef;
			const listingContainerClass = listingContainer.classList[2];
			if(!DynamicListings.currentFilteredListings.includes(listingContainerClass) || 
				DynamicListings.resetedFiltersQueue.includes(listingContainerClass) || 
				DynamicListings.NumOfActiveListingFilters[listingContainerClass] === 0)
			{
				listingContainer.style.display = "none";
				const index = DynamicListings.currentFilteredListings.indexOf(listingContainerClass);
				if(index >= 0) DynamicListings.currentFilteredListings.splice(index,1);
				
			}else{
				listingContainer.style.display = "";
			}
		}
	}

	static addOverlayWithLoadingSpinnerToFilter(item,loadingSpinner){
		let filterName = item + "-filter";
		let filterContainer = document.querySelector(`[aria-labelledby="${filterName}"]`);
		
		let overlayLoadingSpinner = loadingSpinner.cloneNode(true);
		overlayLoadingSpinner.id = "loading-spiner-overlay-" + item;
		
		let overlay = document.createElement("div");
		overlay.id = "loading-overlay";
		overlay.append(overlayLoadingSpinner);
		overlay.style.cssText = `
			position: absolute;
			top: 0;
			left: 0;
			background-color: #ffffffbf;
			height: 100%;
			width: 100%;
			text-align: center;
			display: flex;
  			align-items: center;
			justify-content: center;
			color: #D1AA68;
			font-weight: 600;
		`;
		
		filterContainer.style.position = "relative";
		filterContainer.append(overlay);
		overlayLoadingSpinner.style.display = "flex";
	}

	static disabledButtonAndInput(listing){
		//----disables 'add to cart' and qty input if item is already in shopping cart
		if(shoppingCart.getProducts().length > 0){
			listing.querySelectorAll(".jet-listing-grid__item").forEach(product=>{
				const id = product.getAttribute("data-post-id")
				if(shoppingCart.indexOfProduct(id) > -1){
					const button = document.getElementById(id);
					const input = document.getElementById(`${id}-qty`);
	
					input.value = '';
					input.setAttribute("disabled", "");	
					button.innerText = "added!!";
					button.style.color = "red";
				}
			})
		}
	}

	static showAllListingContainers(){
		for(const key in DynamicListings.cache){
			const listingContainer = DynamicListings.cache[key].listingContainerRef;
			listingContainer.style.display = "";
		}
	}
}