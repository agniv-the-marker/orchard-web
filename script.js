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

// Replace the existing arrays with a larger set of varied values
const rotations = [4, -5, 2, -4, 6, -2, -5, 3, 1, -6, -3, -1, 4, 2, 3, -4, 2, 3, 5, -2, 
                  -3, 4, 1, -5, 4, -1, 6, -3, -2, -6, 5, -2];
const offsetsX = [8, -10, 4, -6, 12, -8, 6, -4, 10, -12, 5, -7, 9, -5, 7, -9, 11, -8, 
                 6, -11, 8, -5, 12, -7, 5, -10, 7, -6, 9, -8, 4, -12];
const offsetsY = [6, -8, 10, -4, 8, -12, 4, -6, 12, -5, 7, -9, 5, -7, 9, -11, 6, -10, 
                 8, -5, 11, -7, 5, -9, 7, -4, 10, -8, 6, -11, 8, -6];

// Precomputed styles for better performance
const STYLE_COUNT = 32;
const precomputedStyles = Array.from({ length: STYLE_COUNT }, (_, i) => ({
    rotation: `${rotations[i % rotations.length]}deg`,
    offsetX: `${offsetsX[i % offsetsX.length]}px`,
    offsetY: `${offsetsY[i % offsetsY.length]}px`
}));

let styleIndex = 0;

// Function to format the date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Function to generate random offset and rotation
function applyRandomStyles(element) {
    const rotation = `${rotations[styleIndex % rotations.length]}deg`;
    const offsetX = `${offsetsX[styleIndex % offsetsX.length]}px`;
    const offsetY = `${offsetsY[styleIndex % offsetsY.length]}px`;

    element.style.setProperty('--rotation', rotation);
    element.style.setProperty('--offsetX', offsetX);
    element.style.setProperty('--offsetY', offsetY);

    // Increment the index for the next image
    styleIndex = (styleIndex + 1) % rotations.length;
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

// Optimized render function
function renderGallery(imagesByDate, isDayMode) {
    const currentIndex = isDayMode ? currentDayIndex : currentNightIndex;
    const date = isDayMode ? dayDates[currentIndex] : nightDates[currentIndex];
    const images = imagesByDate[date];
    
    // Clear gallery efficiently
    while (gallery.firstChild) {
        gallery.removeChild(gallery.firstChild);
    }

    // Create document fragment for batch DOM updates
    const fragment = document.createDocumentFragment();
    
    // Create and prepare all images
    const imageElements = images.map((src, index) => {
        const img = new Image();
        
        // Don't set src immediately
        img.loading = 'lazy';
        
        // Apply precomputed styles
        const style = precomputedStyles[(styleIndex + index) % STYLE_COUNT];
        img.style.setProperty('--rotation', style.rotation);
        img.style.setProperty('--offsetX', style.offsetX);
        img.style.setProperty('--offsetY', style.offsetY);
        
        // Add click handler
        img.addEventListener('click', () => openFullScreen(img));
        
        // Set src after setting up the loading state
        img.src = src;
        
        return img;
    });

    // Update styleIndex for next render
    styleIndex = (styleIndex + images.length) % STYLE_COUNT;

    // Batch append all images
    imageElements.forEach(img => fragment.appendChild(img));
    gallery.appendChild(fragment);

    // Update date text
    dateElement.textContent = `(${formatDate(date)})`;

    // Handle image loading and classification
    const handleImageLoad = (img) => {
        if (img.naturalWidth > img.naturalHeight) {
            img.classList.add('horizontal');
        } else {
            img.classList.add('vertical');
        }
        if (Math.random() > 0.5) {
            img.classList.add('random-height');
        }
        // Add loaded class to trigger fade in
        requestAnimationFrame(() => {
            img.classList.add('loaded');
        });
    };

    // Set up intersection observer for lazy loading
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.complete) {
                    handleImageLoad(img);
                } else {
                    img.onload = () => handleImageLoad(img);
                }
                observer.unobserve(img);
            }
        });
    });

    // Observe all images
    imageElements.forEach(img => observer.observe(img));
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

// Simplified update mode function
function updateMode() {
    document.body.className = isDay ? 'light-mode' : 'dark-mode';
    toggleButton.textContent = isDay ? 'sunset' : 'sunrise';
    renderGallery(isDay ? dayImagesByDate : nightImagesByDate, isDay);
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