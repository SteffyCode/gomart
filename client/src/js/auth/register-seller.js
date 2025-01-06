import { backendURL } from "../utils/utils.js";

const getSellerForm = document.getElementById("sellerForm");

getSellerForm.onsubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData(getSellerForm);

  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  const registerButton = document.querySelector("#sellerForm button");

  registerButton.disabled = true;
  registerButton.innerHTML = `<div class="spinner-border" role="status" width="20px">
                                                                </div><span class="ms-2">loading...</span>`;

  const registerResponse = await fetch(backendURL + "/api/user", {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  });

  const registerData = await registerResponse.json();

  if (!registerResponse.ok) {
    alert(`${registerData.message}`);
    registerButton.disabled = false;
    registerButton.innerHTML = `Create an account`;
    throw new Error("Couldn't register");
  } else {
    alert(`Registration successful!`);
    getSellerForm.reset();
    window.location.pathname = "/client/login.html";
  }

  registerButton.disabled = false;
  registerButton.innerHTML = `Create an account`;
};
