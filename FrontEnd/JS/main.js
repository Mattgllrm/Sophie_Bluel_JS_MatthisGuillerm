///////////////////////////////////////////////////////////
//                  GESTION DES TRAVAUX                 //
///////////////////////////////////////////////////////////
async function getWorks(filter) {
  document.querySelector(".gallery").innerHTML = "";

  const url = "http://localhost:5678/api/works";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();

    if (filter) {
      const filtered = json.filter((data) => data.category.id === filter);
      for (let i = 0; i < filtered.length; i++) {
        setFigure(filtered[i]);
      }
    } else {
      for (let i = 0; i < json.length; i++) {
        setFigure(json[i]);
      }
    }

    document.querySelector(".gallery-modal").innerHTML = "";
    for (let i = 0; i < json.length; i++) {
      setFigureModal(json[i]);
    }

  } catch (error) {
    console.error(error.message);
  }
}

///////////////////////////////////////////////////////////
//            AJOUT DANS LA GALERIE PRINCIPALE          //
///////////////////////////////////////////////////////////
function setFigure(data) {
  const figure = document.createElement("figure");
  figure.dataset.id = data.id; // pour la suppression plus tard
  figure.innerHTML = `<img src="${data.imageUrl}" alt="${data.title}">
    <figcaption>${data.title}</figcaption>`;
  document.querySelector(".gallery").append(figure); 
}

///////////////////////////////////////////////////////////
//              AJOUT DANS LA MODALE                    //
///////////////////////////////////////////////////////////
function setFigureModal(data) {
  const galleryModal = document.querySelector(".gallery-modal");
  if (!galleryModal) return; // si la modale n'est pas encore créée

  const figure = document.createElement("figure");
  figure.classList.add("modal-figure");
  figure.dataset.id = data.id;

  figure.innerHTML = `
    <img src="${data.imageUrl}" alt="${data.title}">
    <i class="fa-solid fa-trash-can trash-icon"></i>
  `;

  // Suppression au clic sur la trash-can
  const trashIcon = figure.querySelector(".trash-icon");
  trashIcon.addEventListener("click", async () => {
    await deleteWorks(data.id, figure);
  });

  galleryModal.appendChild(figure); 
}

