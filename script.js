const imageInput = document.getElementById('imageInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Initialize Mediapipe Pose
const pose = new Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
});

pose.setOptions({
  modelComplexity: 1,  // Set the model complexity
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,  // Confidence threshold for detection
  minTrackingConfidence: 0.5,   // Confidence threshold for tracking
});

pose.onResults((results) => {
  console.log('Mediapipe Pose Results:', results); // Log the entire results for debugging
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw the uploaded image on the canvas
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  // Check if pose landmarks are detected
  if (results.poseLandmarks) {
    console.log('Pose Landmarks Detected:', results.poseLandmarks); // Log detected landmarks for debugging

    drawConnectors(ctx, results.poseLandmarks, Pose.POSE_CONNECTIONS, {
      color: '#00FF00', // Color of the connectors
      lineWidth: 4,     // Line width for connectors
    });
    drawLandmarks(ctx, results.poseLandmarks, {
      color: '#FF0000', // Color of the landmarks
      lineWidth: 2,     // Line width for landmarks
    });

    // Calculate body type based on shoulder-to-hip ratio
    const shoulderWidth = Math.abs(results.poseLandmarks[11].x - results.poseLandmarks[12].x); // Left and Right shoulder
    const hipWidth = Math.abs(results.poseLandmarks[23].x - results.poseLandmarks[24].x);      // Left and Right hip
    const shoulderToHipRatio = shoulderWidth / hipWidth;

    console.log(`Shoulder Width: ${shoulderWidth}, Hip Width: ${hipWidth}, Ratio: ${shoulderToHipRatio}`); // Log the ratios

    // Display body type based on the ratio
    let bodyType = '';
    if (shoulderToHipRatio < 0.8) {
      bodyType = 'RECTANGLE';
    } else if (shoulderToHipRatio >= 1.0 && shoulderToHipRatio <= 1.2) {
      bodyType = 'APPLE';
    } else if (shoulderToHipRatio > 1.6 && shoulderToHipRatio <= 1.8) {
      bodyType = 'PEAR';
    } else {
      bodyType = 'HOURGLASS';
    }

    document.getElementById('output').innerText = `Body Type: ${bodyType}`;
  } else {
    document.getElementById('output').innerText = 'Pose not detected. Try a different image.';
  }
});

// Handle image input
imageInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      // Set canvas size to match the image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image to the canvas
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // Send the image to Mediapipe for pose detection
      pose.send({ image: img });
    };
  }
});