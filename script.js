    const canvas = document.getElementById("galaxy");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const defaultSettings = {
      gravite: 5000,
      forceRepulse: 10000,
      forceAttract: 10000,
      nbEtoiles: 1500,
      opaciteTrainée: 0.3,
      tailleEtoiles: 1.5,
      simulationSpeed: 1,
      starsPerClick: 10,
      enableCentralGravity: true,
      enableStarGravity: false
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
        if (settings.enableCentralGravity) {
          const dx = canvas.width / 2 - this.x;
          const dy = canvas.height / 2 - this.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);
          const G = settings.gravite;

          const force = (G / distSq) * settings.simulationSpeed;
          const ax = (dx / dist) * force;
          const ay = (dy / dist) * force;

          this.vx += ax;
          this.vy += ay;
        }

        repulsors.forEach(rep => {
          const rx = rep.x - this.x;
          const ry = rep.y - this.y;
          const rDistSq = rx * rx + ry * ry;
          const rDist = Math.sqrt(rDistSq);
          if (rDist > 5) {
            const rForce = (rep.strength / rDistSq) * settings.simulationSpeed;
            const rAx = -(rx / rDist) * rForce;
            const rAy = -(ry / rDist) * rForce;
            this.vx += rAx;
            this.vy += rAy;
          }
        });

        attractors.forEach(att => {
          const ax = att.x - this.x;
          const ay = att.y - this.y;
          const aDistSq = ax * ax + ay * ay;
          const aDist = Math.sqrt(aDistSq);
          if (aDist > 5) {
            const aForce = (att.strength / aDistSq) * settings.simulationSpeed;
            const aAx = (ax / aDist) * aForce;
            const aAy = (ay / aDist) * aForce;
            this.vx += aAx;
            this.vy += aAy;
          }
        });

        if (settings.enableStarGravity) {
          stars.forEach(other => {
            if (other !== this) {
              const dx = other.x - this.x;
              const dy = other.y - this.y;
              const distSq = dx * dx + dy * dy;
              const dist = Math.sqrt(distSq);
              if (dist > 2) {
                const sForce = (settings.gravite / distSq) * settings.simulationSpeed;
                const sAx = (dx / dist) * sForce;
                const sAy = (dy / dist) * sForce;
                this.vx += sAx;
                this.vy += sAy;
              }
            }
          });
        }

        this.x += this.vx * settings.simulationSpeed;
        this.y += this.vy * settings.simulationSpeed;
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

    class Attractor {
      constructor(x, y, strength = settings.forceAttract) {
        this.x = x;
        this.y = y;
        this.strength = strength;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    let stars = [];
    let repulsors = [];
    let attractors = [];
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

      let vx = 0;
      let vy = 0;

      if (settings.enableCentralGravity) {
        let distCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        let speed = Math.sqrt(settings.gravite / distCenter);
        let angleToCenter = Math.atan2(y - centerY, x - centerX);
        vx = -Math.sin(angleToCenter) * speed;
        vy = Math.cos(angleToCenter) * speed;
      }

      let size = Math.random() * settings.tailleEtoiles + 0.5;
      let color = colors[Math.floor(Math.random() * colors.length)];

      stars.push(new Star(x, y, vx, vy, size, color));
    }

    function initStars(nb = settings.nbEtoiles) {
      stars = [];
      repulsors = [];
      attractors = [];
      for (let i = 0; i < nb; i++) {
        createStar();
      }
    }

    initStars();

    canvas.addEventListener("click", (e) => {
      if (e.shiftKey) {
        repulsors.push(new Repulsor(e.clientX, e.clientY, settings.forceRepulse));
      } else if (e.ctrlKey) {
        attractors.push(new Attractor(e.clientX, e.clientY, settings.forceAttract));
      } else {
        for (let i = 0; i < settings.starsPerClick; i++) {
          createStar(e.clientX, e.clientY);
        }
      }
    });

    canvas.addEventListener("mousedown", (e) => {
      if (e.button === 1) { 
        const mx = e.clientX;
        const my = e.clientY;
        const radius = 10;

        repulsors = repulsors.filter(rep => {
          const dx = rep.x - mx;
          const dy = rep.y - my;
          return Math.sqrt(dx*dx + dy*dy) > radius;
        });

        attractors = attractors.filter(att => {
          const dx = att.x - mx;
          const dy = att.y - my;
          return Math.sqrt(dx*dx + dy*dy) > radius;
        });
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
      attractors.forEach(att => att.draw());
      requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    // GUI
    const gui = new dat.GUI();
    gui.add(settings, 'gravite', 1000, 20000).name('Gravity');
    gui.add(settings, 'forceRepulse', 1000, 50000).name('Repulsive force');
    gui.add(settings, 'forceAttract', 1000, 50000).name('Attractive force');
    gui.add(settings, 'opaciteTrainée', 0.01, 1).step(0.01).name('Opacity trail');
    gui.add(settings, 'tailleEtoiles', 0.5, 5).step(0.1).name('Average star size');
    gui.add(settings, 'nbEtoiles', 100, 5000).step(10).name('Number of stars');
    gui.add(settings, 'simulationSpeed', 0.1, 5).step(0.1).name('Simulation speed');
    gui.add(settings, 'starsPerClick', 1, 100).step(1).name('Stars per click');
    gui.add(settings, 'enableCentralGravity').name('Enable central gravity');
    gui.add(settings, 'enableStarGravity').name('Stars exert gravity');

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