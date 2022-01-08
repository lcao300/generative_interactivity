let clx,cly,padx,pady,sw,gl,stw;
let density = [];
let id_arr = [];

let fr = 20;

let op = [];
let mic, fft;

function setup() {
  clx = windowWidth;
  cly = windowHeight;
  
  sw = floor((0.75*min(clx,cly)/32));
  sw = max(min(sw,30),5);
  
  stw = sw/20;
  strokeWeight(stw);
  
  gl = 32 * sw;
  density = [0,sw/2,3*(sw/4),sw/4];
  
  padx = (clx - gl) / 2;
  pady = (cly - gl) / 2;
  createCanvas(clx, cly);
  frameRate(fr);
  for (let i = 0; i < 1024-1; i++) {
    op[i] = floor(random(1,5));
  }
  create_arr();
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT();
  fft.setInput(mic);
}

function draw() {
  let spectrum = fft.analyze();

  let c1 = map(max(spectrum),0,255,0,360);
  let c2 = Math.min.apply(null, spectrum.filter(Boolean));
  setGradient(c1,c2);

  for (var s=0;s<spectrum.length;s+=1) {
    let x = (floor(s/32)*sw)+padx;
    let y = ((s%32)*sw)+pady;
    let freq = spectrum[id_arr[s]];
    draw_square(x,y,s,freq);
  }
}

function create_arr() {
  for (var k=0;k<1024;k+=1) {
    id_arr[k] = 0;
  }
  let t = 1024-1;
  let xlim = [0,32-1];
  let dx = 0;
  let ylim = [0,32-1];
  let dy = 0;
  let state = 0;
  while (t>=0) {
    let idx = (32*dy)+dx;
    id_arr[idx] = t;
    t -= 1;
    switch(state) {
      case 0:
        if (dx==xlim[1]) {
          state = 1;
          ylim[0] += 1;
          dy += 1;
        } else {
          dx += 1;
        }
        break;
      case 1:
        if (dy==ylim[1]) {
          state = 2;
          xlim[1] -= 1;
          dx -= 1;
        } else {
          dy += 1;
        }
        break;
      case 2:
        if (dx==xlim[0]) {
          state = 3;
          ylim[1] -= 1;
          dy -= 1;
        } else {
          dx -= 1;
        }
        break;
      default:
        if (dy==ylim[0]) {
          state = 0;
          xlim[0] += 1;
          dx += 1;
        } else {
          dy -= 1;
        }
        break;
    } 
  }
}

function setGradient(f1,f2) {
  colorMode(HSB);
  let c1 = color(f1,20,100);
  let c2 = color(f2,20,100);
  colorMode(RGB);
  for (let i=0; i<=cly; i++) {
      let inter = map(i,0,cly,0,1);
      let c = lerpColor(c1,c2,inter);
      stroke(c);
      line(0,i,clx,i);
  }
}

function draw_square(x,y,i,f) {
  noFill();
  if (isNaN(f)) {
    stroke(0);
  } else {
    stroke(color(map(255-f,0,255,0,210)));
  }
  square(x,y,sw);
  
  let o = floor(random(0,4));
  let d = floor(map(f,0,255,1,3.99));
    
  switch (op[i]) {
    case 1:
      sq_line(x,y,o,d);
      break;
    case 2:
      sq_corner(x,y,o,d);
      break;
    case 3:
      sq_arc(x,y,o,d);
      break;
    default:
      sq_shape(x,y,o,d);
      break;
  }  
}

function sq_corner(x,y,o,d) {
  for(var i=0;i<=d;i+=1) {
    if (i==0) {
      continue;
    }
    dd = density[i];
    switch(o) {
      case 1:
        line(x+dd,y,x+dd,y+sw-dd);
        line(x+dd,y+sw-dd,x+sw,y+sw-dd);
        break;
      case 2:
        line(x+dd,y,x+dd,y+dd);
        line(x+dd,y+dd,x,y+dd);
        break;
      case 3:
        line(x+dd,y+sw,x+dd,y+dd);
        line(x+dd,y+dd,x+sw,y+dd);
        break;
      default:
        line(x,y+sw-dd,x+dd,y+sw-dd);
        line(x+dd,y+sw-dd,x+dd,y+sw);
        break;
    }
  }
}

