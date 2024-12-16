// Selecting elements
const gallery = document.getElementById('gallery');
const toggleButton = document.getElementById('toggle');
const prevDayButton = document.getElementById('prev-day');
const nextDayButton = document.getElementById('next-day');
const dateElement = document.getElementById('date');

// State
let isDay = true;
let currentDayIndex = 0;
let currentNightIndex = 0;

// Function to format the date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Function to generate random offset and rotation
function applyRandomStyles(element) {
    const rot = 20;
    const offset = 15;
    const rotation = `${Math.random() * rot - rot / 2}deg`;
    const offsetX = `${Math.random() * offset - offset / 2}px`;
    const offsetY = `${Math.random() * offset - offset / 2}px`;

    element.style.setProperty('--rotation', rotation);
    element.style.setProperty('--offsetX', offsetX);
    element.style.setProperty('--offsetY', offsetY);
}

// Function to add random heights to images
function addRandomHeight(imageElement) {
    if (Math.random() > 0.5) {  // Randomly assign some images to have varied heights
        imageElement.classList.add('random-height');
    }
}

// Function to slightly randomize the order of images
function shuffleImages(images) {
    // Define how many positions we will randomly swap
    const numSwaps = Math.floor(images.length * 0.2);  // 20% of images will be swapped
    for (let i = 0; i < numSwaps; i++) {
        const index1 = Math.floor(Math.random() * images.length);
        const index2 = Math.floor(Math.random() * images.length);
        // Swap images at index1 and index2
        [images[index1], images[index2]] = [images[index2], images[index1]];
    }
    return images;
}

// Function to render images for a specific day or night date
function renderGallery(imagesByDate, isDayMode) {
    const currentIndex = isDayMode ? currentDayIndex : currentNightIndex;
    const date = isDayMode ? dayDates[currentIndex] : nightDates[currentIndex];
    let images = imagesByDate[date];

    // Shuffle the images slightly
    images = shuffleImages(images);

    gallery.innerHTML = ''; // Clear gallery

    images.forEach((src) => {
        const img = document.createElement('img');
        img.src = src
        img.loading = 'lazy';  // Add this line for lazy loading
        applyRandomStyles(img);
        addRandomHeight(img);  // Apply random height to some images

        // Detect image aspect ratio and apply class
        img.onload = () => {
            if (img.naturalWidth > img.naturalHeight) {
                img.classList.add('horizontal');
            } else {
                img.classList.add('vertical');
            }
        };

        img.addEventListener('click', () => openFullScreen(img)); // Add click event for full screen
        gallery.appendChild(img);
    });

    // Update the date text next to the title
    dateElement.textContent = `(${formatDate(date)})`;
}

// Add this to the top of your existing script.js, near other variable declarations
let fullscreenModal = null;
let currentFullscreenImageIndex = 0;
let currentFullscreenImages = [];

function openFullScreen(image) {
    // If modal doesn't exist, create it
    if (!fullscreenModal) {
        fullscreenModal = document.createElement('div');
        fullscreenModal.id = 'fullscreen-modal';
        fullscreenModal.innerHTML = `
            <div class="fullscreen-content">
                <button id="close-fullscreen" class="fullscreen-close">&times;</button>
                <button id="prev-fullscreen" class="fullscreen-nav">&lt;</button>
                <button id="next-fullscreen" class="fullscreen-nav">&gt;</button>
                <img id="fullscreen-image" src="" alt="Fullscreen Image">
            </div>
        `;
        document.body.appendChild(fullscreenModal);

        // Close button event
        const closeBtn = document.getElementById('close-fullscreen');
        closeBtn.addEventListener('click', closeFullScreen);

        // Previous and Next navigation
        const prevBtn = document.getElementById('prev-fullscreen');
        const nextBtn = document.getElementById('next-fullscreen');
        prevBtn.addEventListener('click', () => navigateFullscreen(-1));
        nextBtn.addEventListener('click', () => navigateFullscreen(1));

        // Close modal when clicking outside the image
        fullscreenModal.addEventListener('click', (e) => {
            if (e.target === fullscreenModal) {
                closeFullScreen();
            }
        });
    }

    // Prepare images for fullscreen navigation
    currentFullscreenImages = Array.from(gallery.querySelectorAll('img'));
    currentFullscreenImageIndex = currentFullscreenImages.indexOf(image);

    // Set up the fullscreen image
    const fullscreenImage = document.getElementById('fullscreen-image');
    fullscreenImage.src = image.src;

    // Add appropriate class based on image orientation
    if (image.classList.contains('vertical')) {
        fullscreenImage.classList.add('vertical-fullscreen');
    } else if (image.classList.contains('horizontal')) {
        fullscreenImage.classList.add('horizontal-fullscreen');
    }

    fullscreenModal.classList.add('active');
}

