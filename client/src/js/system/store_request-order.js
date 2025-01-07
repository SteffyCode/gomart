import {
  backendURL,
  headers,
  logoutbutton,
  userlogged,
} from "../utils/utils.js";

userlogged();
logoutbutton();

async function getDatas(url = "", keyword) {
  const getAllRequest = document.getElementById("getAllRequests");

  let queryParams =
    "?" +
    (url ? new URL(url).searchParams + "&" : "") +
    (keyword ? "keyword=" + encodeURIComponent(keyword) : "");

  const requestResponse = await fetch(
    url || backendURL + "/api/reorder-request/user" + queryParams,
    { headers }
  );
  const productResponse = await fetch(backendURL + "/api/product/all", {
    headers,
  });
  const vendorResponse = await fetch(backendURL + "/api/user", { headers });

  if (!vendorResponse.ok) {
    throw new Error(`HTTP error! status: ${vendorResponse.status}`);
  }
  if (!productResponse.ok) {
    throw new Error(`HTTP error! status: ${productResponse.status}`);
  }
  if (!requestResponse.ok) {
    throw new Error(`HTTP error! status: ${requestResponse.status}`);
  }

  const requestData = await requestResponse.json();
  const productData = await productResponse.json();
  const vendorData = await vendorResponse.json();

  if (requestResponse.ok) {
    let requestHTML = "",
      hasrequest = false,
      i = 0;

    requestData?.data?.forEach((req) => {
      hasrequest = true;
      const product = productData.find(
        (product) => product.product_id === req.product_id
      );
      const vendor = vendorData.find((vendor) => vendor.id === req.vendor_id);

      i++;

      requestHTML += getAllRequestDataHTML(req, i, product, vendor);
    });

    if (!hasrequest) {
      requestHTML = `<tr><td colspan='9'>No requests found. Create request by clicking "Order Product" button</td></tr>`;
    }

    getAllRequest.innerHTML = requestHTML;

    let pagination = "";
    if (requestData.links) {
      requestData.links.forEach((link) => {
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

    document.querySelectorAll(".updateButton").forEach((button) => {
      button.addEventListener("click", updateClickInfo);
    });

    document.querySelectorAll(".deleteButton").forEach((button) => {
      button.addEventListener("click", deleteClick);
    });

    document.getElementById("pages").innerHTML = pagination;

    document.querySelectorAll("#pages .page-link").forEach((link) => {
      link.addEventListener("click", pageAction);
    });
  }
}

function getAllRequestDataHTML(req, i, product, vendor) {
  return `<tr>
                <td>#REQ00${i}</td>
                <td>${vendor.business_name}</td>
                <td>${product.product_name}</td>
                <td>${req.order_type}</td>
                <td>${req.quantity}</td>
                <td>${req.created_at?.split("T")[0]}</td>
                <td>${
                  req.delivered_date === null
                    ? `Processing request...`
                    : req.status === "Declined"
                    ? `Declined Request`
                    : req.delivered_date
                }</td>
                <td><span class="badge ${
                  req.status === "Pending"
                    ? `bg-warning`
                    : req.status === "Declined"
                    ? `bg-danger`
                    : req.status === "Delivered"
                    ? `bg-success`
                    : ``
                }">${req.status}</span></td>
                <td>
                ${
                  req.status !== "Shipped" && req.status !== "Delivered"
                    ? `<button href="#" class="btn btn-sm btn-outline-primary me-1" data-id="${req.reorder_id}" data-bs-toggle="modal" data-bs-target="#updateProduct${req.reorder_id}">Update</a>`
                    : ``
                }
                  <button href="#" class="btn btn-sm btn-outline-danger deleteButton" data-id="${
                    req.reorder_id
                  }">Delete</button>

                  ${getUpdateModal(req, product)}
                </td>
              </tr>`;
}

function getUpdateModal(req, product) {
  return `    
  <!-- Modal -->
    <div
      class="modal fade"
      id="updateProduct${req.reorder_id}"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header bg-primary">
            <h1 class="modal-title fs-5 text-white" id="exampleModalLabel">
              Update Request
            </h1>
          </div>
          <div class="ms-3 mt-2">Per Item Price (Php ${product?.selling_price})</div>
          <div class="ms-3 mt-2">Wholesale Price (Php ${product?.wholesale_price})</div>
          <form id="update_request${req.reorder_id}">
            <div class="modal-body">                
              <div class="row">
                <div class="col-md-12">
                  <label for="productQuantity" class="fw-bold">Quantity</label>
                  <input
                    type="number"
                    id="productQuantity"
                    name="quantity"
                    min="1"
                    class="form-control"
                    value="${req.quantity}"
                    required
                  />
                </div>
                <div class="col-md-12 mt-3">
                  <label for="reorderAlertQuantity" class="fw-bold"
                    >Order Type (Wholesale or Per item)</label
                  >
                  <input
                    type="text"
                    id="reorderAlertQuantity"
                    name="order_type"
                    min="0"
                    class="form-control"
                    value="${req.order_type}"
                    required
                  />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                id="closeButton${req.reorder_id}"
              >
                Close
              </button>
              <button type="submit" class="btn btn-primary updateButton" id="upButton${req.reorder_id}" data-id="${req.reorder_id}">Update</button>
            </div>
          </form>
        </div>
      </div>
    </div>`;
}

async function createRequest() {
  const getProductList = document.getElementById("getProductList");

  const productList = await fetch(backendURL + "/api/product/all", {
    headers,
  });
  const vendorList = await fetch(backendURL + "/api/user", {
    headers,
  });

  if (!productList.ok) {
    throw new Error(`HTTP error! status: ${productList.status}`);
  }

  const productData = await productList.json();
  const vendorData = await vendorList.json();

  console.log(productData);
  let productHTML = "";
  productData.forEach((product) => {
    const vendor = vendorData.find((vendor) => vendor.id === product.vendor_id);

    productHTML += `<option value="${product.product_id}">${product.product_name} - Per Item(Php ${product.selling_price}) - Wholesale(Php ${product.wholesale_price}) - ${vendor.business_name}</option>`;
  });

  getProductList.innerHTML = productHTML;

  const requestForm = document.getElementById("create_request_form");

  requestForm.onsubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(requestForm);

    const product = productData.find(
      (item) => item.product_id === parseInt(formData.get("product_id"))
    );

    formData.append("vendor_id", product.vendor_id);

    const response = await fetch(backendURL + "/api/reorder-request", {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    if (response.ok) {
      alert("Request created successfully!");
      document.querySelector("#closeButton").click();
      requestForm.reset();
      await getDatas();
    }
  };
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

function updateClickInfo(e) {
  const id = e.target.getAttribute("data-id");
  console.log(id);
  updateInfo(id);
}

function deleteClick(e) {
  const id = e.target.getAttribute("data-id");
  console.log(id);
  deleteInfo(id);
}

async function deleteInfo(id) {
  if (confirm("Are you sure you want to delete this event item?")) {
    const inventoryResponse = await fetch(
      backendURL + "/api/reorder-request/" + id,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!inventoryResponse.ok) throw new Error("Error deleting product");
    else if (inventoryResponse.ok) {
      alert("Inventory Delete Success");
      await getDatas();
    }
  }
}

async function updateInfo(id) {
  const update_form = document.getElementById("update_request" + id);

  if (!update_form) return;

  update_form.onsubmit = async (e) => {
    e.preventDefault();

    const updateButton = document.querySelector("#upButton" + id);
    updateButton.disabled = true;
    updateButton.innerHTML = `Updating request...`;

    const formData = new FormData(update_form);

    // new inputted data
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    // mwthod spoofing
    formData.append("_method", "PUT");

    const requestResponse = await fetch(
      backendURL + "/api/reorder-quantity/" + id,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      }
    );

    if (!requestResponse.ok) {
      updateButton.disabled = false;
      updateButton.innerHTML = `Update`;
      throw new Error("Request Update Failed");
    } else if (requestResponse.ok) {
      document.querySelector("#closeButton" + id).click();
      alert("Request Update Success");
      await getDatas();
    }

    updateButton.disabled = false;
    updateButton.innerHTML = `Update`;
  };
}

getDatas();
createRequest();
