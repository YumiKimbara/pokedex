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

//set variables
let loadNum = 9;
let dataLength;
//let limit = 899;
let limit = 152;
const allPokemon = document.querySelector(".allPokemon");
const form = document.querySelector(".form");
const input = document.querySelector(".input");
const typeList = document.querySelectorAll(".type-list");
const sortIndex = document.querySelector(".sort-index");
const sortAlphabet = document.querySelector(".sort-alphabet");
let allData = [];
let observer;

//get and display pokemon data when footer was crossed for 50%
document.addEventListener("DOMContentLoaded", () => {
  //set up the IntersectionObserver to load more images if the footer is visible.
  let options = {
    root: null,
    rootMargins: "0px",
    threshold: 0.5,
  };
  observer = new IntersectionObserver(handleIntersect, options);
  observer.observe(document.querySelector(".attribution"));

  if (searchTypes === "true") {
    console.log("hi");
    observer.unobserve(document.querySelector(".attribution"));
  }
  //an initial load of some data
  getData();
});
function handleIntersect(entries) {
  //wnen entries[0].isIntersecting === true(cross footer 50%), excute getData function
  if (entries[0].isIntersecting) {
    loadPokemon();
  }
  // if (entries[0].isIntersecting) {
  //   //observer.observe(document.querySelector(".attribution"));
  //   loadPokemon();
  // } else if (searchTypes) {
  //   console.log("hi");
  //   observer.unobserve(document.querySelector(".attribution"));
  // }
}

//get data from pokeAPI
const getData = async function () {
  try {
    localStorage.clear();
    let api, fetchData;

    for (let i = 1; i < limit; i++) {
      api = `https://pokeapi.co/api/v2/pokemon/${i}/`;

      fetchData = await fetch(api, {
        method: "GET",
      });

      if (!fetchData.ok) throw new Error(`(${fetchData.status})`);
      const jsonData = await fetchData.json();

      allData.push(jsonData);
    }

    loadPokemon();
  } catch (err) {
    alert(`Something went wrong. ${err.message}`);
  }
};

//load and display pokemon depends on how many pokemon left
const loadPokemon = () => {
  dataLength = allData.length;
  let loadedItemLength = allPokemon.getElementsByClassName("pokemon-info")
    .length;
  let restLength = dataLength - loadedItemLength;

  if (dataLength !== loadedItemLength) {
    if (loadNum < restLength) {
      displayPokemonPic(allData, loadNum, loadedItemLength);
    } else {
      displayPokemonPic(allData, restLength, loadedItemLength);
      //seeMoreBtn.remove(); // process ends
    }
  } else {
    // If there is no data to load
    return false; // process ends
  }
};

//display pokemon pictures
const displayPokemonPic = (allData, times, currentPosition) => {
  let j;
  for (let i = 0; i <= times; i++) {
    j = i + currentPosition;
    let contents3 = `
    <div class="pokemon-info">
    <img class="pokemon-img" src="${allData[j].sprites.other["official-artwork"].front_default}" alt="pokemon-picture">
    <div>
    <p>No.${allData[j].id}</p>
    <p class="pokemon-name">${allData[j].name}</p>
    </div>
    </div>
    `;
    allPokemon.insertAdjacentHTML("beforeend", contents3);
  }
  callPokemonInfo();
};

const displayPokemonPic2 = (sameTypeData) => {
  allPokemon.innerHTML = "";

  sameTypeData.map((data) => {
    let contents3 = `
    <div class="pokemon-info">
    <img class="pokemon-img" src="${data.sprites.other["official-artwork"].front_default}" alt="pokemon-picture">
    <div>
    <p>No.${data.id}</p>
    <p class="pokemon-name">${data.name}</p>
    </div>
    </div>
    `;
    allPokemon.insertAdjacentHTML("beforeend", contents3);
  });

  callPokemonInfo();
};

//go to pokemon info page and display clicked pokemon
function callPokemonInfo() {
  allPokemon.addEventListener("click", (e) => {
    localStorage.clear();
    if (e.target === allPokemon) return;
    const x = e.target.closest(".pokemon-info").querySelector(".pokemon-name");
    fetchOnePokemon(x.innerHTML);
  });
}

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
const searchTypes = () => {
  typeList.forEach((type) => {
    type.addEventListener("click", (e) => {
      console.log(e.target.nodeName);
      if (e.target.nodeName === "I") {
        const clickedType = e.target.dataset["type"];
        const sameTypeData = [];
        allData.map((data) => {
          data.types.map((dataType) => {
            if (dataType.type.name === clickedType) {
              sameTypeData.push(data);
            }
          });
        });
        displayPokemonPic2(sameTypeData);
      } else return;
    });
  });
};
searchTypes();

//Sort by Index and Alphabet
function sort1(reverse) {
  if (reverse) {
    const indexValue = allData.sort((a, b) =>
      a.id > b.id ? 1 : b.id > a.id ? -1 : 0
    );
    displayPokemonPic2(indexValue);
  } else {
    const indexValue = allData.sort((a, b) =>
      b.id > a.id ? 1 : a.id > b.id ? -1 : 0
    );
    displayPokemonPic2(indexValue);
  }
}

let sortToggle1 = true;
sortIndex.onclick = function () {
  sortToggle1 = !sortToggle1;
  sort1(sortToggle1);
};

function sort2(reverse) {
  if (reverse) {
    const alphabetValue = allData.sort((a, b) =>
      a.name > b.name ? 1 : b.name > a.name ? -1 : 0
    );
    displayPokemonPic2(alphabetValue);
  } else {
    const alphabetValue = allData.sort((a, b) =>
      b.name > a.name ? 1 : a.name > b.name ? -1 : 0
    );
    displayPokemonPic2(alphabetValue);
  }
}

let sortToggle2 = true;
sortAlphabet.onclick = function () {
  sortToggle2 = !sortToggle2;
  sort2(sortToggle2);
};

// const goTop = (e) => {
//   const top2 = e.target.getAttribute("href");
//   console.log(top2);
// };
// goTop();
//document.querySelector(top).scrollIntoView({ behavior: "smooth" });

////////////////////////////////////////////////////
//To do list
// search by typesした時同タイプ以外も出力されてしまう。
// go back to the top
// loading icon
// instruction page
// mobile version
// pop upがブロックされましたのわけ
// ポケモンインフォのコンテンツの充実
