// --- 1. حماية الصفحة (Access Control) ---
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


// --- 2. العناصر الأساسية ---
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("toggleBtn");
const toggleIcon = document.getElementById("toggleIcon");
const tbody = document.getElementById("tbody");

// عناصر الإضافة
const categoryName = document.getElementById("catName");
const categoryDescription = document.getElementById("catDescription");
const productsNumber = document.getElementById("productsNumber");
const catSlugInput = document.getElementById("catSlug");
const saveNewCategoryBtn = document.getElementById("saveNewCategory");

// عناصر التعديل
const editCategoryName = document.getElementById("editCatName");
const editCategoryDescription = document.getElementById("editCatDescription");
const editProductsNumber = document.getElementById("editProductsNumber");
const updateCategoryBtn = document.getElementById("updateCategoryBtn");

let categoryData = [];
let globalIndex = null;
const API_URL = "https://retoolapi.dev/HPpuPd/category";

// --- 3. التحكم في السايد بار ---
toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle(window.innerWidth <= 991 ? "mobile-open" : "collapsed");
    toggleIcon.classList.toggle("fa-xmark");
    toggleIcon.classList.toggle("fa-bars");
});

// --- 4. التحققات (Validation) ---
function validateName(input, errorEl) {
    const regex = /^[A-Za-z0-9\s]{4,}$/; // سمحنا بالأرقام عشان أسماء الماركات
    if (!regex.test(input.value.trim())) {
        errorEl.textContent = "Min 4 characters required (Letters/Numbers).";
        return false;
    }
    errorEl.textContent = "";
    return true;
}

function validateDescription(input, errorEl) {
    if (input.value.trim().length < 10) {
        errorEl.textContent = "Description must be at least 10 characters.";
        return false;
    }
    errorEl.textContent = "";
    return true;
}

// تحديث الـ Slug تلقائياً
categoryName.addEventListener("input", () => {
    catSlugInput.value = categoryName.value.toLowerCase().trim().replace(/\s+/g, "-");
});

// --- 5. التعامل مع البيانات (API) ---
async function getCategories() {
    try {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center">Loading...</td></tr>`;
        const res = await fetch(API_URL);
        categoryData = await res.json();
        displayCategories(categoryData);
    } catch (error) {
        ShowMessage("Error fetching categories", "danger");
    }
}

function displayCategories(data) {
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center">No categories found.</td></tr>`;
        return;
    }
    let num = 1;
    tbody.innerHTML = data.map((cat, i) => `
        <tr>
            <td>${num++}</td>
            <td class="fw-bold">${cat.Name}</td>
            <td>${cat.Description}</td>
            <td>
                <button class="btn btn-sm btn-primary me-1" data-bs-toggle="modal" 
                        data-bs-target="#editCategoryModal" onclick="editCategory('${cat.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCategory('${cat.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join("");
}

// --- 6. إضافة كاتيجوري جديدة ---
saveNewCategoryBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const nameErr = document.getElementById("categoryNameError");
    const descErr = document.getElementById("categoryDescriptionError");

    if (!validateName(categoryName, nameErr) || !validateDescription(categoryDescription, descErr)) return;

    const newCategory = {
        Name: categoryName.value.trim(),
        Description: categoryDescription.value.trim(),
        countOfProduct: Number(productsNumber.value) || 0,
        Slug: catSlugInput.value
    };

    try {
        saveNewCategoryBtn.disabled = true;
        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newCategory)
        });

        ShowMessage("Category Added Successfully");
        const modal = bootstrap.Modal.getInstance(document.getElementById('categoryModal'));
        modal.hide();
        document.getElementById("addCategoryForm").reset();
        getCategories();
    } catch (error) {
        ShowMessage("Failed to add category", "danger");
    } finally {
        saveNewCategoryBtn.disabled = false;
    }
});

// --- 7. التعديل والحذف ---
function editCategory(id) {

    const cat = categoryData.find(c => c.id == id);
    if (!cat) return;


    editCategoryName.value = cat.Name;
    editCategoryDescription.value = cat.Description;
    editProductsNumber.value = cat.countOfProduct;
    globalIndex = id;

}

updateCategoryBtn.addEventListener("click", async () => {
    const nameErr = document.getElementById("editCategoryNameError");
    const descErr = document.getElementById("editCategoryDescriptionError");
    if (!validateName(editCategoryName, nameErr) || !validateDescription(editCategoryDescription, descErr)) return;

    const updated = {
        Name: editCategoryName.value.trim(),
        Description: editCategoryDescription.value.trim(),
        countOfProduct: Number(editProductsNumber.value) || 0,
        Slug: editCategoryName.value.toLowerCase().replace(/\s+/g, "-")
    };

    try {
        await fetch(`${API_URL}/${globalIndex}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated)
        });
        ShowMessage("Category Updated Successfully");
        bootstrap.Modal.getInstance(document.getElementById('editCategoryModal')).hide();
        getCategories();
    } catch (error) {
        ShowMessage("Update failed", "danger");
    }
});

async function deleteCategory(id) {
    const cat = categoryData.find(c => c.id == id);
    if (cat && cat.countOfProduct > 0) {
        ShowMessage(`Cannot delete: This category contains ${cat.countOfProduct} products`, "warning");
        return;
    }

    if (confirm("Are you sure you want to delete this category?")) {
        try {
            await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            ShowMessage("Category Deleted");
            getCategories();
        } catch (error) {
            ShowMessage("Delete failed", "danger");
        }
    }
}

// مرافئ عامة
function ShowMessage(msg, type = "success") {
    const alertDiv = document.getElementById("alert");
    alertDiv.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${msg}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    setTimeout(() => alertDiv.innerHTML = "", 3000);
}

// تشغيل عند التحميل
getCategories();