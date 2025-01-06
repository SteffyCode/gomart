import { setRouter } from "../router/router.js";

setRouter();

const backendURL = "http://ite19-backend/public";

const headers = {
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  Accept: "application/json",
};

async function redirectBasedOnType() {
  const profileResponse = await fetch(backendURL + "/api/profile/show", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!profileResponse.ok) {
    throw new Error("Failed to fetch user data");
  }

  const profileData = await profileResponse.json();
  console.log("User profile:", profileData);

  if (profileData?.business_type == "Retail") {
    localStorage.setItem("type", "Retail");
    window.location.pathname = "/client/store_dashboard.html";
  } else if (profileData?.business_type == "Vendor") {
    localStorage.setItem("type", "Vendor");
    window.location.pathname = "/client/vendor.html";
  } else if (profileData?.role == "Customer") {
    localStorage.setItem("type", "Customer");
    window.location.pathname = "/client/index.html";
  }
}

async function userlogged() {
  if (localStorage.getItem("token") != null) {
    const profileResponse = await fetch(`${backendURL}/api/profile/show`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!profileResponse.ok) {
      console.error("Failed to fetch user data");
      document.getElementById("loggedUser").innerHTML = renderLoginButton();
      return;
    }

    const profileData = await profileResponse.json();

    // Set business_id if applicable
    if (["Retail", "Vendor"].includes(profileData.business_type)) {
      document.getElementById("business_id").value = profileData.id;
    }

    // Get the user logged-in element
    const userloggedIn = document.getElementById("loggedUser");
    if (!userloggedIn) return;

    // Render user details based on their role
    if (profileData.role === "Customer") {
      userloggedIn.innerHTML = `
          <div id="loggedUser">
            <img
              class="rounded-circle border mx-2"
              src="${
                profileData.image_path
                  ? `${backendURL}/storage/${profileData.image_path}`
                  : "src/img/avatar.png"
              }"
              alt="Profile"
              width="30"
              height="30"
            />
            <button class="btn btn-primary" id="logout_button">Logout</button>
          </div>
        `;
      logoutbutton(); // Ensure this function handles logout properly
    } else if (["Vendor", "Retail"].includes(profileData.business_type)) {
      userloggedIn.innerHTML = `
          <div id="loggedUser">
            Welcome, ${profileData.business_name}!
            <img
              class="rounded-circle border ms-2"
              src="${
                profileData.image_path
                  ? `${backendURL}/storage/${profileData.image_path}`
                  : "src/img/avatar.png"
              }"
              alt="Profile"
              width="30"
              height="30"
            />
          </div>
        `;
    } else {
      userloggedIn.innerHTML = renderLoginButton();
    }
  } else {
    // No token found, show login button
    document.getElementById("loggedUser").innerHTML = renderLoginButton();
  }
}

// Reusable function for login button
function renderLoginButton() {
  return `
    <a href="login.html" class="btn btn-primary text-white px-3">
      Login
    </a>
  `;
}

userlogged();

async function logoutbutton() {
  if (localStorage.getItem("token") != null) {
    const logout_button = document.getElementById("logout_button");
    logout_button.addEventListener("click", async () => {
      logout_button.disabled = true;

      const logout = await fetch(backendURL + "/api/logout", { headers });

      if (!logout.ok) {
        throw new Error("Failed to logout");
      }

      if (logout.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("type");
        window.location.pathname = "/client/login.html";
      }
    });
  }
}

async function cartLength() {
  const cartRes = await fetch(backendURL + "/api/carts/by-store", {
    headers,
  });

  if (!cartRes.ok) {
    throw new Error("Failed to get cart length");
  }

  const cartData = await cartRes.json();

  let count = 0;
  for (let i = 0; i < cartData.length; i++) {
    for (let j = 0; j < cartData[i].items.length; j++) {
      count += cartData[i].items[j].quantity;
    }
  }

  document.getElementById("cart_length").innerHTML = count;
}

// Conditionally call the function if the user is logged in
if (
  localStorage.getItem("token") != null &&
  localStorage.getItem("type") == "Customer"
) {
  cartLength();
}

export {
  cartLength,
  backendURL,
  redirectBasedOnType,
  headers,
  userlogged,
  logoutbutton,
};
