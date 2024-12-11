import { backendURL, headers, userlogged } from "../utils/utils.js";

userlogged();

async function getDatas() {
  const getStores = document.getElementById("getStores");

  const storeRes = await fetch(backendURL + `/api/user`, { headers });

  if (!storeRes.ok) {
    throw new Error("Failed to fetch data");
  }

  const store = await storeRes.json();

  const randomStores = store.sort(() => Math.random() - 0.5);

  let storeHTML = "",
    hasStore = false;

  randomStores.forEach((s) => {
    hasStore = true;

    console.log(s);
    if (s.business_type === "Retail") {
      storeHTML += getStoreHTML(s);
    }
  });

  if (!hasStore) {
    getStores.innerHTML = "<h2>No stores found</h2>";
    return;
  }

  getStores.innerHTML = storeHTML;
}

function getStoreHTML(store) {
  return `       <!-- Store 1 -->
          <div class="col">
            <div class="card text-center border-0">
              <div class="card-body p-2">
                <img
                  src="${
                    store.image_path
                      ? `${backendURL}/storage/${store.image_path}`
                      : `src/img/SM.jpg`
                  }"
                  alt="Store 1 Logo"
                  class="mb-3 image-store"
                />
                <h5 class="card-title mb-0">${store.business_name}</h5>
                <p class="text-muted">${store.city} <br> ${
    store.business_address
  }</p>
              </div>
            </div>
          </div>
`;
}

getDatas();
