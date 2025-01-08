import {
  backendURL,
  headers,
  logoutbutton,
  userlogged,
} from "../utils/utils.js";

userlogged();

async function getCustomerProfile() {
  //   const checkout = document.getElementById("checkout");

  // Fetch necessary data
  const profileRes = await fetch(`${backendURL}/api/profile/show`, { headers });

  if (!profileRes.ok) throw new Error("Can't fetch profile data");

  const profileData = await profileRes.json();

  //   if (profileData.role === "Customer") {
  //     document.getElementById("customer_id").value = profileData.customer_id;
  //   }

  console.log(profileData);
}
