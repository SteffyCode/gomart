import { backendURL, userlogged, headers } from "../utils/utils.js";

userlogged();

async function getDatas(keyword) {
  const listOfProducts = document.getElementById("listOfProducts");
  const sectionNamelist = document.getElementById("sectionNamelist");
  const productLength = document.getElementById("productLength");

  let customerData = null;

  let queryParams =
    "?" +
    // (url ? new URL(url).searchParams + "&" : "") +
    (keyword ? "keyword=" + encodeURIComponent(keyword) : "");

  try {
    const [productsRes, storesRes, inventoryRes] = await Promise.all([
      fetch(backendURL + "/api/product/all", { headers }),
      fetch(backendURL + "/api/user", { headers }),
      fetch(backendURL + "/api/inventory/all" + queryParams, { headers }),
    ]);

    if (localStorage.getItem("token") !== null) {
      const customerRes = await fetch(backendURL + "/api/profile/show", {
        headers,
      });
      if (customerRes.ok) {
        customerData = await customerRes.json();
      }
    }

    if (!productsRes.ok || !storesRes.ok || !inventoryRes.ok) {
      throw new Error("Can't fetch data");
    }

    const productData = await productsRes.json();
    const storeData = await storesRes.json();
    const inventoryData = await inventoryRes.json();

    console.log(inventoryData);

    let sectionHTML = "";
    const seenSections = new Set();

    // Generate section filters
    sectionHTML += `<input type="radio" name="section_names" value="All" class="me-1" checked />
                    <label>All</label><br />`;

    productData.forEach((product) => {
      if (!seenSections.has(product.section_name)) {
        seenSections.add(product.section_name);
        sectionHTML += `<input type="radio" name="section_names" value="${product.section_name}" class="me-1" />
                        <label>${product.section_name}</label><br />`;
      }
    });

    sectionNamelist.innerHTML = sectionHTML;

    // Add event listeners to section filters
    document
      .querySelectorAll('input[name="section_names"]')
      .forEach((input) => {
        input.addEventListener("change", () =>
          filterProducts(productData, storeData, inventoryData, customerData)
        );
      });

    // Initial display of products
    filterProducts(productData, storeData, inventoryData, customerData);
  } catch (error) {
    console.error(error);
    listOfProducts.innerHTML = `<p class="text-danger">Failed to fetch data. Please try again later.</p>`;
  }
}

function filterProducts(productData, storeData, inventoryData, customerData) {
  const listOfProducts = document.getElementById("listOfProducts");
  const productLength = document.getElementById("productLength");
  const selectedSection = document.querySelector(
    'input[name="section_names"]:checked'
  ).value;

  const randominventory = inventoryData.sort(() => Math.random() - 0.5);

  let productHTML = "";
  let count = 0;

  randominventory.forEach((inventory) => {
    const product = productData.find(
      (p) => p.product_id === inventory.product_id
    );
    const store = storeData.find((s) => s.id === inventory.store_id);

    if (
      product &&
      (selectedSection === "All" || product.section_name === selectedSection)
    ) {
      count++;
      productHTML += getProductHTML(product, store, inventory, customerData);
    }
  });

  productLength.textContent = count;
  listOfProducts.innerHTML = count > 0 ? productHTML : "No products found.";
}

function getProductHTML(product, store, inventory, customerData) {
  const productURL = `buyer_productDetails.html?inventory=${inventory.inventory_id}`;

  return `<div class="col">
        <a href="${productURL}" class="text-decoration-none"> 
            <div class="card h-80">
              <img
                src="${
                  product.image_path
                    ? `${backendURL}/storage/${product.image_path}`
                    : `src/img/product.png`
                }"
                class="card-img-top"
                alt="Product Image"
              />
              <div class="card-body text-center">
                <h6 class="card-title mb-1">${product.product_name}</h6>
                <p class="card-text mb-1">Php ${inventory.new_price}</p>
                </a>
                <button class="btn btn-outline-primary w-100 cartButton"
                  onclick="try { addItemToCart({ storeId: ${
                    store.id
                  }, productId: ${product.product_id}, customerId: ${
    customerData?.customer_id || "null"
  }, quantity: 1 }) } catch(e) { console.error(e); }"
>
                  Add to Cart
                </button>
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
  getDatas(keyword);
};

getDatas();
