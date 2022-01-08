class Simulation {
  constructor(n_particles,n_frames,delim,row,col,val,ns,w) {
    this.done = false;
    const f = new Field(n_particles,delim,row,col,val,ns,w);
    this.field = f;
    this.frames = n_frames;
  }
  
  go() {
    this.field.init();
    let count = 0;
    while (true) {
      this.field.update_field();
      if (count >= this.frames) {
        break;
      }
      count += 1;
    }
  }
}

class Field {
  constructor(n_particles,delim,row,col,val,ns,w) {
    this.n_particles = n_particles;
    this.d = delim;
    this.row = row;
    this.col = col;
    this.particles = [];
    this.field = [];
    this.val = val;
    this.ns = ns;
    this.w = w;
  }
  
  init() {
    for (let i=0; i<this.n_particles; i+=1) {
      const p = new Particle(this.val,this.w);
      this.particles.push(p);
    }
    let zoff = 0;
    let yoff = 0;
    for (let i=0; i<this.row; i+=1) {
      let xoff = 0;
      for (let j=0; j<this.col; j+=1) {
        let idx = i+j*this.col;
        let n = noise(xoff,yoff,zoff);
        let angle = n*TWO_PI*this.ns;
        let v = p5.Vector.fromAngle(angle);
        v.setMag(1);
        this.field[idx] = v;
        xoff += 0.1;
      }
      yoff += 0.1;
      zoff += 0.0003;
    }
  }
  
  update_field() {
    for (let i=0; i<this.n_particles; i+=1) {
      this.particles[i].follow(this.field,this.d,this.col);
      this.particles[i].update();
      this.particles[i].edge();
      this.particles[i].show();
    }
  }
  
}

class Particle {
  constructor(val,w) {
    this.pos = createVector(random(width),random(height));
    this.prev = this.pos.copy();
    this.v = createVector(0,0);
    this.a = createVector(0,0);
    this.maxv = 2;
    this.val = val;
    if (this.val) {
      this.sat = 255;
    } else {
      this.sat = 0;
    }
    this.width = w;
  }
  
  follow(pfield,d,col) {
    let x = floor(this.pos.x/d);
    let y = floor(this.pos.y/d);
    let idx = x+y*col;
    let tempvec = pfield[idx];
    this.a.add(tempvec);
  }
  
  update() {
    this.v.add(this.a);
    this.v.limit(this.maxv);
    this.pos.add(this.v);
    this.a.mult(0);
  }
  
  show() {
    stroke(color(this.sat));
    strokeWeight(this.width);
    line(this.prev.x,this.prev.y,this.pos.x,this.pos.y);
    this.update_pos();
  }
  
  update_pos() {
    this.prev.x = this.pos.x;
    this.prev.y = this.pos.y;
  }
  
  edge() {
    if (this.pos.x > width) {
      this.pos.x = 0;
      this.update_pos();
    }
    if (this.pos.x < 0) {
      this.pos.x = width;
      this.update_pos();
    }
    if (this.pos.y > height) {
      this.pos.y = 0;
      this.update_pos();
    }
    if (this.pos.y < 0) {
      this.pos.y = height;
      this.update_pos();
    }
  }
}