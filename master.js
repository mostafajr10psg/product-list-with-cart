const emptyCartEle = document.querySelector(".your-cart .empty-cart");
const cartInfoEle = document.querySelector(".your-cart .cart-info");
const totalItemsEle = document.querySelector(".your-cart .total-items span");
const dessertsCartEle = document.querySelector(".your-cart .all-desserts-cart");
const totalCostEle = document.querySelector(".your-cart .order-total .total-cost");
const confirmationModal = document.querySelector(".confirmation-modal");
const newOrderBtnEle = document.querySelector(".confirmation-modal .new-order-btn");
const overlay = document.querySelector(".overlay");

function addClassToEles(cls, ...eles) {
  for (let e of eles) e.classList.add(cls);
}

function removeClassFromEles(cls, ...eles) {
  for (let e of eles) e.classList.remove(cls);
}

function getEleByDessertId(ele, dessertId) {
  return document.querySelector(`${ele}[data-dessert-id='${dessertId}']`);
}

function showEmptyCart() {
  cartInfoEle.classList.add("hidden");
  emptyCartEle.classList.remove("hidden");
}

function showAddBtn(dessertId) {
  const dessert = getEleByDessertId(".dessert", dessertId);
  dessert.querySelector(".dessert-image").classList.remove("b-color-dessert");
  dessert.querySelector(".add-btn").classList.remove("hidden");
  dessert.querySelector(".count-btn").classList.add("hidden");
}

function hideAddBtn(dessertId) {
  const dessert = getEleByDessertId(".dessert", dessertId);
  dessert.querySelector(".dessert-image").classList.add("b-color-dessert");
  addClassToEles("hidden", dessert.querySelector(".add-btn"), emptyCartEle);
  removeClassFromEles("hidden", dessert.querySelector(".count-btn"), cartInfoEle);
}

function removeDollarSign(ele) {
  return +ele.replace("$", "");
}

function priceFormatting(price) {
  return `$${price.toFixed(2)}`;
}

function cloneTemplate(template, cloneEle) {
  return document.querySelector(template).content.querySelector(cloneEle).cloneNode(true);
}

function setDataToEle(parent, ele, data) {
  return (parent.querySelector(ele).textContent = data);
}

function updateTotalCost(dessertPrice, operator) {
  if (typeof dessertPrice === "string") dessertPrice = removeDollarSign(dessertPrice);
  const pureTotalCost = removeDollarSign(totalCostEle.textContent);
  operator === "+"
    ? (totalCostEle.textContent = priceFormatting(pureTotalCost + dessertPrice))
    : (totalCostEle.textContent = priceFormatting(pureTotalCost - dessertPrice));
}

const dessertsNameMap = new Map();
const dessertsPriceMap = new Map();

function handleAddBtn(btn) {
  const dessertId = btn.closest(".dessert").dataset.dessertId;
  const dessertCartEle = cloneTemplate("template.dessert-cart-prototype", ".dessert-cart");
  dessertCartEle.dataset.dessertId = dessertId;
  hideAddBtn(dessertId);
  totalItemsEle.textContent++;

  const dessertPrice = setDataToEle(dessertCartEle, ".price", dessertsPriceMap.get(+dessertId));
  setDataToEle(dessertCartEle, ".total-price", dessertPrice);
  setDataToEle(dessertCartEle, ".name", dessertsNameMap.get(+dessertId));
  updateTotalCost(dessertPrice, "+");
  dessertsCartEle.append(dessertCartEle);
}

function handlePlusAndMinus(btn, status) {
  const dessertEle = btn.closest(".dessert");
  const dessertEleId = dessertEle.dataset.dessertId;
  const dessertCartEle = getEleByDessertId(".dessert-cart", dessertEleId);
  const dessertCartPrice = removeDollarSign(dessertCartEle.querySelector(".price").textContent);
  const dessertQuantityEle = dessertEle.querySelector(".count-btn .quantity");

  function updateDessertTotalPrice() {
    setDataToEle(dessertCartEle, ".total-price", priceFormatting(dessertQuantityEle.textContent * dessertCartPrice));
  }

  function updateDessertCartQuantity() {
    setDataToEle(dessertCartEle, ".quantity", `${dessertQuantityEle.textContent}x`);
  }

  function handlePlus() {
    dessertQuantityEle.textContent++;
    totalItemsEle.textContent++;
    updateDessertCartQuantity();
    updateDessertTotalPrice();
    updateTotalCost(dessertCartPrice, "+");
  }

  function handleMinus() {
    totalItemsEle.textContent--;
    if (dessertQuantityEle.textContent === "1") {
      showAddBtn(dessertEleId);
      dessertCartEle.remove();
      document.getElementsByClassName("dessert-cart").length === 0 ? showEmptyCart() : "";
    } else {
      dessertQuantityEle.textContent--;
      updateDessertCartQuantity();
      updateDessertTotalPrice();
    }
    updateTotalCost(dessertCartPrice, "-");
  }

  if (status === "plus") return handlePlus();
  else if (status === "minus") return handleMinus();
}

