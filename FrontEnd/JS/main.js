///////////////////////////////////////////////////////////
//  (no HTML Brut)    CREATION DYNAMIQUE DES CONTENEURS //
///////////////////////////////////////////////////////////
function createPortfolioExtras() {
  const sectionPortfolio = document.querySelector("#portfolio");

  // Div filtres
  const divFilters = document.createElement("div");
  divFilters.className = "div-container";
  sectionPortfolio.appendChild(divFilters);

  // Div galerie principale
  const gallery = document.createElement("div");
  gallery.className = "gallery";
  sectionPortfolio.appendChild(gallery);
}

createPortfolioExtras();
///////////////////////////////////////////////////////////
//            (no HTML Brut)     TRANSFORMATION HEADER  //
///////////////////////////////////////////////////////////

function transformHeaderLinks() {
  const header = document.querySelector("header nav ul");
  header.innerHTML = ""; 

  const liProjects = document.createElement("li");
  const aProjects = document.createElement("a");
  aProjects.href = "#portfolio";
  aProjects.textContent = "projets";
  liProjects.appendChild(aProjects);
  header.appendChild(liProjects);

  const liContact = document.createElement("li");
  const aContact = document.createElement("a");
  aContact.href = "#contact";
  aContact.textContent = "contact";
  liContact.appendChild(aContact);
  header.appendChild(liContact);

  const liLogin = document.createElement("li");
  liLogin.className = "login";
  const aLogin = document.createElement("a");
  aLogin.href = "login.html";
  aLogin.textContent = "login";
  liLogin.appendChild(aLogin);
  header.appendChild(liLogin);

  const liInstagram = document.createElement("li");
  const imgInsta = document.createElement("img");
  imgInsta.src = "./assets/icons/instagram.png";
  imgInsta.alt = "Instagram";
  liInstagram.appendChild(imgInsta);
  header.appendChild(liInstagram);
}

transformHeaderLinks();


