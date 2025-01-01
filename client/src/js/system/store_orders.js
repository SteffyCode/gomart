import {
  backendURL,
  headers,
  logoutbutton,
  userlogged,
} from "../utils/utils.js";

userlogged();
logoutbutton();

async function getDatas(url = "", keyword) {
  const getOrders = document.getElementById("getOrders");

  let queryParams =
    "?" +
    (url ? new URL(url).searchParams + "&" : "") +
    (keyword ? "keyword=" + encodeURIComponent(keyword) : "");

  const orders = await fetch(
    url || backendURL + "/api/order/user" + queryParams,
    { headers }
  );
  const customers = await fetch(backendURL + "/api/customer", {
    headers,
  });
  const products = await fetch(backendURL + "/api/product/all", {
    headers,
  });
  const carts = await fetch(backendURL + "/api/carts/storeIndex", {
    headers,
  });

  if (!orders.ok) {
    throw new Error("Can't fetch order data");
  }
  if (!customers.ok) {
    throw new Error("Can't fetch customer data");
  }
  if (!products.ok) {
    throw new Error("Can't fetch product data");
  }
  if (!carts.ok) {
    throw new Error("Can't fetch cart data");
  }

  const orderDatas = await orders.json();
  const customerDatas = await customers.json();
  const productDatas = await products.json();
  const cartDatas = await carts.json();

  console.log(cartDatas[0].items);

  if (orders.ok) {
    let hasOrder = false;
    let orderHTML = "";
    let i = 0;

    orderDatas.data.forEach((order, index) => {
      const customer = customerDatas.find(
        (c) => c.customer_id === order.customer_id
      );

      let orderedItems = "";

      const currentCart = cartDatas[index]; // Get the cart for this index
      if (currentCart && Array.isArray(currentCart.items)) {
        currentCart.items.forEach((c) => {
          const product = productDatas.find(
            (p) => p.product_id === c.product_id
          );

          if (product) {
            orderedItems += `${product.product_name} (price (per):${c.price}) (qty:${c.quantity})<br>`;
          } else {
            console.warn(`Product not found for cart item:`, c);
          }
        });
      } else {
        console.warn(
          `Cart data missing or invalid for index: ${index}`,
          currentCart
        );
      }

      hasOrder = true;
      i++;

      orderHTML += getOrderHTML(order, customer, i, orderedItems);
    });

    getOrders.innerHTML = orderHTML;

    if (!hasOrder) {
      document.getElementById(
        "noOrderFound"
      ).innerHTML = `<div class="text-center my-4">No order found.</div>`;
    }

    let pagination = "";
    if (orderDatas.links) {
      orderDatas.links.forEach((link) => {
        pagination += `
                  <li class="page-item">
                      <a class="page-link ${
                        link.url == null ? " disabled" : ""
                      }${link.active ? " active" : ""}" href="#" data-url="${
          link.url
        }">
                          ${
                            link.label === "&laquo; Previous"
                              ? `&#171;`
                              : link.label === "Next &raquo;"
                              ? `&#187;`
                              : link.label
                          }
                      </a>
                  </li>`;
      });
    }

    document.querySelectorAll(".updateStatusButton").forEach((button) => {
      button.addEventListener("click", updateClickStatus);
    });

    document.getElementById("pages").innerHTML = pagination;

    document.querySelectorAll("#pages .page-link").forEach((link) => {
      link.addEventListener("click", pageAction);
    });
  }
}
// }

function getOrderHTML(order, customer, index, orderedItems) {
  return `<tr>
                    <td class="fw-bold">${index}</td>
                    <td>${orderedItems}</td>
                    <td>${customer.first_name} ${customer.last_name}</td>
                    <td>${customer.address}</td>
                    <td>${customer.phone_number}</td>
                    <td>${order.shipping_cost}</td>
                    <td>${order.total_amount}</td>
                    <td>${order.payment_method}</td>
                    <td class="${
                      order.status === "Accepted"
                        ? `text-success`
                        : order.status === "Declined"
                        ? `text-danger`
                        : order.status === "Shipped"
                        ? `text-primary`
                        : order.status === "Delivered"
                        ? `text-success`
                        : ``
                    }">  ${order.status}
                    </td>  
                    <td>${
                      order.shipped_date === null
                        ? `Waiting...`
                        : order.shipped_date
                    }</td>
                    <td>${
                      order.delivered_date === null
                        ? `Waiting...`
                        : order.delivered_date
                    }</td>
                    <td>
                      ${
                        order.status === "Pending"
                          ? `<div>
                        <button
                          class="btn btn-sm btn-outline-success updateStatusButton"
                          data-id="${order.order_id}"
                          data-status="Accepted"
                        >
                          Accept
                        </button>
                        <button
                          class="btn btn-sm btn-outline-danger updateStatusButton"
                          data-id="${order.order_id}"
                          data-status="Declined"
                        >
                          decline
                        </button>
                      </div>`
                          : ``
                      }
                      <div>
                       ${
                         order.status === "Shipped"
                           ? ` <button
                          class="btn btn-sm btn-outline-success updateStatusButton"
                          data-id="${order.order_id}"
                          data-cart-id="${order.cart_id}"
                          data-status="Delivered"
                        >
                          Mark as Delivered
                        </button>`
                           : ``
                       }
                        ${
                          order.status === "Accepted"
                            ? `<button
                          class="btn btn-sm btn-outline-primary updateStatusButton"
                          data-id="${order.order_id}"
                          data-status="Shipped"
                        >
                          Mark as Shipped
                        </button>`
                            : ``
                        }
                      </div>
                    </td>
                  </tr>`;
}

const search_form = document.getElementById("search_form");
search_form.onsubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData(search_form);
  const keyword = formData.get("keyword");
  console.log(keyword);
  getDatas("", keyword);
};

const pageAction = async (e) => {
  e.preventDefault();
  const url = e.target.getAttribute("data-url");
  await getDatas(url);
};

function updateClickStatus(e) {
  const id = e.target.getAttribute("data-id");
  const status = e.target.getAttribute("data-status");
  const cart_id = e.target.getAttribute("data-cart-id");
  console.log(id, status, cart_id);
  updateRequestStatus(id, status, cart_id);
}

async function updateRequestStatus(id, status, cart_id) {
  if (confirm(`Are you sure you want to this?`)) {
    const formData = new FormData();
    formData.append("status", status);
    const currentDate = new Date().toISOString().split("T")[0];

    if (status === "Shipped") {
      formData.append("shipped_date", currentDate);
    } else if (status === "Delivered") {
      storeDeliveredSale(cart_id);
      formData.append("delivered_date", currentDate);
    }

    formData.append("_method", "PUT");

    const reorderResponse = await fetch(
      backendURL + "/api/order-status/" + id,
      {
        method: "POST",
        headers,
        body: formData,
      }
    );

    if (!reorderResponse.ok) throw new Error("Failed to update order status");

    if (reorderResponse.ok) {
      await getDatas();
    }
  }
}

async function storeDeliveredSale(cartId) {
  const cartResponse = await fetch(`${backendURL}/api/carts/show/${cartId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!cartResponse.ok) {
    const errorDetails = await cartResponse.text();
    throw new Error(`Failed to fetch cart data: ${errorDetails}`);
  }

  const cartData = await cartResponse.json();

  // console.log("Fetched Cart Data:", cartData);
  console.log("Fetched Cart Items:", cartData.items);

  const items = cartData.items;

  for (const item of items) {
    const saleData = {
      customer_id: cartData.customer_id,
      store_id: cartData.store_id,
      price: Number(item.price),
      product_id: item.product_id,
      quantity: Number(item.quantity),
      total_amount: Number(item.price) * Number(item.quantity),
    };

    console.log("Sending Sale Data:", saleData);

    const saleResponse = await fetch(`${backendURL}/api/sales`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(saleData),
    });

    if (!saleResponse.ok) {
      const errorDetails = await saleResponse.text();
      throw new Error(`Failed to create sale data: ${errorDetails}`);
    }

    console.log("Sale data created successfully for product:", item.product_id);
  }
}

getDatas();
