// Ajustes
var particleCount = 40,
	flareCount = 10,
	motion = 0.05,
	tilt = 0.05,
	color = '#A71A1A',
	particleSizeBase = 1,
	particleSizeMultiplier = 0.5,
	flareSizeBase = 100,
	flareSizeMultiplier = 100,
	lineWidth = 1,
	linkChance = 75, 
	linkLengthMin = 5, 
	linkLengthMax = 7, 
	linkOpacity = 0.25;
	linkFade = 90, 
	linkSpeed = 1, 
	glareAngle = -60,
	glareOpacityMultiplier = 0.05,
	renderParticles = true,
	renderParticleGlare = true,
	renderFlares = true,
	renderLinks = true,
	renderMesh = false,
	flicker = true,
	flickerSmoothing = 15, 
	blurSize = 0,
	orbitTilt = true,
	randomMotion = true,
	noiseLength = 1000,
	noiseStrength = 1;

var canvas = document.getElementById('stars'),
	//orbits = document.getElementById('orbits'),
	context = canvas.getContext('2d'),
	mouse = { x: 0, y: 0 },
	m = {},
	r = 0,
	c = 1000, 
	n = 0,
	nAngle = (Math.PI * 2) / noiseLength,
	nRad = 100,
	nScale = 0.5,
	nPos = {x: 0, y: 0},
	points = [],
	vertices = [],
	triangles = [],
	links = [],
	particles = [],
	flares = [];

function init() {
	var i, j, k;

	// requestAnimFrame polyfill
	window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				function( callback ){
					window.setTimeout(callback, 1000 / 60);
				};
	})();

	
	resize();

	mouse.x = canvas.clientWidth / 2;
	mouse.y = canvas.clientHeight / 2;

	// Create particle positions
	for (i = 0; i < particleCount; i++) {
		var p = new Particle();
		particles.push(p);
		points.push([p.x*c, p.y*c]);
	}

	

	
	vertices = Delaunay.triangulate(points);
	
	var tri = [];
	for (i = 0; i < vertices.length; i++) {
		if (tri.length == 3) {
			triangles.push(tri);
			tri = [];
		}
		tri.push(vertices[i]);
	}
	



	for (i = 0; i < particles.length; i++) {

		for (j = 0; j < triangles.length; j++) {
			
			k = triangles[j].indexOf(i);
			
			if (k !== -1) {
				triangles[j].forEach(function(value, index, array) {
					if (value !== i && particles[i].neighbors.indexOf(value) == -1) {
						particles[i].neighbors.push(value);
					}
				});
			}
		}
	}
	

	if (renderFlares) {
		
		for (i = 0; i < flareCount; i++) {
			flares.push(new Flare());
		}
	}

	
	if ('ontouchstart' in document.documentElement && window.DeviceOrientationEvent) {
		console.log('Using device orientation');
		window.addEventListener('deviceorientation', function(e) {
			mouse.x = (canvas.clientWidth / 2) - ((e.gamma / 90) * (canvas.clientWidth / 2) * 2);
			mouse.y = (canvas.clientHeight / 2) - ((e.beta / 90) * (canvas.clientHeight / 2) * 2);
			
		}, true);
	}
	else {
		
		console.log('Using mouse movement');
		document.body.addEventListener('mousemove', function(e) {
			
			mouse.x = e.clientX;
			mouse.y = e.clientY;
		});
	}

	
	if (randomMotion) {
		
	}


	(function animloop(){
		requestAnimFrame(animloop);
		resize();
		render();
	})();
}

