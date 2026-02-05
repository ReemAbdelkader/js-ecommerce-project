const form = document.getElementById('rgisterAdmin');
const message = document.getElementById('message');
const viewUserBtn = document.getElementById('viewUsers');
const viewAdminBtn = document.getElementById('viewAdmin');
const usersTable = document.getElementById("usersTable");
const adminsTable = document.getElementById("adminsTable");
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("toggleBtn");
const toggleIcon = document.getElementById("toggleIcon");

// --- 1. حماية الصفحة (Security Check) ---
const currentUser = getUser();
if (!currentUser || currentUser.role !== "superadmin") {
    alert("Access Denied! Redirecting to login...");
    window.location.href = "../../pages/AuthPages/Login.html";
}

// --- 2. التحكم في السايد بار ---
toggleBtn.addEventListener("click", () => {
    if (window.innerWidth <= 991) {
        sidebar.classList.toggle("mobile-open");
        toggleIcon.classList.toggle("fa-bars");
        toggleIcon.classList.toggle("fa-xmark");
    } else {
        sidebar.classList.toggle("collapsed");
        toggleIcon.classList.toggle("fa-bars");
        toggleIcon.classList.toggle("fa-xmark");
    }
});

// --- 3. تسجيل أدمن جديد ---
form.addEventListener('submit', function (e) {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const repeatPassword = document.getElementById('repeatPassword').value;

    // Reset Errors
    document.querySelectorAll('.text-danger').forEach(span => span.textContent = "");

    let isValid = true;

    if (!validateName(firstName)) {
        document.getElementById("firstNameError").textContent = "First name must be at least 4 letters.";
        isValid = false;
    }
    if (!validateName(lastName)) {
        document.getElementById("lastNameError").textContent = "Last name must be at least 4 letters.";
        isValid = false;
    }
    if (!validatePassword(password)) {
        document.getElementById("passwordError").textContent = "Weak password!";
        isValid = false;
    }
    if (password !== repeatPassword) {
        document.getElementById("repeatPasswordError").textContent = "Passwords do not match!";
        isValid = false;
    }

    if (!isValid) return;

    const allUsers = get_item(storageKeys.Users) || [];

    if (allUsers.some(user => user.email === email)) {
        document.getElementById("emailError").textContent = "This email already exists!";
        return;
    }

    // إنشاء الأدمن الجديد
    const newAdmin = createAdmin(firstName, lastName, email, password);
    allUsers.push(newAdmin);
    set_Item(storageKeys.Users, allUsers);

    message.innerHTML = '<div class="alert alert-success">Admin created successfully!</div>';
    form.reset();

    // تحديث جدول الأدمن لو كان مفتوح
    if (adminsTable.style.display === "table") fillAdminsTable();
});

// --- 4. عرض وتبديل الجداول ---
viewUserBtn.addEventListener("click", () => {
    adminsTable.style.display = "none";
    usersTable.style.display = usersTable.style.display === "table" ? "none" : "table";
    if (usersTable.style.display === "table") fillUsersTable();
});

viewAdminBtn.addEventListener("click", () => {
    usersTable.style.display = "none";
    adminsTable.style.display = adminsTable.style.display === "table" ? "none" : "table";
    if (adminsTable.style.display === "table") fillAdminsTable();
});

// --- 5. ملء الجداول ووظائف الحذف ---
function fillUsersTable() {
    const users = (get_item(storageKeys.Users) || []).filter(u => u.role === "user");
    const tbody = document.getElementById("usersBody");
    tbody.innerHTML = users.length ? "" : '<tr><td colspan="4" class="text-center">No users found</td></tr>';

    users.forEach(u => {
        tbody.innerHTML += `
            <tr>
                <td>${u.firstName}</td>
                <td>${u.lastName}</td>
                <td>${u.email}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="confirmDelete('${u.id}', 'user')">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </td>
            </tr>`;
    });
}

function fillAdminsTable() {
    const admins = (get_item(storageKeys.Users) || []).filter(u => u.role === "admin");
    const tbody = document.getElementById("adminsBody");
    tbody.innerHTML = admins.length ? "" : '<tr><td colspan="4" class="text-center">No admins found</td></tr>';

    admins.forEach(a => {
        tbody.innerHTML += `
            <tr>
                <td>${a.firstName}</td>
                <td>${a.lastName}</td>
                <td>${a.email}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="confirmDelete('${a.id}', 'admin')">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </td>
            </tr>`;
    });
}

// --- 6. وظيفة الحذف الموحدة ---
window.confirmDelete = function (id, type) {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
        let allUsers = get_item(storageKeys.Users) || [];
        allUsers = allUsers.filter(u => u.id !== id);
        set_Item(storageKeys.Users, allUsers);

        if (type === 'admin') fillAdminsTable();
        else fillUsersTable();
    }
};