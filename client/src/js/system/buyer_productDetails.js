import { backendURL, headers } from "../utils/utils.js";

async function getDatas() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const inventoryId = urlParams.get("inventory");

    const [inventoryShow, productRes, storeRes] = await Promise.all([
      fetch(`${backendURL}/api/inventory/${inventoryId}`, { headers }),
      fetch(`${backendURL}/api/product/all`, { headers }),
      fetch(`${backendURL}/api/user`, { headers }),
    ]);

    if (!inventoryShow.ok || !productRes.ok || !storeRes.ok) {
      throw new Error("Failed to fetch one or more data sets.");
    }

    const inventoryData = await inventoryShow.json();
    const productDatas = await productRes.json();
    const storeDatas = await storeRes.json();

    const product = productDatas.find(
      (p) => p.product_id === inventoryData.product_id
    );
    const store = storeDatas.find((s) => s.id === inventoryData.store_id);

    if (!product || !store) {
      throw new Error("Product or Store not found.");
    }

    document.getElementById("productDetails").innerHTML = `
      <div class="container mt-3">
        <!-- Product Details -->
        <div class="card p-3 mb-2 mx-auto border-1" style="max-width: 900px">
              <a href="buyer_products.html"class="text-decoration-none fw-bold my-2"><span class="bi bi-arrow-left"> back</span></a>

          <div class="row g-0">
            <!-- Product Image -->
            <div class="col-lg-6">
              <img
                src="${
                  product.image_path
                    ? `${backendURL}/storage/${product.image_path}`
                    : `src/img/product.png`
                }"
                class="img-fluid rounded shadow-sm"
                alt="${product.product_name || "Product Image"}"
                style="height: 300px; width: 100%; object-fit: cover"
              />
            </div>
            <!-- Product Details -->
            <div class="col-lg-6">
              <div class="card-body">
                <h4 class="fw-bold mb-3">${product.product_name}</h4>
                <h6 class="text-primary fw-bold mb-3">Php ${
                  inventoryData.new_price
                }</h6>
                <p class="card-text text-muted">
                  ${product.description || "No description available."}
                </p>
                <div class="d-flex align-items-center mb-4">
                  <label for="quantity" class="me-2">Quantity:</label>
                  <input
                    type="number"
                    id="quantity"
                    class="form-control"
                    value="1"
                    style="width: 70px"
                    min="1"
                  />
                </div>
                <div class="d-flex justify-content-end gap-2">
                  <button class="btn btn-primary px-2">
                    <i class="bi bi-cart3 pe-2"></i>Add to Cart
                  </button>
                  <button class="btn btn-primary px-2">
                    <i class="bi bi-bag pe-1"></i> Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Seller Information -->
        <div class="card p-3 mx-auto pb-1 border-1" style="max-width: 900px">
          <h6 class="fw-bold">[${store.business_name.toUpperCase()}]</h6>
        </div>
      </div>`;
  } catch (error) {
    console.error("Error fetching data:", error);
    document.getElementById("productDetails").innerHTML = `
      <p class="text-danger">Failed to load product details. Please try again later.</p>`;
  }
}

getDatas();
