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
  Scale: 300,
  Centrifugal: 180,
  Factor1: 45,
  Factor2: 60,
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

  
  var sliderNames = ["Red_Drift", "Green_Drift", "Blue_Drift","Opacity"];
  for (var i = 0; i < sliderNames.length; i++) {
    // Create a label for the slider
    var label = createElement("label", sliderNames[i]);

    // Create the slider
    var slider = createSlider(0, 255, 100);
    slider.addClass("slider");

    makeContainer(label,slider);

    // Assign event listener to update opts object on slider change
    slider.input(updateVal.bind(null, sliderNames[i], slider));
  }

  var label = createElement("label", "Opacity_Drift");
  var slider = createSlider(0, 100, 40);
  slider.addClass("slider");
  makeContainer(label,slider);
  slider.input(updateVal.bind(null, "Opacity_Drift", slider));

  //Centrifugal
  var label = createElement("label", "Centrifugal");
  var slider = createSlider(0, 500, 180);
  slider.addClass("slider");
  makeContainer(label,slider);
  slider.input(updateVal.bind(null, "Centrifugal", slider));

  //Scale
  var label = createElement("label", "Scale");
  var slider = createSlider(0, 400, 180);
  slider.addClass("slider");
  makeContainer(label,slider);
  slider.input(updateVal.bind(null, "Scale", slider));

  var sliderFactors = ["Factor1", "Factor2"];
  var precision = 0.01;
  var sliderMin = 0.00;
  var sliderMax = 100;
  for (var i = 0; i < sliderFactors.length; i++) {
    
    // Create a label for the slider
    var label = createElement("label", sliderFactors[i]);

    // Create the slider
    var slider = createSlider(0,  sliderMax , 50);
    slider.addClass("slider");

    makeContainer(label,slider);
    // Assign event listener to update opts object on slider change
    slider.input(updateVal.bind(null, sliderFactors[i], slider));

  }




  //add a button
  button = createButton("Generate");
  button.addClass("button");
  //Add the slider to the parent gui HTML element
  button.parent("gui-container");
  button.mousePressed(randomize);

  //add a button
  button = createButton("Magic");
  button.addClass("button");
  //Add the slider to the parent gui HTML element
  button.parent("gui-container");
  button.mousePressed(randomPick);

  //add a button
  button = createButton("Save");
  button.addClass("button");
  //Add the slider to the parent gui HTML element
  button.parent("gui-container");
  button.mousePressed(save);

// Create a note element
var note = createElement("p", "Generate: Get similar patterns with the setting parameters.");
note.addClass("note");
// Add the note to the parent GUI HTML element
note.parent("gui-container");

// Create a note element
var note = createElement("p", "Magic: Only happens once, remember to save it!");
note.addClass("note");
// Add the note to the parent GUI HTML element
note.parent("gui-container");
  
}

function randomPick(){
  opts["Red_Drift"] = random(255);
  opts["Green_Drift"] = random(255);
  opts["Blue_Drift"] = random(255);
  opts["Opacity"] = random(50,255);
  opts["Centrifugal"] = random(450);
  opts["Scale"] = random(150,400);
  opts["Factor1"] = random(100);
  opts["Factor2"] = random(100);


  randomize();

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
  
  rad=opts.Scale;
  move=opts.Centrifugal;
  alp=opts.Opacity;
  
  background(opts.Background[0],opts.Background[1],opts.Background[2]);
  randomSeed(random(10000));
  sentence = axiom;
  createFlower();
}

function save() {
  // Draw the main canvas onto the hidden canvas
  hiddenCanvas.image(canvas, 0, 0);

  // Save the hidden canvas as an image
  hiddenCanvas.save('image.png');
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
      rad*=opts.Factor1*0.01;
      radShaft*=opts.Factor2*0.01;
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
// Create the hidden canvas
hiddenCanvas = createGraphics(width, height);
  addGUI();
  // let width = opts.Width;
  // let height = opts.Height;
  //createCanvas(width, height);

  pixelDensity(2);
  
  rad=opts.Scale;
  move=opts.Centrifugal;
  alp=opts.Opacity;
  
  background(opts.Background[0],opts.Background[1],opts.Background[2]);
  randomSeed(random(10000));
  sentence = axiom;
  createFlower();
  
  
}




function windowResized() {

  resizeCanvas(windowWidth, windowHeight, true);

}