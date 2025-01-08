import {
  backendURL,
  headers,
  userlogged,
  logoutbutton,
} from "../utils/utils.js";

logoutbutton();
userlogged();

document.getElementById("sortSection").addEventListener("change", function () {
  getDatas("", "", this.value);
});

async function getDatas(url = "", keyword, filterProduct = "All") {
  const getProducts = document.getElementById("getProducts");

  let queryParams =
    "?" +
    (url ? new URL(url).searchParams + "&" : "") +
    (keyword ? "keyword=" + encodeURIComponent(keyword) : "");

  const productlist = await fetch(
    url || backendURL + "/api/vendor/product" + queryParams,
    {
      headers,
    }
  );

  if (!productlist.ok) {
    throw new Error("Failed to fetch products.");
  }

  const productData = await productlist.json();

  if (productlist.ok) {
    const section = document.querySelector("#sortSection").value;

    const filterProduct =
      section === "All"
        ? productData.data
        : productData.data.filter((product) =>
            section === "All"
              ? productData.data
              : product.section_name === section
          );

    let ProductsHTML = "";
    let hasProduct = false;

    filterProduct.forEach((product) => {
      hasProduct = true;
      ProductsHTML += getProductsHTML(product);
    });

    if (!hasProduct) {
      ProductsHTML = `<tr><td colspan='12'><div class="text-center">No product found. Click "Add New Product" button to add products.</div></td></tr>`;
    }

    getProducts.innerHTML = ProductsHTML;
  }

  let pagination = "";
  if (productData.links) {
    productData.links.forEach((link) => {
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

  // assign click event on update button
  document.querySelectorAll(".updateButton").forEach((button) => {
    button.addEventListener("click", updateClickInfo);
  });

  // assign click event on delete button
  document.querySelectorAll(".deleteButton").forEach((button) => {
    button.addEventListener("click", deleteClick);
  });

  // pagination
  document.getElementById("pages").innerHTML = pagination;

  document.querySelectorAll("#pages .page-link").forEach((link) => {
    link.addEventListener("click", pageAction);
  });
}

function getProductsHTML(product) {
  return `<tr>
            <td>
              <img
                src="${backendURL}/storage/${product.image_path}"
                alt="#"
                style="width: 35px; aspect-ratio: 1/1"
              />
            </td>
            <td>${product.UPC}</td>
            <td>${product.product_name}</td>
            <td>${product.product_type}</td>
            <td>${product.brand}</td>
            <td>${product.section_name}</td>
            <td>
              ${product.description}
            </td>
            <td>${product.selling_price}</td>
            <td>${product.wholesale_price}</td>
            <td>${product.cost_price}</td>
            <td>${product.stock_quantity}</td>
            <td>${product.status}</td>
            <td style="width: 140px">
              <a
                href="update-product.html"
                class="btn btn-sm btn-primary me-1"
                data-bs-toggle="modal"
                data-bs-target="#updateProduct${product.product_id}"
                >Update</a
              >
              <span class="btn btn-sm btn-outline-danger deleteButton" data-id="${
                product.product_id
              }"
                >Delete</span
              >
             ${updateProductModal(product)}
            </td>
        </tr>`;
}

function updateProductModal(product) {
  return ` <!-- Modal for Update Product -->
    <div
      class="modal fade"
      id="updateProduct${product.product_id}"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-primary">
            <h1 class="modal-title fs-5 text-white" id="exampleModalLabel">
              Update Product
            </h1>
          </div>
          <form id="update_product_form${product.product_id}">
            <div class="modal-body mx-3">
              <!-- Product Details Form -->

              <div class="row">
                <div class="col-md-6 mt-1">
                  <label for="productName" class="fw-bold">Product Name</label>
                  <input
                    type="text"
                    id="productName"
                    name="product_name"
                    class="form-control"
                    value="${product.product_name}"
                  />
                </div>
                <div class="col-md-6 mt-1">
                  <label for="productType" class="fw-bold">Product Type</label>
                  <input
                    type="text"
                    id="productType"
                    name="product_type"
                    class="form-control"
                    value="${product.product_type}"
                  />
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mt-3">
                  <label for="productBrand" class="fw-bold">Brand</label>
                  <input
                    type="text"
                    id="productBrand"
                    name="brand"
                    class="form-control"
                    value="${product.brand}"
                  />
                </div>
                <div class="col-md-6 mt-3">
                  <label for="productPrice" class="fw-bold">Item Price</label>
                  <input
                    type="number"
                    id="selling_price"
                    name="selling_price"
                    class="form-control"
                    step="0.01"
                    min="0"
                    value="${product.selling_price}"
                  />
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mt-3">
                  <label for="productType" class="fw-bold">Cost Price</label>
                  <input
                    type="number"
                    id="cost_price"
                    name="cost_price"
                    class="form-control"
                    step="0.01"
                    value="${product.cost_price}"
                  />
                </div>
                <div class="col-md-6 mt-3">
                  <label for="productBrand" class="fw-bold"
                    >Wholesale Price</label
                  >
                  <input
                    type="number"
                    id="wholesale_price"
                    name="wholesale_price"
                    value="${product.wholesale_price}"
                    class="form-control"
                    step="0.01"
                  />
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mt-3">
                  <label for="stock_quantity" class="fw-bold">Quantity</label>
                  <input
                    type="number"
                    id="stock_quantity"
                    name="stock_quantity"
                    class="form-control"
                    value="${product.stock_quantity}"
                  />
                </div>
                <div class="col-md-6 mt-3">
                  <label for="section_name" class="fw-bold">Sections</label>
                  <select
                    id="section_name"
                    name="section_name"
                    class="form-control"                    
                  >
                    <option value="" disabled selected>Select a section</option>
                    <option value="Produce" ${
                      product.section_name === "Produce" ? `selected` : ``
                    }>Produce</option>
                    <option value="Bakery" ${
                      product.section_name === "Bakery" ? `selected` : ``
                    }>Bakery</option>
                    <option value="Dairy" ${
                      product.section_name === "Dairy" ? `selected` : ``
                    }>Dairy</option>
                    <option value="Meat & Seafood" ${
                      product.section_name === "Meat & Seafood"
                        ? `selected`
                        : ``
                    }>Meat & Seafood</option>
                    <option value="Frozen Foods" ${
                      product.section_name === "Frozen Foods" ? `selected` : ``
                    }>Frozen Foods</option>
                    <option value="Beverages" ${
                      product.section_name === "Beverages" ? `selected` : ``
                    }>Beverages</option>
                    <option value="Snacks" ${
                      product.section_name === "Snacks" ? `selected` : ``
                    }>Snacks</option>
                    <option value="Household Items" ${
                      product.section_name === "Household Items"
                        ? `selected`
                        : ``
                    }>Household Items</option>
                    <option value="Health & Beauty" ${
                      product.section_name === "Health & Beauty"
                        ? `selected`
                        : ``
                    }>Health & Beauty</option>
                    <option value="Canned Goods" ${
                      product.section_name === "Canned Goods" ? `selected` : ``
                    }>Canned Goods</option>
                    <option value="Baby Products" ${
                      product.section_name === "Baby Products" ? `selected` : ``
                    }>Baby Products</option>
                    <option value="Pet Supplies" ${
                      product.section_name === "Pet Supplies" ? `selected` : ``
                    }>Pet Supplies</option>
                  </select>
                </div>
              </div>
              <div class="row">
              <div class="col-md-6 mt-3">
                  <label for="section_name" class="fw-bold">Status of the Product</label>
                  <select
                    id="status"
                    name="status"
                    class="form-control"                    
                  >
                    <option value="" disabled selected>Select a section</option>
                    <option value="Available" ${
                      product.status === "Available" ? `selected` : ``
                    }>Available</option>
                    <option value="Out of Stocks" ${
                      product.status === "Out of Stocks" ? `selected` : ``
                    }>Out of Stocks</option>
                    <option value="Discontinued" ${
                      product.status === "Discontinued" ? `selected` : ``
                    }>Discontinued</option>
                  </select>
                </div>
                <div class="col-md-6 mt-3">
                <label for="productImage" class="fw-bold">Product Image</label>
                <input
                  type="file"
                  id="productImage"
                  name="image_path"
                  class="form-control"
                  accept="image/*"
                />
              </div>
                </div>
              <div class="row">
                <div class="col-md-12 mt-3">
                  <label for="productDescription" class="fw-bold"
                    >Description</label
                  >
                  <textarea
                    id="productDescription"
                    name="description"
                    class="form-control"
                    rows="3"
                  >${product.description}</textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                id="closeButton${product.product_id}"
              >
                Close
              </button>
              <button type="submit" class="btn btn-primary updateButton" data-id=${
                product.product_id
              }>Update</button>
            </div>
          </form>
        </div>
      </div>
    </div>`;
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

// update functionality
async function updateInfo(id) {
  const update_form = document.getElementById("update_product_form" + id);

  if (!update_form) return;

  update_form.onsubmit = async (e) => {
    e.preventDefault();

    const updateButton = document.querySelector(".updateButton");
    updateButton.disabled = true;
    updateButton.innerHTML = `Updating product...`;

    const formData = new FormData(update_form);

    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    formData.append("_method", "PUT");
    const productResponse = await fetch(
      backendURL + "/api/product/details/" + id,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      }
    );

    if (
      formData.get("status") == "Out of Stocks" ||
      formData.get("status") == "Discontinued"
    ) {
      await updateActiveStatus(false);
    } else if (formData.get("status") == "Available") {
      await updateActiveStatus(true);
    }

    async function updateActiveStatus(activeStatus) {
      await fetch(backendURL + "/api/product-isActive/" + id, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: activeStatus, _method: "PUT" }),
      });
    }

    if (!productResponse.ok) {
      updateButton.disabled = false;
      updateButton.innerHTML = `Update`;
      throw new Error("Product Update Failed");
    } else if (productResponse.ok) {
      document.querySelector("#closeButton" + id).click();
      await getDatas();
    }

    updateButton.disabled = false;
    updateButton.innerHTML = `Update`;
  };
}

//delete functionality
async function deleteInfo(id) {
  if (confirm("Are you sure you want to delete this event item?")) {
    const productResponse = await fetch(backendURL + "/api/product/" + id, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!productResponse.ok) throw new Error("Error deleting product");
    else if (productResponse.ok) {
      await getDatas();
    }
  }
}

getDatas();
