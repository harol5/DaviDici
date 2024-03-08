const checkOrderForm = document.querySelector("#check-order-form");
const mainContainer = document.querySelector("#main-container");

function updateStatus(order){
    if(order.Status === 404){
        mainContainer.innerHTML = `<h1 class="order-not-found">${order.Detail}</h1>`;
        return;
    }

    const {Address,ArrivedDate,Client,ContactName,DepartedDate,GoodsList,Status} = order;
    const renderProducts = () => {
        let products = "";
        for(const good of GoodsList){
            products += `
                <div>
                    <h3>Name:</h3>
                    <span>${good.GoodsName}</span>
                    <h3>Qty:</h3>
                    <span>${good.Quantity}</span>
                </div>
            `;
        }
        return products;
    }

    const formatDay = (date) => {
        let dateFormatted = new Date(date).toLocaleString();
        if(dateFormatted === "Invalid Date") dateFormatted = "N/A";
        return dateFormatted;
    }
    
    mainContainer.innerHTML = `
        <div class="key-value-wrapper">
            <h2>Status</h2>
            <span>${Status || "to be scheduled"}</span>
        </div>
        <div class="key-value-wrapper">
            <h2>Client</h2>
            <span>${Client}</span>
        </div>
        <div class="key-value-wrapper">
            <h2>Contact Name</h2>
            <span>${ContactName || "N/A"}</span>
        </div>
        <div class="key-value-wrapper">
            <h2>Address</h2>
            <span>${Address}</span>
        </div>
        <div class="key-value-wrapper">
            <h2>Arrived Date</h2>
            <span>${formatDay(ArrivedDate)}</span>
        </div>
        <div class="key-value-wrapper">
            <h2>Departed Date</h2>
            <span>${formatDay(DepartedDate)}</span>
        </div>
        <div class="key-value-wrapper products-container">
            <h2>Products</h2>
            ${renderProducts()}
        </div>
    `;
}

checkOrderForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const orderNumber = document.querySelector("#order-number").value;

    await jQuery.ajax({
        url:'/wp-json/hrcode/v1/check-order',
        method:'POST',
        data:{
            orderNumber,
        },
        success: function(res) {
            const order = JSON.parse(res);
            updateStatus(order);
        },
        error: function(xhr, status, error) {
            console.log(error);
        }
    })
});

