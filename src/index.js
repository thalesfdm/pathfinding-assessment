import Cartographer from "./assets/js/classes/Cartographer.js";
import Graph from "./assets/js/classes/Graph.js";
import Logger from "./assets/js/classes/Logger.js";
import routes from "./assets/js/data/routes.js";
import coordinates from "./assets/js/data/coordinates.js";

const fromList = document.getElementById("from-list");
const toList = document.getElementById("to-list");
const searchButton = document.getElementById("search-button");

for (let city in coordinates) {
  const option = document.createElement("option");
  option.value = city;
  option.innerHTML = city;
  fromList.appendChild(option);
  toList.appendChild(option.cloneNode(true));
}

const canvas = document.getElementById("canvas");
const cartographer = new Cartographer(
  canvas,
  "./src/assets/img/map.png",
  coordinates
);
const logger = new Logger(document.getElementById("logger"));
const graph = Graph.fromJson(routes, logger, cartographer);

searchButton.addEventListener("click", () => {
  return graph.uniformCostSearch(fromList.value, toList.value);
});
