// عرض محتويات سلة التسوق للمستخدم الحالي
function renderCart() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const allCartsData = JSON.parse(localStorage.getItem("carts")) || [];

  const userEmail = currentUser ? currentUser.email : "guest";
  const userCartObj = allCartsData.find(c => c.user === userEmail);
  const myCart = userCartObj ? userCartObj.items : [];

  const listContainer = document.getElementById("cartItemsList");
  const emptyState = document.getElementById("emptyCart");
  const navCount = document.getElementById("cart-count-nav");
  const itemsCount = document.getElementById("cart-items-count");

  if (myCart.length === 0) {
    listContainer.innerHTML = "";
    emptyState.style.display = "block";
    navCount.textContent = "0";
    itemsCount.textContent = "0";
    updateSummary(0);
    return;
  }

  emptyState.style.display = "none";
  listContainer.innerHTML = "";
  let total = 0;
  let totalItems = 0;

  myCart.forEach((item) => {
    // البحث عن المنتج في المخزن باستخدام item.id
    const product = products.find(p => (p.id || p.Id) == item.id);

    if (product) {
      const itemTotal = product.price * item.quantity;
      total += itemTotal;
      totalItems += item.quantity;

      listContainer.innerHTML += `
            <div class="card cart-item-card mb-3 shadow-sm border-0">
              <div class="row g-0 align-items-center">
                <div class="col-md-3 col-4">
                  <img src="${product.image}" class="product-img-cart" alt="${product.name}">
                </div>
                <div class="col-md-9 col-8">
                  <div class="card-body p-3">
                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 class="fw-bold mb-1">${product.name}</h6>
                        <small class="text-muted d-block mb-2">${product.category || 'Luxury Watch'}</small>
                      </div>
                      <button class="btn btn-sm text-danger border-0" onclick="removeItem('${item.id}')" title="Remove Item">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                      <div class="quantity-grp">
                        <button class="qty-btn" onclick="changeQty('${item.id}', -1)">-</button>
                        <span class="mx-3 fw-bold small">${item.quantity}</span>
                        <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
                      </div>
                      <div class="text-end">
                        <span class="text-danger fw-bold h6 mb-0">${itemTotal.toLocaleString()} $</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>`;
    }
  });

  navCount.textContent = totalItems;
  itemsCount.textContent = totalItems;
  updateSummary(total);
}
// ========= PayPal Integration ===========
function initPayPalButton() {
  paypal.Buttons({
    style: {
      shape: 'rect',
      color: 'gold',
      layout: 'vertical',
      label: 'paypal',
    },

    createOrder: function (data, actions) {
      // جلب المجموع الكلي من الصفحة
      const totalAmount = document.getElementById('totalPrice').textContent.replace(' EGP', '').replace(',', '');

      // تحويل العملة (PayPal لا يدعم EGP بشكل مباشر في بعض الحسابات، لذا يفضل التحويل لـ USD للديمو)
      const usdAmount = (parseFloat(totalAmount) / 50).toFixed(2);

      return actions.order.create({
        purchase_units: [{
          amount: {
            value: usdAmount
          }
        }]
      });
    },

    onApprove: function (data, actions) {
      return actions.order.capture().then(function (orderData) {
        alert('Transaction completed by ' + orderData.payer.name.given_name);
        // هنا تنفذ دالة إتمام الطلب الخاصة بك
        placeOrder();
      });
    },

    onError: function (err) {
      console.error('PayPal Error:', err);
      alert('Something went wrong with the payment.');
    }
  }).render('#paypal-button-container');
}

// نده على الدالة عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", initPayPalButton);
// ===========
function updateSummary(total) {
  const formatted = total.toLocaleString() + "$";
  document.getElementById("subtotalPrice").textContent = formatted;
  document.getElementById("totalPrice").textContent = formatted;
}

function changeQty(productId, delta) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userEmail = currentUser ? currentUser.email : "guest";
  let allCartsData = JSON.parse(localStorage.getItem("carts")) || [];

  let userCartObj = allCartsData.find(c => c.user === userEmail);
  if (userCartObj) {
    let item = userCartObj.items.find(i => i.id === productId);
    if (item && (item.quantity + delta) > 0) {
      item.quantity += delta;
      localStorage.setItem("carts", JSON.stringify(allCartsData));
      renderCart();
    }
  }
}

function removeItem(productId) {
  if (!confirm("Are you sure you want to remove this item?")) return;

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userEmail = currentUser ? currentUser.email : "guest";
  let allCartsData = JSON.parse(localStorage.getItem("carts")) || [];

  let userCartObj = allCartsData.find(c => c.user === userEmail);
  if (userCartObj) {
    userCartObj.items = userCartObj.items.filter(i => i.id !== productId);
    localStorage.setItem("carts", JSON.stringify(allCartsData));
    renderCart();
  }
}

function placeOrder() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    alert("Please login to complete your purchase.");
    return;
  }

  let allCartsData = JSON.parse(localStorage.getItem("carts")) || [];
  let userCartObj = allCartsData.find(c => c.user === currentUser.email);
  let myCart = userCartObj ? userCartObj.items : [];
  const products = JSON.parse(localStorage.getItem("products")) || [];

  if (!myCart || myCart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  let orders = JSON.parse(localStorage.getItem("orders")) || [];
  let total = 0;
  myCart.forEach(item => {
    const p = products.find(prod => (prod.id || prod.Id) == item.id);
    if (p) total += (p.price * item.quantity);
  });

  const newOrder = {
    id: Date.now(),
    userId: currentUser.id || currentUser.Id,
    userName: `${currentUser.firstName} ${currentUser.lastName}`,
    userEmail: currentUser.email,
    date: new Date().toLocaleString(),
    items: [...myCart],
    totalPrice: total,
    status: "pending"
  };

  orders.push(newOrder);
  localStorage.setItem("orders", JSON.stringify(orders));

  // Clear the current user's cart only
  userCartObj.items = [];
  localStorage.setItem("carts", JSON.stringify(allCartsData));

  alert("Success! Your order has been placed.");
  window.location.href = "../../pages/userPage/order.html";
}

document.addEventListener("DOMContentLoaded", renderCart);