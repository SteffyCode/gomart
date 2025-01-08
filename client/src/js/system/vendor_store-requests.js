import {
  backendURL,
  headers,
  userlogged,
  logoutbutton,
} from "../utils/utils.js";

logoutbutton();
userlogged();

async function getDatas(url = "", keyword) {
  const getRequests = document.getElementById("getRequests");

  let queryParams =
    "?" +
    (url ? new URL(url).searchParams + "&" : "") +
    (keyword ? "keyword=" + encodeURIComponent(keyword) : "");

  const requestResponse = await fetch(
    url || backendURL + "/api/reorder-request/user" + queryParams,
    {
      headers,
    }
  );
  const productResponse = await fetch(backendURL + "/api/product/all", {
    headers,
  });
  const storeResponse = await fetch(backendURL + "/api/user", {
    headers,
  });

  if (!requestResponse.ok) {
    throw new Error("Failed to fetch request data.");
  }

  if (!productResponse.ok) {
    throw new Error("Failed to fetch product data.");
  }
  if (!storeResponse.ok) {
    throw new Error("Failed to fetch store data.");
  }

  const [requestDatas, productDatas, storeDatas] = await Promise.all([
    requestResponse.json(),
    productResponse.json(),
    storeResponse.json(),
  ]);

  console.log(requestDatas);

  let hasRequest = false,
    requestHTML = "",
    i = 0;

  requestDatas?.data?.forEach((req) => {
    hasRequest = true;
    i++;
    const product = productDatas.find(
      (product) => product.product_id === req.product_id
    );
    const store = storeDatas.find((store) => store.id === req.store_id);

    requestHTML += getrequestHTML(req, store, product, i);
  });
  if (!hasRequest) {
    requestHTML = `<tr><td colspan='9' class="text-center">No requests found. Wait for reorder request of customers.</td></tr>`;
  }

  getRequests.innerHTML = requestHTML;

  let pagination = "";
  if (requestDatas.links) {
    requestDatas.links.forEach((link) => {
      pagination += `
                    <li class="page-item" >
                        <a class="page-link ${
                          link.url == null ? " disabled" : ""
                        }${link.active ? " active" : ""}" href="#" data-url="${
        link.url
      }">
                            ${
                              link.label === "&laquo; Previous"
                                ? `&#171;`
                                : link.label === "Next &raquo;"
                                ? `&#187;`
                                : link.label
                            }
                        </a>
                    </li>`;
    });
  }

  document.querySelectorAll(".updatebutton").forEach((button) => {
    button.addEventListener("click", updateClickStatus);
  });

  document.getElementById("pages").innerHTML = pagination;

  document.querySelectorAll("#pages .page-link").forEach((link) => {
    link.addEventListener("click", pageAction);
  });
}

function getrequestHTML(req, store, product, i) {
  return `<!-- Sample rows -->
              <tr>
                <td>#REQ00${i}</td>
                <td>${product.product_name}</td>
                <td>${product.section_name}</td>
                <td>${store.business_name}</td>
                <td>${req.order_type}</td>
                <td>${req.quantity}</td>
                <td>${req.created_at?.split("T")[0]}</td>
                <td>${
                  req.delivered_date === null
                    ? "Processing request..."
                    : req.delivered_date
                }</td>
                <td><span class="badge ${
                  req.status === "Pending"
                    ? `bg-warning`
                    : req.status === "Declined"
                    ? `bg-danger`
                    : req.status === "Delivered"
                    ? `bg-success`
                    : req.status === "Shipped"
                    ? `bg-success`
                    : ``
                }">${req.status}</span></td>
                <td>
                ${
                  req.status === "Pending"
                    ? `<button type="button" class="btn btn-sm btn-outline-success updatebutton" data-status="Shipped" data-id="${req.reorder_id}">
                    Accept
                  </button>
                  <button type="button" class="btn btn-sm btn-outline-danger updatebutton" data-status="Declined" data-id="${req.reorder_id}">
                    Decline
                  </button>`
                    : ``
                }

                ${
                  req.status === "Shipped"
                    ? `<button type="button" class="btn btn-sm btn-primary updatebutton" data-status="Delivered" data-id="${req.reorder_id}">
                    Mark as Delivered
                  </button>`
                    : ``
                }
                </td>
              </tr>`;
}

const search_form = document.getElementById("search_form");
search_form.onsubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData(search_form);
  const keyword = formData.get("keyword");
  console.log(keyword);
  getDatas("", keyword);
};

const pageAction = async (e) => {
  e.preventDefault();
  const url = e.target.getAttribute("data-url");
  await getDatas(url);
};

function updateClickStatus(e) {
  const id = e.target.getAttribute("data-id");
  const status = e.target.getAttribute("data-status");
  console.log(id, status);
  updateRequestStatus(id, status);
}

async function updateRequestStatus(id, status) {
  if (confirm(`Are you sure you want to this?`)) {
    const formData = new FormData();
    formData.append("status", status);
    const currentDate = new Date().toISOString().split("T")[0];

    if (status === "Shipped") {
      formData.append("shipped_date", currentDate);
    } else if (status === "Delivered") {
      formData.append("delivered_date", currentDate);
    }

    formData.append("_method", "PUT");

    const reorderResponse = await fetch(
      backendURL + "/api/reorder-request/" + id,
      {
        method: "POST",
        headers,
        body: formData,
      }
    );

    if (!reorderResponse.ok) throw new Error("Failed to update request status");

    if (reorderResponse.ok) {
      await getDatas();
    }
  }
}

getDatas();
