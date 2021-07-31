"use strict";

//animation for input form
$("input").on("focusin", function () {
  $(this).parent().find("label").addClass("active");
});

$("input").on("focusout", function () {
  if (!this.value) {
    $(this).parent().find("label").removeClass("active");
  }
});

//set global variables
let targetPokemonListLength;
let limit = 899;
const allPokemon = document.querySelector(".allPokemon");
const form = document.querySelector(".form");
const input = document.querySelector(".input");
const typeFilterButtons = document.querySelectorAll(".type-list-item");
const sortIndex = document.querySelector(".sort-index");
const sortAlphabet = document.querySelector(".sort-alphabet");
const loadingImg = document.getElementById("loadingImg");
let pokemons = [];
let filteredPokemons = [];
let isFiltered = false;
let observer;
//let num2;

//scroll button
const goUp = document.querySelector(".go-up");
const goTop = () => {
  goUp.addEventListener("click", (e) => {
    e.preventDefault();
    const id = e.target.getAttribute("href");
    document.querySelector(id).scrollIntoView({ behavior: "smooth" });
  });
};
goTop();

const checkScroll = () => {
  let y = window.scrollY;
  if (y >= 950) {
    goUp.classList.remove("hidden");
  } else if (y <= 950) {
    goUp.classList.add("hidden");
  }
};
window.addEventListener("scroll", checkScroll);

//get and render pokemon data when footer was crossed for 50%
document.addEventListener("DOMContentLoaded", () => {
  //set up the IntersectionObserver to load more images if the footer is visible.
  let options = {
    root: null,
    rootMargins: "0px",
    threshold: 0.5,
  };

  observer = new IntersectionObserver(handleIntersect, options);
  observer.observe(document.querySelector(".attribution"));

  if (registerClickEventsToTypeListItems()) {
    observer.unobserve(document.querySelector(".attribution"));
  }
  //an initial load of some data
  //getAllPokemons();
  //sample();
});

function handleIntersect(entries) {
  //wnen entries[0].isIntersecting === true(cross footer 50%), excute renderMorePokemons function
  if (entries[0].isIntersecting) {
    console.log("handleIntersect");
    let num = 1;
    // num2 = num < limit ? num + 10 : limit;
    let num2 = num++;
    getAllPokemons(num, num2);
    //renderMorePokemons();
  }
}

// const sample = async function () {
//   try {
//     localStorage.clear();
//     let api, fetchData;
//     for (let i = 1; i < 20; i++) {
//       api = `https://pokeapi.co/api/v2/pokemon/${i}/`;
//       console.log(api);
//       fetchData = await fetch(api, {
//         method: "GET",
//       });
//       console.log(fetchData);

//       if (!fetchData.ok) throw new Error(`(${fetchData.status})`);
//       const jsonData = await fetchData.json();
//       pokemons.push(jsonData);
//     }
//     renderMorePokemons();
//   } catch (err) {
//     if (err.includes("Failed to fetch")) {
//       alert(`Something went wrong. ${err.message}`);
//     } else {
//       console.error(err);
//     }
//   }
// };

//get data from pokeAPI
const getAllPokemons = async function (num, num2) {
  //@@@ここら辺で読み込むnumとnum2を＋10とかにする。
  //handleIntersect→getAllpokemons→jsonData→renderAllPokemonの順にconsole.logで来ていればOK。
  //なぜならrenderAllPokemonの前にjsonDataが先に読み込めていないとrenderAllPokemonでhtmlの描画ができないから。
  //filterで消しちゃったrenderAllPokemonは元に戻した方が良いかも？
  // let num = 1;
  // let num2 = num < limit ? num++ : limit;
  console.log("getAllPokemons");
  try {
    localStorage.clear();
    let api, fetchData;
    for (let i = num2; i < limit; i++) {
      api = `https://pokeapi.co/api/v2/pokemon/${i}/`;
      fetchData = await fetch(api, {
        method: "GET",
      });

      if (!fetchData.ok) throw new Error(`(${fetchData.status})`);
      const jsonData = await fetchData.json();
      console.log("jsonData");
      pokemons.push(jsonData);
      renderMorePokemons();
    }
    // let num = 10;
    // let num2 = num < pokemons.length ? num + 10 : pokemons.length;
    // console.log(num2);
    // renderMorePokemons(num2);
  } catch (err) {
    if (err.includes("Failed to fetch")) {
      alert(`Something went wrong. ${err.message}`);
    } else {
      console.error(err);
    }
  }
};

//load and render pokemon depends on how many pokemon left
const renderMorePokemons = (i) => {
  console.log("renderMorePokemons");
  loadingImg.classList.add("hide");

  let targetPokemons;
  if (isFiltered) {
    targetPokemons = filteredPokemons;
  } else {
    targetPokemons = pokemons;
    //targetPokemons = i;
    //targetPokemons = pokemons.slice(0, num2);
  }

  targetPokemonListLength = targetPokemons.length;
  let loadedItemLength =
    allPokemon.getElementsByClassName("pokemon-info").length;

  if (targetPokemonListLength !== loadedItemLength) {
    for (let i = loadedItemLength; i < targetPokemonListLength; i++) {
      const pokemonInfo = document.createElement("div");
      pokemonInfo.setAttribute("class", "pokemon-info");
      pokemonInfo.innerHTML = `
        <img class="pokemon-img" src="${targetPokemons[i].sprites.other["official-artwork"].front_default}" alt="pokemon-picture">
        <div>
        <p>No.${targetPokemons[i].id}</p>
        <p class="pokemon-name">${targetPokemons[i].name}</p>
        </div>
      `;

      pokemonInfo.addEventListener("click", () => {
        localStorage.clear();

        fetchOnePokemon(targetPokemons[i].name);
      });
      allPokemon.insertAdjacentElement("beforeend", pokemonInfo);
    }
    //loadingImg.classList.add("hide");
  }
};

