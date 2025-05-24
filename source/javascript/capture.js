const camera_button = document.querySelector("#start-camera-btn");
const video = document.querySelector("#video");
video.style.transform = "scaleX(-1)";  // Add mirror effect
const capture_button = document.querySelector("#capture-btn");
const image_container = document.querySelector("#image-container");
const timerInput = document.querySelector("#timer");
let photoCount = 0;  // Counter to track number of photos
const MAX_PHOTOS = 4;  // Maximum number of photos allowed

// Create countdown display element
const countdownDisplay = document.createElement('div');
countdownDisplay.className = 'countdown-display';
document.body.appendChild(countdownDisplay);


async function initCamera(){
	// Clear any existing photos when starting new capture session
	localStorage.removeItem('capturedImages');
	photoCount = 0;
	image_container.innerHTML = '';
	capture_button.disabled = false;
	
	try {
		const stream = await navigator.mediaDevices.getUserMedia({ 
			video: {
				width: { ideal: 1620 },
				height: { ideal: 1080 },
				aspectRatio: 3/2,
				facingMode: "user"  // Use front-facing camera
			}, 
			audio: false 
		});
		video.srcObject = stream;
		
		// Set canvas dimensions to match 2:3 aspect ratio
		canvas.width = 1620;
		canvas.height = 1080;
	}
	catch (err) {
		console.error("Error accessing the camera: ", err);
	}
}

// window.addEventListener("DOMContentLoaded", initCamera);

camera_button.addEventListener('click', initCamera);

function startCountdown(seconds) {
    return new Promise((resolve) => {
        let remainingTime = seconds;
        
        const updateDisplay = () => {
            if (remainingTime > 0) {
                countdownDisplay.style.display = 'block';
                countdownDisplay.textContent = remainingTime;
                remainingTime--;
                setTimeout(updateDisplay, 1000);
            } else {
                countdownDisplay.style.display = 'none';
                resolve();
            }
        };
        
        updateDisplay();
    });
}

async function captureImage(){
	if (photoCount >= MAX_PHOTOS) {
		alert("Maximum limit of 4 photos reached!");
		return;
	}

    // Get timer value (default to 0 if not set)
    const timerSeconds = parseInt(timerInput.value) || 0;
    
    if (timerSeconds > 0) {
        capture_button.disabled = true;  // Disable button during countdown
        await startCountdown(timerSeconds);
        capture_button.disabled = false;  // Re-enable button after countdown
    }

    // Get the video's actual display dimensions
    const videoRect = video.getBoundingClientRect();
    const videoDisplayWidth = videoRect.width;
    const videoDisplayHeight = videoRect.height;

    // Create a temporary canvas to crop the image
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // Set temp canvas size to match video display size
    tempCanvas.width = videoDisplayWidth;
    tempCanvas.height = videoDisplayHeight;
    
    // Calculate the source dimensions to maintain aspect ratio
    const videoAspectRatio = video.videoWidth / video.videoHeight;
    const displayAspectRatio = videoDisplayWidth / videoDisplayHeight;
    
    let sourceX = 0, sourceY = 0, sourceWidth = video.videoWidth, sourceHeight = video.videoHeight;
    
    if (videoAspectRatio > displayAspectRatio) {
        // Video is wider than display
        sourceWidth = video.videoHeight * displayAspectRatio;
        sourceX = (video.videoWidth - sourceWidth) / 2;
    } else {
        // Video is taller than display
        sourceHeight = video.videoWidth / displayAspectRatio;
        sourceY = (video.videoHeight - sourceHeight) / 2;
    }
    
    // Draw the video frame to the temp canvas, cropping to match display
    tempCtx.drawImage(
        video,
        sourceX, sourceY, sourceWidth, sourceHeight,  // Source rectangle
        0, 0, videoDisplayWidth, videoDisplayHeight   // Destination rectangle
    );
    
    // Get the cropped image data
    const image_data_url = tempCanvas.toDataURL('image/jpeg');

    // Save to localStorage
    const savedImages = JSON.parse(localStorage.getItem('capturedImages') || '[]');
    savedImages.push(image_data_url);
    localStorage.setItem('capturedImages', JSON.stringify(savedImages));

    const captureImage = new Image();
    captureImage.src = image_data_url;
    captureImage.style.width = "225px";
    captureImage.style.height = "150px";
    captureImage.style.objectFit = "cover";
    captureImage.style.transform = "scaleX(-1)";  // Flip the captured image to match video
    image_container.prepend(captureImage);
	
	photoCount++;
	
	// Disable the capture button if max photos reached
	if (photoCount >= MAX_PHOTOS) {
		capture_button.disabled = true;
        //redirect to preview page
        window.location.href = '/source/html/preview.html';
	}
}

capture_button.addEventListener('click', captureImage);
