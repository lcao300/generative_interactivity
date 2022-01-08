// helpers
let button,input,tx,prediction,s,wv,row,col,cv,cw,ch,delim,nf,myfont,is;
let s_ready = false;
let w_ready = false;
let done = false;
let pressed = false;

// features
let s_score,s_val,n_words,dt1,dt2;
let tokens = [];

// transformed features
let bg_col,sat,p_col,lw,ns,val,ns_int;

function setup() {
  myfont = loadFont('assets/Inconsolata-Light.ttf')
  colorMode(HSB);
  cw = windowWidth;
  ch = windowHeight;
  cv = createCanvas(cw,ch);
  
  is = (min(cw,ch)/2);
  nf = map(random(),0,1,500,5000);
  s = ml5.sentiment('movieReviews',ready_s);
  wv = ml5.word2vec('data/wordvecs5000.json',ready_w);
  input = createElement('textarea');
  input.size(is,is);
  input.elt.placeholder = 'VIEW ON COMPUTER FOR BEST EXPERIENCE\nhow are you today? (1000 characters max)';
  input.elt.style.textAlign = 'center';
  input.attribute('maxlength','1000');
  
  button = createButton('submit');
  input.position((windowWidth-is)/2,((windowHeight-is)/2)-((button.height+10)/2));
  button.position((windowWidth-button.width)/2,((windowHeight-is)/2)-((button.height+10)/2)+is+10);
  
  button.mousePressed(sub);
  cv.mouseReleased(analyze);
}

function ready_s() {
  s_ready = true;
}

function ready_w() {
  w_ready = true;
}

function sub() {
  input.hide();
  button.hide();
  background(0,0,0,0.2);
  textSize((30/600)*min(cw,ch));
  textAlign(CENTER,CENTER);
  fill(255);
  textFont(myfont);
  text('loading...',cw/2,ch/2);
  pressed = true;
}

function analyze() {
  if (done === false && pressed === true) {
    tx = input.value();
    while (!s_ready) {
      continue;
    }
    gets();
    tokenize();
    while (!w_ready) {
      continue;
    }
    getw();
    drawbg();
    runsim();
    done = true;
  }
}

function gets() {
  pred = s.predict(tx);
  s_score = map(pred.score,0,1,-1,1);
  s_val = abs(s_score);
}

function tokenize() {
  let temp = tx.replace(/[-_:;.,!?\(\)]/g, "");
  tokens = splitTokens(temp);
}

function getw() {
  let count = 0;
  n_words = tokens.length;
}

function drawbg() {
  fillparam();
  let c1,c2;
  if (s_score <= 0) {
    c1 = color(bg_col1,30,50);
    c2 = color(bg_col2,30,50);
  } else {
    c1 = color(bg_col1,30,90);
    c2 = color(bg_col2,30,90);
  }
  for (let x=0; x < width; x+=1) {
      for (let y=0; y < height; y+=1) {
        let noiseVal = noise(x*ns,y*ns);
        let lerp_c = lerpColor(c1,c2,noiseVal);
        stroke(lerp_c);
        point(x,y);
      }
  }
}

function gettime() {
  let m = map(month(),1,12,0,9);
  let d = map(day(),1,31,0,9);
  let h = map(hour(),0,23,0,9);
  let min = map(minute(),0,59,0,9);
  let sec = map(second(),0,59,0,9);
  let temp1 = sec*10+m*1;
  let temp2 = min*100+d*10+h;
  dt1 = temp1;
  dt2 = floor(map(temp2,0,999,0,100));
}

function fillparam() {
  delim = floor((5/600) * (min(cw,ch)) * (map(s_val,1,0,1,7)));
  row = floor(cw/delim);
  col = floor(ch/delim);
  
  gettime();
  bg_col1 = map(dt1,0,100,0,360);
  bg_col2 = map(dt2,0,100,0,360);
  sat = map(s_val,-0.5,1.3,0,100);
  if (s_score<=0) {
    p_col = 255;
    val = false;
  } else {
    p_col = 0;
    val = true;
  }
  lw = map(s_val,0,1,0.2,1);
  ns = map(s_val,0,1,0.005,0.03);
  ns_int = map(s_val,0,1,3,6);
}

function runsim() {
  let temp_words = n_words;
  let w = (0.1/600) * min(cw,ch);
  if (n_words > 300) {
    temp_words = 300;
  }
  let n_particles = map(temp_words,0,300,1000,3000);
  const s = new Simulation(n_particles,nf,delim,row,col,val,ns_int,w);
  s.go();
}