///////////////////////////////////////////////////////////
//                GESTION DES CATEGORIES                //
///////////////////////////////////////////////////////////
async function getCategories() {
  const url = "http://localhost:5678/api/categories";
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Response status: ${response.status}`);

    const json = await response.json();
    for (let i = 0; i < json.length; i++) setFilter(json[i]);
  } catch (error) {
    console.error(error.message);
  }
} 
getCategories(); 

function setFilter(data) {
  const div = document.createElement("div");
  div.className = data.id;
  div.addEventListener("click", () => getWorks(data.id));
  div.innerHTML = `${data.name}`;
  document.querySelector(".div-container").append(div); 
}

document.querySelector(".tous").addEventListener("click", () => getWorks()); 

///////////////////////////////////////////////////////////
//                 MODE ADMINISTRATION                  //
///////////////////////////////////////////////////////////
function displayAdminMode() { 
  const loginBtn = document.querySelector(".login");

  if (sessionStorage.authToken) {
    // Bandeau "Mode édition"
    const editBanner = document.createElement("div");
    editBanner.className = "edit";
    editBanner.innerHTML = '<p><a href="#modal1" class="js-modal"><i class="fa-regular fa-pen-to-square"></i> Mode édition</a></p>';  
    document.body.prepend(editBanner);

    if (loginBtn) {
      loginBtn.textContent = "logout";
      loginBtn.addEventListener("click", () => {
        sessionStorage.removeItem("authToken");
        window.location.href = "login.html";
      });
    }
  }
}

displayAdminMode();

///////////////////////////////////////////////////////////
//                      MODALE (Open/close)                     //
///////////////////////////////////////////////////////////
let modal = null;
const focusableSelector = "button, a, input, textarea";
let focusables = [];
let previouslyFocusableElement = null;

const openModal = function (e) {
  e.preventDefault();
  modal = document.querySelector(e.currentTarget.getAttribute("href"));
  focusables = Array.from(modal.querySelectorAll(focusableSelector));
  previouslyFocusableElement = document.querySelector(":focus");
  modal.style.display = null;
  focusables[0].focus();
  modal.removeAttribute("aria-hidden");
  modal.setAttribute("aria-modal", "true");
  modal.addEventListener("click", closeModal);
  modal.querySelector(".js-modal-close").addEventListener("click", closeModal);
  modal.querySelector(".js-modal-stop").addEventListener("click", stopPropagation);
};

const closeModal = function (e) {
  if (!modal) return;
  if (previouslyFocusableElement) previouslyFocusableElement.focus();
  e.preventDefault();
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  modal.removeAttribute("aria-modal");
  modal.removeEventListener("click", closeModal);
  modal.querySelector(".js-modal-close").removeEventListener("click", closeModal);
  modal.querySelector(".js-modal-stop").removeEventListener("click", stopPropagation);
  modal = null;
};

const stopPropagation = function (e) { e.stopPropagation(); };
const focusModal = function (e) { e.preventDefault(); };

document.querySelectorAll(".js-modal").forEach((a) => a.addEventListener("click", openModal));

window.addEventListener("keydown", function (e) {
  if (e.key === "Escape" || e.key === "Esc") closeModal(e);
  if (e.key === "Tab" && modal !== null) focusModal(e);
});

///////////////////////////////////////////////////////////
//               CREATION DE LA MODALE                  //
///////////////////////////////////////////////////////////
function createModal() {
  const modal = document.createElement("aside");
  modal.id = "modal1";
  modal.className = "modal";
  modal.setAttribute("aria-hidden", "true");
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-labelledby", "titlemodal");
  modal.style.display = "none";

  const wrapper = document.createElement("div");
  wrapper.className = "modal-wrapper js-modal-stop";

  const closeContainer = document.createElement("div");
  closeContainer.className = "close-button-container";

  const closeButton = document.createElement("button");
  closeButton.className = "js-modal-close";
  closeButton.innerHTML = `<i class="fa-solid fa-xmark"></i>`;

  closeContainer.appendChild(closeButton);
  wrapper.appendChild(closeContainer);

  const title = document.createElement("h3");
  title.textContent = "Galerie photo";
  wrapper.appendChild(title);

  const galleryModal = document.createElement("div");
  galleryModal.className = "gallery-modal";
  wrapper.appendChild(galleryModal);

  const hr = document.createElement("hr");
  wrapper.appendChild(hr);

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "modal-button-container";

  const addButton = document.createElement("button");
  addButton.className = "add-photo-button";
  addButton.textContent = "Ajouter une photo";

  buttonContainer.appendChild(addButton);
  wrapper.appendChild(buttonContainer);

  modal.appendChild(wrapper);
  document.body.appendChild(modal);

  closeButton.addEventListener("click", () => {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
  });
}

// crée la modale avant de charger les travaux
createModal();
getWorks();

///////////////////////////////////////////////////////////
//         OUVRIR LA MODALE AVEC "MODIFIER"             //
///////////////////////////////////////////////////////////
function addEditProjectButton() {
  if (sessionStorage.authToken) {
    const portfolioSection = document.querySelector("#portfolio");
    const h2 = portfolioSection.querySelector("h2"); 

    const editDiv = document.createElement("div");
    editDiv.className = "edit-project";
    editDiv.appendChild(h2);

    const editLink = document.createElement("a");
    editLink.href = "#modal1";
    editLink.className = "js-modal";
    editLink.innerHTML = `<i class="fa-regular fa-pen-to-square"></i> Modifier`;
    editLink.addEventListener("click", openModal);

    editDiv.appendChild(editLink);
    portfolioSection.prepend(editDiv);
  }
}

addEditProjectButton();

///////////////////////////////////////////////////////////
//         SUPPRESSION DES TRAVAUX                      //
///////////////////////////////////////////////////////////
const deleteApi = "http://localhost:5678/api/works/";

async function deleteWorks(id, figureElement) {
  const token = sessionStorage.getItem("authToken");

  try {
    const response = await fetch(deleteApi + id, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      figureElement.remove(); // supprime dans la modale
      const galleryFigure = document.querySelector(`.gallery figure[data-id="${id}"]`);
      if (galleryFigure) galleryFigure.remove(); // supprime dans la galerie principale
      console.log(`Projet ${id} supprimé avec succès`);
    } else {
      console.error("Erreur lors de la suppression :", response.status);
    }
  } catch (error) {
    console.error("Erreur réseau :", error);
  }
}

///////////////////////////////////////////////////////////
//         Deuxième Modal                               //
/////////////////////////////////////////////////////////// 

const addPictureButton = document.querySelector(".add-photo-button")