const renderFilteredPokemons = () => {
  allPokemon.innerHTML = "";

  for (const pokemon of filteredPokemons) {
    const pokemonInfo = document.createElement("div");
    pokemonInfo.setAttribute("class", "pokemon-info");
    pokemonInfo.innerHTML = `
      <img class="pokemon-img" src="${pokemon.sprites.other["official-artwork"].front_default}" alt="pokemon-picture">
      <div>
      <p>No.${pokemon.id}</p>
      <p class="pokemon-name">${pokemon.name}</p>
      </div>
    `;

    pokemonInfo.addEventListener("click", () => {
      localStorage.clear();

      fetchOnePokemon(pokemon.name);
    });
    allPokemon.insertAdjacentElement("beforeend", pokemonInfo);
  }
};

//search pokemon in the input form
const searchPokemon = () => {
  form.addEventListener("submit", (e) => {
    localStorage.clear();
    e.preventDefault();
    fetchOnePokemon(input.value.toLowerCase());
  });
};
searchPokemon();

const fetchSpeciesDetail = async (pokemonValue) => {
  try {
    const api2 = `${pokemonValue.species.url}`;
    let fetchSpecies = await fetch(api2, {
      method: "GET",
    });
    if (!fetchSpecies.ok) throw new Error(`(${fetchData.status})`);
    fetchSpecies.json().then((data) => {
      [data.flavor_text_entries].map((texts) => {
        texts.map((text) => {
          if (text.language.name !== "en") return;
          if (text.version.name !== "sword") return;
          localStorage.setItem("description", JSON.stringify(text.flavor_text));
        });
      });

      [data.genera].map((genera) => {
        genera.map((genus) => {
          if (genus.language.name !== "en") return;
          localStorage.setItem("category", JSON.stringify(genus.genus));
        });
      });
    });
  } catch (err) {
    alert(`Something went wrong. ${err.message}`);
  }
};

//get one pokemon data from pokeAPI
const fetchOnePokemon = async (pokemonValue) => {
  try {
    const api = `https://pokeapi.co/api/v2/pokemon/${pokemonValue}/`;
    const fetchData = await fetch(api, {
      method: "GET",
    });
    if (fetchData.status === 404)
      throw new Error(`Invalid Pokemon name.(${fetchData.status})`);
    if (!fetchData.ok) throw new Error(`(${fetchData.status})`);
    fetchData.json().then((data) => {
      localStorage.setItem("pokemonValue", JSON.stringify(data));
      let pokemonValue = JSON.parse(localStorage.getItem("pokemonValue"));

      const firstFunc = async function () {
        await fetchSpeciesDetail(pokemonValue);
      };

      const secondFunc = async function () {
        await window.open("pokemon-info.html");
      };

      const allFunc = async function () {
        await firstFunc();
        await secondFunc();
      };
      allFunc();
    });
  } catch (err) {
    alert(`Something went wrong. ${err.message}`);
  }
};

//search pokemon by the same types
const registerClickEventsToTypeListItems = () => {
  typeFilterButtons.forEach((typeFilterButton) => {
    typeFilterButton.addEventListener("click", (e) => {
      const type = e.target.dataset["type"];
      isFiltered = true;
      filteredPokemons = [];
      for (const pokemon of pokemons) {
        for (const typeNode of pokemon.types) {
          if (typeNode.type.name === type) {
            filteredPokemons.push(pokemon);
          }
        }
      }
      renderFilteredPokemons();
    });
  });
};
registerClickEventsToTypeListItems();

//sort by index and alphabet
function sortByIndices(isAsc) {
  isFiltered = false;
  filteredPokemons = pokemons;

  if (isAsc) {
    const indexValue = pokemons.sort((a, b) =>
      b.id > a.id ? 1 : a.id > b.id ? -1 : 0
    );
    renderFilteredPokemons(indexValue);
  } else {
    const indexValue = pokemons.sort((a, b) =>
      a.id > b.id ? 1 : b.id > a.id ? -1 : 0
    );
    renderFilteredPokemons(indexValue);
  }
}

let isSortedByIndicesInAsc = true;
sortIndex.onclick = function () {
  isSortedByIndicesInAsc = !isSortedByIndicesInAsc;
  sortByIndices(isSortedByIndicesInAsc);
};

function sortByNames(isAsc) {
  isFiltered = false;
  filteredPokemons = pokemons;

  if (isAsc) {
    const alphabetValue = pokemons.sort((a, b) =>
      b.name > a.name ? 1 : a.name > b.name ? -1 : 0
    );
    renderFilteredPokemons(alphabetValue);
  } else {
    const alphabetValue = pokemons.sort((a, b) =>
      a.name > b.name ? 1 : b.name > a.name ? -1 : 0
    );
    renderFilteredPokemons(alphabetValue);
  }
}

let isSortedByNamesInAsc = true;
sortAlphabet.onclick = function () {
  isSortedByNamesInAsc = !isSortedByNamesInAsc;
  sortByNames(isSortedByNamesInAsc);
};
