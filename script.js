const canvas = document.getElementById("galaxy");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const defaultSettings = {
      gravite: 5000,
      forceRepulse: 10000,
      nbEtoiles: 1500,
      opaciteTrainée: 0.3,
      tailleEtoiles: 1.5
    };

    const settings = { ...defaultSettings };

    class Star {
      constructor(x, y, vx, vy, size, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.color = color;
      }
      update() {
        const dx = canvas.width / 2 - this.x;
        const dy = canvas.height / 2 - this.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);
        const G = settings.gravite;

        const force = G / distSq;
        const ax = (dx / dist) * force;
        const ay = (dy / dist) * force;

        this.vx += ax;
        this.vy += ay;

        repulsors.forEach(rep => {
          const rx = rep.x - this.x;
          const ry = rep.y - this.y;
          const rDistSq = rx * rx + ry * ry;
          const rDist = Math.sqrt(rDistSq);
          if (rDist > 5) {
            const rForce = rep.strength / rDistSq;
            const rAx = -(rx / rDist) * rForce;
            const rAy = -(ry / rDist) * rForce;
            this.vx += rAx;
            this.vy += rAy;
          }
        });

        this.x += this.vx;
        this.y += this.vy;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    class Repulsor {
      constructor(x, y, strength = settings.forceRepulse) {
        this.x = x;
        this.y = y;
        this.strength = strength;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    let stars = [];
    let repulsors = [];
    const colors = ["#ffffff", "#ffe9c4", "#d4fbff", "#ffd1dc"];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    function createStar(x = null, y = null) {
      let angle = Math.random() * Math.PI * 2;
      let radius = Math.pow(Math.random(), 0.5) * (canvas.width / 2 * 0.8);

      if (x !== null && y !== null) {
        angle = Math.random() * Math.PI * 2;
        radius = Math.random() * 50;
        x = x + Math.cos(angle) * radius;
        y = y + Math.sin(angle) * radius;
      } else {
        x = centerX + Math.cos(angle) * radius;
        y = centerY + Math.sin(angle) * radius;
      }

      let distCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      let speed = Math.sqrt(settings.gravite / distCenter);

      let angleToCenter = Math.atan2(y - centerY, x - centerX);
      let vx = -Math.sin(angleToCenter) * speed;
      let vy = Math.cos(angleToCenter) * speed;

      let size = Math.random() * settings.tailleEtoiles + 0.5;
      let color = colors[Math.floor(Math.random() * colors.length)];

      stars.push(new Star(x, y, vx, vy, size, color));
    }

    function initStars(nb = settings.nbEtoiles) {
      stars = [];
      repulsors = [];
      for (let i = 0; i < nb; i++) {
        createStar();
      }
    }

    initStars();

    canvas.addEventListener("click", (e) => {
      if (e.shiftKey) {
        repulsors.push(new Repulsor(e.clientX, e.clientY, settings.forceRepulse));
      } else {
        for (let i = 0; i < 10; i++) {
          createStar(e.clientX, e.clientY);
        }
      }
    });

    function animate() {
      ctx.fillStyle = `rgba(0, 0, 0, ${settings.opaciteTrainée})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      stars.forEach(star => {
        star.update();
        star.draw();
      });
      repulsors.forEach(rep => rep.draw());
      requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    const gui = new dat.GUI();
    gui.add(settings, 'gravite', 1000, 20000).name('Gravity');
    gui.add(settings, 'forceRepulse', 1000, 50000).name('Repulsive force');
    gui.add(settings, 'opaciteTrainée', 0.01, 1).step(0.01).name('Opacity trail');
    gui.add(settings, 'tailleEtoiles', 0.5, 5).step(0.1).name('Average star size');
    gui.add(settings, 'nbEtoiles', 100, 5000).step(10).name('Number of stars');

    gui.add({
      reset: () => {
        Object.assign(settings, defaultSettings);
        gui.__controllers.forEach(ctrl => ctrl.updateDisplay());
      }
    }, 'reset').name('Reset settings');

    gui.add({
      restart: () => {
        initStars(settings.nbEtoiles);
      }
    }, 'restart').name('Restart simulation');

    const controlsList = document.getElementById('controlsList');
    const controlsFolder = gui.addFolder('Show/Hide controls');
    controlsFolder.add({toggle: true}, 'toggle').name('Show/Hide').onChange(value => {
      controlsList.style.display = value ? 'block' : 'none';
    });
    controlsFolder.open();