class Cartographer {
  constructor(canvas, image, coordinates, color) {
    this.ctx = canvas.getContext("2d");
    this.loadMap(image);
    this.coordinates = coordinates;
    this.color = color || "blue";
  }

  async loadMap(image) {
    this.map = await new Promise((r) => {
      const img = new Image();
      img.onload = () => r(img);
      img.src = image;
    });
    this.ctx.canvas.width = this.map.width;
    this.ctx.canvas.height = this.map.height;
    this.ctx.drawImage(this.map, 0, 0);
  }

  clearMap() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.drawImage(this.map, 0, 0);
  }

  addMarker(x, y, color, radius) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius || 8, 0, 2 * Math.PI);
    this.ctx.fillStyle = color || this.color;
    this.ctx.fill();
  }

  async drawRoute(fromX, fromY, toX, toY, color, width) {
    this.ctx.beginPath();
    this.ctx.moveTo(fromX, fromY);
    this.ctx.lineTo(toX, toY);
    this.ctx.lineWidth = width || 3;
    this.ctx.strokeStyle = color || this.color;
    await this.takeTime(250);
    this.ctx.stroke();
  }

  async drawPath(path) {
    const nodes = path.nodes;
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i + 1]) {
        await this.drawRoute(
          this.coordinates[nodes[i]]["x"],
          this.coordinates[nodes[i]]["y"],
          this.coordinates[nodes[i + 1]]["x"],
          this.coordinates[nodes[i + 1]]["y"]
        );
      }
    }
  }

  async takeTime(time) {
    await new Promise((r) => setTimeout(r, time));
  }
}

export default Cartographer;
