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

//test

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
});

let checkNumberofPokemon1 = 1;

function handleIntersect(entries) {
  //wnen entries[0].isIntersecting === true(cross footer 50%), excute renderMorePokemons function
  if (entries[0].isIntersecting) {
    //console.log("handleIntersect");
    let checkNumberofPokemon2 = checkNumberofPokemon1++;
    let num = 1;
    if (checkNumberofPokemon2 >= 2) return;
    getAllPokemons(num);
  }
}

//get data from pokeAPI
const getAllPokemons = async function (num, num2) {
  //handleIntersect→getAllpokemons→jsonData→renderMorePokemonの順にconsole.logになるように。
  //なぜならrenderAllPokemonの前にjsonDataが先に読み込めていないとrenderAllPokemonでhtmlの描画ができないから。

  //console.log("getAllPokemons");

  try {
    localStorage.clear();
    let api, fetchData;
    for (let i = num; i < limit; i++) {
      api = `https://pokeapi.co/api/v2/pokemon/${i}/`;
      fetchData = await fetch(api, {
        method: "GET",
      });
      if (!fetchData.ok) throw new Error(`(${fetchData.status})`);
      const jsonData = await fetchData.json();
      //console.log("jsonData");
      pokemons.push(jsonData);
      renderMorePokemons();
    }
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
  //console.log("renderMorePokemons");
  loadingImg.classList.add("hide");

  let targetPokemons;
  if (isFiltered) {
    targetPokemons = filteredPokemons;
  } else {
    targetPokemons = pokemons;
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
    fetchOnePokemon(input.value.trim().toLowerCase());
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
        await window.location.replace("pokemon-info.html");
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
