function createUser(firstName, lastName, email, password, role = "user") {
    return {
        id: crypto.randomUUID(),
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        role: role,
        createdAt: new Date().toISOString()
    };
}

function createAdmin(firstName, lastName, email, password) {
    return createUser(firstName, lastName, email, password, "admin");
}