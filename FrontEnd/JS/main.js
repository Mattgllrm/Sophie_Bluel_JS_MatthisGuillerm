// 1 Faites l’appel à l’API avec fetch afin de récupérer dynamiquement les projets de l’architecte. 
//const worksApi = "http://localhost:5678/api/works"; 

//const works = fetch(worksApi);
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
        setFigureModal(filtered[i])
      }
    } else {
      for (let i = 0; i < json.length; i++) {
        setFigure(json[i]);
        setFigureModal(json[i])
      }
    }

  } catch (error) {
    console.error(error.message);
  }
}

getWorks()
// 1.1 Utilisez JavaScript pour ajouter à la galerie les travaux de l’architecte que vous avez récupéré. 

function setFigure(data) {
  const figure = document.createElement("figure");
  figure.innerHTML = `<img src="${data.imageUrl}" alt="${data.title}">
    <figcaption>${data.title}</figcaption>`;

  document.querySelector(".gallery").append(figure); 
}

function setFigureModal(data) {
  const figure = document.createElement("figure");
  figure.classList.add("modal-figure");

  figure.innerHTML = `
    <img src="${data.imageUrl}" alt="${data.title}">
    <i class="fa-solid fa-trash-can trash-icon"></i>
  `;

  // on cible la poubelle
  const trashIcon = figure.querySelector(".trash-icon");

  // au clic → supprimer la figure entière
  trashIcon.addEventListener("click", () => {
    figure.remove();
  });

  document.querySelector(".gallery-modal").append(figure); 
}


// 1.2 Réalisation du filtres des travaux

async function getCategories() {
  const url = "http://localhost:5678/api/categories";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    for (let i = 0; i < json.length; i++) {   
      setFilter(json[i]);
    }
  } catch (error) {
    console.error(error.message);
  }
} 
getCategories(); 

function setFilter (data) {
  console.log(data);
  const div = document.createElement("div");
  div.className = data.id;
  console.log(data.id)
  div.addEventListener("click",() => getWorks(data.id));

  div.innerHTML = `${data.name}`;
  document.querySelector(".div-container").append(div); 
}
 document.querySelector(".tous").addEventListener("click", () => getWorks()); 

 // Bandeau Mode Editions 

function displayAdminMode() { 
  if (sessionStorage.authToken) {
    const editBanner = document.createElement("div");
    editBanner.className = "edit";
    editBanner.innerHTML = '<p><a href="#modal1" class="js-modal"><i class="fa-regular fa-pen-to-square"></i> Mode édition</a></p>';  
    document.body.prepend(editBanner);

    const login = document.querySelector(".login")
    document.querySelector(".login").textContent = "logout"
  }
}

displayAdminMode();

//      Première Modale 

let modal = null;
const focusableSelector = "button, a, input, textarea"
let focusables = []
let previouslyFocusableElement = null

const openModal = function (e) {
  e.preventDefault();
    modal = document.querySelector(e.target.getAttribute("href"));
    focusables = Array.from(modal.querySelectorAll(focusableSelector))
    previouslyFocusableElement = document.querySelector(":focus")
    modal.style.display = null;
    focusables[0].focus()
    modal.removeAttribute("aria-hidden");
    modal.setAttribute("aria-modal", "true");
    modal.addEventListener("click", closeModal);
   modal.querySelector(".js-modal-close").addEventListener("click", closeModal);
     modal.querySelector(".js-modal-stop").addEventListener("click", stopPropagation);

};
  
const closeModal = function (e) {
  if (modal === null) return;
  if (previouslyFocusableElement !== null) previouslyFocusableElement.focus()
  e.preventDefault();
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    modal.removeAttribute("aria-modal");
    modal.removeEventListener("click", closeModal);
    modal.querySelector(".js-modal-close").removeEventListener("click", closeModal);
    modal.querySelector(".js-modal-stop").removeEventListener("click", stopPropagation);
    modal = null
}

const stopPropagation = function (e) {
    e.stopPropagation()
}

const focusModal = function (e) {
  e.preventDefault()

}

document.querySelectorAll(".js-modal").forEach((a) => {
  a.addEventListener(`click`, openModal);
});

window.addEventListener(`keydown`, function (e) {
if (e.key === `Escape`|| e.key === "Esc") {
  closeModal(e)
}
if (e.key === "Tab" && modal !== null) {
  focusModal(e);
}
});
 
//////////////////////////////////////////////Création Modal/////////////////////////////////////////////////////////
function createModal() {
  // Crée l'aside
  const modal = document.createElement("aside");
  modal.id = "modal1";
  modal.className = "modal";
  modal.setAttribute("aria-hidden", "true");
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-labelledby", "titlemodal");
  modal.style.display = "none";

  // Conteneur modal-wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "modal-wrapper js-modal-stop";

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

  // Galerie modal
  const galleryModal = document.createElement("div");
  galleryModal.className = "gallery-modal";
  wrapper.appendChild(galleryModal);

  // Ligne HR
  const hr = document.createElement("hr");
  wrapper.appendChild(hr);

  // Bouton Ajouter photo
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "modal-button-container";

  const addButton = document.createElement("button");
  addButton.className = "add-photo-button";
  addButton.textContent = "Ajouter une photo";

  buttonContainer.appendChild(addButton);
  wrapper.appendChild(buttonContainer);

  // Ajout du wrapper à l'aside
  modal.appendChild(wrapper);

  // Ajout à body
  document.body.appendChild(modal);

  // Activation du bouton de fermeture pour la modale
  closeButton.addEventListener("click", () => {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
  });
}

// Appelle la fonction pour créer la modale
createModal();


