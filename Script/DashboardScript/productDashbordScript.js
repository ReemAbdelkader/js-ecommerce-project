
const currentUser = getUser();
if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "superadmin")) {
    alert("Access Denied!");
    window.location.href = "../../pages/AuthPages/Login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    const superAdminLink = document.getElementById("superAdminLink");
    if (currentUser.role === "superadmin") {
        superAdminLink.classList.remove("d-none");
    }
})
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


const productsTableBody = document.getElementById("tbody");
const addProductForm = document.getElementById("addCategoryForm");
const saveNewProductBtn = document.getElementById("saveNewProduct");
const updateProductBtn = document.getElementById("updateCategoryBtn");

// عملت فيتش علي نفس الapi بتاع ريم علشان الداتا تكون موحده وبعتو للسيلكت 
async function loadCategories() {
    const addSelect = document.getElementById("productCategory");
    const editSelect = document.getElementById("editproductCategory");

    try {
        const response = await fetch("https://retoolapi.dev/HPpuPd/category");
        const categories = await response.json();

        const options = categories.map(cat =>
            `<option value="${cat.Name}">${cat.Name}</option>`
        ).join("");

        const placeholder = `<option value="" disabled selected>Select a category</option>`;
        addSelect.innerHTML = placeholder + options;
        editSelect.innerHTML = placeholder + options;
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

// --- 4. معالجة إضافة منتج جديد ---
saveNewProductBtn?.addEventListener("click", async () => {
    // التحققات (Validation)
    if (!validateProductInputs("add")) return;
    //هلشان اعرف اخزن الصوره ف اللوكال استورج لازم اقراها ك Data URL
    const file = document.getElementById("productImage").files[0];
    const reader = new FileReader();

    reader.onload = () => {
        const newProduct = {
            id: crypto.randomUUID(),
            name: document.getElementById("productName").value.trim(),
            category: document.getElementById("productCategory").value,
            description: document.getElementById("productDescription").value.trim(),
            price: parseFloat(document.getElementById("productPrice").value),
            stock: parseInt(document.getElementById("productStock").value),
            image: reader.result // Base64 string
        };

        const products = JSON.parse(localStorage.getItem("products")) || [];
        products.push(newProduct);
        localStorage.setItem("products", JSON.stringify(products));

        ShowMessage("Product added successfully", "success");
        bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
        addProductForm.reset();
        fillTableWithProducts();
    };
    reader.readAsDataURL(file);
});

// --- 5. عرض المنتجات في الجدول ---
function fillTableWithProducts() {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    productsTableBody.innerHTML = products.map((product, index) => `
        <tr>
            <td class="text-center">${index + 1}</td>
            <td class="fw-bold">${product.name}</td>
            <td><span class="badge bg-secondary">${product.category}</span></td>
            <td class="text-truncate" style="max-width: 150px;">${product.description}</td>
            <td class="text-center">
                <img src="${product.image}" alt="img" width="50" height="50" style="object-fit: cover; border-radius: 5px;">
            </td>
            <td class="text-success fw-bold">$${product.price}</td>
            <td class="text-center">${product.stock}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-warning me-1" onclick="editProduct('${product.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join("");
}

// --- 6. التعديل والحذف ---
let currentEditId = null;

function editProduct(id) {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const product = products.find(p => p.id === id);
    if (!product) return;

    currentEditId = id;
    document.getElementById("editproductName").value = product.name;
    document.getElementById("editproductCategory").value = product.category;
    document.getElementById("editproductDescription").value = product.description;
    document.getElementById("editproductPrice").value = product.price;
    document.getElementById("editproductStock").value = product.stock;

    new bootstrap.Modal(document.getElementById("editProductModal")).show();
}
// تعديل البيانات مع امكانية تغيير الصورة
updateProductBtn.addEventListener("click", () => {
    if (!validateProductInputs("edit")) return;

    let products = JSON.parse(localStorage.getItem("products")) || [];
    const index = products.findIndex(p => p.id === currentEditId);

    const fileInput = document.getElementById("editproductImage");

    const updateData = () => {
        products[index].name = document.getElementById("editproductName").value.trim();
        products[index].category = document.getElementById("editproductCategory").value;
        products[index].description = document.getElementById("editproductDescription").value.trim();
        products[index].price = parseFloat(document.getElementById("editproductPrice").value);
        products[index].stock = parseInt(document.getElementById("editproductStock").value);

        localStorage.setItem("products", JSON.stringify(products));
        ShowMessage("Product updated successfully", "success");
        bootstrap.Modal.getInstance(document.getElementById('editproductModal')).hide();
        fillTableWithProducts();
    };

    if (fileInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = () => {
            products[index].image = reader.result;
            updateData();
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        updateData();
    }
});

function deleteProduct(id) {
    if (confirm("Are you sure you want to delete this product?")) {
        let products = JSON.parse(localStorage.getItem("products")) || [];
        products = products.filter(p => p.id !== id);
        localStorage.setItem("products", JSON.stringify(products));
        fillTableWithProducts();
        ShowMessage("Product deleted", "danger");
    }
}

// لو الموودادد البريفكش هيبقي فاضي فيروح يشيك علي عناصرالادد زي البروكت نيم مثلا لو اديت هيروح يدور ف العناصر الاديت زي اديت برودكت نيم 
function validateProductInputs(mode) {
    const prefix = mode === "add" ? "" : "edit";
    const name = document.getElementById(`${prefix}productName`);
    const price = document.getElementById(`${prefix}productPrice`);
    const category = document.getElementById(`${prefix}productCategory`);
    const image = document.getElementById(`${prefix}productImage`);
    const description = document.getElementById(`${prefix}productDescription`);
    const stock = document.getElementById(`${prefix}productStock`);


    if (name.value.length < 4) { alert("Name too short"); return false; }
    if (!category.value) { alert("Select a category"); return false; }
    if (description.value.length < 10) { alert("Description too short"); return false; }
    if (parseFloat(price.value) <= 0 || isNaN(parseFloat(price.value))) { alert("Invalid price"); return false; }
    if (stock.value === "" || parseInt(stock.value) < 0) { alert("Invalid stock value"); return false; }
    if (mode === "add" && image.files.length === 0) { alert("Image required"); return false; }

    return true;
}


document.addEventListener("DOMContentLoaded", () => {
    loadCategories();
    fillTableWithProducts();
});