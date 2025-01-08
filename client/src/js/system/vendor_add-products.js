import {
  backendURL,
  headers,
  logoutbutton,
  userlogged,
} from "../utils/utils.js";

userlogged();
logoutbutton();

const createProductForm = document.getElementById("add_product_form");

createProductForm.onsubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData(createProductForm);

  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  const existedProduct = await fetch(backendURL + "/api/vendor/product", {
    headers,
  });

  if (!existedProduct.ok) throw new Error(existedProduct.status);

  const productData = await existedProduct.json();

  if (productData.length > 0) {
    const isProductExist = productData.map(
      (product) => product.product_id === parseInt(formData.get("product_id"))
    );

    console.log(isProductExist);

    const isTrue = isProductExist.find((isExist) => isExist === true);

    if (isTrue) {
      alert("Inventory already exists. Check your inventory.");
      createProductButton.disabled = false;
      createProductButton.innerHTML = "Create";
      return;
    }
  }
  const profileRes = await fetch(backendURL + "/api/profile/show", { headers });
  if (!profileRes.ok) throw new Error(profileRes.status);
  const profileData = await profileRes.json();

  // append vendor_id
  formData.append("vendor_id", profileData.id);
  // append UPC
  formData.append("UPC", generateUPC());

  const response = await fetch(backendURL + "/api/product", {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) throw new Error(response.status);

  if (response.ok) {
    createProductForm.reset();
    alert("Product Creation Successful");
  }
};

function generateUPC() {
  // Generate the first 11 random digits
  let upc = "";
  for (let i = 0; i < 11; i++) {
    upc += Math.floor(Math.random() * 10);
  }

  // Calculate the check digit
  const checkDigit = calculateCheckDigit(upc);
  upc += checkDigit;

  return upc;
}

function calculateCheckDigit(upc) {
  if (upc.length !== 11) {
    throw new Error("UPC must have 11 digits for check digit calculation.");
  }

  let oddSum = 0;
  let evenSum = 0;

  for (let i = 0; i < upc.length; i++) {
    const digit = parseInt(upc[i]);
    if (i % 2 === 0) {
      oddSum += digit;
    } else {
      evenSum += digit;
    }
  }

  const total = oddSum * 3 + evenSum;
  const checkDigit = (10 - (total % 10)) % 10;
  return checkDigit;
}