const dessertsList = document.querySelector(".desserts-list");
dessertsList.addEventListener("pointerup", (e) => {
  let btn = e.target;

  if (btn.closest(".add-btn")) handleAddBtn(btn);
  else if (btn.closest(".plus")) handlePlusAndMinus(btn, "plus");
  else if (btn.closest(".minus")) handlePlusAndMinus(btn, "minus");
});

async function setDataToDesserts() {
  const fetchdata = await fetch("data.json");
  const dessertsData = await fetchdata.json();

  for (let i = 0; i < dessertsData.length; i++) {
    const dessert = cloneTemplate("template.dessert-prototype", ".dessert");
    dessert.dataset.dessertId = `${i + 1}`;

    dessert.querySelector(".dessert-image").src = dessertsData[i].image.desktop;
    const sources = dessert.querySelectorAll("picture source");
    sources[0].srcset = dessertsData[i].image.mobile;
    sources[1].srcset = dessertsData[i].image.tablet;
    sources[2].srcset = dessertsData[i].image.desktop;

    setDataToEle(dessert, ".category", dessertsData[i].category);
    setDataToEle(dessert, ".name", dessertsData[i].name);
    setDataToEle(dessert, ".price", priceFormatting(dessertsData[i].price));

    dessertsNameMap.set(i + 1, dessertsData[i].name);
    dessertsPriceMap.set(i + 1, priceFormatting(dessertsData[i].price));
    dessertsList.append(dessert);
  }
}

setDataToDesserts();

function handleDessertChanges(dessertCart) {
  const dessert = getEleByDessertId(".dessert", dessertCart.dataset.dessertId);
  const dessertQuantity = dessert.querySelector(".count-btn .quantity");
  totalItemsEle.textContent = +totalItemsEle.textContent - +dessertQuantity.textContent;
  dessertQuantity.textContent = "1";
  showAddBtn(dessert.dataset.dessertId);
}

dessertsCartEle.addEventListener("pointerup", (e) => {
  btn = e.target;
  if (!btn.closest(".remove-btn")) return;
  const dessertCart = btn.closest(".dessert-cart");

  handleDessertChanges(dessertCart);
  updateTotalCost(dessertCart.querySelector(".total-price").textContent, "-");
  dessertCart.remove();
  document.querySelectorAll(".remove-btn").length === 0 ? showEmptyCart() : "";
});

function handleConfirmationModal() {
  removeClassFromEles("hidden", overlay, confirmationModal);
  setTimeout(() => confirmationModal.classList.add("show-modal-smoothly"), 200);

  if (matchMedia("(max-width: 480px)").matches) {
    confirmationModal.style.bottom = "-100%";
    setTimeout(() => confirmationModal.style.removeProperty("bottom"), 100);
  }

  const cloneOrderInfo = document.querySelector(".your-cart .order-info").cloneNode(true);
  cloneOrderInfo.querySelectorAll(".dessert-cart").forEach((dc) => {
    dc.querySelector(".remove-btn").remove();
    const dessertImg = getEleByDessertId(".dessert", dc.dataset.dessertId).querySelector(".dessert-image");
    const thumbnailImg = document.createElement("img");
    thumbnailImg.src = dessertImg.src.replace("desktop", "thumbnail");
    dc.prepend(thumbnailImg);
    dc.append(dc.querySelector(".total-price"));
  });
  newOrderBtnEle.before(cloneOrderInfo);
}

const confirmBtnEle = document.querySelector(".your-cart button.confirm");
confirmBtnEle.addEventListener("pointerup", () => {
  document.body.classList.add("lock-scroll");
  handleConfirmationModal();

  document.querySelectorAll(".dessert").forEach((ele) => {
    ele.querySelector(".count-btn .quantity").textContent = "1";
    showAddBtn(ele.dataset.dessertId);
  });

  totalItemsEle.textContent = "0";
  dessertsCartEle.innerHTML = "";
  totalCostEle.textContent = "0";
  showEmptyCart();
});

newOrderBtnEle.addEventListener("pointerup", () => {
  document.body.classList.remove("lock-scroll");
  confirmationModal.querySelector(".order-info").remove();
  confirmationModal.classList.remove("show-modal-smoothly");
  addClassToEles("hidden", confirmationModal, overlay);
});
