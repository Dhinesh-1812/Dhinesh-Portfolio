// --- 1. FULL VIEWPORT 3D WIREFRAME POLYHEDRA & CONSTELLATION ENGINE ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', () => {
  resizeCanvas();
  init3DScene();
});

// Interactive Mouse Navigation
let mouse = { x: null, y: null, radius: 120 };
window.addEventListener('mousemove', (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});
window.addEventListener('mouseout', () => {
  mouse.x = null;
  mouse.y = null;
});

// 3D 3D Octahedron / Polyhedron Wireframe Model Class
class Polyhedron3D {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.z = Math.random() * 300 + 150;
    this.size = Math.random() * 25 + 20;

    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;

    this.rotX = Math.random() * Math.PI;
    this.rotY = Math.random() * Math.PI;
    this.rotZ = Math.random() * Math.PI;

    this.rotSpeedX = (Math.random() - 0.5) * 0.015;
    this.rotSpeedY = (Math.random() - 0.5) * 0.015;
    this.rotSpeedZ = (Math.random() - 0.5) * 0.015;

    // 3D Octahedron Vertices
    this.vertices = [
      { x: 0, y: 1, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 0, z: 1 },
      { x: -1, y: 0, z: 0 },
      { x: 0, y: 0, z: -1 },
      { x: 0, y: -1, z: 0 }
    ];

    // 3D Octahedron Edges
    this.edges = [
      [0, 1], [0, 2], [0, 3], [0, 4],
      [5, 1], [5, 2], [5, 3], [5, 4],
      [1, 2], [2, 3], [3, 4], [4, 1]
    ];
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.rotX += this.rotSpeedX;
    this.rotY += this.rotSpeedY;
    this.rotZ += this.rotSpeedZ;

    // Screen wrap
    if (this.x < -50) this.x = canvas.width + 50;
    if (this.x > canvas.width + 50) this.x = -50;
    if (this.y < -50) this.y = canvas.height + 50;
    if (this.y > canvas.height + 50) this.y = -50;
  }

  draw() {
    const projected = [];
    const fov = 400;

    for (let i = 0; i < this.vertices.length; i++) {
      let v = { ...this.vertices[i] };

      // Rotation around X
      let y1 = v.y * Math.cos(this.rotX) - v.z * Math.sin(this.rotX);
      let z1 = v.y * Math.sin(this.rotX) + v.z * Math.cos(this.rotX);

      // Rotation around Y
      let x2 = v.x * Math.cos(this.rotY) + z1 * Math.sin(this.rotY);
      let z2 = -v.x * Math.sin(this.rotY) + z1 * Math.cos(this.rotY);

      // Rotation around Z
      let x3 = x2 * Math.cos(this.rotZ) - y1 * Math.sin(this.rotZ);
      let y3 = x2 * Math.sin(this.rotZ) + y1 * Math.cos(this.rotZ);

      // 3D Perspective Projection
      let scale = fov / (fov + this.z + z2 * this.size);
      let px = this.x + x3 * this.size * scale;
      let py = this.y + y3 * this.size * scale;

      projected.push({ x: px, y: py });
    }

    // Draw Wireframe Edges
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < this.edges.length; i++) {
      const p1 = projected[this.edges[i][0]];
      const p2 = projected[this.edges[i][1]];
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
    }
    ctx.stroke();

    // Draw vertex glowing dots
    ctx.fillStyle = 'rgba(216, 180, 254, 0.85)';
    for (let i = 0; i < projected.length; i++) {
      ctx.fillRect(projected[i].x - 1.5, projected[i].y - 1.5, 3, 3);
    }
  }
}

// 3D Constellation Stars & Squares
class StarNode3D {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 1;
    this.isSquare = Math.random() > 0.4;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;

