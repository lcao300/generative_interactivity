class Parallax {
  constructor(squares,s,a) {
    this.num_squares = squares;
    this.sat = s;
    this.transparency = a;
    this.sq_arr = [];
    this.max_amp = min(cw,ch)/10;
    this.mult = min(cw,ch)*5;
    this.fill = 1;
    this.stroke = min(cw,ch)/500;
    this.gray = 0;
  }
  
  init() {
    for (let i=0; i<this.num_squares; i+=1) {
      let z = i + random(-0.5,0.5);
      let temp = new Square(this.sat,this.transparency,this.max_amp,z);
      this.sq_arr[i] = temp;
    }
  }
  
  render() {
    for (let i=0; i<this.num_squares; i+=1) {
      let sq = this.sq_arr[i];
      let c;
      if (this.gray === 0) {
        colorMode(HSB);
        c = color(sq.hue,sq.sat,sq.brightness,sq.transparency);
      } else {
        colorMode(RGB);
        let temp = map(sq.transparency,0,1,0,255);
        c = color(sq.gray,temp);
      }
      if (this.fill === 1) {
        noStroke();
        fill(c);
      } else {
        noFill();
        strokeWeight(this.stroke);
        stroke(c);
      }
      rect(sq.x,sq.y,sq.amp);
    }
    colorMode(HSB);
  }
  
  to_gray(g) {
    this.gray = g;
  }
  
  dim(out) {
    this.fill = out;
  }
  
  invert() {
    for (let i=0; i<this.num_squares; i+=1) {
      let sq = this.sq_arr[i];
      sq.hue = (sq.hue+180)%360;
    }
  }
  
  update_col(s,a) {
    for (let i=0; i<this.num_squares; i+=1) {
      let sq = this.sq_arr[i];
      sq.sat = s;
      sq.transparency = a;
    }
  }
  
  move(x,y) {
    for (let i=0; i<this.num_squares; i+=1) {
      let sq = this.sq_arr[i];
      sq.x += this.mult * x * ((sq.z)/(cw*ch));
      sq.y += this.mult * y * ((sq.z)/(cw*ch));
      sq.check();
    }
  }
  
  hue_shift(ind) {
    for (let i=0; i<this.num_squares; i+=1) {
      let sq = this.sq_arr[i];
      sq.hue = (sq.hue+1)%360;
      sq.gray = map(sq.hue,0,360,0,255);
    }
  }
  
}

class Square {
  constructor(s,a,max_amp,z) {
    this.hue = floor(random(360));
    this.sat = s;
    this.brightness = 100;
    this.transparency = a;
    this.amp = random(1,max_amp);
    this.x_bounds = cw/6;
    this.y_bounds = ch/6;
    this.x = floor(random(-1*this.x_bounds,cw+this.x_bounds));
    this.y = floor(random(-1*this.y_bounds,ch+this.y_bounds));
    this.z = z;
    this.gray = map(this.hue,0,360,0,255);
  }
  
  check() {
    if (this.x<(-1*this.x_bounds)) {
      let dx = abs(this.x);
      dx = dx % this.x_bounds;
      this.x = cw+dx;
    }
    if (this.x>cw+this.x_bounds) {
      let dx = abs(this.x-this.x_bounds);
      dx = dx % this.x_bounds;
      this.x = -1*this.x_bounds + dx;
    }
    if (this.y<(-1*this.y_bounds)) {
      let dy = abs(this.y);
      dy = dy % this.y_bounds;
      this.y = ch+dy;
    }
    if (this.y>ch+this.y_bounds) {
      let dy = abs(this.y-this.y_bounds);
      dy = dy % this.y_bounds;
      this.y = -1*this.y_bounds + dy;
    }
  }
}