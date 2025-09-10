const loginApi = "http://localhost:5678/api/users/login"; 

document.getElementById("loginform").addEventListener("submit", handleSubmit);

async function handleSubmit(event) {
  event.preventDefault(); 

  let user = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
  };

  let response = await fetch(loginApi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
  
  
const oldError = document.querySelector(".error-login");
if (oldError) {
  oldError.remove();
}
  if (response.status != 200) {
    const errorBox = document.createElement("div");
    errorBox.className = "error-login";
    errorBox.innerHTML = "Veuillez vérifier votre email et/ou votre mot de passe";
    document.querySelector("form").prepend(errorBox);
  } else {
    let result = await response.json();
    const token = result.token;
    sessionStorage.setItem("authToken", token);
    window.location.href = "/Portfolio-architecte-sophie-bluel/FrontEnd/index.html";               // rajouté le chemin exact
  }
}