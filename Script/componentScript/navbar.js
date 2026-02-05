function injectProfileMenu() {
    const user = JSON.parse(localStorage.getItem("currentUser")); // أو استخدم getUser()
    const container = document.getElementById("profileDropdownContainer");

    if (!user || !container) return;

    // كود القائمة المنسدلة
    container.innerHTML = `
        <div class="profile-dropdown">
            <div class="profile-icon" id="profileIconToggle">
                <img src="${user.image || '../../New folder/landingimg/WhatsApp Image 2026-02-04 at 11.49.25 PM.jpeg'}" alt="User">
            </div>
            <ul class="dropdown-list" id="profileDropdownMenu">
                <li class="px-3 py-2 text-muted small border-bottom text-center">${user.userName || 'User'}</li>
                <li><a href="../../pages/AuthPages/myProfile.html"><i class="fas fa-user"></i> <span>Profile</span></a></li>
                ${(user.role === 'admin' || user.role === 'superadmin') ? `
                    <li><a href="../DashboardPages/DashboardAdmin.html"><i class="fas fa-user-shield"></i> <span>Dashboard</span></a></li>
                ` : ''}
                <hr class="divider">
                <li><a href="#" id="dynamicLogout"><i class="fas fa-sign-out-alt"></i> <span>Logout</span></a></li>
            </ul>
        </div>
    `;

    // برمجة الفتح والإغلاق
    const icon = document.getElementById("profileIconToggle");
    const menu = document.getElementById("profileDropdownMenu");

    icon.onclick = (e) => {
        e.stopPropagation();
        menu.classList.toggle("active");
    };

    document.getElementById("dynamicLogout").onclick = (e) => {
        e.preventDefault();
        localStorage.removeItem("currentUser");
        location.href = "../AuthPages/Login.html";
    };

    window.addEventListener("click", () => menu.classList.remove("active"));
}