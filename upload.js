//upload script
var dropZones = document.getElementsByClassName("drop-zone");
var fileInputs = document.getElementsByClassName("file");
var urlInputs = document.getElementsByClassName("url");
var uploadIcons = document.getElementsByClassName("upload-icon");
var fileNameElements = document.getElementsByClassName("file-name");

function setCameraBlockPointerEvents(enabled) {
  var cameraBlock = document.querySelector(".camera-block");
  if (cameraBlock) {
    cameraBlock.style.pointerEvents = enabled ? "auto" : "none";
  }
}

let isCameraActive = false;

function checkAndSetCameraActive() {
  var cameraBlock = document.querySelector(".camera-block");
  // Replace the condition below with your actual condition to check if the camera is active
  isCameraActive = cameraBlock && cameraBlock.style.pointerEvents === "none";
  return isCameraActive;
}

var cameraBlock = document.querySelector(".camera-block");
cameraBlock.addEventListener("click", function () {
  // Set isCameraActive to true when the camera block is clicked
  checkAndSetCameraActive();

  // Disable the file and URL inputs
  for (let i = 0; i < fileInputs.length; i++) {
    fileInputs[i].disabled = true;
    urlInputs[i].disabled = true;
  }
});

for (let i = 0; i < dropZones.length; i++) {
  let dropZone = dropZones[i];
  let fileInput = fileInputs[i];
  let urlInput = urlInputs[i];
  let uploadIcon = uploadIcons[i];
  let fileNameElement = fileNameElements[i];

  dropZone.addEventListener("click", function () {
    fileInput.click();
  });

  fileInput.addEventListener("change", function () {
    if (this.files && this.files.length > 0) {
      var file = this.files[0];
      var fileSize = file.size / 1024 / 1024; // in MB

      if (fileSize > 25) {
        alert("File size exceeds 25MB. Please select a smaller file.");
        this.value = ""; // Clear the input
        return;
      }

      fileNameElement.textContent = file.name;
      uploadIcon.style.display = "none";
      if (!isCameraActive) {
        urlInput.disabled = true;
      }
      setCameraBlockPointerEvents(false);
    } else {
      fileNameElement.textContent = "";
      uploadIcon.style.display = "";
      if (!isCameraActive) {
        urlInput.disabled = false;
      }
      setCameraBlockPointerEvents(true);
    }
  });

  urlInput.addEventListener("input", function () {
    if (this.value) {
      if (!isCameraActive) {
        fileInput.disabled = true;
      }
      setCameraBlockPointerEvents(false);
    } else {
      if (!isCameraActive) {
        fileInput.disabled = false;
      }
      setCameraBlockPointerEvents(true);
    }
  });

  dropZone.addEventListener("dragover", function (e) {
    e.preventDefault();
    this.style.background = "#f0f0f0";
  });

  dropZone.addEventListener("dragleave", function (e) {
    this.style.background = "none";
  });

  dropZone.addEventListener("drop", function (e) {
    e.preventDefault();
    this.style.background = "none";
    fileInput.files = e.dataTransfer.files;
    fileNameElement.textContent = e.dataTransfer.files[0].name;
    uploadIcon.style.display = "none";
    urlInput.disabled = true;
  });
}

window.addEventListener("DOMContentLoaded", (event) => {
  const fileInput = document.querySelector(".file");
  const removeFileButton = document.querySelector(".remove-file");
  const fileNameElement = document.querySelector(".file-name");
  const uploadIcon = document.querySelector(".upload-icon");
  const urlInput = document.querySelector(".url"); // Use '.url' as the selector

  fileInput.addEventListener("change", function () {
    if (this.files && this.files[0]) {
      fileNameElement.textContent = this.files[0].name;
      removeFileButton.style.display = "block";
      uploadIcon.style.display = "none";
      urlInput.disabled = true;
    } else {
      // If no file is selected, hide the removeFileButton
      removeFileButton.style.display = "none";
      uploadIcon.style.display = "block";
      urlInput.disabled = false;
      setCameraBlockPointerEvents(true);
    }
  });

  removeFileButton.addEventListener("click", function (event) {
    event.stopPropagation();
    fileInput.value = "";
    fileNameElement.textContent = "";
    this.style.display = "none";
    uploadIcon.style.display = "block";
    urlInput.disabled = false;
    setCameraBlockPointerEvents(true);
  });
});