    if (mouse.x !== null && mouse.y !== null) {
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius) {
        this.x -= dx / 25;
        this.y -= dy / 25;
      }
    }
  }
  draw() {
    ctx.fillStyle = 'rgba(216, 180, 254, 0.8)';
    if (this.isSquare) {
      ctx.fillRect(this.x, this.y, this.size * 1.5, this.size * 1.5);
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

let polyhedra = [];
let starNodes = [];

function init3DScene() {
  polyhedra = [];
  starNodes = [];

  // Floating 3D Octahedrons
  for (let i = 0; i < 8; i++) {
    polyhedra.push(new Polyhedron3D());
  }

  // Floating 3D Particles
  const count = Math.floor((canvas.width * canvas.height) / 14000);
  for (let i = 0; i < Math.max(count, 50); i++) {
    starNodes.push(new StarNode3D());
  }
}
init3DScene();

// Connect Star Constellation
function drawConstellationWeb() {
  const maxDistance = 110;
  for (let a = 0; a < starNodes.length; a++) {
    for (let b = a + 1; b < starNodes.length; b++) {
      let dx = starNodes[a].x - starNodes[b].x;
      let dy = starNodes[a].y - starNodes[b].y;
      let dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maxDistance) {
        let alpha = (1 - dist / maxDistance) * 0.25;
        ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(starNodes[a].x, starNodes[a].y);
        ctx.lineTo(starNodes[b].x, starNodes[b].y);
        ctx.stroke();
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Constellation Connections
  drawConstellationWeb();

  // 2. Stars and Particles
  for (let i = 0; i < starNodes.length; i++) {
    starNodes[i].update();
    starNodes[i].draw();
  }

  // 3. 3D Polyhedrons
  for (let i = 0; i < polyhedra.length; i++) {
    polyhedra[i].update();
    polyhedra[i].draw();
  }

  requestAnimationFrame(animate);
}
animate();

// --- 2. DYNAMIC TYPING EFFECT ---
const targetText = "Java Full Stack Developer";
let charIndex = 0;
let isDeleting = false;
const typedElement = document.getElementById("typed-text");

function typeEffect() {
  if (!typedElement) return;
  if (isDeleting) {
    typedElement.textContent = targetText.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typedElement.textContent = targetText.substring(0, charIndex + 1);
    charIndex++;
  }

  let typeSpeed = isDeleting ? 40 : 90;

  if (!isDeleting && charIndex === targetText.length) {
    typeSpeed = 1800;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    typeSpeed = 400;
  }
  setTimeout(typeEffect, typeSpeed);
}
typeEffect();

// --- 3. INTERACTIVE TERMINAL ENGINE ---
const terminalInput = document.getElementById('terminal-input');
const terminalBody = document.getElementById('terminal-body');

const commands = {
  help: "Commands: <span class='term-highlight'>skills</span>, <span class='term-highlight'>projects</span>, <span class='term-highlight'>experience</span>, <span class='term-highlight'>education</span>, <span class='term-highlight'>contact</span>, <span class='term-highlight'>github</span>, <span class='term-highlight'>clear</span>",
  skills: "Core Java, OOPs, Spring Boot, RESTful APIs, JDBC, Hibernate, MySQL, JavaScript, HTML5, CSS3, Bootstrap, Git",
  projects: "1. SkillBridge – Job Matching Platform | 2. CiviSolve – E-Governance Grievance Management System",
  experience: "• Besant Technologies (Java Full Stack Intern) | • Emglitz Technologies (Intern)",
  education: "B.E. in ECE (2022–2026) • Sengunthar Engineering College • CGPA: 8.5",
  contact: "Email: dhineshkarunanithi1812@gmail.com | Phone: +91 6385407859 | Erode, Tamil Nadu",
  github: "<a href='https://github.com/Dhinesh-1812' target='_blank' style='color:#c084fc;'>github.com/Dhinesh-1812</a>",
  clear: "CLEAR"
};

if (terminalInput) {
  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const input = terminalInput.value.trim().toLowerCase();
      terminalInput.value = '';

      if (input === 'clear') {
        terminalBody.innerHTML = '';
        return;
      }

      const response = commands[input] || `Command not found: '${input}'. Type <span class='term-highlight'>'help'</span>.`;

      const userRow = document.createElement('p');
      userRow.className = 'terminal-output';
      userRow.innerHTML = `<span style="color:#c084fc;">dhinesh@system:~$</span> ${input}`;

      const botRow = document.createElement('p');
      botRow.className = 'terminal-output';
      botRow.innerHTML = response;

      terminalBody.appendChild(userRow);
      terminalBody.appendChild(botRow);
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }
  });
}

// --- 4. FLOATING SCROLL TO TOP ---
const scrollBtn = document.getElementById("scrollToTopBtn");
window.addEventListener("scroll", () => {
  if (scrollBtn) {
    scrollBtn.style.display = window.scrollY > 300 ? "flex" : "none";
  }
});
if (scrollBtn) {
  scrollBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
