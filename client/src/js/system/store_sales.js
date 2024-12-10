import {
  backendURL,
  headers,
  logoutbutton,
  userlogged,
} from "../utils/utils.js";

userlogged();
logoutbutton();

async function getDatas(url = "", keyword) {
  const getSales = document.getElementById("getSales");

  let queryParams =
    "?" +
    (url ? new URL(url).searchParams + "&" : "") +
    (keyword ? "keyword=" + encodeURIComponent(keyword) : "");

  const salesResponse = await fetch(
    url || backendURL + "/api/sales/store" + queryParams,
    {
      headers,
    }
  );
  const productOrderResponse = await fetch(backendURL + "/api/product/all", {
    headers,
  });
  const customerResponse = await fetch(backendURL + "/api/customer", {
    headers,
  });

  if (!salesResponse.ok || !productOrderResponse.ok || !customerResponse.ok) {
    throw new Error("Failed to fetch required data.");
  }

  const salesData = await salesResponse.json();
  const productData = await productOrderResponse.json();
  const customerData = await customerResponse.json();

  let salesHTML = "",
    hasSales = false;
  salesData.data.forEach((sale) => {
    const product = productData.find(
      (product) => product.product_id === sale.product_id
    );
    const customer = customerData.find(
      (customer) => customer.customer_id === sale.customer_id
    );

    hasSales = true;
    salesHTML += getSalesHTML(sale, customer, product);
  });

  if (!hasSales) {
    salesHTML = `<tr><td colspan='10'>No sales found.</td></tr>`;
  }

  getSales.innerHTML = salesHTML;

  let pagination = "";
  if (salesData.links) {
    salesData.links.forEach((link) => {
      pagination += `
                    <li class="page-item" >
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

  document.getElementById("pages").innerHTML = pagination;

  document.querySelectorAll("#pages .page-link").forEach((link) => {
    link.addEventListener("click", pageAction);
  });
}

function getSalesHTML(sale, customer, product) {
  return `<tr>
                <td>${product.product_name}</td>
                <td>${product.product_type}</td>
                <td>${product.brand}</td>
                 <td>${
                   customer.is_frequent_shopper
                     ? `${customer.first_name} ${customer.last_name}`
                     : `Anonymous`
                 }</td>
                <td>${
                  customer.is_frequent_shopper
                    ? `${customer.address}`
                    : `Anonymous`
                }</td>
                <td>${
                  customer.is_frequent_shopper
                    ? `${customer.phone_number}`
                    : `Anonymous`
                }</td>
                <td>${sale.quantity}</td>
                <td>${sale.price}</td>
                <td>${sale.total_amount}</td>
                <td>${sale.payment_method}</td>
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

getDatas();