function render() {
	if (randomMotion) {
		n++;
		if (n >= noiseLength) {
			n = 0;
		}

		nPos = noisePoint(n);
		
	}


	context.clearRect(0, 0, canvas.width, canvas.height);

	if (blurSize > 0) {
		context.shadowBlur = blurSize;
		context.shadowColor = color;
	}

	if (renderParticles) {
		
		for (var i = 0; i < particleCount; i++) {
			particles[i].render();
		}
	}

	if (renderMesh) {
	
		context.beginPath();
		for (var v = 0; v < vertices.length-1; v++) {
	
			if ((v + 1) % 3 === 0) { continue; }

			var p1 = particles[vertices[v]],
				p2 = particles[vertices[v+1]];

		

			var pos1 = position(p1.x, p1.y, p1.z),
				pos2 = position(p2.x, p2.y, p2.z);

			context.moveTo(pos1.x, pos1.y);
			context.lineTo(pos2.x, pos2.y);
		}
		context.strokeStyle = color;
		context.lineWidth = lineWidth;
		context.stroke();
		context.closePath();
	}

	if (renderLinks) {
	
		if (random(0, linkChance) == linkChance) {
			var length = random(linkLengthMin, linkLengthMax);
			var start = random(0, particles.length-1);
			startLink(start, length);
		}

	
		for (var l = links.length-1; l >= 0; l--) {
			if (links[l] && !links[l].finished) {
				links[l].render();
			}
			else {
				delete links[l];
			}
		}
	}

	if (renderFlares) {
	
		for (var j = 0; j < flareCount; j++) {
			flares[j].render();
		}
	}

	
}

function resize() {
	canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
	canvas.height = canvas.width * (canvas.clientHeight / canvas.clientWidth);
}

function startLink(vertex, length) {
	
	links.push(new Link(vertex, length));
}




var Particle = function() {
	this.x = random(-0.1, 1.1, true);
	this.y = random(-0.1, 1.1, true);
	this.z = random(0,4);
	this.color = color;
	this.opacity = random(0.1,1,true);
	this.flicker = 0;
	this.neighbors = [];
};
Particle.prototype.render = function() {
	var pos = position(this.x, this.y, this.z),
		r = ((this.z * particleSizeMultiplier) + particleSizeBase) * (sizeRatio() / 1000),
		o = this.opacity;

	if (flicker) {
		var newVal = random(-0.5, 0.5, true);
		this.flicker += (newVal - this.flicker) / flickerSmoothing;
		if (this.flicker > 0.5) this.flicker = 0.5;
		if (this.flicker < -0.5) this.flicker = -0.5;
		o += this.flicker;
		if (o > 1) o = 1;
		if (o < 0) o = 0;
	}

	context.fillStyle = this.color;
	context.globalAlpha = o;
	context.beginPath();
	context.arc(pos.x, pos.y, r, 0, 2 * Math.PI, false);
	context.fill();
	context.closePath();

	if (renderParticleGlare) {
		context.globalAlpha = o * glareOpacityMultiplier;
		
		
		context.ellipse(pos.x, pos.y, r * 100, r, (glareAngle - ((nPos.x - 0.5) * noiseStrength * motion)) * (Math.PI / 180), 0, 2 * Math.PI, false);
		context.fill();
		context.closePath();
	}

	context.globalAlpha = 1;
};



var Flare = function() {
	this.x = random(-0.25, 1.25, true);
	this.y = random(-0.25, 1.25, true);
	this.z = random(0,2);
	this.color = color;
	this.opacity = random(0.001, 0.01, true);
};
Flare.prototype.render = function() {
	var pos = position(this.x, this.y, this.z),
		r = ((this.z * flareSizeMultiplier) + flareSizeBase) * (sizeRatio() / 1000);

	

	context.beginPath();
	context.globalAlpha = this.opacity;
	context.arc(pos.x, pos.y, r, 0, 2 * Math.PI, false);
	context.fillStyle = this.color;
	context.fill();
	context.closePath();
	context.globalAlpha = 1;
};


