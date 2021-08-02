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

  async depthFirstSearch(from, to) {
    if (this.logger) {
      this.logger.clear();
      this.logger.println("# DEPTH FIRST SEARCH", "yellow");
      this.logger.print("Starting at ", "white");
      this.logger.print(from, "lightgreen");
      this.logger.println("...", "white");
    }

    if (this.cartographer) {
      this.cartographer.clearMap();
      this.cartographer.addMarker(
        this.cartographer.coordinates[from]["x"],
        this.cartographer.coordinates[from]["y"]
      );
      this.cartographer.addMarker(
        this.cartographer.coordinates[to]["x"],
        this.cartographer.coordinates[to]["y"]
      );
    }

    const fromNode = this.nodes.get(from);
    const toNode = this.nodes.get(to);

    const previousNodes = new Map();
    const visited = new Set();
    const stack = new Array();

    stack.push(fromNode);

    while (stack.length != 0) {
      const current = stack.pop();

      if (visited.has(current)) continue;
      if (current == toNode) break;

      visited.add(current);

      for (const edge of current.edges) {
        if (!visited.has(edge.to)) stack.push(edge.to);

        if (this.logger) {
          this.logger.print("From ", "green");
          this.logger.print(edge.from.label, "lightgreen");
          this.logger.print(", checking ", "green");
          this.logger.print(edge.to.label, "lightgreen");
          this.logger.println("...", "green");
        }

        if (this.cartographer) {
          await this.cartographer.drawRoute(
            this.cartographer.coordinates[edge.from.label]["x"],
            this.cartographer.coordinates[edge.from.label]["y"],
            this.cartographer.coordinates[edge.to.label]["x"],
            this.cartographer.coordinates[edge.to.label]["y"],
            "#0f0",
            3
          );
          this.cartographer.addMarker(
            this.cartographer.coordinates[edge.to.label]["x"],
            this.cartographer.coordinates[edge.to.label]["y"],
            "#0f0",
            4
          );
          this.cartographer.addMarker(
            this.cartographer.coordinates[from]["x"],
            this.cartographer.coordinates[from]["y"]
          );
          this.cartographer.addMarker(
            this.cartographer.coordinates[to]["x"],
            this.cartographer.coordinates[to]["y"]
          );
        }
      }
    }

    const path = this.buildPath(previousNodes, toNode);

    if (this.logger) {
      this.logger.println("Found a path!", "white");
      this.logger.println(path.toString(), "yellow");
      this.logger.println("Distance: " + distances.get(toNode), "white");
    }

    if (this.cartographer) await this.cartographer.drawPath(path);

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

    if (this.cartographer) {
      this.cartographer.clearMap();
      this.cartographer.addMarker(
        this.cartographer.coordinates[from]["x"],
        this.cartographer.coordinates[from]["y"]
      );
      this.cartographer.addMarker(
        this.cartographer.coordinates[to]["x"],
        this.cartographer.coordinates[to]["y"]
      );
    }

    const fromNode = this.nodes.get(from);
    const toNode = this.nodes.get(to);

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
            await this.cartographer.drawRoute(
              this.cartographer.coordinates[edge.from.label]["x"],
              this.cartographer.coordinates[edge.from.label]["y"],
              this.cartographer.coordinates[edge.to.label]["x"],
              this.cartographer.coordinates[edge.to.label]["y"],
              "#0f0",
              3
            );
            this.cartographer.addMarker(
              this.cartographer.coordinates[edge.to.label]["x"],
              this.cartographer.coordinates[edge.to.label]["y"],
              "#0f0",
              4
            );
            this.cartographer.addMarker(
              this.cartographer.coordinates[from]["x"],
              this.cartographer.coordinates[from]["y"]
            );
            this.cartographer.addMarker(
              this.cartographer.coordinates[to]["x"],
              this.cartographer.coordinates[to]["y"]
            );
          }
        }
      }
    }

    const path = this.buildPath(previousNodes, toNode);

    if (this.logger) {
      this.logger.println("Found a path!", "white");
      this.logger.println(path.toString(), "yellow");
      this.logger.println("Distance: " + distances.get(toNode), "white");
    }

    if (this.cartographer) await this.cartographer.drawPath(path);

    return path;
  }
}

export default Graph;
