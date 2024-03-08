/**
 * ShoppingCartDOM Class scope variables:
 * - needs access to shoppingCart variable to getProducts(), getGrandTotal().
 *   also instantiates the same variable where it gets the previusly mentioned methods.
 * - needs access to ProductDom class to disabledAddToCartButton() and enableQtyInput().
 * 
 * ShoppingCart Class needs access to ShoppingCartDOM Class to set last product updated.
 * 
 * ProductDom class need access to shoppingCart variable
 *
 * TODO: must find a way to decouple all these classes and avoid using var to created my variables.
 * Do they follow the single responsability principal?
 */



//=========GLOBAL VARIABLE, FUNCTIONS AND EVENTS===========//
var shoppingCart;
var productsUpdatedEvent = new Event("productsUpdated");
var USDollar = new Intl.NumberFormat('en-US',{
  style: "currency",
  currency: "USD",
});

//this class contains all the methods necesary to update the shopping cart DOM element and LocalStorage
class ShoppingCartDOM {
    static grandTotalRef;
    static orderNowRef;
    static productsRenderedRef = {};
    static lastProductUpdated;
  
    static updateLocalStorage(){
      const products = shoppingCart.getProducts();
      const grandTotal = shoppingCart.getGrandTotal();
      const suggestedWashbasinSize = shoppingCart.getSuggestedWashbasinSize();
      const orderNowUrl = shoppingCart.getUrl();
      localStorage.setItem("shopping-cart",JSON.stringify({products,grandTotal,suggestedWashbasinSize,orderNowUrl}));
    };
  
    static addProduct(id,name,qty,sku,total,unitPrice){
      const productContainer = document.createElement("div");
      productContainer.id = `product-container-${id}`;
      productContainer.classList.add("header-product-container")
      productContainer.innerHTML = `
        <div class="headers-container">
          <h2 class="description-header">Description</h2>
          <h2 class="other-header">Sku</h2>
          <h2 class="other-header">Price</h2>
          <h2 class="other-header">Qty</h2>
          <h2 class="other-header">Total</h2>
          <h2 class="other-header no-print"></h2>
        </div>
        <div class="product-container">
          <div class="product-name-container">
            <span>${name}</span>
          </div>
          <div class="product-sku-container">
            <span>${sku}</span>
          </div>
          <div class="product-price-container">
            <span>${USDollar.format(unitPrice)}</span>
          </div>
          <div class="product-qty-container">
            <input type="number" class="qty-shopping-cart" name="quantity" min="0" max="100" value="${qty}" step="1" data-product-id="${id}" />
          </div>
          <div class="product-total-container">
            <span class="total-container">${USDollar.format(total)}</span>
          </div>
          <div class="product-remove-button-container no-print">
            <button class="remove-button" data-product-id="${id}">remove</button>
          </div>           
        </div>        
      `;
      document.querySelector(".products-container").appendChild(productContainer);
      ShoppingCartDOM.productsRenderedRef[id] = productContainer;
    };
  
    static updateProduct(productDomRef,total){
      productDomRef.querySelector(".total-container").innerText = `${USDollar.format(total)}`;
    };
  
    static removeProduct(productShoppingCartDomRef,id){
      //TODO: enable quantity input and reset "add to cart";
      productShoppingCartDomRef.remove();
      delete ShoppingCartDOM.productsRenderedRef[id];
  
      //reseting initial state for botton and input on listing.
      const addToCartButton = document.getElementById(id);
      const qtyInput = document.getElementById(`${id}-qty`);
  
      ProductDOM.disabledAddToCartButton(addToCartButton);
      ProductDOM.enableQtyInput(qtyInput)
    }
  
