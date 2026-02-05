// وضعنا الكود هنا للتأكد من الربط الصحيح
const orders = JSON.parse(localStorage.getItem("orders")) || [];
const products = JSON.parse(localStorage.getItem("products")) || [];
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

function renderOrders() {
  const container = document.getElementById("ordersContainer");
  const emptyState = document.getElementById("emptyOrders");

  if (!currentUser) {
    container.innerHTML = `<div class="alert alert-warning text-center">Please login to see your orders.</div>`;
    return;
  }

  // فلترة الأوردرات بناءً على إيميل المستخدم أو الـ ID
  const myOrders = orders.filter(o => o.userEmail === currentUser.email || o.userId === currentUser.id);

  if (myOrders.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  container.innerHTML = "";
  myOrders.reverse().forEach(order => {
    let itemsHTML = "";

    order.items.forEach(item => {
      // التعديل المهم هنا: البحث بـ item.id أو item.productId حسب اللي متخزن في الكارت
      const p = products.find(prod => (prod.id || prod.Id) == (item.id || item.productId));

      if (p) {
        itemsHTML += `
              <div class="d-flex align-items-center mb-3 p-2 border-bottom last-child-border-0">
                <img src="${p.image}" class="product-img-mini me-3 shadow-sm" onerror="this.src='https://via.placeholder.com/70'">
                <div class="flex-grow-1">
                  <h6 class="mb-0 small fw-bold text-dark">${p.name}</h6>
                  <small class="text-muted">Quantity: ${item.quantity} | Price: ${p.price} EGP</small>
                </div>
                <span class="fw-bold text-dark small">${(item.quantity * p.price).toLocaleString()} EGP</span>
              </div>`;
      }
    });

    const statusStyle = {
      "pending": "bg-warning text-dark",
      "shipped": "bg-info text-white",
      "delivered": "bg-success text-white",
      "cancelled": "bg-danger text-white"
    };

    const card = document.createElement("div");
    card.className = "col-md-9 col-lg-8 mb-4";
    card.innerHTML = `
          <div class="card order-card shadow-sm border-0">
            <div class="card-header bg-white border-bottom-0 pt-3 d-flex justify-content-between align-items-center">
              <div>
                <span class="text-muted extra-small text-uppercase">Order Details</span>
                <h6 class="fw-bold mb-0">Order #${order.id}</h6>
                <small class="text-muted"><i class="far fa-calendar-alt me-1"></i>${order.date}</small>
              </div>
              <span class="status-badge ${statusStyle[order.status] || 'bg-secondary text-white'}">
                ${order.status.toUpperCase()}
              </span>
            </div>
            <div class="card-body">
              <div class="order-items-list">
                ${itemsHTML || '<p class="text-muted small">Product details unavailable</p>'}
              </div>
              <div class="pt-3 d-flex justify-content-between align-items-center">
                <span class="text-muted">Total Paid</span>
                <span class="h5 mb-0 text-danger fw-bold">${(order.totalPrice || 0).toLocaleString()} EGP</span>
              </div>
            </div>
          </div>`;
    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", renderOrders);