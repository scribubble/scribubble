
AFRAME.registerComponent('border-plane', {
	schema: {
		scale: { type: 'number', default: 1 },
		radius: { type: 'number', default: 0.05 }
	},
	init: function init() {
		const 	_x = 0,
				_y = 0,
				_width = this.el.getAttribute('width'),
				_height = this.el.getAttribute('height'),
				_radius = this.data.radius;
        
		let shape = new THREE.Shape();
		shape.moveTo( _x, _y + _radius );
		shape.lineTo( _x, _y + _height - _radius );
		shape.quadraticCurveTo( _x, _y + _height, _x + _radius, _y + _height );
		shape.lineTo( _x + _width - _radius, _y + _height );
		shape.quadraticCurveTo( _x + _width, _y + _height, _x + _width, _y + _height - _radius );
		shape.lineTo( _x + _width, _y + _radius );
		shape.quadraticCurveTo( _x + _width, _y, _x + _width - _radius, _y );
		shape.lineTo( _x + _radius, _y );
		shape.quadraticCurveTo( _x, _y, _x, _y + _radius );

		const geoPoints = new THREE.BufferGeometry().setFromPoints( shape.getPoints() );
		const line = new THREE.Line( geoPoints, new THREE.LineBasicMaterial( { color: '#4262FF' } ) );

		line.position.set(-_width / 2 * this.data.scale, -_height / 2 * this.data.scale, 0);
		line.scale.set(this.data.scale, this.data.scale, 0);

		this.el.object3D.add(line);
	}
});

