import * as THREE from 'three';
function simulate() {
    const infectionRate = parseFloat(document.getElementById('infectionRate').value);
    const recoveryRate = parseFloat(document.getElementById('recoveryRate').value);
    const days = parseInt(document.getElementById('days').value);
    
    
    const population = 1000;
    let susceptible = population - 1;
    let infected = 1;
    let recovered = 0;
    
    // Array para almacenar los datos de cada día
    const data = [{ day: 0, susceptible, infected, recovered }];
    
    // Simulación de cada día
    for (let day = 1; day <= days; day++) {
      const newInfected = infectionRate * infected * susceptible / population;
      const newRecovered = recoveryRate * infected;
      
      susceptible -= newInfected;
      infected += newInfected - newRecovered;
      recovered += newRecovered;
      
      data.push({ day, susceptible, infected, recovered });
    }
  
    animateChart(data);
    animate3DChart(data);
  }
  window.simulate = simulate;
  
  function animateChart(data) {
  
    d3.select("#chart").selectAll("*").remove();
    
  
    const width = 600, height = 400, margin = 50;
    const svg = d3.select("#chart").append("svg").attr("width", width).attr("height", height);
    const xScale = d3.scaleLinear().domain([0, data.length - 1]).range([margin, width - margin]);
    const yScale = d3.scaleLinear().domain([0, 1000]).range([height - margin, margin]);
  
   
    svg.append("g").attr("transform", `translate(0,${height - margin})`).call(d3.axisBottom(xScale).ticks(10));
    svg.append("g").attr("transform", `translate(${margin},0)`).call(d3.axisLeft(yScale).ticks(10));

    
svg.append("text")
.attr("x", width / 4)
.attr("y", height - margin / 4)
.attr("text-anchor", "middle")
.style("font-size", "14px")
.text("Días");


svg.append("text")
.attr("transform", "rotate(-90)")
.attr("x", -height / 4)
.attr("y", margin / 4)
.attr("text-anchor", "middle")
.style("font-size", "14px")
.text("Población");
  
    
    const lineSusceptible = d3.line().x(d => xScale(d.day)).y(d => yScale(d.susceptible));
    const lineInfected = d3.line().x(d => xScale(d.day)).y(d => yScale(d.infected));
    const lineRecovered = d3.line().x(d => xScale(d.day)).y(d => yScale(d.recovered));
  
    svg.append("path").datum(data.slice(0, 1)).attr("d", lineSusceptible).attr("stroke", "blue").attr("fill", "none").attr("id", "susceptibleLine");
    svg.append("path").datum(data.slice(0, 1)).attr("d", lineInfected).attr("stroke", "red").attr("fill", "none").attr("id", "infectedLine");
    svg.append("path").datum(data.slice(0, 1)).attr("d", lineRecovered).attr("stroke", "green").attr("fill", "none").attr("id", "recoveredLine");
  
    
    let dayIndex = 1;
    const interval = setInterval(() => {
      if (dayIndex >= data.length) return clearInterval(interval);
  
      
      svg.select("#susceptibleLine").datum(data.slice(0, dayIndex)).attr("d", lineSusceptible);
      svg.select("#infectedLine").datum(data.slice(0, dayIndex)).attr("d", lineInfected);
      svg.select("#recoveredLine").datum(data.slice(0, dayIndex)).attr("d", lineRecovered);
  
      dayIndex++;
    }, 100); 
  }

  function animate3DChart(data) {
    d3.select("#threeChart").selectAll("*").remove();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(400, 300);
    document.getElementById('threeChart').appendChild(renderer.domElement);

    const color = {susceptible: 0x0000ff, infected: 0xff0000, recovered: 0x00ff00};

    const particleGroup = {
      susceptible: new THREE.Group(),
      infected: new THREE.Group(),
      recovered: new THREE.Group()
    }

    Object.values(particleGroup).forEach(group => scene.add(group));
      
    let dayIndex = 0;
    const interval = setInterval(() => {
      if (dayIndex >= data.length) return clearInterval(interval);

      const dayData = data[dayIndex];

      Object.values(particleGroup).forEach(group => {
        while (group.children.length) group.remove(group.children[0]);
      })

      const targetPositions = [];
      const createParticle = (count, color, group) => {
        for (let i = 0; i < count; i++) {
          const particle = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 8, 8),
            new THREE.MeshBasicMaterial({ color })
          )
          particle.position.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
          )

          const target = new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
          );

          targetPositions.push(target);
          group.add(particle);
        }
      }

      function animateParticles(group){
        group.children.forEach((particle, index)=>{
          const target = targetPositions[index];
          smoothMove(particle, target, 0.05);
        })
      }
      const factorEscalar = 0.3;
      createParticle(Math.floor(dayData.susceptible * factorEscalar), color.susceptible, particleGroup.susceptible);
      createParticle(Math.floor(dayData.infected * factorEscalar), color.infected, particleGroup.infected);
      createParticle(Math.floor(dayData.recovered * factorEscalar), color.recovered, particleGroup.recovered);

      renderer.render(scene, camera);
      dayIndex++;

    }, 1000);

    camera.position.z = 15;

    function animate(){
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }

    animate();
  }


//funcion para renderizar al cargar la pagina
window.onload = function() {
  simulate();
}
