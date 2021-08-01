class PriorityQueue {
  constructor(comparator = (a, b) => a > b) {
    this.items = [];
    this.count = 0;
    this.comparator = comparator;
  }

  add(item) {
    let i;

    for (i = this.count - 1; i >= 0; i--) {
      if (this.comparator(this.items[i], item))
        this.items[i + 1] = this.items[i];
      else break;
    }

    this.items[i + 1] = item;
    this.count++;
  }

  remove() {
    return this.items[--this.count];
  }

  isEmpty() {
    return this.count == 0;
  }
}

export default PriorityQueue;