// Modify navigateFullscreen to handle image classes
function navigateFullscreen(direction) {
    currentFullscreenImageIndex += direction;

    // Wrap around if we go past the start or end
    if (currentFullscreenImageIndex >= currentFullscreenImages.length) {
        currentFullscreenImageIndex = 0;
    } else if (currentFullscreenImageIndex < 0) {
        currentFullscreenImageIndex = currentFullscreenImages.length - 1;
    }

    const fullscreenImage = document.getElementById('fullscreen-image');
    const nextImage = currentFullscreenImages[currentFullscreenImageIndex];

    // Reset previous classes
    fullscreenImage.classList.remove('vertical-fullscreen', 'horizontal-fullscreen');

    // Add appropriate class based on image orientation
    if (nextImage.classList.contains('vertical')) {
        fullscreenImage.classList.add('vertical-fullscreen');
    } else if (nextImage.classList.contains('horizontal')) {
        fullscreenImage.classList.add('horizontal-fullscreen');
    }

    fullscreenImage.src = nextImage.src;
}

// Function to close the fullscreen modal
function closeFullScreen() {
    const fullscreenModal = document.getElementById('fullscreen-modal');
    if (fullscreenModal) {
        fullscreenModal.classList.remove('active');
    }
}

// Function to update the mode (modify existing function)
function updateMode() {
    if (isDay) {
        document.body.className = 'light-mode';
        renderGallery(dayImagesByDate, true);  // Render day images
        toggleButton.textContent = 'sunset';
    } else {
        document.body.className = 'dark-mode';
        renderGallery(nightImagesByDate, false);  // Render night images
        toggleButton.textContent = 'sunrise';
    }
}

// Event listeners for mode toggle
toggleButton.addEventListener('click', () => {
    isDay = !isDay;
    updateMode();
});

// Event listeners for navigating between day/night dates
prevDayButton.addEventListener('click', () => {
    currentDayIndex = Math.max(0, currentDayIndex - 1);
    currentNightIndex = Math.max(0, currentNightIndex - 1);
    updateMode();
});

nextDayButton.addEventListener('click', () => {
    currentDayIndex = Math.min(dayDates.length - 1, currentDayIndex + 1);
    currentNightIndex = Math.min(nightDates.length - 1, currentNightIndex + 1);
    updateMode();
});

window.addEventListener('scroll', adjustNavigationPosition);

// Corrected adjustNavigationPosition function
function adjustNavigationPosition() {
    const navigation = document.querySelector('.navigation');
    const windowHeight = window.innerHeight;
    const navigationHeight = navigation.offsetHeight;

    // Position navigation relative to viewport
    navigation.style.position = 'sticky';
    navigation.style.top = '20px';  // Small offset from the top
    navigation.style.zIndex = '10';  // Ensure it's above other content
}

window.onload = () => {
    currentDayIndex = 0; // Start with the first day date
    currentNightIndex = 0; // Start with the first night date
    isDay = false; // Start with night mode
    updateMode();
    adjustNavigationPosition();
};