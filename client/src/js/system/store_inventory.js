import {
  backendURL,
  headers,
  userlogged,
  logoutbutton,
} from "../utils/utils.js";

logoutbutton();

async function getDatas(url = "") {
  const getcategoryTabsContent = document.getElementById("categoryTabsContent");
  const getInventoryTab = document.getElementById("getInventoryTab");

  const inventoryResponse = await fetch(
    url || backendURL + "/api/store/inventory",
    {
      headers,
    }
  );
  const productResponse = await fetch(backendURL + "/api/product/all", {
    headers,
  });
  const vendorResponse = await fetch(backendURL + "/api/user", { headers });
  const profileResponse = await fetch(backendURL + "/api/profile/show", {
    headers,
  });

  if (
    !inventoryResponse.ok ||
    !vendorResponse.ok ||
    !productResponse.ok ||
    !profileResponse.ok
  ) {
    throw new Error(
      `HTTP error! status: ${
        inventoryResponse.status ||
        vendorResponse.status ||
        productResponse.status ||
        profileResponse.status
      }`
    );
  }

  const inventoryData = await inventoryResponse.json();
  const productDatas = await productResponse.json();
  const vendorDatas = await vendorResponse.json();
  const profileData = await profileResponse.json();

  console.log("mao ning inventory:", inventoryData);

  if (inventoryResponse.ok) {
    let inventoryHTML = "";
    let inventoryTabHTML = "";
    let seenSections = new Set();

    // Group inventory data by section
    const groupedInventory = inventoryData.data.reduce((acc, inventory) => {
      const productData = productDatas.find(
        (product) => product?.product_id === inventory?.product_id
      );
      if (!productData) return acc;

      const section = productData.section_name;
      if (!acc[section]) acc[section] = [];
      acc[section].push({ inventory, productData });
      return acc;
    }, {});

    Object.keys(groupedInventory).forEach((section, index) => {
      const rows = groupedInventory[section];
      const vendorNames = rows.map((row) =>
        vendorDatas.find((vendor) => vendor?.id === row.productData.vendor_id)
      );

      inventoryHTML += getInventoryHTML(rows, vendorNames, index === 0);
      inventoryTabHTML += getInventoryTabHTML(rows[0].productData, index === 0);
      if (
        rows[0].inventory.quantity < rows[0].inventory.reorder_level &&
        !rows[0].inventory.is_reordered
      ) {
        const formData = {
          quantity: 10,
          store_id: profileData.id,
          vendor_id: rows[0].productData.vendor_id,
          product_id: rows[0].inventory.product_id,
          order_type: "Wholesale",
        };

        console.log(formData);
        fetch(backendURL + "/api/reorder-request", {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        fetch(
          backendURL +
            "/api/inventory/status/" +
            rows[0].inventory.inventory_id,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...headers,
            },
            body: JSON.stringify({ is_reordered: true }),
          }
        );
      } else if (
        rows[0].inventory.quantity > rows[0].inventory.reorder_level ||
        rows[0].inventory.quantity > rows[0].inventory.reorder_quantity
      ) {
        fetch(
          backendURL +
            "/api/inventory/status/" +
            rows[0].inventory.inventory_id,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...headers,
            },
            body: JSON.stringify({ is_reordered: false }),
          }
        );
      }
    });

    getcategoryTabsContent.innerHTML = inventoryHTML;
    getInventoryTab.innerHTML = inventoryTabHTML;

    // Initialize the first tab as active
    const firstTab = getInventoryTab.querySelector(".nav-link");
    firstTab.classList.add("active");
    const firstTabPane = getcategoryTabsContent.querySelector(".tab-pane");
    firstTabPane.classList.add("show", "active");

    // Add event listener for tab clicks
    const tabs = getInventoryTab.querySelectorAll(".nav-link");
    const tabPanes = getcategoryTabsContent.querySelectorAll(".tab-pane");

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();

        // Remove active class from all tabs
        tabs.forEach((t) => t.classList.remove("active"));
        tabPanes.forEach((p) => p.classList.remove("show", "active"));

        // Add active class to the clicked tab and its corresponding pane
        tab.classList.add("active");
        tabPanes[index].classList.add("show", "active");
      });
    });

    let pagination = "";
    if (inventoryData.links) {
      inventoryData.links.forEach((link) => {
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

function getInventoryTabHTML(product, isActive = false) {
  return `<li class="nav-item">
              <a
                class="nav-link ${isActive ? "active" : ""}"
                data-bs-toggle="pill"
                href="#${product.section_name}"
                aria-selected="${isActive}">${product.section_name}</a>
            </li>`;
}

function getInventoryHTML(rows, vendorNames, isActive = false) {
  const product = rows[0].productData;
  return `
    <div class="tab-pane fade ${isActive ? "show active" : ""}" id="${
    product.section_name
  }" role="tabpanel" aria-labelledby="${product.section_name}-tab">
      <div class="table-responsive">
        <table class="table table-striped rounded-2">
          <thead>
            <tr class="bg-primary text-white">
              <th>ID</th>
              <th>UPC Code</th>
              <th>Product Name</th>
              <th>Vendor</th>
              <th>Brand</th>
              <th>Section</th>
              <th>Product Type</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map((row, index) =>
                getInventoryDataHTML(
                  row.inventory,
                  row.productData,
                  vendorNames[index],
                  index + 1
                )
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>`;
}

function getInventoryDataHTML(inventory, product, vendor, index) {
  return `
    <tr>
      <td>${index}</td>
      <td>${product.UPC}</td>
      <td>${product.product_name}</td>
      <td>${vendor?.business_name || "Unknown"}</td>
      <td>${product.brand}</td>
      <td>${product.section_name}</td>
      <td>${product.product_type}</td>
      <td>
        ${inventory.quantity}
        ${
          inventory.quantity < inventory.reorder_quantity &&
          inventory.reorder_quantity > inventory.reorder_level &&
          inventory.quantity > inventory.reorder_level
            ? `<span class="badge text-bg-warning ms-2" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" class="bi bi-exclamation-triangle-fill flex-shrink-0 opacity-75" viewBox="0 0 16 16" role="img" aria-label="Warning:" style="width: 12px">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </svg></span>`
            : ``
        }
        ${
          inventory.reorder_level > inventory.quantity &&
          inventory.reorder_quantity > inventory.quantity
            ? ` <span class="badge text-bg-danger ms-2" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" class="bi bi-exclamation-triangle-fill flex-shrink-0 opacity-75" viewBox="0 0 16 16" role="img" aria-label="Warning:" style="width: 12px">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </svg></span>`
            : ``
        }
      </td>
      <td>Php ${inventory.new_price}</td>
      <td>
        <a href="update-product.html" class="btn btn-sm btn-primary me-1 updateButton" data-bs-toggle="modal" data-bs-target="#updateProduct${
          inventory.inventory_id
        }">Update</a>

        <span class="btn btn-sm btn-outline-danger deleteButton" data-id="${
          inventory.inventory_id
        }">Delete</span>

        <!-- Update Modal -->
        ${getUpdateModal(inventory, product)}
      </td>
    </tr>`;
}

function getUpdateModal(inventory, product) {
  return `    
  <!-- Modal -->
    <div
      class="modal fade"
      id="updateProduct${inventory.inventory_id}"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-primary">
            <h1 class="modal-title fs-5 text-white" id="exampleModalLabel">
              Product Name - ${product.product_name}
            </h1>
            <button
              type="button"
              class="btn-close"
              id="closeButton${inventory.inventory_id}"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <form id="update_inventory${inventory.inventory_id}">

            <div class="modal-body">
              <div class="row">
                
              <div class="row">
                <div class="col-md-12">
                  <label for="productPrice" class="fw-bold">Price</label>
                  <input
                    type="number"
                    id="productPrice"
                    name="new_price"
                    class="form-control"
                    step="0.01"
                    min="0"
                    value="${inventory.new_price}"
                    required
                  />
                </div>
                <div class="col-md-12 mt-3">
                  <label for="productQuantity" class="fw-bold">Quantity</label>
                  <input
                    type="number"
                    id="productQuantity"
                    name="quantity"
                    min="1"
                    class="form-control"
                    value="${inventory.quantity}"
                    required
                  />
                </div>
              </div>
              <div class="row">
                <div class="col-md-12 mt-3">
                  <label for="reorderLevel" class="fw-bold"
                    >Reorder Level</label
                  >
                  <input
                    type="number"
                    id="reorderLevel"
                    name="reorder_level"
                    min="0"
                    class="form-control"
                    value="${inventory.reorder_level}"
                    required
                  />
                </div>
                <div class="col-md-12 mt-3">
                  <label for="reorderAlertQuantity" class="fw-bold"
                    >Reorder Alert Quantity</label
                  >
                  <input
                    type="number"
                    id="reorderAlertQuantity"
                    name="reorder_quantity"
                    min="0"
                    class="form-control"
                    value=  "${inventory.reorder_quantity}"
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
              >
                Close
              </button>
              <button type="submit" class="btn btn-primary updateButton" id="upButton${inventory.inventory_id}" data-id="${inventory.inventory_id}">Update</button>
            </div>
          </form>
        </div>
      </div>
    </div>`;
}

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

async function updateInfo(id) {
  const update_form = document.getElementById("update_inventory" + id);

  if (!update_form) return;

  update_form.onsubmit = async (e) => {
    e.preventDefault();

    const updateButton = document.querySelector("#upButton" + id);
    updateButton.disabled = true;
    updateButton.innerHTML = `Updating inventory...`;

    const formData = new FormData(update_form);

    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    formData.append("_method", "PUT");

    const inventoryResponse = await fetch(backendURL + "/api/inventory/" + id, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    if (!inventoryResponse.ok) {
      updateButton.disabled = false;
      updateButton.innerHTML = `Update`;
      throw new Error("Inventory Update Failed");
    } else if (inventoryResponse.ok) {
      document.querySelector("#closeButton" + id).click();
      alert("Inventory Update Success");
      await getDatas();
    }

    updateButton.disabled = false;
    updateButton.innerHTML = `Update`;
  };
}

async function deleteInfo(id) {
  if (confirm("Are you sure you want to delete this event item?")) {
    const inventoryResponse = await fetch(backendURL + "/api/inventory/" + id, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!inventoryResponse.ok) throw new Error("Error deleting product");
    else if (inventoryResponse.ok) {
      alert("Inventory Delete Success");
      await getDatas();
    }
  }
}

userlogged();

const addInvetoryForm = document.getElementById("add_inventory_form");

addInvetoryForm.onsubmit = async (e) => {
  e.preventDefault();

  const inventoryOwnedResponse = await fetch(
    backendURL + "/api/inventory/store/all",
    { headers }
  );

  if (!inventoryOwnedResponse.ok) {
    throw new Error("Can't fetch inventory");
  }

  const inventoryData = await inventoryOwnedResponse.json();

  const formData = new FormData(addInvetoryForm);

  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }
  console.log("asdasd", inventoryData, formData.get("product_id"));

  const createProductButton = document.querySelector(
    "#add_inventory_form button"
  );

  createProductButton.disabled = true;
  createProductButton.innerHTML = "Creating...";

  if (inventoryData.length > 0) {
    const isInventoryExist = inventoryData.map(
      (product) => product.product_id === parseInt(formData.get("product_id"))
    );

    console.log(isInventoryExist);

    const isTrue = isInventoryExist.find((isExist) => isExist === true);

    if (isTrue) {
      alert("Inventory already exists. Check your inventory.");
      createProductButton.disabled = false;
      createProductButton.innerHTML = "Create";
      return;
    }
  }

  const inventoryResponse = await fetch(backendURL + "/api/inventory", {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });

  if (!inventoryResponse.ok) {
    addInvetoryForm.reset();
    createProductButton.disabled = false;
    createProductButton.innerHTML = "Create";
    alert("Can't Create Product");
    throw new Error("Can't create product");
  } else {
    alert("Successfully created inventory.");
    addInvetoryForm.reset();
  }

  createProductButton.disabled = false;
  createProductButton.innerHTML = "Create";
};

async function getProducts() {
  const getProductList = document.getElementById("getProductList");

  const [vendorResponse, productResponse] = await Promise.all([
    fetch(backendURL + `/api/user`, { headers }),
    fetch(backendURL + "/api/product/all", { headers }),
  ]);

  if (!vendorResponse.ok || !productResponse.ok) {
    throw new Error("Failed to fetch required data.");
  }

  const [vendorDatas, productDatas] = await Promise.all([
    vendorResponse.json(),
    productResponse.json(),
  ]);

  let productHTML = "";

  console.log(vendorDatas, productDatas);
  productHTML = `<option selected disabled>Select product</option>`;
  productDatas.forEach((product) => {
    const vendor = vendorDatas.find(
      (vendor) => vendor?.id === product?.vendor_id
    );

    productHTML += `<option value="${product.product_id}">
            ${product.product_name} - ${vendor.business_name}</option>`;
  });

  getProductList.innerHTML = productHTML;
}
getProducts();
getDatas();
