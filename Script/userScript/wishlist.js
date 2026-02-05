(function () {
  const getStorage = (key) => get_item(key) || [];
  const saveStorage = (key, data) => set_Item(key, data);
  const currentUser = () => (typeof getUser === 'function' ? getUser() : null);
  const getCurrentUserEmail = () => currentUser()?.email || "guest";

  // --- وظيفة الـ Details Modal ---
  function showProductModal(product) {
    // إنشاء حاوية المودال
    const modalOverlay = document.createElement('div');
    modalOverlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.7); z-index: 9999; display: flex; 
            align-items: center; justify-content: center; backdrop-filter: blur(5px);
        `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
            background: white; border-radius: 15px; padding: 0; max-width: 500px; 
            width: 90%; position: relative; overflow: hidden; animation: slideIn 0.3s ease;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        `;

    modalContent.innerHTML = `
            <div style="position: relative;">
                <img src="${product.image}" style="width: 100%; height: 250px; object-fit: cover;">
                <button id="closeModal" style="position: absolute; top: 15px; right: 15px; background: white; border: none; width: 35px; height: 35px; border-radius: 50%; font-weight: bold; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">×</button>
            </div>
            <div style="padding: 25px;">
                <span style="color: #dc2626; font-size: 0.8rem; font-weight: bold; text-uppercase; letter-spacing: 1px;">${product.category}</span>
                <h2 style="margin: 10px 0; color: #1f2937; font-size: 1.5rem;">${product.name}</h2>
                <p style="color: #6b7280; line-height: 1.6; font-size: 0.95rem; margin-bottom: 20px;">${product.description || 'No description available for this luxury timepiece.'}</p>
                <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #eee; pt: 20px; margin-top: 20px; padding-top: 20px;">
                    <span style="font-size: 1.5rem; font-weight: 800; color: #dc2626;">$${Number(product.price).toFixed(2)}</span>
                    <button id="modalAddToCart" style="background: #dc2626; color: white; border: none; padding: 10px 25px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.3s;">Add to Cart</button>
                </div>
            </div>
            <style>
                @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                #modalAddToCart:hover { background: #b91c1c; transform: translateY(-2px); }
            </style>
        `;

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // إغلاق المودال
    const close = () => modalOverlay.remove();
    modalContent.querySelector('#closeModal').onclick = close;
    modalOverlay.onclick = (e) => { if (e.target === modalOverlay) close(); };

    // زرار السلة داخل المودال
    modalContent.querySelector('#modalAddToCart').onclick = () => {
      addToCartHandler(product.id || product.Id);
      close();
    };
  }

  // --- الوظائف الأساسية ---
  function getWishlistForCurrentUser() {
    const email = getCurrentUserEmail();
    const all = getStorage(storageKeys.Wishlists);
    let entry = all.find(e => e.user === email);
    if (!entry) {
      entry = { user: email, items: [] };
      all.push(entry);
      saveStorage(storageKeys.Wishlists, all);
    }
    entry.items = entry.items.map(it => typeof it === 'string' ? { id: it, addedAt: Date.now() } : it);
    return entry;
  }

  function toggleWishlist(productId) {
    const email = getCurrentUserEmail();
    const all = getStorage(storageKeys.Wishlists);
    const entry = getWishlistForCurrentUser();
    const idx = entry.items.findIndex(it => it.id === productId);
    if (idx !== -1) { entry.items.splice(idx, 1); }
    const allIdx = all.findIndex(e => e.user === email);
    all[allIdx] = entry;
    saveStorage(storageKeys.Wishlists, all);
    renderWishlist();
  }

  function addToCartHandler(productId) {
    const email = getCurrentUserEmail();
    const allCarts = getStorage(storageKeys.Carts);
    let userCart = allCarts.find(c => c.user === email) || { user: email, items: [] };
    if (!allCarts.find(c => c.user === email)) allCarts.push(userCart);

    const existing = userCart.items.find(it => it.id === productId);
    if (existing) { existing.quantity = (existing.quantity || 1) + 1; }
    else { userCart.items.push({ id: productId, quantity: 1, addedAt: Date.now() }); }

    saveStorage(storageKeys.Carts, allCarts);
    updateCartCountUI();
    alert("✅ Added to cart!");
  }

  function renderWishlist() {
    const grid = document.getElementById("wishlistGrid");
    const emptyState = document.getElementById("emptyState");
    const template = document.getElementById("wishlist-item-template");
    if (!grid || !template) return;

    const wishlistEntry = getWishlistForCurrentUser();
    const allProducts = getStorage(storageKeys.Products);

    let products = wishlistEntry.items.map(item => {
      const p = allProducts.find(prod => (prod.id || prod.Id) == item.id);
      return p ? { ...p, addedAt: item.addedAt } : null;
    }).filter(Boolean);

    // البحث والترتيب
    const search = document.getElementById("globalSearch")?.value.toLowerCase() || "";
    if (search) products = products.filter(p => p.name.toLowerCase().includes(search));

    const sort = document.getElementById("sortSelect")?.value || "newest";
    if (sort === "price-asc") products.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") products.sort((a, b) => b.price - a.price);
    if (sort === "name-asc") products.sort((a, b) => a.name.localeCompare(b.name));

    document.getElementById("wishlist-count-display").textContent = products.length;

    if (products.length === 0) {
      grid.innerHTML = "";
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";
    grid.innerHTML = "";

    products.forEach(product => {
      const clone = template.content.cloneNode(true);
      clone.querySelector(".product-image").src = product.image;
      clone.querySelector(".product-name").textContent = product.name;
      clone.querySelector(".product-category").textContent = product.category;
      clone.querySelector(".product-price").textContent = `$${Number(product.price).toFixed(2)}`;
      clone.querySelector(".product-description").textContent = product.description || "";
      clone.querySelector(".added-date").textContent = `Added: ${new Date(product.addedAt).toLocaleDateString()}`;

      // تفعيل الأزرار
      clone.querySelector(".add-to-cart-btn").onclick = () => addToCartHandler(product.id || product.Id);
      clone.querySelector(".view-details-btn").onclick = () => showProductModal(product);

      const removeAction = () => { if (confirm("Remove from wishlist?")) toggleWishlist(product.id || product.Id); };
      clone.querySelector(".remove-btn").onclick = removeAction;
      clone.querySelector(".remove-btn-overlay").onclick = removeAction;

      grid.appendChild(clone);
    });
  }

  function updateCartCountUI() {
    const email = getCurrentUserEmail();
    const carts = getStorage(storageKeys.Carts);
    const myCart = carts.find(c => c.user === email);
    const count = myCart ? myCart.items.reduce((sum, it) => sum + it.quantity, 0) : 0;
    const badge = document.getElementById("cart-count");
    if (badge) badge.textContent = count;
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderWishlist();
    updateCartCountUI();
    document.getElementById("sortSelect")?.addEventListener("change", renderWishlist);
    document.getElementById("globalSearch")?.addEventListener("input", renderWishlist);
    document.getElementById("clearAllBtn")?.addEventListener("click", () => {
      if (confirm("Clear all?")) {
        const all = getStorage(storageKeys.Wishlists);
        const userWish = all.find(e => e.user === getCurrentUserEmail());
        if (userWish) { userWish.items = []; saveStorage(storageKeys.Wishlists, all); renderWishlist(); }
      }
    });
  });

})();