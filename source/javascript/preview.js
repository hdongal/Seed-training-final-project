let isClosingBrowser = false;

        // Load and display photos when page loads
        window.addEventListener('DOMContentLoaded', () => {
            const photoGrid = document.getElementById('photo-grid');
            const savedImages = JSON.parse(localStorage.getItem('capturedImages') || '[]');
            
            savedImages.forEach((imageData, index) => {
                const photoContainer = document.createElement('div');
                photoContainer.className = 'photo-container';
                
                const img = new Image();
                img.src = imageData;
                img.alt = `Captured photo ${index + 1}`;
                img.style.transform = "scaleX(-1)";  // Add mirror effect to match capture page
                
                photoContainer.appendChild(img);
                photoGrid.appendChild(photoContainer);
            });

            // Add event listeners for color buttons
            const colorButtons = document.querySelectorAll('.frame-color button');
            colorButtons.forEach(button => {
                // Set initial button background color
                const color = button.getAttribute('data-color');
                button.style.backgroundColor = color;
                if (color === '#FFFFFF') {
                    button.style.color = '#000000';
                } else if (color === '#0E0E0E' || color === '#1F0F6B' || color === '#9A4EAE') {
                    button.style.color = '#FFFFFF';
                }
                
                button.addEventListener('click', () => {
                    const color = button.getAttribute('data-color');
                    const frame = document.getElementById('frame');
                    frame.style.backgroundColor = color;
                });
            });

            // Add event listeners for sticker buttons
            const stickerButtons = document.querySelectorAll('.frame-sticker button');
            const frame = document.getElementById('frame');
            
            stickerButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const sticker = button.getAttribute('data-sticker');
                    frame.setAttribute('data-sticker', sticker);
                    
                    // Update active state of buttons
                    stickerButtons.forEach(btn => btn.classList.remove('active'));
                    if (sticker !== 'none') {
                        button.classList.add('active');
                    }
                });
            });
        });

        async function downloadCombinedImage() {
            const frame = document.getElementById('frame');
            const canvas = document.getElementById('finalCanvas');
            const ctx = canvas.getContext('2d');

            // Get the actual frame dimensions
            const frameRect = frame.getBoundingClientRect();
            canvas.width = frameRect.width;
            canvas.height = frameRect.height;

            // Create a temporary image for html2canvas
            const frameImage = await html2canvas(frame);

            // Draw the frame with photos onto the canvas
            ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);

            // Convert the canvas to an image and trigger download
            const combinedImageUrl = canvas.toDataURL('image/jpeg', 1.0);
            const link = document.createElement('a');
            link.href = combinedImageUrl;
            link.download = 'framed-photos.jpg';
            link.click();
        }

        // Function to handle going back to camera page
        function goBack() {
            if (confirm('Going back to camera will clear current photos. Continue?')) {
                localStorage.removeItem('capturedImages');
                window.location.href = '/source/html/capture.html';
            }
        }

        // Handle browser close event
        window.addEventListener('beforeunload', function(e) {
            // Only show confirmation and clear storage if actually closing the browser
            if (!isClosingBrowser) {
                return;
            }
            e.preventDefault();
            e.returnValue = '';
            localStorage.removeItem('capturedImages');
        });

        // Detect actual browser/tab closing
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'hidden') {
                isClosingBrowser = true;
            } else {
                isClosingBrowser = false;
            }
        });