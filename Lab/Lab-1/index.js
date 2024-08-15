document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const username = document.getElementById("username");
    const password = document.getElementById("password");

    const validUsername = "Anchit";
    const validPassword = "zxcvbnm";

    form.addEventListener("submit", (event) => {
        // Check whether entered or not
        let isValid = true;
        if (username.value.trim() === "") {
            alert("UserID is required.");
            isValid = false;
        }
        else if (username.value.trim() !== validUsername) {
            alert("Invalid UserID");
            isValid = false;
        }

        if (password.value.trim() === "") {
            alert("Password is required.");
            isValid = false;
        }
        else if (password.value.trim() !== validPassword) {
            alert("Invalid Password");
            isValid = false;
        }

        if (!isValid) {
            event.preventDefault();
        }
    });
});
