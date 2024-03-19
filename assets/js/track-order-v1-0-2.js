const checkOrderForm = document.querySelector("#check-order-form");
const mainContainer = document.querySelector("#main-container");

function updateStatus(order) {
  if (order.Status === 404) {
    mainContainer.innerHTML = `<h1 class="order-not-found">${order.Detail}</h1>`;
    return;
  }

  const {
    Address,
    ArrivedDate,
    Client,
    ContactName,
    DepartedDate,
    GoodsList,
    HasPhoto,
    HasSignaturePhoto,
    Phone,
    Photos,
    ReportUrl,
    SignaturePhotos,
    Status,
  } = order;

  const renderProducts = () => {
    let products = "";
    for (const good of GoodsList) {
      products += `
                <div>
                    <h3>Product Description:</h3>
                    <span>${good.GoodsName}</span>
                    <h3>Qty:</h3>
                    <span>${good.Quantity}</span>
                </div>
            `;
    }
    return products;
  };

  const renderPictures = () => {
    if (!HasPhoto)
      return "<p>Not pictures at this moment</p>";

    let pictures = "";
    for (const picture of Photos) {
      pictures += `<img src=${picture} />`;
    }

    return pictures;
  };

  const renderSignature = () => {
    if (!HasSignaturePhoto)
      return "<p>Not signature at this moment</p>";

    let pictures = `
      <img src=${SignaturePhotos[0]} />
      <a href=${ReportUrl}>Download E-pod</a>
    `;
    
    return pictures;
  };

  const formatDay = (date) => {
    let dateFormatted = new Date(date).toLocaleString();
    if (dateFormatted === "Invalid Date") dateFormatted = "N/A";
    return dateFormatted;
  };

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
            <h2>Contact Phone</h2>
            <span>${Phone || "N/A"}</span>
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
        <div class="pictures-container">
            <h2>Pictures</h2>
            <div>
            ${renderPictures()}
            </div>
        </div>
        <div class="signature-container">
            <h2>Signature</h2>
            <div>
            ${renderSignature()}
            </div>
        </div>
    `;
}

checkOrderForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const orderNumber = document.querySelector("#order-number").value;

  await jQuery.ajax({
    url: "/wp-json/hrcode/v1/check-order",
    method: "POST",
    data: {
      orderNumber,
    },
    success: function (res) {
      const order = JSON.parse(res);
      console.log(order);
      updateStatus(order);
    },
    error: function (xhr, status, error) {
      console.log(error);
    },
  });
});
