import { backendURL, userlogged, headers } from "../utils/utils.js";

userlogged();

async function getDatas() {
  const listOfProducts = document.getElementById("listOfProducts");
  const sectionNamelist = document.getElementById("sectionNamelist");
  const productLength = document.getElementById("productLength");

  try {
    const [productsRes, storesRes, inventoryRes] = await Promise.all([
      fetch(`${backendURL}/api/product/all`, { headers }),
      fetch(`${backendURL}/api/user`, { headers }),
      fetch(`${backendURL}/api/inventory/all`, { headers }),
    ]);

    if (!productsRes.ok || !storesRes.ok || !inventoryRes.ok) {
      throw new Error("Can't fetch data");
    }

    const productData = await productsRes.json();
    const storeData = await storesRes.json();
    const inventoryData = await inventoryRes.json();

    let productHTML = "";
    let sectionHTML = "";
    const seenSections = new Set();

    // Generate section filters
    sectionHTML += `<input type="radio" name="fav_language" value="All" class="me-1" checked />
                    <label>All</label><br />`;

    productData.forEach((product) => {
      if (!seenSections.has(product.section_name)) {
        seenSections.add(product.section_name);
        sectionHTML += `<input type="radio" name="fav_language" value="${product.section_name}" class="me-1" />
                        <label>${product.section_name}</label><br />`;
      }
    });

    // Add event listeners to section filters
    sectionNamelist.innerHTML = sectionHTML;
    document.querySelectorAll('input[name="fav_language"]').forEach((input) => {
      input.addEventListener("change", () =>
        filterProducts(productData, storeData, inventoryData)
      );
    });

    // Initial display of products
    filterProducts(productData, storeData, inventoryData);
  } catch (error) {
    console.error(error);
    listOfProducts.innerHTML = `<p class="text-danger">Failed to fetch data. Please try again later.</p>`;
  }
}

function filterProducts(productData, storeData, inventoryData) {
  const listOfProducts = document.getElementById("listOfProducts");
  const productLength = document.getElementById("productLength");
  const selectedSection = document.querySelector(
    'input[name="fav_language"]:checked'
  ).value;

  let productHTML = "";
  let count = 0;

  inventoryData.forEach((inventory) => {
    const product = productData.find(
      (p) => p.product_id === inventory.product_id
    );
    const store = storeData.find((s) => s.id === inventory.store_id);

    if (
      product &&
      (selectedSection === "All" || product.section_name === selectedSection)
    ) {
      count++;
      productHTML += getProductHTML(product, store, inventory);
    }
  });

  productLength.textContent = count;
  listOfProducts.innerHTML =
    count > 0 ? productHTML : "No products found in the selected section.";
}

function getProductHTML(product, store, inventory) {
  const productURL = `buyer_productDetails.html?inventory=${encodeURIComponent(
    inventory.inventory_id
  )}`;

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
                <button class="btn btn-outline-primary w-100 cartButton" data-inv-id="${
                  inventory.inventory_id
                }" data-store-id="${store.store_id}" data-product-id="${
    product.product_id
  }">
                  Add to Cart
                </button>
              </div>
            </div>

      </div>`;
}

getDatas();
