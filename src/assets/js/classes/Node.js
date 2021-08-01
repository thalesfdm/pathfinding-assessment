import Edge from "./Edge.js";

class Node {
  constructor(label) {
    this.label = label;
    this.edges = new Array();
  }

  addEdge(to, weight) {
    this.edges.push(new Edge(this, to, weight));
  }
}

export default Node;
