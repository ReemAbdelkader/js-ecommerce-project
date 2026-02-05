const currentUser = getUser(); // من ملف StorgeKeys.js
if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "superadmin")) {
    alert("Unauthorized access! Redirecting to login...");
    window.location.href = "../../pages/AuthPages/Login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    const superAdminLink = document.getElementById("superAdminLink");
    if (currentUser.role === "superadmin") {
        superAdminLink.classList.remove("d-none");
    }
})



const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("toggleBtn");
const toggleIcon = document.getElementById("toggleIcon");
toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle(window.innerWidth <= 991 ? "mobile-open" : "collapsed");
    toggleIcon.classList.toggle("fa-xmark");
    toggleIcon.classList.toggle("fa-bars");
});
// تحميل طلبات الادمن وعرضها
function loadAdminOrders() {
    const orders = JSON.parse(localStorage.getItem(storageKeys.Orders)) || [];
    const products = JSON.parse(localStorage.getItem(storageKeys.Products)) || [];
    const tbody = document.getElementById("ordersList");

    tbody.innerHTML = "";
    document.getElementById("totalOrdersCount").textContent = `Total Orders: ${orders.length}`;

    orders.reverse().forEach(order => {
        const tr = document.createElement("tr");
        const total = order.totalPrice || 0;

        tr.innerHTML = `
                    <td><small class="text-danger fw-bold">#${order.id}</small></td>
                    <td>
                        <div class="fw-bold">${order.userName || 'Guest'}</div>
                        <small class="text-muted" style="font-size:10px;">ID: ${order.userId}</small>
                    </td>
                    <td>${order.date}</td>
                    <td class="fw-bold">${total.toLocaleString()} EGP</td>
                    <td>
                        <select class="form-select form-select-sm status-select mx-auto" 
                                onchange="updateOrderStatus(${order.id}, this.value)">
                                // علي حسب ما الدمن يحدده الستاتس هيبقي سلكتد
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="viewOrderItems(${order.id})">
                            <i class="fas fa-eye"></i> Details
                        </button>
                    </td>
                `;
        tbody.appendChild(tr);
    });
}

function updateOrderStatus(orderId, newStatus) {
    let orders = JSON.parse(localStorage.getItem(storageKeys.Orders)) || [];
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
        orders[index].status = newStatus;
        localStorage.setItem(storageKeys.Orders, JSON.stringify(orders));

        console.log(`Order ${orderId} updated to ${newStatus}`);
    }
}
// لو عاوز اشوف الديتيل الخاص بطلب 
function viewOrderItems(orderId) {
    const orders = JSON.parse(localStorage.getItem(storageKeys.Orders)) || [];
    const products = JSON.parse(localStorage.getItem(storageKeys.Products)) || [];
    const order = orders.find(o => o.id === orderId);

    if (!order || !order.items) {
        console.error("Order not found or has no items");
        return;
    }

    const detailDiv = document.getElementById("orderItemsDetail");

    detailDiv.innerHTML = order.items.map(item => {
        // فحص المنتج بناءً على productId أو id لضمان المطابقة
        const p = products.find(prod => (prod.id || prod.Id) == (item.productId || item.id));

        // صورة افتراضية في حالة عدم وجود صورة للمنتج
        const productImg = p?.image || 'https://via.placeholder.com/60/000000/FFFFFF?text=No+Image';
        const productName = p?.name || 'Product Deleted';
        const productPrice = p?.price || 0;

        return `
            <div class="d-flex align-items-center mb-3 border-bottom border-secondary pb-2">
                <img src="${productImg}" style="width: 60px; height: 60px; object-fit: cover;" class="rounded me-3 border border-danger">
                <div class="flex-grow-1">
                    <h6 class="mb-0 text-white">${productName}</h6>
                    <small class="text-muted">Qty: ${item.quantity} x ${productPrice} EGP</small>
                </div>
            </div>
        `;
    }).join("");

    const modalElement = document.getElementById('orderDetailModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    } else {
        console.error("Modal element #orderDetailModal not found!");
    }
}

document.addEventListener("DOMContentLoaded", loadAdminOrders);

function logout() {
    localStorage.removeItem("currentUser");
    location.href = "../AuthPages/login.html";
}