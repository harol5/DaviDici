export default class Gallery{
    static images = {
        hpl:[
            "https://www.davidici.com/wp-content/uploads/2023/11/HPL-TOP-1.png",
        ],
        ocritech:[
            "https://www.davidici.com/wp-content/uploads/2023/08/OCRITECH-ACRYLIC-TOP.png",
        ],
        stoneware:[
            "https://www.davidici.com/wp-content/uploads/2023/11/STONEWARE-INTEGRATED-SINK.png",
        ],
        ceramic:[
            "https://www.davidici.com/wp-content/uploads/2023/12/CERAMIC-WASHBASIN.png",
        ],
        mineralmarble:[
            "https://www.davidici.com/wp-content/uploads/2023/12/MINERALMARMO-1.png",
        ],
        quartz:[
            "https://www.davidici.com/wp-content/uploads/2023/11/QUARTZ.png",
        ],
    };

    static currentOptionDisplayed;

    static initializeGalleryButton(){
        const shoppingCartButton = document.createElement("button");
        shoppingCartButton.id = "gallery-button";
        shoppingCartButton.classList.add("no-print");
        shoppingCartButton.innerHTML = `
          <img src="https://www.davidici.com/wp-content/uploads/2024/02/gallery-wide-svgrepo-com.svg" alt="image icon" class="gallery-icon" />
          <h1>Gallery</h1>
        `;		  
        document.querySelector(`body`).appendChild(shoppingCartButton);
    };

    static initializeGalleryContainer(){
        //this func will create the element that will contain all the products selected.
        const modal = document.createElement("div");
        modal.id = "myModal-wasbasin-images";
        modal.classList.add("modal");
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-content-header">
                    <img class="logo" alt="davidici logo" src="https://www.davidici.com/wp-content/uploads/2023/11/logo-password-protected-page.svg" />
                    <span class="close close-gallery no-print">&times;</span>
                    <h1 class="title-gallery">Gallery</h1>
                </div>
                <div class="modal-content-body gallery-content">
                    <div class="gallery-container-options">
                        <h2 tabindex="0">HPL</h2>
                        <h2 tabindex="0">OCRITECH</h2>
                        <h2 tabindex="0">STONEWARE</h2>
                        <h2 tabindex="0">CERAMIC</h2>
                        <h2 tabindex="0">MINERALMARBLE</h2>
                        <h2 tabindex="0">QUARTZ</h2>
                    </div>
                    <div class="gallery-container-images">
                        <h2 class="initial-message">Select a collection</h2>
                    </div>		
                </div>
            </div>
        `;
        document.querySelector(`body`).appendChild(modal);
  
        //--------------Interactivity---------------
        // Get the button that opens the modal
        const galleryButton = document.querySelector("#gallery-button");
        // Get the <span> element that closes the modal
        const span = document.getElementsByClassName("close-gallery")[0];
        // When the user clicks the button, open the modal 
        galleryButton.addEventListener("click",(e)=>{
          modal.style.display = "block";
        })
        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
            console.log("gallery modal")
          modal.style.display = "none";
        }
        // When the user clicks anywhere outside of the modal, close it
        window.addEventListener("click",(event) => {
            if (event.target == modal) {
            modal.style.display = "none";
            }
        })
    };    

    static initializeOptionsEventDelegation(){
        const delegator = document.querySelector(".gallery-container-options");
        delegator.addEventListener("click",(e)=>{
            const target = e.target;
            if(target.localName === "h2"){
                Gallery.displayImages(target.innerText.toLowerCase());
            }
        });
    }

    static displayImages(option){
        document.querySelector(".initial-message").style.display = "none";
        if(Gallery.currentOptionDisplayed){
            const currentOption = Gallery.currentOptionDisplayed;
            currentOption.remove();
        }
        
        const imagesContainer = document.createElement("div");
        for(const imgUrl of Gallery.images[option]){
            const img = document.createElement("img");
            img.classList.add("gallery-images");
            img.src = imgUrl;
            imagesContainer.appendChild(img);
        }
        Gallery.currentOptionDisplayed = imagesContainer;

        const mainContainer = document.querySelector(".gallery-container-images");
        mainContainer.appendChild(imagesContainer);
    };
}