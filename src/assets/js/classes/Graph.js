import Node from "./Node.js";
import NodeEntry from "./NodeEntry.js";
import Path from "./Path.js";
import PriorityQueue from "./PriorityQueue.js";

class Graph {
  constructor() {
    this.nodes = new Map();
  }

  addNode(label) {
    if (!this.nodes.has(label)) this.nodes.set(label, new Node(label));
  }

  addEdge(from, to, weight) {
    const fromNode = this.nodes.get(from);
    const toNode = this.nodes.get(to);
    fromNode.addEdge(toNode, weight);
  }

  static fromJson(data) {
    const graph = new Graph();

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

  getShortestPath(from, to, logger) {
    logger = logger || null;

    if (logger) logger.println("# Dijkstra", "#fff");

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

      if (logger) logger.println("currently at " + current.label, "#0f0");

      if (current == toNode) break;

      current.edges.forEach((edge) => {
        if (logger) {
          logger.print("--> checking " + edge.to.label, "#0a0");
          logger.println(" (" + edge.weight + " km)", "#aaa");
        }

        if (visited.has(edge.to)) return;

        const newDistance = distances.get(current) + edge.weight;
        if (newDistance < distances.get(edge.to)) {
          distances.set(edge.to, newDistance);
          previousNodes.set(edge.to, current);
          queue.add(new NodeEntry(edge.to, newDistance));
        }
      });
    }

    return this.buildPath(previousNodes, toNode);
  }
}

export default Graph;
