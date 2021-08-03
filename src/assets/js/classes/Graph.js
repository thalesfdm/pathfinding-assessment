import Node from "./Node.js";
import NodeEntry from "./NodeEntry.js";
import Path from "./Path.js";
import PriorityQueue from "./PriorityQueue.js";

class Graph {
  constructor(logger, cartographer) {
    this.nodes = new Map();
    this.cartographer = cartographer;
    this.logger = logger;
  }

  addNode(label) {
    if (!this.nodes.has(label)) this.nodes.set(label, new Node(label));
  }

  addEdge(from, to, weight) {
    const fromNode = this.nodes.get(from);
    const toNode = this.nodes.get(to);
    fromNode.addEdge(toNode, weight);
  }

  static fromJson(data, logger, cartographer) {
    const graph = new Graph(logger, cartographer);

    Object.keys(data).forEach((key) => {
      const from = key;
      graph.addNode(from);
      Object.keys(data[from]).forEach((key) => {
        const to = key;
        const weight = data[from][to];
        graph.addNode(to);
        graph.addEdge(from, to, weight);
      });
    });

    return graph;
  }

  buildPath(previousNodes, toNode) {
    const stack = new Array();
    stack.push(toNode);

    let previous = previousNodes.get(toNode);
    while (previous != null) {
      stack.push(previous);
      previous = previousNodes.get(previous);
    }

    const path = new Path();
    while (!(stack.length == 0)) path.add(stack.pop().label);

    return path;
  }

  async uniformCostSearch(from, to) {
    if (this.logger) {
      this.logger.clear();
      this.logger.println("# UNIFORM COST SEARCH", "yellow");
      this.logger.print("Starting at ", "white");
      this.logger.print(from, "lightgreen");
      this.logger.println("...", "white");
    }

    const fromNode = this.nodes.get(from);
    const toNode = this.nodes.get(to);

    if (this.cartographer) {
      this.cartographer.clearMap();
      this.cartographer.color = "#0f0";
      this.drawNode(fromNode, "blue");
      this.drawNode(toNode, "blue");
    }

    const distances = new Map();

    this.nodes.forEach((node) => distances.set(node, Number.MAX_VALUE));
    distances.set(fromNode, 0);

    const previousNodes = new Map();
    const visited = new Set();
    const queue = new PriorityQueue((a, b) => a.priority < b.priority);

    queue.add(new NodeEntry(fromNode, 0));

    while (!queue.isEmpty()) {
      const current = queue.remove().node;
      visited.add(current);

      if (current == toNode) break;

      for (const edge of current.edges) {
        if (visited.has(edge.to)) continue;

        const newDistance = distances.get(current) + edge.weight;

        if (newDistance < distances.get(edge.to)) {
          distances.set(edge.to, newDistance);
          previousNodes.set(edge.to, current);
          queue.add(new NodeEntry(edge.to, newDistance));

          if (this.logger) {
            this.logger.print("From ", "green");
            this.logger.print(edge.from.label, "lightgreen");
            this.logger.print(", checking ", "green");
            this.logger.print(edge.to.label, "lightgreen");
            this.logger.println("...", "green");
          }

          if (this.cartographer) {
            await this.drawEdge(edge);
            this.drawNode(edge.to, this.cartographer.color, 4);
            this.drawNode(fromNode, "blue");
            this.drawNode(toNode, "blue");
          }
        }
      }
    }

    const path = this.buildPath(previousNodes, toNode);

    if (this.logger) {
      this.logger.println("Found a path!", "white");
      this.logger.println(path.toString(), "yellow");
      this.logger.println("Distance: " + distances.get(toNode) + " km", "white");
    }

    this.cartographer.color = "blue";
    if (this.cartographer) await this.cartographer.drawPath(path);

    return path;
  }

  async aStarSearch(from, to) {
    if (this.logger) {
      this.logger.clear();
      this.logger.println("# A* SEARCH", "yellow");
      this.logger.print("Starting at ", "white");
      this.logger.print(from, "lightgreen");
      this.logger.println("...", "white");
    }

    const fromNode = this.nodes.get(from);
    const toNode = this.nodes.get(to);

    if (this.cartographer) {
      this.cartographer.clearMap();
      this.cartographer.color = "#0f0";
      this.drawNode(fromNode, "blue");
      this.drawNode(toNode, "blue");
    }

    const gScore = new Map();
    this.nodes.forEach((node) => gScore.set(node, Number.MAX_VALUE));
    gScore.set(fromNode, 0);

    const fScore = new Map();
    this.nodes.forEach((node) => fScore.set(node, Number.MAX_VALUE));
    fScore.set(fromNode, this.getHeuristics(fromNode, toNode));

    const previousNodes = new Map();
    const visited = new Set();
    const queue = new PriorityQueue((a, b) => a.priority < b.priority);

    queue.add(new NodeEntry(fromNode, fScore.get(fromNode)));

    while (!queue.isEmpty()) {
      const current = queue.remove().node;
      visited.add(current);

      if (current == toNode) break;

      for (const edge of current.edges) {
        if (visited.has(edge.to)) continue;
        const tentative = gScore.get(current) + edge.weight;

        if (tentative < gScore.get(edge.to)) {
          previousNodes.set(edge.to, current);
          gScore.set(edge.to, tentative);
          fScore.set(
            edge.to,
            gScore.get(edge.to) + this.getHeuristics(edge.to, toNode)
          );

          queue.add(new NodeEntry(edge.to, fScore.get(edge.to)));
        }

        if (this.logger) {
          this.logger.print("From ", "green");
          this.logger.print(edge.from.label, "lightgreen");
          this.logger.print(", checking ", "green");
          this.logger.print(edge.to.label, "lightgreen");
          this.logger.println("...", "green");
        }

        if (this.cartographer) {
          await this.drawEdge(edge);
          this.drawNode(edge.to, this.cartographer.color, 4);
          this.drawNode(fromNode, "blue");
          this.drawNode(toNode, "blue");
        }
      }
    }

    const path = this.buildPath(previousNodes, toNode);

    if (this.logger) {
      this.logger.println("Found a path!", "white");
      this.logger.println(path.toString(), "yellow");
      this.logger.println("Distance: " + gScore.get(toNode) + " km", "white");
    }

    this.cartographer.color = "blue";
    if (this.cartographer) await this.cartographer.drawPath(path);

    return path;
  }

  getHeuristics(node, goal) {
    const x1 = this.cartographer.coordinates[node.label]["x"];
    const y1 = this.cartographer.coordinates[node.label]["y"];
    const x2 = this.cartographer.coordinates[goal.label]["x"];
    const y2 = this.cartographer.coordinates[goal.label]["y"];
    const a = x1 - x2;
    const b = y1 - y2;
    return Math.sqrt(a * a + b * b) * 8;
  }

  drawNode(node, color, radius) {
    this.cartographer.addMarker(
      this.cartographer.coordinates[node.label]["x"],
      this.cartographer.coordinates[node.label]["y"],
      color,
      radius
    );
  }

  async drawEdge(edge, color, width) {
    await this.cartographer.drawRoute(
      this.cartographer.coordinates[edge.from.label]["x"],
      this.cartographer.coordinates[edge.from.label]["y"],
      this.cartographer.coordinates[edge.to.label]["x"],
      this.cartographer.coordinates[edge.to.label]["y"],
      color,
      width
    );
  }
}

export default Graph;
