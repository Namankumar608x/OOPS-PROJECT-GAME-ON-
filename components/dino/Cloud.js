export class Cloud {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 47;
    this.height = 13;
    this.active = true;
    this.speed = 0.8; // Clouds slow move
  }

  update() {
    this.x -= this.speed;
    
    if (this.x + this.width < 0) {
      this.active = false;
    }
  }

  getPosition() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}