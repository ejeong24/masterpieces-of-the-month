//**************CONST DECLARATIONS************* */
const localUrl = "http://localhost:3000/masterpieces";
// const rijksUrl = `https://www.rijksmuseum.nl/api/nl/collection?key=${apiKey}&${category}=${query}`
const metUrl = `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=`;
const metObjectUrl = `https://collectionapi.metmuseum.org/public/collection/v1/objects/`;
const imageContainer = document.querySelector("#image-container");
const focusImage = document.querySelector(".focus-image");
const details = document.querySelector("#image-details");
const detailsTitle = document.querySelector("#image-title-content");
const detailsArtist = document.querySelector("#artist-name-content");
const detailsYear = document.querySelector("#art-year-content");
const favoriteBtn = document.querySelector("#favoriteBtn");
const removeFavBtn = document.querySelector("#removeFavBtn");
const rating = document.querySelector("#rating-dropdown");
const searchForm = document.querySelector("#search_form");
const showFaveBtn = document.querySelector("#showFaveBtn");
let favoriteCount = 0;
let birthMonth;
let objectUrl;
//const newImageForm = document.querySelector('#new-image-form')
// let imageCounter =0;  //used to make columns and rows

//****************END CONST DECLARATIONS************ */

//*********TO DO LIST****** */

//************FETCH REQUESTS**************** */

function getRijks(category, query) {
  fetch(
    `https://www.rijksmuseum.nl/api/nl/collection?key=${apiKey}&${category}=${query}`
  )
    .then((resp) => resp.json())
    .catch((error) => console.log(error.message));
}

function getMetSearch(parameter) {
  return fetch(`${metUrl}${parameter}`)
    .then((resp) => resp.json())
    .then((resp) => {
      for (let i = 0; i < 40; i++) {
        getMetId(resp.objectIDs[i]);
      }
    })
    .catch((error) => console.log(error.message));
}

function getMetId(objectId) {
  fetch(`${metObjectUrl}${objectId}`)
    .then((resp) => resp.json())
    .then((resp) => renderMetImage(resp))
    .catch((error) => console.log(error.message));
}

function deleteAllMet() {
  fetch(`http://localhost:3000/MET`, {
    method: "DELETE",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
  }).then((response) => response.json());
}

function getLocal(id) {
  return fetch(`${localUrl}/${id}`)
    .then((resp) => resp.json())
    .catch((error) => console.log(error.message));
}

function postLocal(url, data) {
  fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((res) => console.log(res));
}

