class Logger {
  constructor(element) {
    this.element = element;
  }

  print(message, color) {
    this.element.innerHTML += `<span style="color:${color}">${message}</span>`;
  }

  println(message, color) {
    this.element.innerHTML += `<span style="color:${color}">${message}</span><br />`;
  }

  clear() {
    this.element.innerHTML = "";
  }
}

export default Logger;
