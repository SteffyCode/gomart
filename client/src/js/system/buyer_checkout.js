import {
  backendURL,
  headers,
  logoutbutton,
  userlogged,
} from "../utils/utils.js";

userlogged();
// logoutbutton();

async function checkoutItems() {
  const checkout = document.getElementById("checkout");
  const cartId = new URLSearchParams(window.location.search).get("cartId");

  // Fetch necessary data
  const cartRes = await fetch(`${backendURL}/api/carts/by-store`, { headers });
  const productsRes = await fetch(`${backendURL}/api/product/all`, { headers });
  const profileRes = await fetch(`${backendURL}/api/profile/show`, { headers });

  if (!cartRes.ok) throw new Error("Can't fetch cart data");
  if (!productsRes.ok) throw new Error("Can't fetch product data");
  if (!profileRes.ok) throw new Error("Can't fetch profile data");

  const cartData = await cartRes.json();
  const productsData = await productsRes.json();
  const profileData = await profileRes.json();

  if (profileData.role === "Customer") {
    document.getElementById("customer_id").value = profileData.customer_id;
  }

  const cart = cartData.find((item) => item.id == cartId);
  if (!cart) {
    checkout.innerHTML = "<p>Cart not found!</p>";
    return;
  }

  // Calculate total and generate item rows
  let cartItemHTML = "";
  let finalTotal = 0;

  cart.items.forEach((item) => {
    const product = productsData.find((p) => p.product_id === item.product_id);
    if (product) {
      const subtotal = parseFloat(item.price) * parseInt(item.quantity);

      finalTotal += subtotal;

      cartItemHTML += `
        <tr>
          <td>${product.product_name}</td>
          <td class="text-end">₱${parseFloat(item.price).toFixed(2)}</td>
          <td class="text-end">${item.quantity}</td>
          <td class="text-end">₱${subtotal.toFixed(2)}</td>
        </tr>`;
    }
  });

  // Populate the checkout details
  checkout.innerHTML = getCheckoutDetails(
    cartItemHTML,
    finalTotal,
    profileData,
    cart
  );

  document.querySelectorAll(".orderButton").forEach((button) => {
    button.addEventListener("click", orderButtonClick);
  });
}

function getCheckoutDetails(cartItemHTML, total, customer, cart) {
  return `
    <h4 class="fw-bold">Checkout</h4>

    <!-- Delivery Address Section -->
    <div class="customer-address d-flex justify-content-between align-items-center">
      <div>
        <h5>Customer Address</h5>
        <p><strong>Name:</strong> ${customer.first_name} ${
    customer.last_name
  }</p>
        <p><strong>Phone:</strong> ${customer.phone_number}</p>
        <p><strong>Address:</strong> ${customer.address}</p>
      </div>
      <button
        class="btn btn-secondary"
        data-bs-toggle="modal"
        data-bs-target="#editAddressModal"
      >
        <i class="bi bi-pencil-square pe-2"></i>Edit
      </button>
    </div>

    <!-- Order Summary Section -->
    <div class="bg-light rounded-3 mt-3 p-3">
      <h5>Order Summary</h5>
      <table class="table table-light">
        <thead>
          <tr>
            <th>Items</th>
            <th class="text-end">Unit Price</th>
            <th class="text-end">Quantity</th>
            <th class="text-end">Item Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${cartItemHTML}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="text-end"><strong>TOTAL:</strong></td>
            <td class="text-end fw-bold">₱${total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Payment Summary Section -->
    <div class="bg-light rounded-3 mt-3 p-3">
      <h5>Summary</h5>
      <p class="text-end"><strong>Merchandise Subtotal:</strong> ₱${total.toFixed(
        2
      )}</p>
      <p class="text-end"><strong>Delivery Subtotal:</strong> ₱29.00</p>
      <p class="text-end"><strong>Total Payment:</strong> ₱${
        parseFloat(total.toFixed(2)) + parseInt(29)
      }</p>
    </div>

    <!-- Confirm Order Button -->
    <div class="d-flex justify-content-end mt-3 mb-3">
      <button class="btn btn-primary text-white px-3 orderButton" cart-id="${
        cart.id
      }" customer-id="${cart.customer_id}" total-amount="${
    parseFloat(total.toFixed(2)) + parseInt(29)
  }" store-id="${cart.store_id}" customer-address="${
    customer.address
  }" shipped-cost="${29}">Confirm Order</button>
    </div>
    
    `;
}

