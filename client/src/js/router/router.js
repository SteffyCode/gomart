const orgType = localStorage.getItem("type");
const token = localStorage.getItem("token");

function setRouter() {
  const currentPath = window.location.pathname;

  console.log(currentPath);

  // switch (currentPath) {
  //   case `/client/`:
  //   case `/client/login.html`:
  //   case `/client/register-buyer.html`:
  //   case `/client/register-store.html`:
  //   case `/client/index.html`:
  //   case `/client/buyer_products.html`:
  //     if (orgType === "Customer") {
  //       window.location.pathname = `/client/index.html`;
  //     } else if (orgType === "Retail") {
  //       window.location.pathname = `/client/store-dashboard.html`;
  //     } else if (orgType === "Vendor") {
  //       window.location.pathname = `/client/vendor.html`;
  //     }
  //     break;

  //   case `/client/store_add-product.html`:
  //   case `/client/store_dashboard.html`:
  //   case `/client/store_inventory.html`:
  //   case `/client/store_request-order.html`:
  //     if (token === null) {
  //       window.location.pathname = `/client/login.html`;
  //     } else if (orgType === "Vendor") {
  //       window.location.pathname = `/client/vendor.html`;
  //     }
  //     break;

  //   case `/client/vendor.html`:
  //   case `/client/vendor_store-requests.html`:
  //   case `/client/vendor_products.html`:
  //     if (token === null) {
  //       window.location.pathname = `/client/login.html`;
  //     } else if (orgType === "Retail") {
  //       window.location.pathname = `/client/store-dashboard.html`;
  //     }
  //     break;

  //   case `/client/checkout.html`:
  //   case `/client/orderConfirmation.html`:
  //     if (token === null) {
  //       window.location.pathname = `/client/login.html`;
  //     }
  //     break;

  //   default:
  //     break;
  // }
}

export { setRouter };
