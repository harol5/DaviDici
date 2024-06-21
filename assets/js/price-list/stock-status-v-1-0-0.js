export default class StockStatus {
  static currentProductDisplayed;

  static initialize() {
    const modal = document.createElement("div");
    modal.id = "stock-info-modal";
    modal.classList.add("modal");
    modal.innerHTML = `
               <div class="stock-modal-content">
                    <div class="modal-content-header">
                         <span class="close close-stock-info no-print">&times;</span>
                         <img class="logo" alt="davidici logo" src="https://www.davidici.com/wp-content/uploads/2023/11/logo-password-protected-page.svg" />
                         <h1 class="title-stock-info">stock info</h1>                         
                    </div>
                    <div class="modal-content-body">
                    </div>                    
               </div>
          `;
    document.querySelector(`body`).appendChild(modal);

    //--------------Interactivity---------------
    document.addEventListener("click", async (e) => {
      const button = e.target;

      // check if target is button that opens the stock info modal.
      if (button.classList.contains("check-stock-button")) {
        const productId = button.getAttribute("data-product-id");
        // show modal
        modal.style.display = "block";

        // call stock info api and get data .
        const data = await StockStatus.getData(productId);

        // create an element with data embeded and inserted to modal content.
        StockStatus.createElement(data);
      }
    });

    // Get the <span> element that closes the modal
    const span = document.getElementsByClassName("close-stock-info")[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
      modal.style.display = "none";
      StockStatus.removeElement();
    };

    // When the user clicks anywhere outside of the modal, close it
    window.addEventListener("click", (event) => {
      if (event.target == modal) {
        modal.style.display = "none";
        StockStatus.removeElement();
      }
    });
  }

  static async getData(id) {
    let data;
    await jQuery.ajax({
      url: "/wp-json/hrcode/v1/stock-info",
      method: "POST",
      data: {
        post_id: id,
      },
      success: function (response) {
        data = response;
      },
      error: function (xhr, status, error) {
        console.log(error);
      },
    });
    return data;
  }

  static createElement({ id, description, qty, status }) {
    const contentWrapper = document.createElement("section");
    contentWrapper.id = `${id}-stock-info`;
    contentWrapper.classList.add("stock-info-content-wrapper");
    contentWrapper.innerHTML = `
              <span>
                   <h2>Products:</h2>
                   <p>${description}</p>
              </span>
              <span>
                   <h2>Current stock status:</h2>
                   <p>${status}</p>
              </span>
              <span>
                   <h2>Quatity in stock:</h2>
                   <p>${qty}</p>
              </span>
         `;

    document
      .querySelector("#stock-info-modal .modal-content-body")
      .appendChild(contentWrapper);
    StockStatus.currentProductDisplayed = contentWrapper;
  }

  static removeElement() {
    StockStatus.currentProductDisplayed.remove();
  }
}

// export default class ModalDomNode {
//      #name;
//      #element = "div";
//      #className = "modal";
//      #contentModalWidth = "70%"

//      constructor(name, element, contentModalWidth, ...className){
//           this.#name = name;
//           this.#element = element;
//           this.#contentModalWidth = contentModalWidth;
//           this.#className = className;
//      }

//   initialize(content) {
//     const modal = document.createElement(this.#element);
//     modal.id = this.#name + "-modal";
//     modal.classList.add(...this.#className);
//     modal.innerHTML = `
//                <div class="stock-info-modal-content" style="width:${this.#contentModalWidth}">
//                     ${content}
//                </div>
//           `;
//     document.querySelector(`body`).appendChild(modal);

//     //--------------Interactivity---------------
//     document.addEventListener("click", (e) => {
//       const button = e.target;

//       // check if target is button that opens the stock info modal.
//       if (button.classList.contains("check-stock-button")) {
//         const productId = button.getAttribute("data-product-id");

//         // call stock info api and get data.

//         // create an element with data embeded and inserted to modal content.

//         // show modal
//         modal.style.display = "block";
//       }
//     });

//     // Get the <span> element that closes the modal
//     const span = document.getElementsByClassName("close-stock-info")[0];

//     // When the user clicks on <span> (x), close the modal
//     span.onclick = function () {
//       modal.style.display = "none";
//     };

//     // When the user clicks anywhere outside of the modal, close it
//     window.addEventListener("click", (event) => {
//       if (event.target == modal) {
//         modal.style.display = "none";
//       }
//     });
//   }

//   static async getData(){

//   }
// }
