const storageKeys = {
    Users: "users",
    Categories: "categories",
    Products: "products",
    Carts: "carts",
    Orders: "orders",
    Wishlists: "wishlists",
    Ratings: "ratings",
    CurrentUser: "currentUser"
}
// علشان ماحدش يقدر يغير القيم بتاعت الستوريج 
Object.freeze(storageKeys);

function goSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}

function set_Item(key, date) {
    localStorage.setItem(key, JSON.stringify(date));
}

// 
function get_item(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error("Error parsing localStorage key: " + key, e);
        return null;
    }
}
function remove_Item(key) {
    localStorage.removeItem(key);
}

// تخزين المستخدم الحالي في الجلسة
function setUser(user) {
    set_Item(storageKeys.CurrentUser, user);
}
// اللي عامل لوجين 
function getUser() {
    return get_item(storageKeys.CurrentUser);
}

function getCartKey() {
    const user = getUser();
    return user ? `${storageKeys.Carts}_${user.id || user.Id}` : null;
}

function logout() {
    remove_Item(storageKeys.CurrentUser);
    window.location.href = "../../pages/AuthPages/Login.html"
}

function validatePassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(password);
}
function validateName(name) {
    return /^[A-Za-z]{4,}$/.test(name);
} function validateDescription(desc) {
    return /^[A-Za-z]{10,}$/.test(desc);
}
// لو مش موجوده بعملها علشان ميدينيش ايرور 
function initStorage() {
    Object.values(storageKeys).forEach(key => {
        if (!localStorage.getItem(key)) {
            if (key === storageKeys.CurrentUser) {
                localStorage.setItem(key, JSON.stringify(null));
            } else {
                localStorage.setItem(key, JSON.stringify([]));
            }
        }
    });
}
function seedSuperAdmin() {
    const allUsers = get_item(storageKeys.Users);

    const existSuperAdmin = allUsers.some(u => u.role === "superadmin");
    if (!existSuperAdmin) {
        const SuperAdmin = createUser(
            "Super",
            "Admin",
            "superadmin@example.com",
            "Super@123",
            "superadmin"
        );
        allUsers.push(SuperAdmin);
        set_Item(storageKeys.Users, allUsers);
    } else {
        console.log("Super Admin already exists");
    }
}
initStorage();
seedSuperAdmin();


