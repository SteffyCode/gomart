import {
  backendURL,
  userlogged,
  headers,
  logoutbutton,
} from "../utils/utils.js";

userlogged();
// logoutbutton();

async function getCartItems() {
  const getCartByStore = document.getElementById("cartItems");

  const cartResponse = await fetch(backendURL + "/api/carts/by-store", {
    headers,
  });
  const productsResponse = await fetch(backendURL + "/api/product/all", {
    headers,
  });
  const storeResponse = await fetch(backendURL + "/api/user", { headers });

  const carts = await cartResponse.json();
  const products = await productsResponse.json();
  const stores = await storeResponse.json();

  if (!cartResponse.ok || !productsResponse.ok || !storeResponse.ok)
    throw new Error("Request fetch failed");

  console.log(carts);

  let cartHTML = "",
    hasCart = false;
  carts.forEach((cart) => {
    hasCart = true;
    const store = stores.find((store) => store.id === cart.store_id);

    cartHTML += getCartHTML(cart, store, products);
  });

  if (!hasCart) {
    cartHTML = `<div class="text-center bg-white rounded-2 p-4 mt-2"><p class="text-center">No items in your cart.</p></div>`;
  }

  getCartByStore.innerHTML = cartHTML;

  document.querySelectorAll(".subtractQuantity").forEach((button) => {
    button.addEventListener("click", updateQuantityClick);
  });

  document.querySelectorAll(".addQuantity").forEach((button) => {
    button.addEventListener("click", updateQuantityClick);
  });

  document.querySelectorAll(".deleteButton").forEach((button) => {
    button.addEventListener("click", deleleClick);
  });
}

function getCartHTML(cart, store, products) {
  const total = cart.items.reduce((sum, item) => {
    const product = products.find((p) => p.product_id === item.product_id);

    if (!product) return sum;

    return sum + parseFloat(item.price) * parseInt(item.quantity);
  }, 0);

  return ` <div class="p-2 pb-0 fs-6 fw-bold">${store.business_name}</div>
          <hr class="m-1" />
          <table class="table table-light mb-2">
            <tbody>
              ${getCartItemsHTML(cart.items, products)}
            </tbody>
          </table>
          <div class="d-flex justify-content-end align-items-center pe-4">
            <div class="me-3"><strong>TOTAL:</strong> ₱${total.toFixed(2)}</div>
            <a href="buyer_checkout.html?cartId=${encodeURIComponent(cart.id)}">
              <button class="btn btn-primary text-white me-5 mb-2 px-4">
                Check Out
              </button>
            </a>
          </div>`;
}

function getCartItemsHTML(items, products) {
  let cartItemsHTML = "";

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const product = products.find(
      (product) => product.product_id === item.product_id
    );

    // Handle case where product is not found
    if (!product) {
      console.error(`Product with ID ${item.product_id} not found`);
      continue;
    }

    cartItemsHTML += `<tr>
                <td>${product.product_name}</td>
                <td>₱${item.price}</td>
                <td>
                  <div id="updateQuantity${item.id}">
            <button class="btn btn-sm btn-primary me-3 px-2 fw-bold subtractQuantity" data-id="${
              item.id
            }" data-action="subtract">-</button>
            ${item.quantity}
            <button class="btn btn-sm btn-primary ms-3 px-2 fw-bold addQuantity" data-id="${
              item.id
            }" data-action="add">+</button>
          </div>
                </td>
                <td>₱${(
                  parseFloat(item.price) * parseInt(item.quantity)
                ).toFixed(2)}</td>
                <td>
                  <button class="btn btn-danger btn-sm deleteButton" data-id="${
                    item.id
                  }">Delete</button>
                </td>
              </tr>`;
  }

  return cartItemsHTML;
}

function deleleClick(e) {
  const id = e.target.getAttribute("data-id");
  console.log(id);
  deleteItem(id);
}

function updateQuantityClick(e) {
  const id = e.target.getAttribute("data-id");
  const action = e.target.getAttribute("data-action");
  console.log(id, action);
  updateQuantity(id, action);
}

async function updateQuantity(id, action) {
  try {
    const update = document.querySelectorAll(`#updateQuantity${id} button`);
    console.log(update);
    update[0].disabled = true;
    update[1].disabled = true;

    const response = await fetch(`${backendURL}/api/carts/${action}/${id}`, {
      method: "POST",
      headers: headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      await getCartItems();
      throw new Error(errorData.error || "Failed to update quantity");
    }

    await getCartItems();
    update.disabled = false;
  } catch (error) {
    console.error("Error updating quantity:", error.message);
    alert(error.message);
  }
}

async function deleteItem(id) {
  try {
    const response = await fetch(`${backendURL}/api/carts/item/${id}`, {
      method: "DELETE",
      headers: headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      await getCart();
      throw new Error(errorData.error || "Failed to delete item");
    }
    await getCartItems();
  } catch (error) {
    console.error("Error deleting item:", error.message);
    alert(error.message);
  }
}

getCartItems();
