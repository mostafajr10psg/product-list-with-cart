const dessertsList = document.querySelector(".desserts-list");
const emptyCart = document.querySelector(".your-cart .empty-cart-info");
const cartInfo = document.querySelector(".your-cart .cart-info");
const orderInfo = document.querySelector(".your-cart .order-info");
const totalItems = document.querySelector(".your-cart .total-items span");
const allDessertsCart = document.querySelector(".your-cart .all-desserts-cart");
const totalCost = document.querySelector(".your-cart .order-total .total-cost");
const confirmBtn = document.querySelector(".your-cart button.confirm");
const orderconfirmed = document.querySelector(".order-confirmed");
const newOrderBtn = document.querySelector(".order-confirmed .new-order-btn");
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
  cartInfo.classList.add("hidden");
  emptyCart.classList.remove("hidden");
}

function showAddBtn(dessertId) {
  let dessert = getEleByDessertId(".dessert", dessertId);
  dessert.querySelector(".dessert-image").classList.remove("b-color-dessert");
  dessert.querySelector(".add-btn").classList.remove("hidden");
  dessert.querySelector(".count-btn").classList.add("hidden");
}

function showCountBtn(dessertId) {
  let dessert = getEleByDessertId(".dessert", dessertId);
  dessert.querySelector(".dessert-image").classList.add("b-color-dessert");
  addClassToEles("hidden", dessert.querySelector(".add-btn"), emptyCart);
  removeClassFromEles("hidden", dessert.querySelector(".count-btn"), cartInfo);
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

const dessertsNameMap = new Map();
const dessertsPriceMap = new Map();

async function getData() {
  const fetchdata = await fetch("data.json");
  const dessertsData = await fetchdata.json();

  for (let i = 0; i < dessertsData.length; i++) {
    let dessert = cloneTemplate("template.dessert-prototype", ".dessert");
    dessert.dataset.dessertId = `${i + 1}`;
    dessert.querySelector(".dessert-image").src = dessertsData[i].image.desktop;

    setDataToEle(dessert, ".info .category", dessertsData[i].category);
    setDataToEle(dessert, ".info .name", dessertsData[i].name);
    setDataToEle(dessert, ".info .price", priceFormatting(dessertsData[i].price));

    dessertsNameMap.set(i + 1, dessertsData[i].name);
    dessertsPriceMap.set(i + 1, priceFormatting(dessertsData[i].price));
    dessertsList.append(dessert);
  }
}
getData();

function updateTotalCost(dessertPrice) {
  // do a better version
  totalCost.textContent = priceFormatting(removeDollarSign(totalCost.textContent) + dessertPrice);
}

function handleAddBtn(btn) {
  let dessertId = btn.closest(".dessert").dataset.dessertId;
  let createDessertCart = cloneTemplate("template.dessert-cart-prototype", ".dessert-cart");
  createDessertCart.dataset.dessertId = dessertId;
  showCountBtn(dessertId);
  totalItems.textContent++;

  setDataToEle(createDessertCart, ".dessert-name", dessertsNameMap.get(+dessertId));
  let dessertPrice = setDataToEle(createDessertCart, ".dessert-price", dessertsPriceMap.get(+dessertId));
  setDataToEle(createDessertCart, ".dessert-total-price", dessertPrice);
  updateTotalCost(removeDollarSign(dessertPrice));
  allDessertsCart.append(createDessertCart);
}

function handlePlusAndMinus(btn, status) {
  let dessert = btn.closest(".dessert");
  let dessertId = dessert.dataset.dessertId;
  let dessertCart = getEleByDessertId(".dessert-cart", dessertId);
  let dessertCartPrice = removeDollarSign(dessertCart.querySelector(".dessert-price").textContent);
  let dessertQuantity = dessert.querySelector(".count-btn .quantity");

  function updateDessertTotalPrice() {
    dessertCart.querySelector(".dessert-total-price").textContent = priceFormatting(
      dessertQuantity.textContent * dessertCartPrice
    );
  }

  function updateDessertCartQuantity() {
    setDataToEle(dessertCart, ".dessert-quantity", `${dessertQuantity.textContent}x`);
  }

  function handlePlus() {
    dessertQuantity.textContent++;
    totalItems.textContent++;
    updateDessertCartQuantity();
    updateDessertTotalPrice();
    updateTotalCost(dessertCartPrice);
  }

  function handleMinus() {
    totalItems.textContent--;
    if (dessertQuantity.textContent === "1") {
      showAddBtn(dessertId);
      dessertCart.remove();
      document.getElementsByClassName("dessert-cart").length === 0 ? showEmptyCart() : "";
    } else {
      dessertQuantity.textContent--;
      updateDessertCartQuantity();
      updateDessertTotalPrice();
    }
    updateTotalCost(-dessertCartPrice);
  }

  if (status === "plus") return handlePlus();
  else if (status === "minus") return handleMinus();
}

// add-btn
dessertsList.addEventListener("click", (e) => {
  let btn = e.target;

  if (btn.closest(".add-btn")) handleAddBtn(btn);
  else if (btn.closest(".plus")) handlePlusAndMinus(btn, "plus");
  else if (btn.closest(".minus")) handlePlusAndMinus(btn, "minus");
});

// remove-btn
allDessertsCart.addEventListener("click", (e) => {
  btn = e.target;
  if (!btn.closest(".remove-btn")) return;
  let dessertCart = btn.closest(".dessert-cart");
  let dessertTotalPrice = dessertCart.querySelector(".dessert-total-price").textContent;
  let dessert = getEleByDessertId(".dessert", dessertCart.dataset.dessertId);
  let dessertQuantity = dessert.querySelector(".count-btn .quantity");

  totalItems.textContent = +totalItems.textContent - +dessertQuantity.textContent;
  dessertQuantity.textContent = "1";
  showAddBtn(dessert.dataset.dessertId);
  updateTotalCost(-removeDollarSign(dessertTotalPrice));
  dessertCart.remove();
  document.querySelectorAll(".remove-btn").length === 0 ? showEmptyCart() : "";
});

// order-confirmed
confirmBtn.addEventListener("click", () => {
  removeClassFromEles("hidden", overlay, orderconfirmed);
  let cloneOrderInfo = orderInfo.cloneNode(true);
  for (let removeBtn of cloneOrderInfo.querySelectorAll(".dessert-cart .remove-btn")) removeBtn.remove();
  // set the thumbnail imgs
  cloneOrderInfo.querySelectorAll(".dessert-cart").forEach((el) => {
    let img = document.createElement("img");
    img.src = getEleByDessertId(".dessert", el.dataset.dessertId)
      .querySelector(".dessert-image")
      .src.replace("desktop", "thumbnail");
    el.prepend(img);
  });

  let totalPrice = cloneOrderInfo.querySelectorAll(".order-info .dessert-total-price");
  for (let i = 0; i < totalPrice.length; i++)
    cloneOrderInfo.querySelectorAll(".order-info .dessert-info")[i].after(totalPrice[i]);

  document.querySelector(".order-confirmed .new-order-btn").before(cloneOrderInfo);
});

// new-order
newOrderBtn.addEventListener("click", () => {
  orderconfirmed.querySelector(".order-info").remove();
  addClassToEles("hidden", orderconfirmed, overlay);

  const addBtnsHidden = document.querySelectorAll(".add-btn.hidden");
  addBtnsHidden.forEach((addBtn) => {
    addBtn.nextElementSibling.querySelector(".quantity").textContent = "1";
    showAddBtn(addBtn.closest(".dessert").dataset.dessertId);
  });

  totalItems.textContent = "0";
  allDessertsCart.innerHTML = "";
  totalCost.textContent = "0";
  showEmptyCart();
});

// check the responsive on all needed
