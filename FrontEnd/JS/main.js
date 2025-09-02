// 1 Faites l’appel à l’API avec fetch afin de récupérer dynamiquement les projets de l’architecte. 
const worksApi = "http://localhost:5678/api/works"; 

const works = fetch(worksApi);
async function getWorks() {
  const url = "http://localhost:5678/api/works";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    console.log(json);
    for (let i = 0; i < json.length; i++) {   // ✅ corrigé
      setFigure(json[i]);
    }
  } catch (error) {
    console.error(error.message);
  }
} 
getWorks()
// 1.1 Utilisez JavaScript pour ajouter à la galerie les travaux de l’architecte que vous avez récupéré. 

function setFigure(data) {
  const figure = document.createElement("figure");
  figure.innerHTML = `
    <img src="${data.imageUrl}" alt="${data.title}">
    <figcaption>${data.title}</figcaption>
  `;
  document.querySelector(".gallery").append(figure); 
}
