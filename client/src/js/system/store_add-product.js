import { backendURL, headers, userlogged } from "../utils/utils.js";

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

async function getDatas() {
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

getDatas();