    static updateShoppingCartContainer(){
      const {id,name,qty,sku,total,unitPrice,isOnShoppingCart} = this.lastProductUpdated;
      const productDomRef = ShoppingCartDOM.productsRenderedRef[id];
  
      if(productDomRef && isOnShoppingCart){
        ShoppingCartDOM.updateProduct(productDomRef,total);
      }
      else if(!isOnShoppingCart){
        ShoppingCartDOM.removeProduct(productDomRef,id);
      }
      else{
        ShoppingCartDOM.addProduct(id,name,qty,sku,total,unitPrice);
      }
  
      ShoppingCartDOM.grandTotalRef.innerText = `${USDollar.format(shoppingCart.getGrandTotal())}`;
      ShoppingCartDOM.orderNowRef.href = `${shoppingCart.getUrl()}`;

      if(shoppingCart.getProducts().length > 0 && ShoppingCartDOM.orderNowRef.classList.contains("disabled")){
        ShoppingCartDOM.orderNowRef.classList.remove("disabled");
      }

      if(shoppingCart.getProducts().length === 0) ShoppingCartDOM.orderNowRef.classList.add("disabled");
    };
  
    static initializeShoppingCartContainer(){
      //this func will create the element that will contain all the products selected.
      const modal = document.createElement("div");
      modal.id = "myModal";
      modal.classList.add("modal");
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-content-header">
            <span class="close close-shopping-cart no-print">&times;</span>
            <img class="logo" alt="davidici logo" src="https://www.davidici.com/wp-content/uploads/2023/11/logo-password-protected-page.svg" />
            <h1 class="title-shopping-cart">Your Order</h1>
            <button class="print-button no-print">Print Order</button>
          </div>
          <div class="modal-content-body products-container">
          </div>
          <div class="modal-content-footer">
            <h3>Grand Total:</h3>
            <span id="grand-total">${USDollar.format(shoppingCart.getGrandTotal())}</span>
            <a href="https://www.davidici.com/express-program/washbasins/" class="go-to-washbasin-button no-print">
              <div>
                <h2>Go To Washbasins</h2>
              </div>
            </a>
            <a href="${shoppingCart.getUrl()}" class="order-now-button no-print" id="url-order-now" target="_blank">
              <div>
                <h2>Order Now</h2>
              </div>
            </a>
          </div>
        </div>
      `;
      document.querySelector(`body`).appendChild(modal);
      ShoppingCartDOM.grandTotalRef = document.getElementById("grand-total");
      ShoppingCartDOM.orderNowRef = document.getElementById("url-order-now");

      if(shoppingCart.getProducts().length === 0) ShoppingCartDOM.orderNowRef.classList.add("disabled");
  
      //--------------Interactivity---------------
      // Get the button that opens the modal
      const shoppintCartButton = document.querySelector("#shooping-cart-button");
      // Get the <span> element that closes the modal
      const span = document.getElementsByClassName("close-shopping-cart")[0];
      // When the user clicks the button, open the modal 
      shoppintCartButton.addEventListener("click",(e)=>{
        modal.style.display = "block";
      })
      // When the user clicks on <span> (x), close the modal
      span.onclick = function() {
        modal.style.display = "none";
      }
      // When the user clicks anywhere outside of the modal, close it
      window.addEventListener("click",(event) => {
        if (event.target == modal) {
        modal.style.display = "none";
        }
      })
  
      //-----Adding products saved on local storage-----
      const products = shoppingCart.getProducts();
      if(products.length > 0){
        products.forEach(product => {
          const {id,name,qty,sku,total,unitPrice} = product;
          ShoppingCartDOM.addProduct(id,name,qty,sku,total,unitPrice);
        });
      }
    };
  
    static initializeShoppingCart(){
      const isShoppingCartSaved = localStorage.getItem("shopping-cart");
      if(isShoppingCartSaved){
        const {grandTotal,products,suggestedWashbasinSize,orderNowUrl} = JSON.parse(isShoppingCartSaved);
        shoppingCart = new ShoppingCart(products,grandTotal,orderNowUrl,suggestedWashbasinSize);
      }else{
        shoppingCart = new ShoppingCart();
      }
    };
  
    static initializeCustomEvents(){
      document.addEventListener("productsUpdated",(e)=>{
        this.updateLocalStorage();
        this.updateShoppingCartContainer();
      })
    };

    static initializeShoppingCartButton(){
      const shoppingCartButton = document.createElement("button");
      shoppingCartButton.id = "shooping-cart-button";
      shoppingCartButton.classList.add("no-print");
      shoppingCartButton.innerHTML = `
        <img src="https://www.davidici.com/wp-content/uploads/2024/02/shopping-cart-free-5-svgrepo-com-1.svg" alt="shopping cart icon" class="shopping-cart-icon" />
        <h1>View Cart</h1>
      `;

      document.querySelector(`body`).appendChild(shoppingCartButton);
    }
}

//this class contains all the properties and methods of the shopping cart state.
class ShoppingCart {
  #products;
  #grandTotal;
  #suggestedWashbasinSize;
  #baseUrl;

  constructor(products = [], grandTotal = 0, url = "", suggestedWashbasinSize = {
    "vanities price list":[],
    "Side Units price list":[],
  }){
    this.#products = products;
    this.#grandTotal = grandTotal;
    this.#suggestedWashbasinSize = suggestedWashbasinSize;
    this.#baseUrl = url;
  };

  indexOfProduct(id){
    const index = this.#products.findIndex(product=>product.id === id)
    return index;
  };

  getProducts(){
    return this.#products;
  };

  getGrandTotal(){
    return this.#grandTotal;
  };

  getSuggestedWashbasinSize(){
    return this.#suggestedWashbasinSize;
  };

  getUrl(){
    return this.#baseUrl;
  };

  calGrandTotal(){
    let crrGrandTotal = this.#products.reduce((prev,crr,i,arr)=>{
      return prev + arr[i].total
    },0)
    this.#grandTotal = crrGrandTotal;
  };

  updateUrl(){
    if(this.#products.length === 0){
      this.#baseUrl = "";
      return;  
    }

    this.#baseUrl = "https://davidici.datamark.live/?app=Bath%20Vanities&SKU=";
    let allSkuAndQty = "";
    console.log("update url func");
    for(const product of this.#products){
      const skuAndQty = `${product.sku}--${product.qty}~`;
      allSkuAndQty += skuAndQty;
    }
    this.#baseUrl += allSkuAndQty.slice(0,-1);
  };

  updateProduct(index,quantity){
    //gets product.
    const product = this.#products[index];

    //updates # of vanities or side unit. (for cal size of suggested washbasin).
    const isVanityOrSideUnit = product.categories.find(cat => cat === "vanities price list" || cat === "Side Units price list");
    console.log("update product");
    console.log("is vanity or side unit;", isVanityOrSideUnit);
    if(isVanityOrSideUnit){
      let diff = quantity - product.qty;
      if(diff === -1){
        this.#suggestedWashbasinSize[isVanityOrSideUnit].pop();
      }else{
        this.#suggestedWashbasinSize[isVanityOrSideUnit].push(product.size);
      }
    }

    //updates qty.
    product.qty = quantity.toString();
    product.total = Number(this.#products[index].unitPrice) * quantity;
    this.calGrandTotal();
    ShoppingCartDOM.lastProductUpdated = product;
    this.updateUrl();
    document.dispatchEvent(productsUpdatedEvent);
  };

  async addNewProduct(id,quantity){
    let self = this;
    await jQuery.ajax({
      url:'/wp-json/hrcode/v1/product-info',
      method:'POST',
      data:{
        post_id: id,
        quantity
      },
      success: function(product) {
        self.#products.push(product);
        self.calGrandTotal();
        ShoppingCartDOM.lastProductUpdated = product;

        //-------for calculating the suggested size for washbasin depending on vanities or side units selected.
        const isVanityOrSideUnit = product.categories.find(cat => cat === "vanities price list" || cat === "Side Units price list");
        if(isVanityOrSideUnit){
          if(product.qty > 1){
            for(let i = 0; i < product.qty; i++){
              self.#suggestedWashbasinSize[isVanityOrSideUnit].push(product.size);
            }
          }else{
            self.#suggestedWashbasinSize[isVanityOrSideUnit].push(product.size);
          }
        }
        //----------------------

        self.updateUrl();
        document.dispatchEvent(productsUpdatedEvent);
      },
      error: function(xhr, status, error) {
        console.log(error);
      }
    })
  };

  removeProduct(index){
    const product = this.#products.splice(index,1)[0];

    //checks if product is vanity or side unit and remove their sizes on suggestedWashbasinSize array.
    const isVanityOrSideUnit = product.categories.find(cat => cat === "vanities price list" || cat === "Side Units price list");
    if(isVanityOrSideUnit){
      for(let i = 0; i < product.qty; i++){
        const index = this.#suggestedWashbasinSize[isVanityOrSideUnit].indexOf(product.size);
        this.#suggestedWashbasinSize[isVanityOrSideUnit].splice(index,1);
      }
    } 

    const removedProduct = {...product, isOnShoppingCart: false};
    this.calGrandTotal();
    ShoppingCartDOM.lastProductUpdated = removedProduct;
    this.updateUrl();
    document.dispatchEvent(productsUpdatedEvent);
  };
}

//this class manages the events and render consitions for qty input and add to cart button.
class ProductDOM {
  static getInfo(target){
    const id = target.id;
    const quantity = Number(target.getAttribute("data-qty"));
    const qtyInputId = target.getAttribute("data-qty-input-id");
    return {id, quantity, qtyInputId};
  }

  static enableAddToCartButton(addToCartButton,quantity,qtyInputId){
    addToCartButton.removeAttribute("disabled");
    addToCartButton.setAttribute("data-qty",quantity.toString());
    addToCartButton.setAttribute("data-qty-input-id",qtyInputId);
  }

  static disabledAddToCartButton(addToCartButton, isProductAdeed = false){
    if(addToCartButton){
      addToCartButton.innerText = "add to cart";
      addToCartButton.style.color = "#d1aa68";
      addToCartButton.setAttribute("disabled", "");
      addToCartButton.setAttribute("data-qty","0");
    }

    if(isProductAdeed){
      addToCartButton.innerText = "added!!";
      addToCartButton.style.color = "red";
    }
  }

  static disabledQtyInput(qtyInputId){
    const qtyInput = document.getElementById(qtyInputId);
    qtyInput.value = '0';
    qtyInput.setAttribute("disabled", "");
  }

  static enableQtyInput(qtyInput){
    if(qtyInput) qtyInput.removeAttribute("disabled");
  }

  static initializeButtonsEventDelegation(){
    document.addEventListener("click",(e)=>{
      const button = e.target;

      if(button.classList.contains("add-to-cart-button")){
        const {id,quantity, qtyInputId} = this.getInfo(button);
        shoppingCart.addNewProduct(id,quantity);
        this.disabledQtyInput(qtyInputId);
        this.disabledAddToCartButton(button,true);
      }

      if(button.classList.contains("remove-button")){
        const productId = button.getAttribute("data-product-id");
        const index = shoppingCart.indexOfProduct(productId);
        shoppingCart.removeProduct(index);
      }

      if(button.classList.contains("print-button")){
        window.print();
      }
    });
  }

  static initializeInputEventDelegation(){
    document.addEventListener("input",(e)=>{
      const input = e.target;

      if(input.classList.contains("qty")){
        const quantity = input.valueAsNumber;
        const qtyInputId = input.id;
        const addToCartButton =
        input.parentElement.parentElement.parentElement.parentElement.querySelector(
          ".add-to-cart-button"
        );
        quantity > 0 ? this.enableAddToCartButton(addToCartButton,quantity,qtyInputId) : this.disabledAddToCartButton(addToCartButton);
      }

      if(input.classList.contains("qty-shopping-cart")){
        const productId = input.getAttribute("data-product-id");
        const index = shoppingCart.indexOfProduct(productId);
        const quantity = input.valueAsNumber;
        shoppingCart.updateProduct(index,quantity)
      }
    });
  }
}

jQuery(document).ready(function($){
  //---------------Shopping cart --------------------//
  ShoppingCartDOM.initializeShoppingCartButton();
	ShoppingCartDOM.initializeShoppingCart();
  ShoppingCartDOM.initializeShoppingCartContainer();
  ShoppingCartDOM.initializeCustomEvents();
  ProductDOM.initializeButtonsEventDelegation();
  ProductDOM.initializeInputEventDelegation();
});