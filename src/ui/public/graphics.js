/*
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // Create a semicircular arc

        let curves = []
        let lines = []
        for (let i = 0; i < 8; i++){
            const curve = new THREE.EllipseCurve(
                0, 0,              // center x, y
                1 + i * 0.25, 1 + i * 0.25,              // x radius, y radius
                0, Math.PI,        // start angle, end angle
                false,             // clockwise
                0                  // rotation
            );
            curves.push(curve);

            const points = curves[i].getPoints(50);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ color: 0XFFA500 });
            const line = new THREE.Line(geometry, material);
            scene.add(line);
            lines.push(line);
        }

        camera.position.z = 5;

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }
        animate();
*/