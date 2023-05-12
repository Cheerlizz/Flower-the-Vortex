// The Thorn
// Created by Yuelin Guo in Jan.2023

// Inspired by Daniel Shiffman's L-System Fractal Trees 
// Rules are adapted from Eric Davidson's Generative-Plants
// Code for: https://editor.p5js.org/codingtrain/sketches/QmTx-Y_UP

// Instructions: change the properties in settings area and hit the "generate" button to show the outcome of iterations
// the sentences shown below tell the text outcome of each iteration
// variables: F G + - [ ]
// axiom: F
// rules: (F → FF+-)
//        (G → G[+F-]G[-F++]S)

p5.disableFriendlyErrors = true;

const opts = {
  // Generation Details
  Width: 1700,
  Height: 1700,
  Iterations: 3,
  Length: 400,
  Step: 180,
  Factor1: 0.85,
  Factor2: 0.8,
  rule0a: 'F',
  //rule0b: 'Go[-F]S[+G+F][+F]S[-G-F]',
  rule0b: 'Go[-F-]S[+G+F][+F-]S[+G+F]',
  rule1a: 'G',
  //rule1b: 'G[+F]G[-F]S',
  rule1b: 'G[+F-]G[-F++]S',
  Background: [10,20,14],
  //Flower: [242, 115, 230],
  Flower: [57, 181, 224],
  
  // Color Details
  Red_Drift: 50,
  Green_Drift: 70,
  Blue_Drift: 50,
  Opacity: 170,
  Opacity_Drift: 50,
  
  // Additional Functions
  Generate: () => randomize(),
  Save: () => save(),
  create: () => createFlower(),

};

let rad;
let radShaft;
let alp;
let move;
let clr = [];

window.onload = function() {
  let gui = new dat.GUI({width:300});

  let img = gui.addFolder('Image Settings');
  img.add(opts, 'Width', 300, 1400).step(1).onChange(randomize);
  img.add(opts, 'Height', 300, 1400).step(1).onChange(randomize);
  
  let gen = gui.addFolder('Generation Settings')
  gen.add(opts, 'Iterations', 1, 10).step(1).onChange(randomize);
  gen.add(opts, 'Length').onChange(updateRules);
  gen.add(opts, 'Step').onChange(updateRules);
  gen.add(opts, 'rule0a').onChange(updateRules);
  gen.add(opts, 'rule0b').onChange(updateRules);
  gen.add(opts, 'rule1a').onChange(updateRules);
  gen.add(opts, 'rule1b').onChange(updateRules);

  let col = gui.addFolder("Color Settings");
  col.addColor(opts, 'Background');
  col.addColor(opts, 'Flower');
  col.add(opts, 'Red_Drift');
  col.add(opts, 'Green_Drift');
  col.add(opts, 'Blue_Drift');
  
  col.add(opts, 'Factor1', 0, 1).step(0.01);
  col.add(opts, 'Factor2', 0, 1).step(0.01);
  
  col.add(opts, 'Opacity', 0, 255).step(1);
  col.add(opts, 'Opacity_Drift').step(1);
  gui.add(opts, 'Generate');
  gui.add(opts, 'Save');
 
};

function updateVal(propertyName, slider) {
  opts[propertyName] = slider.value();
}

function updateClr(propertyName, colorPicker) {
  var rgbValues = colorPicker.color().levels;
  opts[propertyName] = rgbValues;
}




