import React, { useRef, useEffect } from "react";
import { Scene, PerspectiveCamera, Color, WebGLRenderer, AmbientLight, DirectionalLight, GridHelper, AxesHelper, BoxGeometry, CanvasTexture, SpriteMaterial, Sprite, MeshPhongMaterial, Mesh } from 'three';


// Simpler implementation of 3D chart using vanilla Three.js
export default function ThreeJsChart({ data, xKey, yKey }) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    // Don't re-initialize if already set up
    if (rendererRef.current) return;

    const init = async () => {
      // Import OrbitControls dynamically to avoid SSR issues
      const OrbitControlsModule = await import(
        "three/examples/jsm/controls/OrbitControls"
      );
      const OrbitControls = OrbitControlsModule.OrbitControls;

      // Get container dimensions
      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;

      // Create scene
      const scene = new Scene();
      scene.background = new Color(0xf0f0f0);
      sceneRef.current = scene;

      // Create camera
      const camera = new PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(20, 20, 20);
      cameraRef.current = camera;

      // Create renderer
      const renderer = new WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.shadowMap.enabled = true;
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Create controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controlsRef.current = controls;

      // Add lights
      const ambientLight = new AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 20, 10);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      // Create grid helper
      const gridHelper = new GridHelper(50, 50);
      scene.add(gridHelper);

      // Create axes helper
      const axesHelper = new AxesHelper(15);
      scene.add(axesHelper);

      // Create 3D bars for data visualization
      createDataBars();

      // Animation loop
      function animate() {
        animationRef.current = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      }

      animate();

      // Handle window resize
      const handleResize = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    };

    init();

    return () => {
      // Clean up on unmount
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Create or update data bars whenever data, xKey, or yKey changes
  useEffect(() => {
    if (!sceneRef.current) return;

    createDataBars();
  }, [data, xKey, yKey]);

  // Function to create data bars
  const createDataBars = () => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;

    // Remove existing bars
    scene.children = scene.children.filter(
      (child) => !child.userData || child.userData.type !== "dataBar"
    );

    // Add axes and grid back
    const gridHelper = new GridHelper(30, 30);
    scene.add(gridHelper);

    const axesHelper = new AxesHelper(15);
    scene.add(axesHelper);

    // Add lights
    const ambientLight = new AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // If no data, return early
    if (!data || !data.length || !xKey || !yKey) return;

    // Colors for the bars
    const colors = [
      0x0088fe, 0x00c49f, 0xffbb28, 0xff8042, 0x9467bd, 0xe377c2, 0x7f7f7f,
      0xbcbd22,
    ];

    // Calculate maximum value for scaling
    const maxValue = Math.max(...data.map((item) => Number(item[yKey]) || 0));
    const normalizeValue = (val) => (val / maxValue) * 10;

    // Define spacing factor for bar positioning
    const spacingFactor = 2;

    // Create bars
    data.forEach((item, index) => {
      const value = Number(item[yKey]) || 0;
      const normalizedHeight = normalizeValue(value);

      // Create bar geometry
      const geometry = new BoxGeometry(1, normalizedHeight, 1);

      // Create bar material
      const material = new MeshPhongMaterial({
        color: new Color(colors[index % colors.length]),
        shininess: 100,
      });

      // Create mesh
      const bar = new Mesh(geometry, material);

      // Position bar
      bar.position.set(
        (index - data.length / 2) * spacingFactor, // X position
        normalizedHeight / 2, // Y position (half height, as pivot is in center)
        0 // Z position
      );

      // Set user data for identification
      bar.userData = { type: "dataBar", value, name: item[xKey] };

      // Add to scene
      scene.add(bar);

      // Add text label for value
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = 256;
      canvas.height = 64;
      context.fillStyle = "#000000";
      context.font = "24px Arial";
      context.fillText(String(value), 10, 40);

      const texture = new CanvasTexture(canvas);
      const labelMaterial = new SpriteMaterial({ map: texture });
      const label = new Sprite(labelMaterial);
      label.position.set(
        bar.position.x,
        bar.position.y + normalizedHeight / 2 + 1,
        bar.position.z
      );
      label.scale.set(5, 1.25, 1);
      label.userData = { type: "dataBar" };
      scene.add(label);

      // Add text label for name
      const nameCanvas = document.createElement("canvas");
      const nameContext = nameCanvas.getContext("2d");
      nameCanvas.width = 256;
      nameCanvas.height = 64;
      nameContext.fillStyle = "#000000";
      nameContext.font = "18px Arial";
      nameContext.fillText(String(item[xKey]).substring(0, 15), 10, 30);

      const nameTexture = new CanvasTexture(nameCanvas);
      const nameLabelMaterial = new SpriteMaterial({ map: nameTexture });
      const nameLabel = new Sprite(nameLabelMaterial);
      nameLabel.position.set(bar.position.x, -0.5, bar.position.z + 1);
      nameLabel.scale.set(5, 1.25, 1);
      nameLabel.userData = { type: "dataBar" };
      scene.add(nameLabel);
    });

    // Add axis labels
    const xAxisCanvas = document.createElement("canvas");
    const xAxisContext = xAxisCanvas.getContext("2d");
    xAxisCanvas.width = 256;
    xAxisCanvas.height = 64;
    xAxisContext.fillStyle = "#000000";
    xAxisContext.font = "bold 24px Arial";
    xAxisContext.fillText(xKey, 10, 40);

    const xAxisTexture = new CanvasTexture(xAxisCanvas);
    const xAxisMaterial = new SpriteMaterial({ map: xAxisTexture });
    const xAxisLabel = new Sprite(xAxisMaterial);
    xAxisLabel.position.set(0, -2, (data.length * spacingFactor) / 2 + 2);
    xAxisLabel.scale.set(8, 2, 1);
    xAxisLabel.userData = { type: "dataBar" };
    scene.add(xAxisLabel);

    const yAxisCanvas = document.createElement("canvas");
    const yAxisContext = yAxisCanvas.getContext("2d");
    yAxisCanvas.width = 256;
    yAxisCanvas.height = 64;
    yAxisContext.fillStyle = "#000000";
    yAxisContext.font = "bold 24px Arial";
    yAxisContext.fillText(yKey, 10, 40);

    const yAxisTexture = new CanvasTexture(yAxisCanvas);
    const yAxisMaterial = new SpriteMaterial({ map: yAxisTexture });
    const yAxisLabel = new Sprite(yAxisMaterial);
    yAxisLabel.position.set((-data.length * spacingFactor) / 2 - 2, 5, 0);
    yAxisLabel.scale.set(8, 2, 1);
    yAxisLabel.userData = { type: "dataBar" };
    scene.add(yAxisLabel);
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "500px",
        overflow: "hidden",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
    ></div>
  );
}
