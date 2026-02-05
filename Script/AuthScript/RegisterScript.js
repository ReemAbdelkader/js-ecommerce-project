
const form = document.getElementById('registrationForm');
const message = document.getElementById('message');

function validateName(name) {
    return /^[A-Za-z]{4,}$/.test(name);
}



form.addEventListener('submit', function (e) {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const repeatPassword = document.getElementById('repeatPassword').value;
    const firstNameError = document.getElementById("firstNameError")
    const lastNameError = document.getElementById("lastNameError")
    const emailError = document.getElementById("emailError")
    const passwordError = document.getElementById("passwordError")
    const repeatPasswordError = document.getElementById("repeatPasswordError")

    if (!validateName(firstName)) {
        firstNameError.textContent = "First name must be at least 4 letters and contain only letters.";
        return;
    } else {
        firstNameError.textContent = "";
    }

    if (!validateName(lastName)) {
        lastNameError.textContent = "last name must be at least 4 letters and contain only letters.";
        return;
    } else {
        lastNameError.textContent = "";
    }

    if (!validatePassword(password)) {
        passwordError.textContent = "Password must be at least 6 characters, include uppercase, lowercase, number, and symbol.";
        return;
    } else {
        passwordError.textContent = "";
    }
    if (password !== repeatPassword) {
        repeatPasswordError.textContent = "Passwords do not match!";
        return;
    } else {
        repeatPasswordError.textContent = "";
    }

    const users = get_item(storageKeys.Users) || [];

    const emailExists = users.some(user => user.email === email);

    if (emailExists) {
        emailError.textContent = "sorry , this email already exist !"
        return;
    } else {
        emailError.textContent = "";
    }

    const newUser = createUser(firstName, lastName, email, password, "user");

    users.push(newUser);
    set_Item(storageKeys.Users, users);
    setUser(newUser);

    message.innerHTML = '<div class="alert alert-success">Registration successful!</div>';
    setTimeout(() => {
        window.location.href = "../../pages/AuthPages/Login.html";
    }, 2000);
    form.reset();
});

