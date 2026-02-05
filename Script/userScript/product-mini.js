//خاص بالباجنيشن والفلاتر وعرض المنتجات
const STATE = {
    currentPage: 1,
    itemsPerPage: 8,
    filteredProducts: [],
    allProducts: []
};

document.addEventListener("DOMContentLoaded", () => {
    const user = getUser();

    // 1. لو مفيش مستخدم أصلاً، وديه صفحة تسجيل الدخول
    if (!user) {
        window.location.href = "../../pages/AuthPages/Login.html";
        return; // بنوقف التنفيذ هنا عشان ميكملش باقي الشروط
    }

    // 2. لو المستخدم أدمن أو سوبر أدمن
    if (user.role === "admin" || user.role === "superadmin") {

        document.getElementById("AdminLink").classList.remove("d-none");


        document.getElementById("ProductsLink").classList.add("d-none");
        document.getElementById("ordersLink").classList.add("d-none");
        document.getElementById("wishlistLink").classList.add("d-none");
        document.getElementById("cartLink").classList.add("d-none");


    }
});

// عرض مودال تفاصيل المنتج
function showProductModal(product) {
    const modalOverlay = document.createElement('div');
    modalOverlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.8); z-index: 9999; display: flex; 
        align-items: center; justify-content: center; backdrop-filter: blur(8px);
    `;

    const modalContent = document.createElement('div');
    modalContent.className = "bg-white rounded-4 shadow-lg overflow-hidden";
    modalContent.style.cssText = `width: 90%; max-width: 500px; position: relative; animation: slideUp 0.3s ease;`;

    modalContent.innerHTML = `
        <div class="position-relative">
            <img src="${product.image}" class="w-100" style="height: 300px; object-fit: cover;">
            <button id="closeMdl" class="btn btn-light btn-sm position-absolute top-0 end-0 m-3 rounded-circle shadow" style="width:35px; height:35px;">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="p-4">
            <span class="badge bg-danger mb-2">${product.category}</span>
            <h3 class="fw-bold text-dark mb-2">${product.name}</h3>
            <p class="text-muted small mb-4" style="line-height:1.6;">${product.description || 'Experience luxury with this premium Smarty timepiece, designed for elegance and precision.'}</p>
            <div class="d-flex align-items-center justify-content-between pt-3 border-top">
                <span class="h3 fw-bold text-danger mb-0">$${product.price.toFixed(2)}</span>
                <button id="modalAddBtn" class="btn btn-danger px-4 fw-bold rounded-pill">
                    <i class="fas fa-shopping-cart me-2"></i>Add to Cart
                </button>
            </div>
        </div>
        <style>
            @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        </style>
    `;

    document.body.appendChild(modalOverlay);
    modalOverlay.appendChild(modalContent);

    // إغلاق المودال
    const close = () => modalOverlay.remove();
    modalContent.querySelector('#closeMdl').onclick = close;
    modalOverlay.onclick = (e) => { if (e.target === modalOverlay) close(); };

    // إضافة للسلة من المودال
    modalContent.querySelector('#modalAddBtn').onclick = () => {
        addToCart(product.id);
        close();
    };
}

// تحميل البيانات من التخزين وتطبيق الفلاتر
function loadData() {
    const rawProducts = get_item(storageKeys.Products) || [];
    const rawCategories = get_item(storageKeys.Categories) || [];

    STATE.allProducts = rawProducts.map(p => ({
        id: p.id || p.Id,
        name: p.name || p.Name,
        category: p.category || p.Category,
        price: parseFloat(p.price || p.Price) || 0,
        image: p.image || p.Image || 'https://via.placeholder.com/300',
        description: p.description || p.Description || '',
        stock: parseInt(p.stock || p.Stock) || 0
    }));

    const filterSelect = document.getElementById("categoryFilter");
    if (filterSelect) {
        filterSelect.innerHTML = '<option value="all">All Categories</option>';
        rawCategories.forEach(cat => {
            const catName = typeof cat === 'string' ? cat : (cat.Name || cat.name);
            const opt = document.createElement("option");
            opt.value = catName;
            opt.textContent = catName;
            filterSelect.appendChild(opt);
        });
    }
    applyFilters();
}

// عرض المنتجات في الشبكة
function renderGrid() {
    const grid = document.getElementById("productsGrid");
    const template = document.getElementById("product-card-template");
    if (!grid || !template) return;

    grid.innerHTML = "";
    const start = (STATE.currentPage - 1) * STATE.itemsPerPage;
    const paginatedItems = STATE.filteredProducts.slice(start, start + STATE.itemsPerPage);

    const currentUser = typeof getUser === 'function' ? getUser() : null;
    const wishlists = get_item(storageKeys.Wishlists) || [];
    const myWishlist = wishlists.find(w => w.user === currentUser?.email);

    paginatedItems.forEach(product => {
        const clone = template.content.cloneNode(true);

        // تعبئة البيانات
        clone.querySelector(".product-image").src = product.image;
        clone.querySelector(".product-name").textContent = product.name;
        clone.querySelector(".product-category").textContent = product.category;
        clone.querySelector(".product-price").textContent = `$${product.price.toFixed(2)}`;
        clone.querySelector(".product-desc").textContent = product.description;

        // زر السلة
        const cartBtn = clone.querySelector(".add-to-cart-btn");
        if (product.stock <= 0) {
            cartBtn.disabled = true;
            cartBtn.textContent = "Sold Out";
            cartBtn.classList.replace("btn-danger", "btn-secondary");
        } else {
            cartBtn.onclick = () => addToCart(product.id);
        }

        // زر التفاصيل (Details) - تفعيل الزرار هنا
        const viewBtn = clone.querySelector(".view-btn");
        if (viewBtn) {
            viewBtn.onclick = () => showProductModal(product);
        }

        // زر المفضلة (Wishlist)
        const wishBtn = clone.querySelector(".wishlist-btn");
        const heartIcon = wishBtn.querySelector("i");
        const isFav = myWishlist ? myWishlist.items.some(item => (item.id || item) === product.id) : false;

        if (isFav) {
            heartIcon.classList.replace("far", "fas");
            heartIcon.classList.add("text-danger");
        }

        wishBtn.onclick = () => toggleWishlist(product.id, heartIcon);

        grid.appendChild(clone);
    });

    updatePaginationUI();
}
function addToCart(productId) {
    // 1. جلب البيانات الأساسية
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        alert("Please login first!");
        return;
    }

    const email = currentUser.email;
    let allCarts = JSON.parse(localStorage.getItem("carts")) || [];

    // 2. البحث عن سلة المستخدم الحالي
    let userCartIndex = allCarts.findIndex(c => c.user === email);

    if (userCartIndex === -1) {
        // لو المستخدم ملوش سلة أصلاً، ننشئ له واحدة جديدة
        allCarts.push({
            user: email,
            items: [{ id: productId, quantity: 1, addedAt: Date.now() }]
        });
    } else {
        // لو عنده سلة، نشوف المنتج موجود فيها ولا لا
        let existingItem = allCarts[userCartIndex].items.find(it => it.id === productId);

        if (existingItem) {
            existingItem.quantity += 1; // نزود الكمية
        } else {
            allCarts[userCartIndex].items.push({ id: productId, quantity: 1, addedAt: Date.now() });
        }
    }

    // 3. حفظ المصفوفة الكبيرة كلها في "carts"
    localStorage.setItem("carts", JSON.stringify(allCarts));

    // اختياري: تنظيف المفاتيح القديمة اللي كانت بتعمل زحمة (زي مفتاح الـ ID)
    localStorage.removeItem(currentUser.id || currentUser.Id);
    updateCountsCarts();
    alert("Product added to cart successfully!");
}

function toggleWishlist(productId, heartIcon) {
    const user = typeof getUser === 'function' ? getUser() : null;
    if (!user) {
        alert("Please log in first!");
        return;
    }

    let wishlists = get_item(storageKeys.Wishlists) || [];
    let myWish = wishlists.find(w => w.user === user.email);

    if (!myWish) {
        myWish = { user: user.email, items: [] };
        wishlists.push(myWish);
    }

    const index = myWish.items.findIndex(item => (item.id || item) === productId);
    if (index === -1) {
        myWish.items.push({ id: productId, addedAt: Date.now() });
        heartIcon.classList.replace("far", "fas");
        heartIcon.classList.add("text-danger");
    } else {
        myWish.items.splice(index, 1);
        heartIcon.classList.replace("fas", "far");
        heartIcon.classList.remove("text-danger");
    }

    set_Item(storageKeys.Wishlists, wishlists);
    updateCountsWishlist();
}

// --- 6. تحديث العدادات والفلاتر ---
function updateCountsCarts() {
    const user = typeof getUser === 'function' ? getUser() : null;
    const carts = get_item(storageKeys.Carts) || [];
    const myCart = carts.find(c => c.user === (user?.email || "guest"));
    const count = myCart ? myCart.items.reduce((sum, i) => sum + i.quantity, 0) : 0;
    const badge = document.getElementById("cart-count");
    if (badge) badge.textContent = count;
}

function updateCountsWishlist() {
    const user = typeof getUser === 'function' ? getUser() : null;
    const wishlists = get_item(storageKeys.Wishlists) || [];
    const myWish = wishlists.find(w => w.user === (user?.email || "guest"));
    const badge = document.getElementById("wishlist-count");
    if (badge) badge.textContent = myWish ? myWish.items.length : 0;
}

function applyFilters() {
    const search = document.getElementById("globalSearch")?.value.toLowerCase() || "";
    const category = document.getElementById("categoryFilter")?.value || "all";
    const minPrice = parseFloat(document.getElementById("minPrice")?.value) || 0;
    const maxPrice = parseFloat(document.getElementById("maxPrice")?.value) || Infinity;
    const sortBy = document.getElementById("sortSelect")?.value || "default";

    let filtered = STATE.allProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search);
        const matchesCat = (category === "all") || (p.category === category);
        const matchesPrice = (p.price >= minPrice) && (p.price <= maxPrice);
        return matchesSearch && matchesCat && matchesPrice;
    });

    if (sortBy === "price-asc") filtered.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") filtered.sort((a, b) => b.price - a.price);
    else if (sortBy === "name-asc") filtered.sort((a, b) => a.name.localeCompare(b.name));

    STATE.filteredProducts = filtered;
    STATE.currentPage = 1;
    renderGrid();
}

function updatePaginationUI() {
    const totalPages = Math.ceil(STATE.filteredProducts.length / STATE.itemsPerPage) || 1;
    const info = document.getElementById("pageInfo");
    if (info) info.textContent = `Page ${STATE.currentPage} of ${totalPages}`;

    const prevBtn = document.getElementById("prevPage");
    const nextBtn = document.getElementById("nextPage");
    if (prevBtn) prevBtn.disabled = (STATE.currentPage === 1);
    if (nextBtn) nextBtn.disabled = (STATE.currentPage === totalPages);
}


document.addEventListener("DOMContentLoaded", () => {
    loadData();

    // Event Listeners
    ["globalSearch", "minPrice", "maxPrice"].forEach(id => {
        document.getElementById(id)?.addEventListener("input", applyFilters);
    });
    ["categoryFilter", "sortSelect"].forEach(id => {
        document.getElementById(id)?.addEventListener("change", applyFilters);
    });

    document.getElementById("clearFilters")?.addEventListener("click", () => {
        document.getElementById("minPrice").value = "";
        document.getElementById("maxPrice").value = "";
        document.getElementById("categoryFilter").value = "all";
        document.getElementById("globalSearch").value = "";
        document.getElementById("sortSelect").value = "default";
        applyFilters();
    });

    document.getElementById("prevPage")?.addEventListener("click", () => {
        if (STATE.currentPage > 1) { STATE.currentPage--; renderGrid(); }
    });
    document.getElementById("nextPage")?.addEventListener("click", () => {
        const totalPages = Math.ceil(STATE.filteredProducts.length / STATE.itemsPerPage);
        if (STATE.currentPage < totalPages) { STATE.currentPage++; renderGrid(); }
    });

    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        if (typeof logout === 'function') logout();
    });

    updateCountsCarts();
    updateCountsWishlist();
});

// المزامنة التلقائية
window.addEventListener('storage', () => {
    loadData();
    updateCountsCarts();
    updateCountsWishlist();
});