function sq_arc(x,y,o,d) {
  for(var i=0;i<=d;i+=1) {
    if (i==0) {
      continue;
    }
    dd = density[i]*2;
    switch(o) {
      case 1:
        arc(x,y,dd,dd, 0, HALF_PI);
        break;
      case 2:
        arc(x+sw,y,dd,dd, HALF_PI, PI);
        break;
      case 3:
        arc(x+sw,y+sw,dd,dd, PI, 3*HALF_PI);
        break;
      default:
        arc(x,y+sw,dd,dd, 3*HALF_PI, 2*PI);
        break;
    }
  }
}

function sq_line(x,y,o,d) {
  switch(o) {
    case 1:
      if (d>=1) {
        line(x,y,x+sw,y+sw);
      }
      if (d>=2) {
        line(x,y+(sw/2),x+(sw/2),y+sw);
      }
      if (d>=3) {
        line(x+(sw/2),y,x+sw,y+(sw/2));
      }
      break;
    case 2:
      if (d>=1) {
        line(x,y+sw,x+sw,y);
      }
      if (d>=2) {
        line(x+(sw/2),y,x,y+(sw/2));
      }
      if (d>=3) {
        line(x+sw,y+(sw/2),x+(sw/2),y+sw);
      }
      break;
    case 3:
      if (d>=1) {
        line(x+(sw/2),y,x+(sw/2),y+sw);
      }
      if (d>=2) {
        line(x+(sw/4),y,x+(sw/4),y+sw);
      }
      if (d>=3) {
        line(x+(3*(sw/4)),y,x+(3*(sw/4)),y+sw);
      }
      break;
    default:
      if (d>=1) {
        line(x,y+(sw/2),x+sw,y+(sw/2));
      }
      if (d>=2) {
        line(x,y+(sw/4),x+sw,y+(sw/4));
      }
      if (d>=3) {
        line(x,y+(3*(sw/4)),x+sw,y+(3*(sw/4)));
      }
      break;
  }
}

function sq_shape(x,y,o,d) {
  for(var i=0;i<=d;i+=1) {
    switch(o) {
      case 1:
        dd = density[3-i]+(sw/4);
        circle(x+(sw/2),y+(sw/2),dd);
        break;
      case 2:
        dd = density[i];
        square(x+((sw/2)-(dd/2)),y+((sw/2)-(dd/2)),dd);
        break;
      case 3:
        dd = density[i]/2;
        hexagon(x+(sw/2),y+(sw/2),dd);
        break;
      default:
        dd = density[i]/2;
        trigon(x+(sw/2),y+(sw/2),dd);
        break;
    }
  }
}

function hexagon(x,y,radius) {
  let angle = TWO_PI/6;
  beginShape();
  for (let a=0;a<TWO_PI;a+=angle) {
    let sx = x+cos(a)*radius;
    let sy = y+sin(a)*radius;
    vertex(sx,sy);
  }
  endShape(CLOSE);
}

function trigon(x,y,radius) {
  let angle = TWO_PI/3;
  beginShape();
  for (let a=PI/6;a<TWO_PI;a+=angle) {
    let sx = x+cos(a)*radius;
    let sy = y+sin(a)*radius+(sw/10);
    vertex(sx,sy);
  }
  endShape(CLOSE);
}

function touchStarted() {
  getAudioContext().resume();
}

function off() {
  document.getElementById("overlay").style.display = "none";
}

document.addEventListener("click",toggle);
function toggle(event) {
  var x = event.target;
  if (x.style.filter === "invert(1)") {
    x.style.filter = "invert(1) grayscale(1)";
  } else if (x.style.filter === "invert(1) grayscale(1)") {
    x.style.filter = "invert(1) contrast(2) grayscale(1)";
  } else if (x.style.filter === "invert(1) contrast(2) grayscale(1)") {
    x.style.filter = "contrast(2) grayscale(1)";
  } else if (x.style.filter === "contrast(2) grayscale(1)") {
    x.style.filter = "none";
  } else {
    x.style.filter = "invert(1)";
  }
}
