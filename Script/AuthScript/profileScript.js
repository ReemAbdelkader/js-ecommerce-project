
const user = JSON.parse(localStorage.getItem("CurrentUser"));

if (!user) {
    console.log("No user is currently logged in.");
}


document.getElementById("profileName").textContent = user.name;
document.getElementById("profileEmail").textContent = user.email;
document.getElementById("profileRole").textContent = user.role;
document.getElementById("profilePic").src = user.profilePic || "default-avatar.png";