// function editAddressModal(customer) {
//   return ` <!-- Edit Address Modal -->
//     <div
//       class="modal fade"
//       id="editAddressModal"
//       tabindex="-1"
//       aria-labelledby="editAddressModalLabel"
//       aria-hidden="true"
//     >
//       <div class="modal-dialog">
//         <div class="modal-content">
//           <div class="modal-header">
//             <h5 class="modal-title" id="editAddressModalLabel">
//               Edit Delivery Details
//             </h5>
//             <button
//               type="button"
//               class="btn-close"
//               data-bs-dismiss="modal"
//               aria-label="Close"
//             ></button>
//           </div>
//           <form id="addressForm">
//             <div class="modal-body">
//               <input type="hidden" id="customer_id" name="customerId" />
//               <div class="mb-3">
//                 <label for="phone" class="form-label">Phone Number</label>
//                 <input
//                   type="text"
//                   class="form-control"
//                   id="phone_number"
//                   name="phone_number"
//                   required
//                   value="${customer.phone_number}"
//                 />
//               </div>
//               <div class="mb-3">
//                 <label for="address" class="form-label">Address</label>
//                 <textarea
//                   class="form-control"
//                   id="address"
//                   name="address"
//                   rows="3"
//                   required
//                 >${customer.address}</textarea>
//               </div>
//             </div>
//             <div class="modal-footer">
//               <button
//                 type="button"
//                 class="btn btn-secondary"
//                 data-bs-dismiss="modal"
//               >
//                 Close
//               </button>
//               <button type="submit" class="btn btn-primary text-white">
//                 Save changes
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>`;
// }

function orderButtonClick(e) {
  const data = {
    cart_id: e.target.getAttribute("cart-id"),
    customer_id: e.target.getAttribute("customer-id"),
    total_amount: e.target.getAttribute("total-amount"),
    store_id: e.target.getAttribute("store-id"),
    shipping_address: e.target.getAttribute("customer-address"),
    shipping_cost: e.target.getAttribute("shipped-cost"),
  };
  console.log(data);
  orderItems(data);
}

async function orderItems(data) {
  const orderResponse = await fetch(backendURL + "/api/order", {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!orderResponse.ok) throw new Error("Failed to place order");

  if (orderResponse.ok) {
    updateCartStatus(data.cart_id);
    alert("Order successfully placed");
    window.location.href = "buyer_products.html";
    console.log("Order successfully");
  }
}

async function updateCartStatus(cartId) {
  const updateCartResponse = await fetch(
    backendURL + `/api/carts/${cartId}/update-status`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!updateCartResponse.ok) throw new Error("Failed to update cart status");

  console.log("Cart status updated successfully");
}

// Update address and phone number fields
const addressForm = document.getElementById("addressForm");

addressForm.onsubmit = async (e) => {
  e.preventDefault();

  const submitButton = e.target.querySelector("button[type='submit']");
  submitButton.disabled = true;

  const formData = new FormData(addressForm);
  const data = {
    customerId: formData.get("customerId"),
    phone_number: formData.get("phone_number"),
    address: formData.get("address"),
  };

  try {
    const updateRes = await fetch(
      `${backendURL}/api/delivery-details/${data.customerId}`,
      {
        method: "PUT",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!updateRes.ok) {
      const errorData = await updateRes.json();
      throw new Error(errorData.message || "Failed to update delivery details");
    }

    const updateData = await updateRes.json();
    alert("Delivery details updated successfully!");
    addressForm.reset();
    await checkoutItems();
  } catch (error) {
    console.error("Error updating delivery details:", error);
    alert(error.message);
  } finally {
    submitButton.disabled = false;
  }
};

checkoutItems();