var Link = function(startVertex, numPoints) {
	this.length = numPoints;
	this.verts = [startVertex];
	this.stage = 0;
	this.linked = [startVertex];
	this.distances = [];
	this.traveled = 0;
	this.fade = 0;
	this.finished = false;
};
Link.prototype.render = function() {
	

	var i, p, pos, points;

	switch (this.stage) {
		
		case 0:

			
			var last = particles[this.verts[this.verts.length-1]];
			
			if (last && last.neighbors && last.neighbors.length > 0) {
				
				var neighbor = last.neighbors[random(0, last.neighbors.length-1)];
			
				if (this.verts.indexOf(neighbor) == -1) {
					this.verts.push(neighbor);
				}
				
			}
			else {
				
				this.stage = 3;
				this.finished = true;
			}

			if (this.verts.length >= this.length) {
		
				for (i = 0; i < this.verts.length-1; i++) {
					var p1 = particles[this.verts[i]],
						p2 = particles[this.verts[i+1]],
						dx = p1.x - p2.x,
						dy = p1.y - p2.y,
						dist = Math.sqrt(dx*dx + dy*dy);

						this.distances.push(dist);
				}
				
				this.stage = 1;
			}
		break;


		case 1:
			if (this.distances.length > 0) {

				points = [];
			

		
				for (i = 0; i < this.linked.length; i++) {
					p = particles[this.linked[i]];
					pos = position(p.x, p.y, p.z);
					points.push([pos.x, pos.y]);
				}

				var linkSpeedRel = linkSpeed * 0.00001 * canvas.width;
				this.traveled += linkSpeedRel;
				var d = this.distances[this.linked.length-1];
			
				if (this.traveled >= d) {
					this.traveled = 0;
				

					this.linked.push(this.verts[this.linked.length]);
					p = particles[this.linked[this.linked.length-1]];
					pos = position(p.x, p.y, p.z);
					points.push([pos.x, pos.y]);

					if (this.linked.length >= this.verts.length) {
					
						this.stage = 2;
					}
				}
				else {
				
					var a = particles[this.linked[this.linked.length-1]],
						b = particles[this.verts[this.linked.length]],
						t = d - this.traveled,
						x = ((this.traveled * b.x) + (t * a.x)) / d,
						y = ((this.traveled * b.y) + (t * a.y)) / d,
						z = ((this.traveled * b.z) + (t * a.z)) / d;

					pos = position(x, y, z);

					
					points.push([pos.x, pos.y]);
				}

				this.drawLine(points);
			}
			else {
				
				this.stage = 3;
				this.finished = true;
			}
		break;

	
		case 2:
			if (this.verts.length > 1) {
				if (this.fade < linkFade) {
					this.fade++;

				
					points = [];
					var alpha = (1 - (this.fade / linkFade)) * linkOpacity;
					for (i = 0; i < this.verts.length; i++) {
						p = particles[this.verts[i]];
						pos = position(p.x, p.y, p.z);
						points.push([pos.x, pos.y]);
					}
					this.drawLine(points, alpha);
				}
				else {
				
					this.stage = 3;
					this.finished = true;
				}
			}
			else {
				
				this.stage = 3;
				this.finished = true;
			}
		break;

	
		case 3:
		default:
			this.finished = true;
		break;
	}
};
Link.prototype.drawLine = function(points, alpha) {
	if (typeof alpha !== 'number') alpha = linkOpacity;

	if (points.length > 1 && alpha > 0) {

		context.globalAlpha = alpha;
		context.beginPath();
		for (var i = 0; i < points.length-1; i++) {
			context.moveTo(points[i][0], points[i][1]);
			context.lineTo(points[i+1][0], points[i+1][1]);
		}
		context.strokeStyle = color;
		context.lineWidth = lineWidth;
		context.stroke();
		context.closePath();
		context.globalAlpha = 1;
	}
};


// Utils

function noisePoint(i) {
	var a = nAngle * i,
		cosA = Math.cos(a),
		sinA = Math.sin(a),
		
		rad = nRad;
	return {
		x: rad * cosA,
		y: rad * sinA
	};
}

function position(x, y, z) {
	return {
		x: (x * canvas.width) + ((((canvas.width / 2) - mouse.x + ((nPos.x - 0.5) * noiseStrength)) * z) * motion),
		y: (y * canvas.height) + ((((canvas.height / 2) - mouse.y + ((nPos.y - 0.5) * noiseStrength)) * z) * motion)
	};
}

function sizeRatio() {
	return canvas.width >= canvas.height ? canvas.width : canvas.height;
}

function random(min, max, float) {
	return float ?
		Math.random() * (max - min) + min :
		Math.floor(Math.random() * (max - min + 1)) + min;
}


// init
if (canvas) init();