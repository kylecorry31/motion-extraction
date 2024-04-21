(function () {
  let historyLength = 4;
  let history = [];
  const videoElement = document.querySelector("video");
  const outputImageElement = document.querySelector("#image");
  let diffMultiplier = 1;
  let baseMultiplier = 0;

  // An in memory canvas for reading the video frame
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const videoWidth = 640;
  const videoHeight = 480;
  canvas.width = videoWidth;
  canvas.height = videoHeight;

  const input = document.querySelector("#history");
  input.addEventListener("input", (event) => {
    historyLength = parseInt(event.target.value);
  });

  // When the image is tapped, toggle between drawing the base and the diff only
  outputImageElement.addEventListener("click", () => {
    if (baseMultiplier === 0) {
      diffMultiplier = 4;
      baseMultiplier = 1;
    } else {
      diffMultiplier = 1;
      baseMultiplier = 0;
    }
  });

  // Open the webcam
  navigator.mediaDevices
    .getUserMedia({
      video: {
        facingMode: "environment",
      },
    })
    .then((stream) => {
      videoElement.srcObject = stream;

      const processFrame = () => {
        // Add the current frame to the history
        context.drawImage(videoElement, 0, 0, videoWidth, videoHeight);
        const imageData = context.getImageData(0, 0, videoWidth, videoHeight);
        history.push(imageData);
        history = history.slice(-historyLength);

        // Subtract the current frame from the first frame in the history
        const firstFrame = history[0];
        const diff = context.createImageData(videoWidth, videoHeight);
        for (let i = 0; i < imageData.data.length; i += 4) {
          diff.data[i] = Math.min(
            255,
            Math.abs(imageData.data[i] - firstFrame.data[i]) * diffMultiplier +
              baseMultiplier * imageData.data[i]
          );
          diff.data[i + 1] = Math.min(
            255,
            Math.abs(imageData.data[i + 1] - firstFrame.data[i + 1]) *
              diffMultiplier +
              baseMultiplier * imageData.data[i + 1]
          );
          diff.data[i + 2] = Math.min(
            255,
            Math.abs(imageData.data[i + 2] - firstFrame.data[i + 2]) *
              diffMultiplier +
              baseMultiplier * imageData.data[i + 2]
          );
          diff.data[i + 3] = 255;
        }

        // Draw the diff data to the image element
        context.putImageData(diff, 0, 0);
        outputImageElement.src = canvas.toDataURL();

        requestAnimationFrame(processFrame);
      };

      processFrame();
    });
})();
