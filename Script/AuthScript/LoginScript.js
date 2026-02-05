const form = document.getElementById('loginForm');
const message = document.getElementById('message');

form.addEventListener("submit", (e) => {
    message.innerHTML = "";
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        message.innerHTML = `<div class="alert alert-danger">Email and password are required</div>`;
        return;
    }

    const allUsers = get_item(storageKeys.Users) || [];

    const existUser = allUsers.find(u => u.email === email);

    if (!existUser || existUser.password !== password) {
        message.innerHTML = `<div class="alert alert-danger">Email or password incorrect!</div>`;
        return;
    }

    setUser(existUser);

    message.innerHTML = `<div class="alert alert-success">Login successful! Redirecting...</div>`;

    setTimeout(() => {
        if (existUser.role === "superadmin") {
            window.location.href = "../../pages/DashboardPages/addNewAdminBySuperAdmin.html";
        } else if (existUser.role === "admin") {
            window.location.href = "../../pages/DashboardPages/DashboardAdmin.html";
        } else {
            window.location.href = "../../pages/userPage/product.html";
        }
    }, 1500);
});