//camera script
document.querySelector(".start-camera").addEventListener("click", function () {
  document.getElementById("videoContainer").style.display = "block";

  const scanner = new jscanify();
  const canvas = document.getElementById("canvas");
  const result = document.getElementById("result");
  const video = document.getElementById("video");
  const captureButton = document.getElementById("capture");
  const previewImage = document.getElementById("preview-img");

  function handleSuccess(stream) {
    video.srcObject = stream;
    video.setAttribute("playsinline", ""); // required on iOS
    video.muted = true; // required on iOS to autoplay
    video.play();
    video.style.display = "";
  }

  navigator.mediaDevices
    .getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    })
    .then(handleSuccess)
    .catch((err) => {
      console.error("Error accessing webcam: ", err);
    });

  // Wait for the video to be ready
  video.addEventListener("loadedmetadata", () => {
    // Set the canvas dimensions based on the video
    const aspectRatio = 3 / 4; // Force a 3:4 aspect ratio
    if (video.videoWidth > video.videoHeight) {
      canvas.width = Math.min(video.videoWidth, 1024);
      canvas.height = canvas.width / aspectRatio;
    } else {
      canvas.height = Math.min(video.videoHeight, 1024);
      canvas.width = canvas.height * aspectRatio;
    }
    result.width = canvas.width;
    result.height = canvas.height;
  });

  video.onplay = () => {
    const canvasCtx = canvas.getContext("2d");
    const resultCtx = result.getContext("2d");

    const updateCanvasDimensions = () => {
      const aspectRatio = 3 / 4; // Force a 3:4 aspect ratio
      if (video.videoWidth > video.videoHeight) {
        canvas.width = Math.min(video.videoWidth, 1024);
        canvas.height = canvas.width / aspectRatio;
      } else {
        canvas.height = Math.min(video.videoHeight, 1024);
        canvas.width = canvas.height * aspectRatio;
      }
      result.width = canvas.width;
      result.height = canvas.height;
    };

    updateCanvasDimensions();

    setInterval(() => {
      // Draw video to canvas only if video is ready
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
        try {
          const resultCanvas = scanner.highlightPaper(canvas);
          resultCtx.clearRect(0, 0, result.width, result.height);
          resultCtx.drawImage(resultCanvas, 0, 0, result.width, result.height);
        } catch (e) {
          console.error("Error processing the canvas:", e);
        }
      }
    }, 100);

    // Handle window resize to update canvas dimensions
    window.addEventListener("resize", updateCanvasDimensions);
  };

// Capture functionality
let ctx = canvas.getContext("2d");
ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
const resultCanvas = scanner.extractPaper(
  canvas,
  canvas.width,
  canvas.height
);

// Get context and image data from resultCanvas
let resultCtx = resultCanvas.getContext("2d");
let imageData = resultCtx.getImageData(0, 0, resultCanvas.width, resultCanvas.height);

// Convert ImageData to cv.Mat
let src = cv.matFromImageData(imageData);

// Convert to grayscale
let gray = new cv.Mat();
cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

// Equalize histogram
let equalized = new cv.Mat();
cv.equalizeHist(gray, equalized);

// Convert back to color
let colorEqualized = new cv.Mat();
cv.cvtColor(equalized, colorEqualized, cv.COLOR_GRAY2RGBA, 0);

// Create empty Mat for output
let dst = new cv.Mat();

// Adjust brightness and contrast
let alpha = 1; // Contrast control (1.0-3.0)
let beta = 70; // Brightness control (0-100)

// Perform the operation new_image(i,j) = alpha*image(i,j) + beta
src.convertTo(dst, -1, alpha, beta);

// Create sharpening kernel
let kernel = cv.matFromArray(3, 3, cv.CV_32F, [
    -1, -1, -1,
    -1, 9, -1,
    -1, -1, -1
]);

// Apply the sharpening kernel
let sharpened = new cv.Mat();
cv.filter2D(dst, sharpened, cv.CV_8U, kernel);

// Convert cv.Mat back to ImageData
let outputImageData = new ImageData(new Uint8ClampedArray(sharpened.data), sharpened.cols, sharpened.rows);

// Put the image data back onto the canvas
resultCtx.putImageData(outputImageData, 0, 0);

const dataUrl = resultCanvas.toDataURL();
previewImage.src = dataUrl; // Use Blob URL for the preview image

// Clean up
src.delete(); dst.delete(); kernel.delete(); sharpened.delete();

});

document.getElementById("cancel").addEventListener("click", function () {
  location.reload();
});
