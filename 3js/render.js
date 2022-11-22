function render(id, selectionobj, nonselectionobj, x, y, z, scale_factor) {
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x8FBCD4);
    
    var width = Math.min(400, window.innerWidth * scale_factor);
    var height = Math.min(400, window.innerWidth * scale_factor);

    var camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3.5); 
    camera.lookAt(new THREE.Vector3(0,0,0)); 

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    document.querySelector(id).appendChild(renderer.domElement);

    var controls = new THREE.OrbitControls(camera, renderer.domElement);

    // Load texture 
    // const textureloader = new THREE.TextureLoader();
    // const texture = textureloader.load(texturepath,);

    var selectmaterial = new THREE.MeshPhongMaterial(
    {color: "yellow",
     flatShading: true,
     side: THREE.DoubleSide,
     polygonOffset: true, 
     polygonOffsetFactor: 1, 
     polygonOffsetUnits: 1,
    });

    var nonselectmaterial = new THREE.MeshPhongMaterial(
        {color: 0xffffff,
         flatShading: true,
         side: THREE.DoubleSide,
         polygonOffset: true, 
         polygonOffsetFactor: 1, 
         polygonOffsetUnits: 1,
        });

    var lightHolder = new THREE.Group();

    var keyLight = new THREE.DirectionalLight(new THREE.Color('rgb(255, 255, 255)'), 1.0);
    keyLight.position.set(-100, 0, 100);

    var fillLight = new THREE.DirectionalLight(new THREE.Color('rgb(255, 255, 255)'), 0.75);    
    fillLight.position.set(100, 0, 100);

    var backLight = new THREE.DirectionalLight(0xffffff, 1.0);
    backLight.position.set(100, 0, -100).normalize();

    lightHolder.add(keyLight);
    lightHolder.add(fillLight);
    lightHolder.add(backLight);
    scene.add(lightHolder);
   
    function selectCallback(object3d) {
        object3d.receiveShadow = true;
        object3d.castShadow = true;
        object3d.traverse( function ( child ) {

        if ( child instanceof THREE.Mesh ) {
            child.material = selectmaterial;

            // Also add wireframe for edges 
            var geo = new THREE.WireframeGeometry( child.geometry ); // or WireframeGeometry
            var mat = new THREE.LineBasicMaterial( { color: "black" } );
            var wireframe = new THREE.LineSegments( geo, mat );
            child.add( wireframe );
        }

        } );

        scene.add(object3d);
    }

    function nonSelectCallback(object3d) {
        object3d.receiveShadow = true;
        object3d.castShadow = true;
        object3d.traverse( function ( child ) {

        if ( child instanceof THREE.Mesh ) {
            child.material = nonselectmaterial;

            // Also add wireframe for edges 
            var geo = new THREE.WireframeGeometry( child.geometry ); // or WireframeGeometry
            var mat = new THREE.LineBasicMaterial( { color: "black" } );
            var wireframe = new THREE.LineSegments( geo, mat );
            child.add( wireframe );
        }

        } );

        scene.add(object3d);
    }

    const onProgress = function ( xhr ) {

		if ( xhr.lengthComputable ) {

			const percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round( percentComplete, 2 ) + '% loaded' );

		}

	};

    var loader = new THREE.OBJLoader();

    // Load selection OBJ 
    loader.load(selectionobj, 
        selectCallback, 
        onProgress,
        function ( error ) {

            console.log('Error: ' + error + ' when loading ' + selectionobj + "\n. Loader path " + loader.path);

        });

    // Load nonselection OBJ 
    loader.load(nonselectionobj, 
        nonSelectCallback, 
        onProgress,
        function ( error ) {

            console.log('Error: ' + error + ' when loading ' + nonselectionobj + "\n. Loader path " + loader.path);

        });
    
    // Assign anchor position
    const spheregeo = new THREE.SphereGeometry(0.01, 5, 5)
    const spheremat = new THREE.MeshBasicMaterial({color: "red"})
    const sphere = new THREE.Mesh(spheregeo, spheremat)

    // Assign new position to sphere 
    sphere.position.x = x;
    sphere.position.y = y;
    sphere.position.z = z;

    scene.add(sphere);

    console.log(scene.children);

    var animate = function () {
        requestAnimationFrame(animate);
        controls.update();
        lightHolder.quaternion.copy(camera.quaternion);
        renderer.render(scene, camera);
    };

    animate();
}
