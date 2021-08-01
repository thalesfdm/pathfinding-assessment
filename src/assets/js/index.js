import Graph from "./Graph.js";
import routes from "./routes.js";
import coordinates from "./coordinates.js";

const fromList = document.getElementById("from-list");
const toList = document.getElementById("to-list");

for (let city in coordinates) {
  const option = document.createElement("option");
  option.value = city;
  option.innerHTML = city;
  fromList.appendChild(option);
  toList.appendChild(option.cloneNode(true));
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const img = new Image();

img.src = "./src/assets/img/map.png";
ctx.canvas.width = img.width;
ctx.canvas.height = img.height;
img.onload = () => ctx.drawImage(img, 0, 0);

const graph = Graph.fromJson(routes);

const renderFromTo = (from, to) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(img, 0, 0);

  const radius = 6;

  const xFrom = coordinates[from]["x"];
  const yFrom = coordinates[from]["y"];
  ctx.beginPath();
  ctx.arc(xFrom, yFrom, radius, 0, 2 * Math.PI);
  ctx.fillStyle = "blue";
  ctx.fill();

  const xTo = coordinates[to]["x"];
  const yTo = coordinates[to]["y"];
  ctx.beginPath();
  ctx.arc(xTo, yTo, radius, 0, 2 * Math.PI);
  ctx.fillStyle = "blue";
  ctx.fill();
};

fromList.addEventListener("change", () => {
  renderFromTo(fromList.value, toList.value);
  renderPath(getPath(fromList.value, toList.value));
});

toList.addEventListener("change", () => {
  renderFromTo(fromList.value, toList.value);
  renderPath(getPath(fromList.value, toList.value));
});

const getPath = (from, to) => {
  return graph.getShortestPath(from, to);
};

const renderPath = (path) => {
  path.nodes.forEach((city, i, path) => {
    if (path[i + 1]) {
      ctx.beginPath();
      ctx.moveTo(coordinates[city]["x"], coordinates[city]["y"]);
      ctx.lineTo(coordinates[path[i + 1]]["x"], coordinates[path[i + 1]]["y"]);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "blue";
      ctx.stroke();
    }
  });
};