function addGUI()
{
  // Add BGcolor picker
  var label = createElement("label", "Background");
  var colorPicker = createColorPicker(color(57, 181, 224));
  colorPicker.addClass("color-picker");
  makeContainer(label,colorPicker);
  colorPicker.input(updateClr.bind(null, "Background",colorPicker));

// Add FLRcolor picker
  var label = createElement("label", "Flower");
  var colorPicker = createColorPicker(color(57, 181, 224));
  colorPicker.addClass("color-picker");
  makeContainer(label,colorPicker);
  colorPicker.input(updateClr.bind(null, "Flower",colorPicker));

  
  var sliderNames = ["Red_Drift", "Green_Drift", "Blue_Drift"];
  for (var i = 0; i < sliderNames.length; i++) {
    // Create a label for the slider
    var label = createElement("label", sliderNames[i]);

    // Create the slider
    var slider = createSlider(0, 255, 100);
    slider.addClass("slider");

    // // Add the label and slider to the parent GUI HTML element
    // var guiContainer = select("#gui-container");
    // label.parent(guiContainer);
    // slider.parent(guiContainer);

    makeContainer(label,slider);

    // Assign event listener to update opts object on slider change
    slider.input(updateVal.bind(null, sliderNames[i], slider));
  }

  //step
  var label = createElement("label", "Step");
  label.addClass("slider-label");
  var slider = createSlider(0, 500, 180);
  slider.addClass("slider");
  // Add the label and slider to the parent GUI HTML element
  var guiContainer = select("#gui-container");
  label.parent(guiContainer);
  slider.parent(guiContainer);
  // Assign event listener to update opts object on slider change
  slider.input(updateVal.bind(null, "Step", slider));

  //length
  var label = createElement("label", "Length");
  label.addClass("slider-label");
  var slider = createSlider(0, 500, 180);
  slider.addClass("slider");
  // Add the label and slider to the parent GUI HTML element
  var guiContainer = select("#gui-container");
  label.parent(guiContainer);
  slider.parent(guiContainer);
  // Assign event listener to update opts object on slider change
  slider.input(updateVal.bind(null, "Length", slider));



  //add a button
  button = createButton("generate");
  button.addClass("button");
  //Add the slider to the parent gui HTML element
  button.parent("gui-container");
  button.mousePressed(randomize);
}

function makeContainer(label,changeVal){
    label.addClass("slider-label");
    
    // Create a container div for the label and color picker
    var container = createDiv();
    container.addClass("input-container");
    // Add the label and flower color picker to the container
    label.parent(container);
    changeVal.parent(container);
    // Add the container to the parent GUI HTML element
    var guiContainer = select("#gui-container");
    container.parent(guiContainer);
}

//Set the first generation of sentence
let axiom = "F";
let sentence = axiom;

//Initialize rules
let rules = [];
rules[0] = {
    a: opts.rule0a,
    b: opts.rule0b
};

rules[1] = {
    a: opts.rule1a,
    b: opts.rule1b,
};


function randomize() {
  randomSeed(random(10000));
  // Update the L-system rules each time pressing generate
  updateRules();
  //createFlower();
  pixelDensity(2);
  
  rad=opts.Length;
  move=opts.Step;
  alp=opts.Opacity;
  
  background(opts.Background[0],opts.Background[1],opts.Background[2]);
  randomSeed(random(10000));
  sentence = axiom;
  createFlower();
}

function save() {
  save('image.png');
}


function updateRules() {
  rules[0] = {
    a: opts.rule0a,
    b: opts.rule0b
  };
  
  rules[1] = {
      a: opts.rule1a,
      b: opts.rule1b,
  };
  
  
}


function createFlower() {
  
  for (var i = 0; i < int(opts.Iterations); i++) {
    generate(i);
  }
}

function generate(iter) {
  //create a new sentence for current generation
  let nextSentence = "";

  radShaft = rad*random(0.9,1.2);
  //create the replacement for current sentence
  
  for (var i = 0; i < sentence.length; i++) {
    let current = sentence.charAt(i);
    //replace the character only when there is a corresponding rule
    let found = false;
    
    for (let j = 0; j < rules.length; j++) {
      if (current == rules[j].a) {
        found = true;
        nextSentence += rules[j].b;
        break;
      }
    }
    if (!found) {
      //keep the same character if there is no rules can be applied
      nextSentence += current;
    }
  }
  sentence = nextSentence;
  //createP(sentence);
  flower(iter);
}


