// فوتر بيتكريت تلقايي مجردما بنده الاسكربت ف اخر الصفحه
document.addEventListener("DOMContentLoaded", function () {
  const footerHTML = `
    <footer class="bg-dark text-white pt-5 pb-3 mt-5" style="border-top: 4px solid #dc2626;">
      <div class="container">
        <div class="row g-4">
          
          <div class="col-lg-4 col-md-6">
            <div class="d-flex align-items-center mb-3">
              <div style="width: 35px; height: 35px; background: #dc2626; color: white; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 10px;">S</div>
              <h4 class="fw-bold mb-0 text-white">Smarty</h4>
            </div>
            <p class="text-white-50 small">
              Experience the elegance of time with Smarty. We provide a curated collection of premium watches that combine craftsmanship with modern technology.
            </p>
          </div>

          <div class="col-lg-2 col-md-6">
            <h6 class="fw-bold mb-4 text-uppercase small text-white" style="letter-spacing: 1px;">Quick Shop</h6>
            <ul class="list-unstyled footer-links">
              <li class="mb-2"><a href="../../pages/userPage/product.html" class="text-white-50 text-decoration-none small footer-link-hover">All Products</a></li>
              <li class="mb-2"><a href="../../pages/userPage/product.html" class="text-white-50 text-decoration-none small footer-link-hover">Luxury Watches</a></li>
              <li class="mb-2"><a href="../../pages/userPage/product.html" class="text-white-50 text-decoration-none small footer-link-hover">Sports Collection</a></li>
            </ul>
          </div>

          <div class="col-lg-2 col-md-6">
            <h6 class="fw-bold mb-4 text-uppercase small text-white" style="letter-spacing: 1px;">Customer Care</h6>
            <ul class="list-unstyled footer-links">
              <li class="mb-2"><a href="../../pages/userPage/order.html" class="text-white-50 text-decoration-none small footer-link-hover">My Orders</a></li>
              <li class="mb-2"><a href="../../pages/userPage/wishlist.html" class="text-white-50 text-decoration-none small footer-link-hover">My Wishlist</a></li>
              <li class="mb-2"><a href="../../pages/userPage/cart.html" class="text-white-50 text-decoration-none small footer-link-hover">Shopping Cart</a></li>
            </ul>
          </div>

          <div class="col-lg-4 col-md-6">
            <h6 class="fw-bold mb-4 text-uppercase small text-white" style="letter-spacing: 1px;">Get in Touch</h6>
            <ul class="list-unstyled text-white-50 small">
              <li class="mb-2"><i class="fas fa-map-marker-alt text-danger me-2"></i>  Smarty Plaza,  Cairo, Egypt.</li>
              <li class="mb-2"><i class="fas fa-phone-alt text-danger me-2"></i>01146650211</li>
              <li class="mb-2"><i class="fas fa-envelope text-danger me-2"></i> support@smarty.com</li>
            </ul>
          </div>

        </div>

        <hr class="my-4" style="opacity: 0.2; background: #fff;">

        <div class="row align-items-center">
          <div class="col-md-6 text-center text-md-start">
            <p class="text-white-50 small mb-0">&copy; 2026 <span class="text-white fw-bold">Smarty</span>. All rights reserved.</p>
          </div>
          <div class="col-md-6 text-center text-md-end mt-3 mt-md-0">
             <i class="fab fa-cc-visa fa-2x mx-1 text-white-50"></i>
             <i class="fab fa-cc-mastercard fa-2x mx-1 text-white-50"></i>
             <i class="fab fa-cc-apple-pay fa-2x mx-1 text-white-50"></i>
          </div>
        </div>
      </div>
    </footer>

    <style>
        .footer-link-hover:hover {
            color: #fff !important;
            padding-left: 5px;
            transition: all 0.3s ease;
        }
    </style>
    `;

  document.body.insertAdjacentHTML('beforeend', footerHTML);
});