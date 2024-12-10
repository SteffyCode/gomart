import { setRouter } from "../router/router.js";

setRouter();

const backendURL = "http://ite19-backend.test";

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
  try {
    const profileResponse = await fetch(`${backendURL}/api/profile/show`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!profileResponse.ok) {
      console.error("Failed to fetch user data");
      document.getElementById("loggedUser").innerHTML = `<!-- Login Button -->
        <a href="login.html" class="btn btn-primary text-white px-3">
          Login
        </a>`;
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

    // Render user details based on role
    if (profileData.role === "Customer") {
      userloggedIn.innerHTML = `
        <div id="loggedUser">
          Welcome, ${profileData.first_name}!
          <img
            class="rounded-circle border mx-2"
            src="${
              profileData.image_path
                ? `${backendURL}/storage/${profileData.image_path}`
                : `src/img/avatar.png`
            }"
            alt="Profile"
            width="30"
            height="30"
          />
          <button class="btn btn-primary" id="logout_button">Logout</button>
        </div>
        `;
      logoutbutton(); // Ensure the logout button logic is in place
    } else if (
      profileData.business_type === "Vendor" ||
      profileData.business_type === "Retail"
    ) {
      userloggedIn.innerHTML = `
        <div id="loggedUser">
          Welcome, ${profileData.business_name}!
          <img
            class="rounded-circle border ms-2"
            src="${
              profileData.image_path
                ? `${backendURL}/storage/${profileData.image_path}`
                : `src/img/avatar.png`
            }"
            alt="Profile"
            width="30"
            height="30"
          />
        </div>`;
    } else {
      userloggedIn.innerHTML = `<!-- Login Button -->
        <a href="login.html" class="btn btn-primary text-white px-3">
          Login
        </a>`;
    }
  } catch (error) {
    console.error("Error:", error.message);
    document.getElementById("loggedUser").innerHTML = `<!-- Login Button -->
      <a href="login.html" class="btn btn-primary text-white px-3">
        Login
      </a>`;
  }
}

userlogged();

async function logoutbutton() {
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

export { backendURL, redirectBasedOnType, headers, userlogged, logoutbutton };
