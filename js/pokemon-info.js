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

//set global variable
const input = document.querySelector(".input");
const onePokemon = document.querySelector(".onePokemon");
const form = document.querySelector(".form");
let abilityofPokemon = [];
let abilityofPokemonURL = [];
let typeofPokemon = [];
let pokemonValue = JSON.parse(localStorage.getItem("pokemonValue"));
let category = JSON.parse(localStorage.getItem("category"));
let description = JSON.parse(localStorage.getItem("description"));

//looping abilities
function loopAbilities(data) {
  data.abilities.forEach((ability) => {
    abilityofPokemon.push(ability.ability.name);
    abilityofPokemonURL.push(ability.ability.url);
    return abilityofPokemon;
  });
}

//looping types
function loopType(data) {
  data.types.forEach((type) => {
    typeofPokemon.push(type.type.name);
    return typeofPokemon;
  });
}

// checking type
const checkType = (arr) => {
  let li = "";
  arr.forEach((icon) => {
    switch (icon) {
      case "normal":
        li += `<li>
            <i class="fas fa-circle" alt="normal" data-type="normal"></i>
          </li>`;
        break;
      case "fire":
        li += `<li>
            <i class="fas fa-fire" data-type="fire"></i>
          </li>`;
        break;
      case "water":
        li += `<li>
            <i class="fas fa-tint" data-type="water"></i>
          </li>`;
        break;
      case "grass":
        li += `<li>
            <i class="fas fa-leaf" data-type="grass"></i>
          </li>`;
        break;
      case "electric":
        li += `<li>
            <i class="fas fa-bolt" data-type="electric"></i>
          </li>`;
        break;
      case "ice":
        li += `<li>
            <i class="fas fa-snowflake" data-type="ice"></i>
          </li>`;
        break;
      case "fighting":
        li += `<li>
            <i class="fas fa-fist-raised" data-type="fighting"></i>
          </li>`;
        break;
      case "poison":
        li += `<li>
            <i class="fas fa-skull" data-type="poison"></i>
          </li>`;
        break;
      case "ground":
        li += `<li>
            <i class="fas fa-mountain" data-type="ground"></i>
          </li>`;
        break;
      case "flying":
        li += `<li>
            <i class="fas fa-dove" data-type="flying"></i>
          </li>`;
        break;
      case "psychic":
        li += `<li>
            <i class="fas fa-dot-circle" data-type="psychic"></i>
          </li>`;
        break;
      case "bug":
        li += `<li>
            <i class="fas fa-bug" data-type="bug"></i>
          </li>`;
        break;
      case "rock":
        li += `<li>
            <i class="fas fa-gem" data-type="rock"></i>
          </li>`;
        break;
      case "ghost":
        li += `<li>
            <i class="fas fa-ghost" data-type="ghost"></i>
          </li>`;
        break;
      case "dragon":
        li += `<li>
            <i class="fas fa-dragon" data-type="dragon"></i>
          </li>`;
        break;
      case "dark":
        li += `<li>
            <i class="fas fa-adjust" data-type="dark"></i>
          </li>`;
        break;
      case "steel":
        li += `<li>
                <i class="fas fa-cog" data-type="steel"></i>
              </li>`;
        break;
      case "fairy":
        li += `<li>
                <i class="fas fa-magic" data-type="fairy"></i>
              </li>`;
        break;
    }
  });
  return `<ul class="listType"><li>Type:</li>${li}</ul>`;
};

const fetchSpeciesDetail = async (pokemonValue) => {
  try {
    const api2 = `${pokemonValue.species.url}`;
    let fetchSpecies = await fetch(api2, {
      method: "GET",
    });
    if (!fetchSpecies.ok) throw new Error(`(${fetchData.status})`);
    fetchSpecies.json().then((data) => {
      [data.flavor_text_entries].forEach((texts) => {
        texts.forEach((text) => {
          if (text.language.name !== "en") return;
          if (text.version.name !== "sword") return;
          localStorage.setItem("description", JSON.stringify(text.flavor_text));
        });
      });

      [data.genera].forEach((genera) => {
        genera.forEach((genus) => {
          if (genus.language.name !== "en") return;
          localStorage.setItem("category", JSON.stringify(genus.genus));
        });
      });
    });
  } catch (err) {
    alert(`Something went wrong. ${err.message}`);
  }
};

//render one pokemon information in the screen
function renderOnePokemon(pokemonData) {
  $(".onePokemon").empty();
  category = JSON.parse(localStorage.getItem("category"));
  description = JSON.parse(localStorage.getItem("description"));

  //insert period and 0 in the height
  let height = pokemonData.height.toString();
  height.length === 1
    ? (height = "0." + height.substring(0, height.length))
    : (height =
        height.substring(0, height.length - 1) +
        "." +
        height.substring(height.length - 1, height.length));

  //insert period in the weight
  let weight = pokemonData.weight.toString();
  weight =
    weight.substring(0, weight.length - 1) +
    "." +
    weight.substring(weight.length - 1, weight.length);

  //insert 0 in the pokemon number
  let number = pokemonData.id.toString();
  number.length === 1
    ? (number = "00" + number.substring(0, number.length))
    : number.length === 2
    ? (number = "0" + number.substring(0, number.length))
    : (number = number);

  typeofPokemon = [];
  loopType(pokemonData);
  abilityofPokemon = [];
  loopAbilities(pokemonData);

  const contents2 = `
    <div class="pokemon-info2">
    <div class="img-container">
    <img class="pokemon-img2" src="${
      pokemonData.sprites.other["official-artwork"].front_default
    }">
    </div>
    <div class="text">
    <p class="third-title-text">${pokemonData.name}</p>
    <p>No.${number}</p>
    <p>Name: ${pokemonData.name}</p>
    <p>Category: ${category}</p>
    <p>Abilities: ${abilityofPokemon}</p>
    <p>Height: ${height}m</p>
    <p>Weight: ${weight}kg</p>
    <div>${checkType(typeofPokemon)}</div>
    <p>${!description ? "" : description}</p>
    </div>
    </div>
    `;

  input.value = "";
  return onePokemon.insertAdjacentHTML("beforeend", contents2);
}
renderOnePokemon(pokemonValue);

//fetch onepokemon data of input form
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
      pokemonValue = JSON.parse(localStorage.getItem("pokemonValue"));

      const firstFunc = async function () {
        await fetchSpeciesDetail(pokemonValue);
      };

      const secondFunc = async function () {
        await location.reload("pokemon-info.html");
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

//search pokemon in the input form
const searchPokemon2 = () => {
  form.addEventListener("submit", (e) => {
    localStorage.clear();
    e.preventDefault();
    fetchOnePokemon(input.value.toLowerCase());
  });
};
searchPokemon2();