function deleteLocal(id) {
  fetch(`http://localhost:3000/masterpieces/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
  }).then((response) => response.json());
}

function postFavorite(data) {
  fetch("http://localhost:3000/favorites", {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    //.then(res => res.json())
    .then((res) => {
      if (res.ok === true) {
        //favoriteBtn.classList.add("hidden")
        //removeFavBtn.classList.remove("hidden")
        //console.log(res);
      }
    });
}

function removeFavorite(id) {
  fetch(`http://localhost:3000/favorites/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
}

function checkForRemoveFav() {
  fetch(`http://localhost:3000/favorites`)
    .then((response) => response.json())
    .then((response) =>
      response.forEach((fav) => {
        if (fav.title === detailsTitle.textContent) removeFavorite(fav.id);
        //favoriteBtn.classList.remove("hidden")
        //removeFavBtn.classList.add("hidden")
      })
    );
}

function patchRating(id) {
  fetch(`http://localhost:3000/favorites/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating: `${rating.value}` }),
  }).then((res) => res.json());
}

function checkForRating() {
  fetch(`http://localhost:3000/favorites`)
    .then((response) => response.json())
    .then((response) =>
      response.forEach((fav) => {
        if (fav.title === detailsTitle.textContent) patchRating(fav.id);
      })
    );
}

function checkFavorite() {
  let isFavorite = false;
  fetch(`http://localhost:3000/favorites`)
    .then((response) => response.json())
    .then((response) =>
      response.forEach((fav) => {
        if (fav.title === detailsTitle.textContent) {
          isFavorite = true;
          console.log("favorite"); //intention is for this to allow us to decide to display the favorite or unfavorite button (not working atm probably because of async issues)
        }
      })
    );
  console.log(isFavorite);
}

function renderFavorites() {
  removeAllChildNodes(imageContainer);
  fetch(`http://localhost:3000/favorites`)
    .then((response) => response.json())
    .then((response) => response.forEach(renderImage));
}
//************END FETCH REQUESTS***************** */

//***********RENDER FUNCTIONS********* */
function renderImage(image) {
  let newImageDiv = document.createElement("div");
  let newImage = document.createElement("img");
  newImage.src = image.image_url;
  newImage.setAttribute("id", image.id);
  addDetailsClick(newImage);
  newImageDiv.append(newImage);
  imageContainer.append(newImageDiv);
}

function showDetails(id) {
  getLocal(id).then((response) => {
    focusImage.src = response.image_url;
    detailsTitle.textContent = `${response.title}`;
    detailsArtist.textContent = `${response.artistName}`;
    detailsYear.textContent = `${response.year}`;
    focusImage.setAttribute("id", id);
    birthMonth = response.birthMonth;
    //console.log(birthMonth)
    objectUrl = response.object_url;
    //console.log(objectUrl)
    rating.value = "";
  });
  details.classList.remove("hidden");
  //checkFavorite()
}

function renderMetImage(image) {
  if (
    (image.primaryImageSmall !== "") &
    (image.primaryImageSmall !== undefined)
  ) {
    let newImageDiv = document.createElement("div");
    let newImage = document.createElement("img");
    addDetailsClick(newImage);
    newImageDiv.append(newImage);
    imageContainer.append(newImageDiv);
    newImage.src = image.primaryImageSmall;
  } else if ((image.primaryImage !== "") & (image.primaryImage !== undefined)) {
    let newImageDiv = document.createElement("div");
    let newImage = document.createElement("img");
    newImage.src = image.primaryImage;
    addDetailsClick(newImage);
    newImageDiv.append(newImage);
    imageContainer.append(newImageDiv);
  }
}

function showFavorites() {}

//***********END RENDER FUNCTIONS******** */

//***********GENERAL FUNCTION DECLARATION**** */
function populate() {
  fetch(localUrl)
    .then((response) => response.json())
    .then((response) => response.forEach(renderImage));
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}
//**********END GENERAL FUNCTION DECLARATION****** */

// //Artwork ratings PATCH request

// function ratingForm (someImage) {   //add ratings to art pieces
//   const artRating=document.createElement('SELECT')
//   artRating.id="rating-form"
//   let ratingOption=document.createElement('option')
//  // artRating.innerHTML="Select Rating"
//  ratingOption.value=1
//  artRating.append(ratingOption)
//   artRating.addEventListener('select', (e) => {
//       e.preventDefault()
//   })
//   artRating.type='number'
//   artRating.value=1,2,3,4
//   someImage.append(artRating)
// }
//ratingForm()

//     patchRating()

//***********ADD-DELETE-BUTTON FUNCTION******** */
// function addDeleteButton (someImage){
// //create a delete button
// const deleteButton = document.createElement("button")
// //set the text to "Delete"
// deleteButton.innerHTML = "Delete"
// //give the delete button an ID
// deleteButton.setAttribute('id', 'delete-button')
// //append the delete button to the given image
// someImage.append(deleteButton)
// //add an event listener to the delete button
// deleteButton.addEventListener('click', () => {
// //deletes the associated image on click
//   someImage.remove()
//   deleteLocal(someImage.id)
// })
// }
//***********END ADD-DELETE-BUTTON FUNCTION******** */

function addDetailsClick(someImage) {
  someImage.addEventListener("click", (event) => {
    // console.log(event.target.id)
    showDetails(event.target.id);
  });
}

//FAVORITE BUTTON EVENT LISTENER

favoriteBtn.addEventListener("click", () => {
  let newFavorite = {
    artistName: detailsArtist.textContent,
    title: detailsTitle.textContent,
    year: detailsYear.textContent,
    birthMonth: birthMonth,
    image_url: focusImage.src,
    object_url: objectUrl,
    rating: "",
  };
  postFavorite(newFavorite);
});

removeFavBtn.addEventListener("click", () => {
  checkForRemoveFav();
});

//GENERAL EVENT LISTENERS
rating.addEventListener("change", () => {
  checkForRating();
});

imageContainer.addEventListener("mouseover", (event) => {
  event.target.classList.add("imgopacity");
});

imageContainer.addEventListener("mouseout", (event) => {
  event.target.classList.remove("imgopacity");
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  query = searchForm.querySelector("#form_input").value;
  console.log(query);
  console.log(getMetSearch(query));

  searchForm.querySelector("#form_input").value = "";
});

showFaveBtn.addEventListener("click", () => {
  renderFavorites();
});

//**************function invokation*** */
populate();
