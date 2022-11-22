'use strict';

/* global THREE */

function main() {
    const canvas = document.createElement('canvas');
    const renderer = new THREE.WebGLRenderer({canvas, alpha: true});
    renderer.setScissorTest(true);

    const sceneElements = [];
    function addScene(elem, fn) {
        const ctx = document.createElement('canvas').getContext('2d');
        elem.appendChild(ctx.canvas);
        sceneElements.push({elem, fn, ctx});
    }

    // Define materials 
    var selectmaterial = new THREE.MeshPhongMaterial(
    {color: 0x90D2EC,
    flatShading: true,
    side: THREE.DoubleSide,
    polygonOffset: true, 
    polygonOffsetFactor: 1, 
    polygonOffsetUnits: 1,
    });

    function makeScene(elem) {
    const scene = new THREE.Scene();

    // Set scene parameters based on element data values 
    const width = window.innerWidth;
    const height = window.innerHeight;

    scene.background = new THREE.Color(0xFFFFFF);
    const fov = 60;
    const aspect = width / height;
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    if (!isNaN(elem.dataset.lookx) && !isNaN(elem.dataset.looky) && !isNaN(elem.dataset.lookz)) {
        camera.lookAt(new THREE.Vector3(elem.dataset.lookx,elem.dataset.looky,elem.dataset.lookz));   
    } else {
        camera.lookAt(new THREE.Vector3(0,0,0));
    }
    if (!isNaN(elem.dataset.camerax) && !isNaN(elem.dataset.cameray) && !isNaN(elem.dataset.cameraz)) {
        camera.position.set(elem.dataset.camerax, elem.dataset.cameray, elem.dataset.cameraz); 
    } else {
        camera.position.set(0, 0, 2.5); 
    }
    scene.add(camera);

    const controls = new THREE.OrbitControls(camera, elem);

    // if (!isNaN(elem.dataset.lookx) && !isNaN(elem.dataset.looky) && !isNaN(elem.dataset.lookz)) {
    //     controls.target = new THREE.Vector3(elem.dataset.lookx,elem.dataset.looky,elem.dataset.lookz);   
    // }

    return {scene, camera, controls};
    }

    // This function reads in the relevant OBJs and adds the relevant meshes to the scene 
    var loader = new THREE.OBJLoader();

    function sceneInitFunction(elem) {
        const {scene, camera, controls} = makeScene(elem);
        
        // Add lights 
        var lightHolder = new THREE.Group();

        var keyLight = new THREE.DirectionalLight(new THREE.Color('rgb(200, 200, 200)'), 1.0);
        keyLight.position.set(-100, 0, 100);

        // var topLight = new THREE.DirectionalLight(new THREE.Color('rgb(200, 200, 200)'), 1.0);
        // keyLight.position.set(50, 100, 50);

        var botLight = new THREE.DirectionalLight(new THREE.Color('rgb(200, 200, 200)'), 1.0);
        keyLight.position.set(-50, -100, -50);

        var fillLight = new THREE.DirectionalLight(new THREE.Color('rgb(200, 200, 200)'), 0.75);    
        fillLight.position.set(100, 0, 100);

        var backLight = new THREE.DirectionalLight(0xffffff, 1.0);
        backLight.position.set(100, 0, -100).normalize();

        // lightHolder.add(topLight);
        lightHolder.add(keyLight);
        lightHolder.add(botLight);
        lightHolder.add(fillLight);
        lightHolder.add(backLight);
        scene.add(lightHolder);
        
        // Define callback functions 
        function selectCallback(object3d) {
            object3d.receiveShadow = true;
            object3d.castShadow = true;
            object3d.traverse( function ( child ) {

            if ( child instanceof THREE.Mesh ) {
                child.material = selectmaterial;

                // Also add wireframe for edges 
                // var geo = new THREE.WireframeGeometry( child.geometry ); // or WireframeGeometry
                // var mat = new THREE.LineBasicMaterial( { color: "black" } );
                // var wireframe = new THREE.LineSegments( geo, mat );
                // child.add( wireframe );
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

        const selectionobj = elem.dataset.selectionobj

        loader.load(selectionobj, 
            selectCallback, 
            onProgress,
            function ( error ) {
                console.log('Error: ' + error + ' when loading ' + selectionobj + "\n. Loader path " + loader.path);
            });
        
        return (time, rect) => {
            camera.aspect = rect.width / rect.height;
            camera.updateProjectionMatrix();
            controls.update();
            renderer.render(scene, camera);
        };
    };

    document.querySelectorAll('[data-selectionobj]').forEach((elem) => {
        const sceneRenderFunction = sceneInitFunction(elem);
        addScene(elem, sceneRenderFunction);
    });

    function render(time) {
    time *= 0.001;

    for (const {elem, fn, ctx} of sceneElements) {
        // get the viewport relative position of this element
        const rect = elem.getBoundingClientRect();
        const {left, right, top, bottom, width, height} = rect;
        const rendererCanvas = renderer.domElement;
        
        // console.log(width)
        // console.log(height)
        // console.log(rendererCanvas.width)
        // console.log(rendererCanvas.height)

        const isOffscreen =
            bottom < 0 ||
            top > window.innerHeight ||
            right < 0 ||
            left > window.innerWidth;

        if (!isOffscreen) {
        // make sure the renderer's canvas is big enough
        if (rendererCanvas.width < width || rendererCanvas.height < height) {
            renderer.setSize(width, height, false);
        }

        // make sure the canvas for this area is the same size as the area
        if (ctx.canvas.width !== width || ctx.canvas.height !== height) {
            ctx.canvas.width = width;
            ctx.canvas.height = height;
        }

        renderer.setScissor(0, 0, width, height);
        renderer.setViewport(0, 0, width, height);

        fn(time, rect);

        // copy the rendered scene to this element's canvas
        ctx.globalCompositeOperation = 'copy';
        ctx.drawImage(
            rendererCanvas,
            0, rendererCanvas.height - height, width, height,  // src rect
            0, 0, width, height);                              // dst rect
        }
    }

    requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();