function flower(iter) {
  
  //background(opts.Background);

  //reset to the identity matrix each time call the function
  resetMatrix();
  translate(width / 2, height/2);
  

  for (let i = 0; i < sentence.length; i++) {

    let current = sentence.charAt(i);

    //if the current character is "F", draw the shape at the current origin
    if (current == 'F' || current == 'G') {
      drawAshape(rad,radShaft,alp) ;
      //morph the shape after drawing
      rad*=opts.Factor1;
      radShaft*=opts.Factor2;
    } else if (current == '+') {
      //Reduce transparency 
      alp+= random(opts.Opacity_Drift);
      //Drawing the looped shape from the centre
      for(let j = 0; j <=7; j++){
        push();
        rotate(j*6*PI/(i+1));
        for(let k = 1; k <=3; k++){
          //Gradually moving away from the centre
          translate(0,move/3);
          drawAshape(rad,radShaft,alp);
        }
        pop();
      }
     

    } else if (current == '-') {
      //Increase transparency
      alp-= random(opts.Opacity_Drift);
      //Drawing the looped shape from the centre
      for(let j = 0; j <= 7; j++){
        push();
        rotate(j*6*PI/(i+1));
        for(let k = 1; k <=3; k++){
           //Gradually get close to the centre
          translate(0,-move/3);
          drawAshape(rad,radShaft,alp);
        }
        pop();
      }

    } else if (current == '[') {
      alp=opts.Opacity;
    } else if (current == ']') {
      alp=opts.Opacity;
    } else if (current == 'S') {
      //change the color range
      clr[0]+=10*random(-opts.Red_Drift, opts.Red_Drift);

    } 
  }
  
  resetMatrix()
}


function drawAshape(rad,radShaft,alp) {
  noStroke();
  //main color for each shape
  let clr = [opts.Flower[0] + random(-opts.Red_Drift, opts.Red_Drift), 
            opts.Flower[1] + random(-opts.Green_Drift, opts.Green_Drift), 
            opts.Flower[2] + random(-opts.Blue_Drift, opts.Blue_Drift)];
  //Starting gradient colour;
  let from = color(clr[0],clr[1],clr[2],alp);
   //Ending gradient colour;
  let to = color(clr[0]+50,clr[1],clr[2],alp);   

  push();
  translate(radShaft/2,0);
  rotate(PI);
  //Set different levels of gradient colour
  let interA = lerpColor(from, to, 0);
  fill(interA);
  ellipse(0,0,radShaft,rad);
  pop();

  push();
  translate(-radShaft/2,0);
  rotate(PI);
  let interB = lerpColor(from, to, 0.3);
  fill(interB);
  ellipse(0,0,radShaft,rad);
  pop();


  //crossing wings
  push();
  let interC = lerpColor(from, to, 0.6);
  fill(interC);
  rotate(PI/6);
  ellipse(0,0,radShaft,rad);
  rotate(-PI/3);
  ellipse(0,0,radShaft,rad);
  pop();

  push();
  let interD = lerpColor(from, to, 1);
  fill(interD);
  rotate(PI/2);
  rotate(PI/6);
  ellipse(0,0,radShaft,rad);
  rotate(-PI/3);
  ellipse(0,0,radShaft,rad);
  pop();

  
}

function setup()
{
 
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("sketch-container"); //move our canvas inside this HTML element

  addGUI();
  // let width = opts.Width;
  // let height = opts.Height;
  //createCanvas(width, height);

  pixelDensity(2);
  
  rad=opts.Length;
  move=opts.Step;
  alp=opts.Opacity;
  
  background(opts.Background[0],opts.Background[1],opts.Background[2]);
  randomSeed(random(10000));
  sentence = axiom;
  createFlower();
  
  
}




function windowResized() {

  resizeCanvas(windowWidth, windowHeight);

}