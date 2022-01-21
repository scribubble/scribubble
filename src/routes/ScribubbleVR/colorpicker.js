
AFRAME.registerComponent('colorpicker', {
	schema: {
        colorWheel: { type: 'selector', default: '#colorWheel' },
		lightWheel: { type: 'selector', default: '#lightWheel' },
		thicknessWheel: { type: 'selector', default: '#thicknessWheel' }
	},
    init: function() {
		this.color = '#FFFFFF';
		this.lightness = 1;
		this.thickness = 1;
        
		// HSL
		this.h = 0;
		this.s = 0;

        this.initWheel();

        this.initCursor();

        this.initListener();
    },
    hslToHex: function(h,s,l) {
		let r, g, b;
		if (s === 0) {
			r = g = b = l; // achromatic
		} else {
			const hue2rgb = (p, q, t) => {
				if (t < 0) t += 1;
				if (t > 1) t -= 1;
				if (t < 1 / 6) return p + (q - p) * 6 * t;
				if (t < 1 / 2) return q;
				if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
				return p;
			};
			const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			const p = 2 * l - q;
			r = hue2rgb(p, q, h + 1 / 3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1 / 3);
		}
		const toHex = x => {
			const hex = Math.round(x * 255).toString(16);
			return hex.length === 1 ? '0' + hex : hex;
		};
		return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
	},
    initWheel: function() {
		this.data.colorWheel.getObject3D('mesh').material = new THREE.ShaderMaterial({
			uniforms: {
				brightness: {
					type: 'f',
					value: this.lightness
				}
			},
			vertexShader: '\
				varying vec2 vUv;\
				void main() {\
					vUv = uv;\
					vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\
					gl_Position = projectionMatrix * mvPosition;\
				}\
			',
			fragmentShader: '\
				#define M_PI2 6.28318530718\n \
				uniform float brightness;\
				varying vec2 vUv;\
				vec3 hsb2rgb(in vec3 c){\
					vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, \
									0.0, \
									1.0 );\
					rgb = rgb * rgb * (3.0 - 2.0 * rgb);\
					return c.z * mix( vec3(1.0), rgb, c.y);\
				}\
				\
				void main() {\
					vec2 toCenter = vec2(0.5) - vUv;\
					float angle = atan(toCenter.y, toCenter.x);\
					float radius = length(toCenter) * 2.0;\
					vec3 color = hsb2rgb(vec3((angle / M_PI2) + 0.5, radius, brightness));\
					gl_FragColor = vec4(color, 1.0);\
				}\
			'
		});
		this.data.lightWheel.getObject3D('mesh').material = new THREE.ShaderMaterial({
			uniforms: {
				color1: {
					value: new THREE.Color("black")
				},
				color2: {
					value: new THREE.Color("white")
				}
			},
			vertexShader: '\
				varying vec2 vUv;\
				void main() {\
					vUv = uv;\
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);\
				}\
			',
			fragmentShader: '\
				uniform vec3 color1;\
				uniform vec3 color2;\
				varying vec2 vUv;\
				void main() {\
					gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);\
				}\
			'
		});
		this.data.thicknessWheel.getObject3D('mesh').material.color = new THREE.Color("red")
    },
    initCursor: function() {
	    this.colorCursor = document.createElement('a-entity');
	    this.lightCursor = document.createElement('a-entity');
	    this.thickCursor = document.createElement('a-entity');
		
		const cursorGeo = new THREE.TorusBufferGeometry(0.025, 0.005, 2, 18);
		this.cursorMat = new THREE.MeshBasicMaterial({
			color: '#000',
			transparent: true
		});

		this.colorCursor.setObject3D('mesh', new THREE.Mesh(cursorGeo, this.cursorMat));
		this.lightCursor.setObject3D('mesh', new THREE.Mesh(cursorGeo, this.cursorMat));
		this.thickCursor.setObject3D('mesh', new THREE.Mesh(cursorGeo, this.cursorMat));

	    this.colorCursor.setAttribute('position', { x: 0, y: 0, z: 0.01 });
	    this.lightCursor.setAttribute('position', { x: 0, y: 1, z: 0.01 });
	    this.thickCursor.setAttribute('position', { x: 0, y: 1, z: 0.01 });

		this.data.colorWheel.appendChild(this.colorCursor);
		this.data.lightWheel.appendChild(this.lightCursor);
		this.data.thicknessWheel.appendChild(this.thickCursor);
    },
    initListener: function() {
		this.data.colorWheel.addEventListener("click", (e)=>{
			let point = e.detail.intersection.uv
			point.x = point.x * 2 - 1
			point.y = point.y * 2 - 1

			var polarPosition = {
				r: Math.sqrt(point.x * point.x + point.y * point.y),
				theta: Math.PI + Math.atan2(point.y, point.x)
			};

			var angle = ((polarPosition.theta * (180 / Math.PI)) + 180) % 360;
			this.h = angle / 360;
			this.s = polarPosition.r;

			this.recalculationColor();

			this.colorCursor.setAttribute('position', {
				x: point.x,
				y: point.y,
				z: 0.01
			});

		});

		this.data.lightWheel.addEventListener("click", (e) => {
			let pointY = e.detail.intersection.uv.y;
			
			this.lightness = pointY;
			this.data.colorWheel.getObject3D('mesh').material.uniforms.brightness.value = this.lightness;

			this.recalculationColor();

			this.lightCursor.setAttribute('position', {
				x: 0,
				y: pointY * 2 - 1,
				z: 0.01
			});

			if (pointY < 0.6)
				this.cursorMat.color = new THREE.Color('#FFF');
			else
				this.cursorMat.color = new THREE.Color('#000');
		});
		
		this.data.thicknessWheel.addEventListener("click", (e) => {
			let pointY = e.detail.intersection.uv.y;

			this.thickCursor.setAttribute('position', {
				x: 0,
				y: pointY * 2 - 1,
				z: 0.01
			});
			
			this.el.dispatchEvent( new CustomEvent('thickness_changed', {
				detail: {
					thickness: Math.abs(pointY - 1)
				}
			}));
		});
    },
	recalculationColor: function() {
		this.color = this.hslToHex(this.h, this.s, this.lightness - this.s * (0.6 * this.lightness));
		this.el.dispatchEvent( new CustomEvent('color_changed', {
			detail: {
				color: this.color
			}
		}));
		this.data.thicknessWheel.getObject3D('mesh').material.color = new THREE.Color(this.color);
	}
});