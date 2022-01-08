let cw,ch,p;
let max_keys;
let density,squares;
let flip = 0;
let outline = 1;
let gray = 0;

let color_coords = [0,0];
let canvas_x;
let h = 100;
let b = 100;
let s = 0;
let a = 0;
let bg_color = 220;

let aud_io,audio_n,audio_max;
let audio_seed = 180;
let base = 200;
let max_base = 300;
let min_base = 100;
let sawtooth_val = 1;
let square_val = 1;
let audio_val = [0,0];
let sine_arr = [];
let tri_arr = [];
let sawtooth_arr = [];
let square_arr = [];

function setup() {
  cw = windowWidth;
  ch = windowHeight;
  canvas_x = 0;
  cv = createCanvas(cw,ch);
  background(bg_color);
  max_keys = 30;
  density = (min(cw,ch)/500)*((cw+ch)/2);
  squares = floor(density);
  
  p = new Parallax(squares,s,a);
  p.init();
  p.render();
  
  audio_setup();
}

function draw() {
  background(bg_color);
  key_typed();
  audio_on();
  colorMode(HSB);
  set_color();
  p.render();
}

function key_typed() {
  if (keyIsDown(87)) {
    color_coords[1] = min(color_coords[1]+0.1,max_keys);
  } 
  if (keyIsDown(83)) {
    color_coords[1] = max(color_coords[1]-0.1,-1*max_keys);
  }
  if (keyIsDown(65)) {
    color_coords[0] = max(color_coords[0]-0.1,-1*max_keys);
  } 
  if (keyIsDown(68)) {
    color_coords[0] = min(color_coords[0]+0.1,max_keys);
  }
  if (keyIsDown(81)) {
    p.hue_shift(1);
    audio_seed -= 1;
    if (audio_seed < 0) {
      audio_seed += 360;
    }
    base = map(audio_seed,0,360,min_base,max_base);
    audio_freq(base);
  } 
  if (keyIsDown(69)) {
    p.hue_shift(-1);
    audio_seed += 1;
    if (audio_seed > 360) {
      audio_seed -= 360;
    }
    base = map(audio_seed,0,360,min_base,max_base);
    audio_freq(base);
  } 
  if (keyIsDown(39)) {
    p.move(1,0);
    canvas_x += 1;
    if (canvas_x > cw) {
      canvas_x -= 2*cw;
    }
    let temp = canvas_sin(canvas_x);
    audio_pan(temp);
  }
  if (keyIsDown(37)) {
    p.move(-1,0);
    canvas_x -= 1;
    if (canvas_x < -cw) {
      canvas_x += 2*cw;
    }
    let temp = canvas_sin(canvas_x);
    audio_pan(temp);
  }
  if (keyIsDown(38)) {
    p.move(0,-1);
  }
  if (keyIsDown(40)) {
    p.move(0,1);
  }
}

function keyPressed() {
  if (key === 'Shift') {
    aud_io = abs(aud_io-1);
  } else if (key === 'f') {
    flip = abs(flip-1);
    colorMode(RGB);
    bg_color = 255-bg_color;
    background(bg_color);
    colorMode(HSB);
    p.invert();
  } else if (key === '/') {
    outline = abs(outline-1);
    p.dim(outline);
    square_val = abs(square_val-1);
  } else if (key === '.') {
    gray = abs(gray-1);
    p.to_gray(gray);
    sawtooth_val = abs(sawtooth_val-1);
  }
}

function set_color() {
  s = abs(map(color_coords[0],-1*max_keys,max_keys,-100,100));
  a = abs(map(color_coords[1],-1*max_keys,max_keys,-1,1));
  p.update_col(s,a);
}

function audio_setup() {
  audio_n = 0;
  aud_io = 0;
  audio_val = [0,0];
  audio_max = 30;
  for (let i=0; i<audio_max; i+=1) {
    wave1 = new p5.Oscillator();
    wave1.setType('sine');
    wave1.start();
    wave1.freq(base*(i+1));
    wave1.amp(0);
    sine_arr[i] = wave1;
    wave2 = new p5.Oscillator();
    wave2.setType('triangle');
    wave2.start();
    wave2.freq(base*(i+1));
    wave2.amp(0);
    tri_arr[i] = wave2;
    wave3 = new p5.Oscillator();
    wave3.setType('sawtooth');
    wave3.start();
    wave3.freq(base*(i+1));
    wave3.amp(0);
    sawtooth_arr[i] = wave3;
    wave4 = new p5.Oscillator();
    wave4.setType('square');
    wave4.start();
    wave4.freq(base*(i+1));
    wave4.amp(0);
    square_arr[i] = wave4;
  }
}

function audio_freq(b) {
  for (let i=0; i<audio_max; i+=1) {
    sine_arr[i].freq(b*(i+1));
    tri_arr[i].freq(b*(i+1));
    sawtooth_arr[i].freq(b*(i+1));
    square_arr[i].freq(b*(i+1));
  }
}

function audio_pan(x) {
  for (let i=0; i<audio_max; i+=1) {
    sine_arr[i].pan(x);
    tri_arr[i].pan(x);
    sawtooth_arr[i].pan(x);
    square_arr[i].pan(x);
  }
}

function canvas_sin(x) {
  let temp = sin((PI/(cw/2))*x);
  return temp;
}

function audio_on() {
  let saw_val = sawtooth_val;
  let sq_val = square_val;
  if (flip === 1) {
    audio_val = [0,1];
  } else {
    audio_val = [1,0];
  }
  if (aud_io === 0) {
    audio_val = [0,0];
    saw_val = 0;
    sq_val = 0;
  }
  
  let temp = dist(0,0,color_coords[0],color_coords[1]);
  audio_n = map(temp,0,45,0,audio_max);
  for (let i=0; i<audio_max; i+=1) {
    let d = decay(i);
    if (i<floor(audio_n)) {
      sine_arr[i].amp(d*audio_val[0]);
      tri_arr[i].amp(d*audio_val[1]);
      sawtooth_arr[i].amp(saw_val*d);
      square_arr[i].amp(sq_val*d);
    } else {
      sine_arr[i].amp(0);
      tri_arr[i].amp(0);
      sawtooth_arr[i].amp(0);
      square_arr[i].amp(0);
    }
  }
}

function decay(i) {
  let temp = exp(-1*0.3*i);
  return temp;
}

function off() {
  document.getElementById("overlay").style.display = "none";
}

function touchStarted() {
  getAudioContext().resume();
}