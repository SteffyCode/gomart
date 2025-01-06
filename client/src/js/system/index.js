// Import required variables and functions from utils.js
import { backendURL, headers, userlogged } from "../utils/utils.js";

// Call the userlogged function to check and display the logged-in user's information
userlogged();

// Fetch and display store data
async function getDatas(keyword) {
  // Get the HTML element where the stores will be displayed
  const getStores = document.getElementById("getStores");

  let queryParams =
    "?" +
    // (url ? new URL(url).searchParams + "&" : "") + // pag walay pagination
    (keyword ? "keyword=" + encodeURIComponent(keyword) : "");

  // Fetch store data from the backend API
  const storeRes = await fetch(backendURL + `/api/user` + queryParams, {
    headers,
  });
  if (!storeRes.ok) {
    throw new Error("Failed to fetch data"); // Handle fetch failure
  }

  // Parse the store data into JSON
  const store = await storeRes.json();

  // Randomize the store order
  const randomStores = store.sort(() => Math.random() - 0.5);

  // Initialize HTML for the stores and a flag to check if any stores exist
  let storeHTML = "",
    hasStore = false;

  // Loop through each store and check if it is of type "Retail"
  randomStores.forEach((s) => {
    hasStore = true; // Set flag to true if stores exist
    console.log(s); // Log the store data for debugging
    if (s.business_type === "Retail") {
      // Generate HTML for each "Retail" store
      storeHTML += getStoreHTML(s);
    }
  });

  // If no stores are found, display a message
  if (!hasStore) {
    getStores.innerHTML = "<h2>No stores found</h2>";
    return; // Exit the function
  }

  // Update the innerHTML of the container with the store cards
  getStores.innerHTML = storeHTML;
}

// Generate HTML for a single store card
function getStoreHTML(store) {
  return `       
    <!-- Store Card -->
    <div class="col">
      <div class="card text-center border-0">
        <div class="card-body p-2">
          <!-- Store Image -->
          <img
            src="${
              store.image_path
                ? `${backendURL}/storage/${store.image_path}` // Use store image if available
                : `src/img/SM.jpg` // Fallback image if no image path is provided
            }"
            alt="Store 1 Logo"
            class="mb-3 image-store"
          />
          <!-- Store Name -->
          <h5 class="card-title mb-0">${store.business_name}</h5>
          <!-- Store Address -->
          <p class="text-muted">
            ${store.city} <br> ${store.business_address}
          </p>
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

// Call the function to fetch and display the store data
getDatas();
