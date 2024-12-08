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
  const profileResponse = await fetch(backendURL + "/api/profile/show", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!profileResponse.ok) {
    throw new Error("Failed to fetch user data");
  }

  const profileData = await profileResponse.json();
  if (profileData?.business_type == "Retail") {
    document.getElementById("business_id").value = profileData.id;
  } else if (profileData?.business_type == "Vendor") {
    document.getElementById("business_id").value = profileData.id;
  }
}

export { backendURL, redirectBasedOnType, headers, userlogged };
