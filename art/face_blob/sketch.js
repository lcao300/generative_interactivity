let capture,cw,ch,cv,maxem,maxind,maxcol;
let url = 'https://rawcdn.githack.com/justadudewhohacks/face-api.js/8259275ef11c5872450d3e52a8104ea9225df29e/weights';
let ready = false;
let detections = [];
let prob = [];
let emotions = ['neutral','happy','sad','angry','fearful','disgusted','surprised'];
let colors = [270,45,200,0,175,100,330];
let ballem = [];
const r = d3.randomUniform;
const num = 100;
const pi2 = Math.PI *2;
const angle = pi2 / num;
const factor = 0.3;
let radius,N;

let physics;
let balls;
let center;

let t, s;


async function pre() {
  console.log('loading models')
	await faceapi.loadSsdMobilenetv1Model(url);
    await faceapi.loadFaceExpressionModel(url);
  ready = true;
  console.log(faceapi.nets);
  console.log('loaded models');
}

function setblobs() {
  ctx = canvas.getContext("2d");
  noStroke();
  
  physics = new VerletPhysics2D();
  physics.setWorldBounds(new Rect(0,0,cw,ch));
  physics.setDrag(0.0001);
  
  balls = d3.range(N).map(i => new Ball(Math.random()*cw, Math.random()*ch));
  
  for (let b of balls) {
    physics.addParticle(b);
    physics.addBehavior(new AttractionBehavior(b,floor(min(cw,ch)/10),-0.5));
  }
  
  center = new VerletParticle2D(cw/2,ch/2);
  physics.addParticle(center);
  physics.addBehavior(new AttractionBehavior(center,min(cw,ch),0.5));
  center.lock();
}

function setup() {
  frameRate(10);
  pre();
  cw = windowWidth;
  ch = windowHeight;
  N = floor(min(cw,ch)/20);
  setblobs();
  cv = createCanvas(cw,ch);
  bg = createGraphics(cw,ch);
  capture = createCapture(VIDEO);
  capture.size(cw,ch);
  capture.hide();
  textSize(20);
}

function draw() {
  faceapi.detectAllFaces(capture.elt).withFaceExpressions()
    .then((allFaces) => {
      for (var detectionsWithExpressions of allFaces) {
        if (detectionsWithExpressions == undefined) {
          console.log("No face detected");
        } else {
          let exprs = detectionsWithExpressions.expressions;
          for (let i=0; i<emotions.length; i+=1) {
            prob[i] = exprs[i].probability.toFixed(3);
          }
        }
    }
  });
  
  maxem = -1;
  maxind = -1;
  for (let i=0;i<prob.length;i++) {
    if (prob[i] >= maxem) {
      maxem = prob[i];
      maxind = i;
    }
  }
  let h = colors[maxind];
  let s = floor(map(maxem,0,1,25,75));
  colorMode(HSB);
  maxcol = color(h,s,100);
  
  let min = map(minute(),0,59,0,360);
  let sec = map(second(),0,59,0,360);
  let temp_str = '-webkit-linear-gradient(0deg, hsla('+floor(min)+',100%,90%,1) 0%, hsla('+floor(sec)+',100%,90%,1) 100%)';
  select('html').style('background',temp_str);
  
  for (let k=0;k<N;k++) {
    j = floor(random(0,ballem.length+1));
    ballem[k] = j;
  }
  
  drawblobs();
}

function drawblobs() {
  ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
  physics.update();
  s = Math.sin(frameCount*-0.01)*10
  center.set(cw/2 + (Math.cos(s%pi2)*20), ch/2 + (Math.sin(s%pi2)*20));
  let count = 0;
  for (let b of balls) {
    b.render(ballem[count]);
    count += 1;
  }
 
  t = frameCount*0.012;
  
  fill(maxcol);
  beginShape()
  for (let i=0; i<num; i++) {
    x = Math.cos(angle*i);
    y = Math.sin(angle*i);
    n = map(noise(x*factor+t,y*factor+t),0,1,35,floor(min(cw,ch)/5));
    p = createVector(x,y).mult(n);
    vertex(p.x+cw/2,p.y+ch/2);
  endShape(CLOSE)
  }
}

class Ball extends VerletParticle2D {
  constructor(x, y) {
    super(x,y);
    
    this.dia = Math.random() < 0.5 ? r(24, 35)() : r(50, 70)() 
    this.col = createVector(Math.random()*floor(min(cw,ch)), Math.random()*(floor(min(cw,ch))), Math.random()*(floor(min(cw,ch))));
    this.setWeight(map(this.dia, 20, 70, 1, 0.9));
  }
  
  render(ind) {
    fill(colors[ind],floor(map(this.col.x+this.col.y,0,2*floor(min(cw,ch)),0,100)),floor(map(this.col.z,0,floor(min(cw,ch)),0,100)));
    ellipse(this.x,this.y,this.dia,this.dia)
  }

}