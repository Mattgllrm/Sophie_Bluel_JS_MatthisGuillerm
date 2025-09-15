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
  if (!galleryModal) return;

  const figure = document.createElement("figure");
  figure.classList.add("modal-figure");
  figure.dataset.id = data.id;

  figure.innerHTML = `
    <img src="${data.imageUrl}" alt="${data.title}">
    <i class="fa-solid fa-trash-can trash-icon"></i>
  `;

  const trashIcon = figure.querySelector(".trash-icon");
  trashIcon.addEventListener("click", async (event) => {
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
  // Crée la modale
  const modal = document.createElement("aside");
  modal.id = "modal1";
  modal.className = "modal";
  modal.setAttribute("aria-hidden", "true");
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-labelledby", "titlemodal");
  modal.style.display = "none";

  // Wrapper principal
  const wrapper = document.createElement("div");
  wrapper.className = "modal-wrapper js-modal-stop";
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.justifyContent = "space-between";
  wrapper.style.height = "688px"; // ou max-height selon ton CSS
  wrapper.style.padding = "20px";
  wrapper.style.backgroundColor = "white";

  // Bouton de fermeture
  const closeContainer = document.createElement("div");
  closeContainer.className = "close-button-container";

  const closeButton = document.createElement("button");
  closeButton.className = "js-modal-close";
  closeButton.innerHTML = `<i class="fa-solid fa-xmark"></i>`;

  closeContainer.appendChild(closeButton);
  wrapper.appendChild(closeContainer);

  // Titre
  const title = document.createElement("h3");
  title.textContent = "Galerie photo";
  wrapper.appendChild(title);

  // Galerie
  const galleryModal = document.createElement("div");
  galleryModal.className = "gallery-modal";
  galleryModal.style.flexGrow = "1";       // prend tout l'espace restant
  galleryModal.style.overflowY = "auto";   // scroll si trop d'images
  wrapper.appendChild(galleryModal);

  // Footer fixe (hr + bouton)
  const modalFooter = document.createElement("div");
  modalFooter.className = "modal-footer";
  modalFooter.style.display = "flex";
  modalFooter.style.flexDirection = "column";
  modalFooter.style.alignItems = "center";

  const hr = document.createElement("hr");
  modalFooter.appendChild(hr);

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "modal-button-container";

  const addButton = document.createElement("button");
  addButton.className = "add-photo-button";
  addButton.textContent = "Ajouter une photo";

  buttonContainer.appendChild(addButton);
  modalFooter.appendChild(buttonContainer);

  wrapper.appendChild(modalFooter);

  // Ajoute le wrapper à la modale
  modal.appendChild(wrapper);
  document.body.appendChild(modal);

  // Gestion ouverture/fermeture
  addButton.addEventListener("click", () => {
    document.querySelector("#modal2").style.display = "flex"; // ouvre modale 2
    document.querySelector("#modal2").setAttribute("aria-hidden", "false");
  });

  closeButton.addEventListener("click", () => {
    document.querySelectorAll(".modal").forEach(m => {
      m.style.display = "none";
      m.setAttribute("aria-hidden", "true");
    });
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      document.querySelectorAll(".modal").forEach(m => {
        m.style.display = "none";
        m.setAttribute("aria-hidden", "true");
      });
    }
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

function createSecondModal() {
  const modal = document.createElement("aside");
  modal.id = "modal2";
  modal.className = "modal add-photo-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-labelledby", "titlemodal2");
  modal.style.display = "none";

  const wrapper = document.createElement("div");
  wrapper.className = "modal-wrapper js-modal-stop";

  // Top buttons
  const topButtons = document.createElement("div");
  topButtons.className = "modal-top-buttons";

  const backButton = document.createElement("button");
  backButton.className = "js-modal-back";
  backButton.innerHTML = `<i class="fa-solid fa-arrow-left"></i>`;

  const closeButton = document.createElement("button");
  closeButton.className = "js-modal-close";
  closeButton.innerHTML = `<i class="fa-solid fa-xmark"></i>`;

  topButtons.appendChild(backButton);
  topButtons.appendChild(closeButton);
  wrapper.appendChild(topButtons);

  // Title
  const title = document.createElement("h3");
  title.textContent = "Ajout photo";
  wrapper.appendChild(title);

  // =============================
  // Conteneur bleu clair + input
  // =============================
  const fileContainer = document.createElement("div");
  fileContainer.className = "modal-file-container";

  const fileIcon = document.createElement("div");
  fileIcon.className = "modal-file-icon";
  fileIcon.innerHTML = `<i class="fa-regular fa-image"></i>`;
  fileContainer.appendChild(fileIcon);

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.name = "photo";
  fileInput.id = "photo";
  fileInput.className = "modal-file-input";
  fileContainer.appendChild(fileInput);

  const fileLabel = document.createElement("label");
  fileLabel.setAttribute("for", "photo");
  fileLabel.className = "modal-file-label";
  fileLabel.textContent = "+ Ajouter photo";
  fileContainer.appendChild(fileLabel);

  const fileText = document.createElement("p");
  fileText.className = "modal-file-text";
  fileText.textContent = "jpg, png : 4mo max";
  fileContainer.appendChild(fileText);

  wrapper.appendChild(fileContainer);

  // Formulaire
  const form = document.createElement("form");
  form.className = "modal-form";
  form.action = "#";
  form.method = "post";

  // Bloc titre
  const titleBlock = document.createElement("div");
  const labelTitle = document.createElement("label");
  labelTitle.setAttribute("for", "title");
  labelTitle.textContent = "Titre";
  labelTitle.classList.add("modal-label");
  const inputTitle = document.createElement("input");
  inputTitle.type = "text";
  inputTitle.name = "title";
  inputTitle.id = "title";
  titleBlock.appendChild(labelTitle);
  titleBlock.appendChild(inputTitle);
  form.appendChild(titleBlock);


  // Bloc catégorie avec select
const categoryBlock = document.createElement("div");
categoryBlock.className = "modal-form-block"; // applique le même style que les autres blocs

// Label
const labelCategory = document.createElement("label");
labelCategory.setAttribute("for", "category");
labelCategory.textContent = "Catégorie";
labelCategory.className = "modal-label";

// Select
const selectCategory = document.createElement("select");
selectCategory.name = "category";
selectCategory.id = "category";
selectCategory.className = "modal-form-input"; 

// Options
const categories = ["", "Objets", "Appartements", "Hôtel et Restaurants"];
categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.toLowerCase().replace(/\s+/g, '-'); // objets, appart, hotel et restau
    option.textContent = cat;
    selectCategory.appendChild(option);
});

categoryBlock.appendChild(labelCategory);
categoryBlock.appendChild(selectCategory);
form.appendChild(categoryBlock);

wrapper.appendChild(form);


  // HR + bouton valider
  const hr = document.createElement("hr");
  wrapper.appendChild(hr);

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "modal-button-container";
  const validateButton = document.createElement("button");
  validateButton.className = "add-photo-button";
  validateButton.textContent = "Valider";
  buttonContainer.appendChild(validateButton);
  wrapper.appendChild(buttonContainer);

  modal.appendChild(wrapper);
  document.body.appendChild(modal);

  // =============================
  // JS ouverture/fermeture
  // =============================
  validateButton.addEventListener("click", (e) => {
    e.preventDefault(); // empêche le submit
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
  });

  // CROIX : ferme toutes les modales
  closeButton.addEventListener("click", () => {
    document.querySelectorAll(".modal").forEach(m => {
      m.style.display = "none";
      m.setAttribute("aria-hidden", "true");
    });
  });

  // FLECHE : retourne à la modale 1
  backButton.addEventListener("click", () => {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    const modal1 = document.getElementById("modal1");
    if (modal1) {
      modal1.style.display = "flex";
      modal1.setAttribute("aria-hidden", "false");
    }
  });

  // CLIC SUR FOND : ferme toutes les modales
  modal.addEventListener("click", e => {
    if (e.target === modal) {
      document.querySelectorAll(".modal").forEach(m => {
        m.style.display = "none";
        m.setAttribute("aria-hidden", "true");
      });
    }
  });
}

