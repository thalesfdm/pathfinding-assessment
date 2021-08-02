class Path {
  constructor() {
    this.nodes = new Array();
  }

  add(node) {
    this.nodes.push(node);
  }

  toString() {
    let str = "Path: ";
    this.nodes.forEach(
      (node, i, arr) => (str += node + (i != arr.length - 1 ? " -> " : " "))
    );
    return str;
  }
}

export default Path;
