import { backendURL } from "../utils/utils.js";

const getCustomerForm = document.getElementById("customer_registration_form");

getCustomerForm.onsubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData(getCustomerForm);

  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  const registerButton = document.querySelector(
    "#customer_registration_form button"
  );

  registerButton.disabled = true;
  registerButton.innerHTML = `<div class="spinner-border" role="status" width="30px">
                                                                </div><span class="ms-2">loading...</span>`;

  const registerResponse = await fetch(backendURL + "/api/customer", {
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
    getCustomerForm.reset();
    window.location.pathname = "/client/login.html";
  }

  registerButton.disabled = false;
  registerButton.innerHTML = `Create an account`;
};
