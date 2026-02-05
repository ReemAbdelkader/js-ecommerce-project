const form = document.getElementById("formPasswordForm");

const emailInput = document.getElementById("email");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");

const emailError = document.getElementById("emailError");
const newPasswordError = document.getElementById("newPasswordError");
const confirmPasswordError = document.getElementById("confirmPasswordError");

const messageDiv = document.getElementById("message");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    // 1. تنظيف أي أخطاء أو رسائل سابقة
    clearErrors();
    messageDiv.innerHTML = "";

    const email = emailInput.value.trim();
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // 2. جلب جميع المستخدمين
    const allUsers = get_item(storageKeys.Users) || [];

    // 3. البحث عن المستخدم بالإيميل
    const userIndex = allUsers.findIndex(user => user.email === email);

    // --- التحققات (Validation) ---

    // التأكد من وجود الإيميل
    if (userIndex === -1) {
        emailError.textContent = "This email is not registered in our store.";
        return;
    }

    // حماية الـ Super Admin من تغيير الباسورد من هنا
    if (allUsers[userIndex].role === "superadmin") {
        emailError.textContent = "Security restricted: Super Admin password cannot be reset here.";
        return;
    }

    // التحقق من قوة كلمة المرور الجديدة (باستخدام الدالة الموجودة في StorgeKeys)
    if (!validatePassword(newPassword)) {
        newPasswordError.textContent =
            "Password must be at least 6 characters, include uppercase, lowercase, number, and symbol.";
        return;
    }

    // التأكد من تطابق كلمتي المرور
    if (newPassword !== confirmPassword) {
        confirmPasswordError.textContent = "Passwords do not match!";
        return;
    }

    // 4. تحديث كلمة المرور في المصفوفة وحفظها
    allUsers[userIndex].password = newPassword;
    set_Item(storageKeys.Users, allUsers);

    // 5. تعطيل زر الإرسال لمنع الضغط المتكرر أثناء التوجيه
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    // 6. إظهار رسالة النجاح والتوجيه لصفحة اللوجن
    showMessage("Password updated successfully! Redirecting to login...", "success");
    form.reset();
});

/**
 * دالة لتنظيف رسائل الخطأ من الواجهة
 */
function clearErrors() {
    emailError.textContent = "";
    newPasswordError.textContent = "";
    confirmPasswordError.textContent = "";
}

/**
 * دالة لإظهار رسالة نجاح أو فشل والتوجيه التلقائي
 */
function showMessage(text, type) {
    messageDiv.innerHTML = `
        <div class="alert alert-${type} text-center shadow-sm">
            ${text}
        </div>
    `;

    setTimeout(() => {
        window.location.href = "../../pages/AuthPages/Login.html";
    }, 2000);
}