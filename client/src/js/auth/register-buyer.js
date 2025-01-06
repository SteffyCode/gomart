// Import the backendURL from the utils file
import { backendURL } from "../utils/utils.js";

// Get the customer registration form element
const getCustomerForm = document.getElementById("customer_registration_form");

// Add submit event listener to the form
getCustomerForm.onsubmit = async (e) => {
  // Prevent the default form submission
  e.preventDefault();

  // get values of customer registration form, set as formData
  const formData = new FormData(getCustomerForm);

  // Log form data (for debugging purposes)
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  // Get the register button element
  const registerButton = document.querySelector(
    "#customer_registration_form button"
  );

  // Disable the register button and show loading spinner
  registerButton.disabled = true;
  registerButton.innerHTML = `<div class="spinner-border" role="status" width="20px">
                                                                </div><span class="ms-2">loading...</span>`;

  // Send a POST request to the backend API to register the customer (fetch API user register endpoint)
  const registerResponse = await fetch(backendURL + "/api/customer", {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  });

  // Parse the JSON response
  const registerData = await registerResponse.json();

  // Check if the registration was successful

  if (!registerResponse.ok) {
    // If registration failed, show an error message
    alert(`${registerData.message}`);
    registerButton.disabled = false;
    registerButton.innerHTML = `Create an account`;
    throw new Error("Couldn't register");
  } else {
    // If registration was successful, show a success message and redirect to login page
    alert(`Registration successful!`);
    getCustomerForm.reset();
    window.location.pathname = "/client/login.html";
  }

  // Re-enable the register button and reset its text
  registerButton.disabled = false;
  registerButton.innerHTML = `Create an account`;
};
