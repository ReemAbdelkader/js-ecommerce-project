const form = document.getElementById("changePasswordForm");
const emailInput = document.getElementById("email");
const oldPasswordInput = document.getElementById("oldPassword");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");

const oldPasswordError = document.getElementById("oldPasswordError");
const newPasswordError = document.getElementById("newPasswordError");
const confirmPasswordError = document.getElementById("confirmPasswordError");
const messageDiv = document.getElementById("message");

// 1. جلب المستخدم الحالي والتأكد من وجوده
const currentUser = getUser(); // الدالة موجودة في StorgeKeys.js

if (!currentUser) {
    // لو مفيش مستخدم مسجل دخول، حوله لصفحة اللوجن فوراً
    window.location.href = "../../pages/AuthPages/Login.html";
} else {
    // ملء حقل الإيميل تلقائياً
    emailInput.value = currentUser.email;
}

form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearErrors();
    messageDiv.innerHTML = "";

    const oldPassword = oldPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // 2. جلب مصفوفة كل المستخدمين
    const allUsers = get_item(storageKeys.Users) || [];

    // 3. البحث عن المستخدم الحالي داخل مصفوفة كل المستخدمين
    const userIndex = allUsers.findIndex(u => u.id === currentUser.id);
    //لو رجع -1 معناه انه مش موجود  

    if (userIndex === -1) {
        showMessage("User profile not found in database", "danger");
        return;
    }

    // 4. التحقق من كلمة المرور القديمة
    if (allUsers[userIndex].password !== oldPassword) {
        oldPasswordError.textContent = "Old password is incorrect";
        return;
    }

    // 5. التحقق من قوة كلمة المرور الجديدة
    if (!validatePassword(newPassword)) {
        newPasswordError.textContent = "Password must be at least 6 characters, include uppercase, lowercase, number, and symbol.";
        return;
    }

    // 6. التأكد من عدم مطابقة كلمة المرور القديمة بالجديدة (اختياري للأمان)
    if (newPassword === oldPassword) {
        newPasswordError.textContent = "New password cannot be the same as old password";
        return;
    }

    // 7. تطابق كلمة المرور الجديدة مع التأكيد
    if (newPassword !== confirmPassword) {
        confirmPasswordError.textContent = "Passwords do not match";
        return;
    }

    // 8. التحديث في مصفوفة Users وفي CurrentUser
    allUsers[userIndex].password = newPassword;
    currentUser.password = newPassword;

    set_Item(storageKeys.Users, allUsers);
    setUser(currentUser); // تحديث الجلسة الحالية بالباسورد الجديد

    // تعطيل الزرار لمنع الضغط المتكرر
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    showMessage("Password updated successfully! Redirecting...", "success");

    setTimeout(() => {
        window.location.href = "../../pages/AuthPages/Login.html";
    }, 2000);
});

function clearErrors() {
    oldPasswordError.textContent = "";
    newPasswordError.textContent = "";
    confirmPasswordError.textContent = "";
}

function showMessage(text, type) {
    messageDiv.innerHTML = `
        <div class="alert alert-${type} text-center shadow-sm">
            ${text}
        </div>
    `;
}