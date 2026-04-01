// --- VARIABLES GLOBALES ---

let robot;
let estado;
let walls = [
  // bordes
  {x: 0, y: 0, w: 600, h: 10},
  {x: 0, y: 590, w: 600, h: 10},
  {x: 0, y: 0, w: 10, h: 600},
  {x: 590, y: 0, w: 10, h: 600},

  // grid tipo maze
  {x: 100, y: 100, w: 10, h: 300},

  {x: 200, y: 200, w: 10, h: 300},

  {x: 300, y: 0, w: 10, h: 300},
  {x: 300, y: 400, w: 10, h: 200},

  {x: 400, y: 100, w: 10, h: 300},

  // horizontales
  {x: 300, y: 300, w: 200, h: 10},

  {x: 0, y: 450, w: 200, h: 10}
];

let tControl = 0;
let tDuracion = Infinity;

let sonar_frontal = 0;
let sonar_derecho = 0;
let sonar_izquierdo = 0;

const AVANZAR = "AVANZAR";
const GIRAR_D = "GIRAR_D";
const GIRAR_I = "GIRAR_I";
const RETROCEDER = "RETROCEDER";

let studentControl = () => {};

let ejecutando = false;


// --- ROBOT ---
function createRobot() {
    return {
        x: 50,
        y: 50,
        theta: 0,

        vL: 0,        // velocidad derecha
        vR: 0,        // velocidad izquierda
    };
}

// --- CONTROL ---
function avanzar() {
  robot.vL = 1;
  robot.vR = 1;
}

function retroceder() {
  robot.vL = -1;
  robot.vR = -1;
}

function parar() {
  robot.vL = 0;
  robot.vR = 0;
}

function girarDer() {
  robot.vL = 1;
  robot.vR = 0;
}

function girarIzq() {
  robot.vL = 0;
  robot.vR = 1;
}

// --- INPUT ---

function runCode() {
  let code = document.getElementById("code").value;

  console.log("=== CODIGO ===");
  console.log(JSON.stringify(code));

  try {
    studentControl = new Function(
        "AVANZAR",
        "GIRAR_D",
        "GIRAR_I",
        "RETROCEDER",
        "millis",
        code
    );
    ejecutando = true;
  } catch (e) {
    alert("Error: " + e.message);
    studentControl = () => {};
  }
}

function reiniciar() {
    robot = createRobot();
}

// --- ACTUALIZAR ---
function updateRobot() {
    let v = (robot.vL + robot.vR) / 2;
    let w = (robot.vL - robot.vR) / 40;

    robot.x += v * Math.cos(robot.theta);
    robot.y += v * Math.sin(robot.theta);
    robot.theta += w;

    if (robot.theta > Math.PI * 2) robot.theta -= Math.PI * 2;
    if (robot.theta < -Math.PI * 2) robot.theta += Math.PI * 2;
}

function medirDistanciaAngulo(thetaOffset) {
  let maxDist = 250;
  let ang = robot.theta + thetaOffset;

  for (let d = 0; d < maxDist; d++) {
    let x = robot.x + Math.cos(ang) * d;
    let y = robot.y + Math.sin(ang) * d;

    if (x < 0 || x > width || y < 0 || y > height) { // bordes
      return d;
    }

    for (let wall of walls) { //paredes
      if (
        x > wall.x &&
        x < wall.x + wall.w &&
        y > wall.y &&
        y < wall.y + wall.h
      ) {
        return d;
      }
    }
  }

  return maxDist;
}

function medirSensores() {
  sensor_frontal = medirDistanciaAngulo(0);
  sensor_izquierdo = medirDistanciaAngulo(-Math.PI/2);
  sensor_derecho = medirDistanciaAngulo(Math.PI/2);
}

// --- DRAW ---
function drawRobot() {
  push();
  translate(robot.x, robot.y);
  rotate(robot.theta);

  rectMode(CENTER);

  fill(0, 150, 255);
  rect(0, 0, 30, 20);

  // frente del auto
  fill(255, 0, 0);
  rect(10, 0, 5, 5);

  pop();
}

function drawSensorLinea(dist, angOffset) {
  let ang = robot.theta + angOffset;

  if (dist < 50) {
    stroke(255, 0, 0);
  } else if (dist < 250) {
    stroke(255, 255, 0);
  } else {
    stroke(0, 0, 255);
  }

  line(
    robot.x,
    robot.y,
    robot.x + Math.cos(ang) * dist,
    robot.y + Math.sin(ang) * dist
  );
}

function drawSensors() {
  drawSensorLinea(sensor_frontal, 0);
  drawSensorLinea(sensor_izquierdo, -Math.PI / 2);
  drawSensorLinea(sensor_derecho, Math.PI / 2);
}

function drawWalls() {
  fill(100);
  for (let wall of walls) {
    rect(wall.x, wall.y, wall.w, wall.h);
  }
}

function drawDebug() {
  fill(0);
  noStroke();
  textSize(14);

  text("Estado: " + estado, 10, 20);
  text("Distancia: " + sensor_frontal.toFixed(1), 10, 40);
  text("vL: " + robot.vL.toFixed(2), 10, 60);
  text("vR: " + robot.vR.toFixed(2), 10, 80);
}

function detenerEjecucion() {
  ejecutando = false;
  parar();
  estado = "AVANZAR";
}

function control() {
  if (!ejecutando) return;

  try {
    studentControl(AVANZAR, GIRAR_D, GIRAR_I, RETROCEDER, millis);
  } catch (e) {
    console.error(e);
  }
}

// --- P5 ---

function setup() {
  createCanvas(600, 600);
  robot = createRobot();
  estado = "AVANZAR";
}

function draw() {
  background(170, 255, 170);

  drawWalls();

  medirSensores();
  control();
  updateRobot();

  drawRobot();
  drawSensors();
  drawDebug();
}