///////////////////////////////////////////////////////////
//                  GESTION DES TRAVAUX                 //
///////////////////////////////////////////////////////////
async function getWorks(filter) {
  // Vider la galerie principale avant affichage
  document.querySelector(".gallery").innerHTML = "";

  const url = "http://localhost:5678/api/works";
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Response status: ${response.status}`);
    const json = await response.json();

    // Filtrage si nécessaire
    const worksToDisplay = filter ? json.filter(data => data.category.id === filter) : json;
    worksToDisplay.forEach(data => setFigure(data));

    // Remplir la modale
    const galleryModal = document.querySelector(".gallery-modal");
    if (galleryModal) {
      galleryModal.innerHTML = "";
      json.forEach(data => setFigureModal(data));
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
  figure.dataset.id = data.id;
  figure.innerHTML = `<img src="${data.imageUrl}" alt="${data.title}">
                      <figcaption>${data.title}</figcaption>`;
  document.querySelector(".gallery").appendChild(figure);
}

///////////////////////////////////////////////////////////
//              AJOUT DANS LA MODALE                    //
///////////////////////////////////////////////////////////
function setFigureModal(data) {
  const galleryModal = document.querySelector(".gallery-modal");
  if (!galleryModal) return;

  const figure = document.createElement("figure");
  figure.className = "modal-figure";
  figure.dataset.id = data.id;
  figure.innerHTML = `
    <img src="${data.imageUrl}" alt="${data.title}">
    <i class="fa-solid fa-trash-can trash-icon"></i>
  `;

  // Ajout event suppression pour chaque icône trash
  const trashIcon = figure.querySelector(".trash-icon");
  trashIcon.addEventListener("click", async () => {
    await deleteWork(data.id, figure); 
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

    const container = document.querySelector(".div-container");
    
    // On affiche les filtres seulement si l'utilisateur n'est pas logué
    if (!sessionStorage.authToken && container) {
      container.innerHTML = ""; // reset pour éviter duplication

      const allFilter = document.createElement("div");
      allFilter.className = "tous";
      allFilter.textContent = "Tous";
      allFilter.addEventListener("click", () => getWorks());
      container.appendChild(allFilter);

      json.forEach(cat => {
        const div = document.createElement("div");
        div.className = cat.id;
        div.textContent = cat.name;
        div.addEventListener("click", () => getWorks(cat.id));
        container.appendChild(div);
      });
    } else if (container) {
      // Si logué → on masque div des filtres
      container.style.display = "none";
    }

    // retourner les catégories (pour la modal2)
    return json;
  } catch (error) {
    console.error(error.message);
    return [];
  }
}

///////////////////////////////////////////////////////////
//                 MODE ADMINISTRATION                  //
///////////////////////////////////////////////////////////
function displayAdminMode() { 
  const loginBtn = document.querySelector(".login");

  if (sessionStorage.authToken) {
    // Bandeau Mode édition
    const editBanner = document.createElement("div");
    editBanner.className = "edit";
    editBanner.innerHTML = '<p><a href="#modal1" class="js-modal"><i class="fa-regular fa-pen-to-square"></i> Mode édition</a></p>';
    document.body.prepend(editBanner);

    // Gestion du bouton logout
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
//                      MODALE (Open/close)             //
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
  modal.style.display = "flex";
  focusables[0]?.focus();
  modal.removeAttribute("aria-hidden");
  modal.setAttribute("aria-modal", "true");
  modal.addEventListener("click", closeModal);
  modal.querySelector(".js-modal-close")?.addEventListener("click", closeModal);
  modal.querySelector(".js-modal-stop")?.addEventListener("click", stopPropagation);
};

const closeModal = function (e) {
  if (!modal) return;
  if (previouslyFocusableElement) previouslyFocusableElement.focus();
  e.preventDefault();
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  modal.removeAttribute("aria-modal");
  modal.removeEventListener("click", closeModal);
  modal.querySelector(".js-modal-close")?.removeEventListener("click", closeModal);
  modal.querySelector(".js-modal-stop")?.removeEventListener("click", stopPropagation);
  modal = null;
};

const stopPropagation = e => e.stopPropagation();
const focusModal = e => e.preventDefault();

document.querySelectorAll(".js-modal").forEach(a => a.addEventListener("click", openModal));
window.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal(e);
  if (e.key === "Tab" && modal) focusModal(e);
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
  modal.style.display = "none";

  const wrapper = document.createElement("div");
  wrapper.className = "modal-wrapper js-modal-stop";

  // Bouton fermeture
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

  // Galerie modale
  const galleryModal = document.createElement("div");
  galleryModal.className = "gallery-modal";
  wrapper.appendChild(galleryModal);

  // Footer fixe (hr + bouton)
  const modalFooter = document.createElement("div");
  modalFooter.className = "modal-footer";

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

  modal.appendChild(wrapper);
  document.body.appendChild(modal);

  // Ouverture modale 2
  addButton.addEventListener("click", () => {
    const modal2 = document.getElementById("modal2");
    if (modal2) {
      modal2.style.display = "flex";
      modal2.setAttribute("aria-hidden", "false");
    }
  });

  // Fermeture modal1 par croix
  closeButton.addEventListener("click", () => {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
  });

  // Fermeture modal1 par clic dehors
  modal.addEventListener("click", e => {
    if (e.target === modal) closeModal(e);
  });
}
createModal();

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

// Suppression d'un seul travail par ID
async function deleteWork(id, figureElement) {
  const token = sessionStorage.getItem("authToken");
  try {
    const response = await fetch(deleteApi + id, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (response.ok) {
      // Supprime dans la modale
      figureElement.remove();
      // Supprime dans la galerie principale
      const galleryFigure = document.querySelector(`.gallery figure[data-id="${id}"]`);
      if (galleryFigure) galleryFigure.remove();
    }
  } catch (error) { console.error(error); }
}

///////////////////////////////////////////////////////////
//         DEUXIEME MODALE + (AJOUT TRAVAUX)            //
///////////////////////////////////////////////////////////
function createSecondModal() {
  const modal = document.createElement("aside");
  modal.id = "modal2";
  modal.className = "modal add-photo-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.setAttribute("role", "dialog");
  modal.style.display = "none";

  const wrapper = document.createElement("div");
  wrapper.className = "modal-wrapper js-modal-stop";

  // --- Top buttons ---
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

  // --- Title ---
  const title = document.createElement("h3");
  title.textContent = "Ajout photo";
  wrapper.appendChild(title);

  // --- File container ---
  const fileContainer = document.createElement("div");
  fileContainer.className = "modal-file-container";

  const fileIcon = document.createElement("div");
  fileIcon.className = "modal-file-icon";
  fileIcon.innerHTML = `<i class="fa-regular fa-image"></i>`;
  fileContainer.appendChild(fileIcon);

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.name = "file";
  fileInput.id = "file";
  fileInput.className = "modal-file-input";
  fileInput.accept = "image/*";
  fileContainer.appendChild(fileInput);

  const fileLabel = document.createElement("label");
  fileLabel.setAttribute("for", "file");
  fileLabel.className = "modal-file-label";
  fileLabel.textContent = "+ Ajouter photo";
  fileContainer.appendChild(fileLabel);

  const fileText = document.createElement("p");
  fileText.className = "modal-file-text";
  fileText.textContent = "jpg, png : 4mo max";
  fileContainer.appendChild(fileText);

  wrapper.appendChild(fileContainer);

  // --- Formulaire ---
  const form = document.createElement("form");
  form.className = "modal-form";

  // Titre
  const titleBlock = document.createElement("div");
  const labelTitle = document.createElement("label");
  labelTitle.setAttribute("for", "title");
  labelTitle.textContent = "Titre";
  labelTitle.className = "modal-label";
  const inputTitle = document.createElement("input");
  inputTitle.type = "text";
  inputTitle.name = "title";
  inputTitle.id = "title";
  titleBlock.appendChild(labelTitle);
  titleBlock.appendChild(inputTitle);
  form.appendChild(titleBlock);

  // Catégorie
  const categoryBlock = document.createElement("div");
  const labelCategory = document.createElement("label");
  labelCategory.setAttribute("for", "category");
  labelCategory.textContent = "Catégorie";
  labelCategory.className = "modal-label";

  const selectCategory = document.createElement("select");
  selectCategory.name = "category";
  selectCategory.id = "category";
  selectCategory.className = "modal-form-input";

  getCategories().then(categories => {
    categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat.id;
      option.textContent = cat.name;
      selectCategory.appendChild(option);
    });
  });

  categoryBlock.appendChild(labelCategory);
  categoryBlock.appendChild(selectCategory);
  form.appendChild(categoryBlock);

  wrapper.appendChild(form);

  // --- HR + bouton Valider ---
  const hr = document.createElement("hr");
  wrapper.appendChild(hr);

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "modal-button-container";

  const validateButton = document.createElement("button");
  validateButton.className = "add-photo-button inactive";
  validateButton.textContent = "Valider";

  buttonContainer.appendChild(validateButton);
  wrapper.appendChild(buttonContainer);

  modal.appendChild(wrapper);
  document.body.appendChild(modal);

  ///////////////////////////////////////////////////////////
  // --- Fonction pour reset form et erreurs ---
  ///////////////////////////////////////////////////////////
  function resetModal2Form() {
    if (!modal) return;

    // Supprimer message d'erreur
    const oldError = form.querySelector(".error-project");
    if (oldError) oldError.remove();

    // Reset inputs
    if (fileInput) fileInput.value = "";
    if (inputTitle) inputTitle.value = "";
    if (selectCategory) selectCategory.value = "";

    // Réafficher icônes et texte
    fileContainer.querySelectorAll(".modal-file-icon, .modal-file-label, .modal-file-text")
      .forEach(el => el.style.display = "");

    const existingPreview = fileContainer.querySelector(".modal-image-preview");
    if (existingPreview) existingPreview.remove();

    // Bouton inactive
    validateButton.classList.add("inactive");
    validateButton.classList.remove("active");
  }

  ///////////////////////////////////////////////////////////
  // --- Gestion du formulaire et prévisualisation ---
  ///////////////////////////////////////////////////////////
  function isFormComplete() {
    return fileInput.files.length > 0 && inputTitle.value.trim() !== "" && selectCategory.value !== "";
  }

  function updateValidateButton() {
    if (isFormComplete()) {
      validateButton.classList.add("active");
      validateButton.classList.remove("inactive");
    } else {
      validateButton.classList.add("inactive");
      validateButton.classList.remove("active");
    }
  }

  // Preview image
  fileInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const existingPreview = fileContainer.querySelector(".modal-image-preview");
        if (existingPreview) existingPreview.remove();

        fileContainer.querySelectorAll(".modal-file-icon, .modal-file-label, .modal-file-text")
          .forEach(el => el.style.display = "none");

        const img = document.createElement("img");
        img.src = e.target.result;
        img.className = "modal-image-preview";
        img.style.maxWidth = "100%";
        img.style.maxHeight = "180px";
        img.style.marginTop = "10px";
        fileContainer.appendChild(img);
        updateValidateButton();
      };
      reader.readAsDataURL(file);
    } else updateValidateButton();
  });

  inputTitle.addEventListener("input", updateValidateButton);
  selectCategory.addEventListener("change", updateValidateButton);
  updateValidateButton();

  ///////////////////////////////////////////////////////////
  // --- Ajout projet via API ---
  ///////////////////////////////////////////////////////////
  validateButton.addEventListener("click", async e => {
    e.preventDefault();
    if (!isFormComplete()) {
      const oldError = form.querySelector(".error-project");
      if (oldError) oldError.remove();
      const errorBox = document.createElement("div");
      errorBox.className = "error-project";
      errorBox.textContent = "Veuillez remplir tous les champs avant de valider.";
      form.prepend(errorBox);
      return;
    }

    const token = sessionStorage.getItem("authToken");
    const formData = new FormData();
    formData.append("title", inputTitle.value.trim());
    formData.append("category", selectCategory.value);
    formData.append("image", fileInput.files[0]);

    try {
      const response = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      if (!response.ok) throw new Error("Erreur API");
      const newProject = await response.json();

      // Ajout projet dans galerie + modale
      setFigure(newProject);
      setFigureModal(newProject);

      // Reset formulaire
      resetModal2Form();

      // Fermer les deux modales
      modal.style.display = "none"; // modal2
      modal.setAttribute("aria-hidden", "true");
      const modal1 = document.getElementById("modal1");
      modal1.style.display = "flex"; // réafficher
      modal1.setAttribute("aria-hidden", "false");

    } catch (err) {
      console.error(err);
      const oldError = form.querySelector(".error-project");
      if (oldError) oldError.remove();
      const errorBox = document.createElement("div");
      errorBox.className = "error-project";
      errorBox.textContent = "Erreur lors de l'ajout du projet.";
      form.prepend(errorBox);
    }
  });

  ///////////////////////////////////////////////////////////
  // --- Fermeture modal2 ---
  ///////////////////////////////////////////////////////////
  closeButton.addEventListener("click", () => {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    const modal1 = document.getElementById("modal1");
    modal1.style.display = "none";
    modal1.setAttribute("aria-hidden", "true");
    resetModal2Form();
  });

  modal.addEventListener("click", e => {
    if (e.target === modal) {
      modal.style.display = "none";
      modal.setAttribute("aria-hidden", "true");
      const modal1 = document.getElementById("modal1");
      modal1.style.display = "none";
      modal1.setAttribute("aria-hidden", "true");
      resetModal2Form();
    }
  });

  // Bouton "Retour" vers modal1
  backButton.addEventListener("click", () => {
    if (modal.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    const modal1 = document.getElementById("modal1");
    modal1.style.display = "flex";
    modal1.setAttribute("aria-hidden", "false");
    resetModal2Form();
  });
}
createSecondModal();

///////////////////////////////////////////////////////////
//         INITIALISATION
///////////////////////////////////////////////////////////
getCategories().then(() => {
  getWorks(); 
});