createSecondModal();



 // ajout de la preview  

 // Sélection de l'input et du conteneur pour l'image
const fileInputEl = document.getElementById("photo");

fileInputEl.addEventListener("change", (event) => {
    const file = event.target.files[0]; // le fichier choisi
    if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            // Vérifie s'il y a déjà un aperçu et le supprime
            const existingPreview = document.querySelector(".modal-image-preview");
            if (existingPreview) existingPreview.remove();

            // Crée l'image
            const img = document.createElement("img");
            img.src = e.target.result;
            img.className = "modal-image-preview";
            img.style.maxWidth = "100%";
            img.style.maxHeight = "180px";
            img.style.marginTop = "10px";

            // Ajoute l'image dans le conteneur bleu clair
            const container = document.querySelector(".modal-file-container");
            container.appendChild(img);
        };

        reader.readAsDataURL(file); // lit le fichier pour l'afficher
    }
});

fileInputEl.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const container = document.querySelector(".modal-file-container");

            // Cacher l'icône, le label et le texte
            container.querySelectorAll(".modal-file-icon, .modal-file-label, .modal-file-text").forEach(el => {
                el.style.display = "none";
            });

            // Supprimer l'ancien preview si présent
            const existingPreview = container.querySelector(".modal-image-preview");
            if (existingPreview) existingPreview.remove();

            // Crée l'image preview
            const img = document.createElement("img");
            img.src = e.target.result;
            img.className = "modal-image-preview";
            img.style.maxWidth = "100%";
            img.style.maxHeight = "180px";
            img.style.marginTop = "10px";

            container.appendChild(img);
        };

        reader.readAsDataURL(file);
    }
}); 








