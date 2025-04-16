// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')  // Fixed path to be relative
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// PWA Install Prompt
let deferredPrompt;
let installButtonShown = false;
const installButton = document.createElement('button');
installButton.style.display = 'none';
installButton.classList.add('install-button');
installButton.innerHTML = '<i class="fas fa-download"></i> Install App';
document.body.appendChild(installButton);

// Debug info
console.log('PWA script loaded and running');

// Delay variables - Reduced significantly for testing
const MIN_USAGE_TIME = 10000; // 10 seconds delay for testing
const USER_INTERACTIONS_NEEDED = 1; // Just 1 interaction needed for testing
let appStartTime = Date.now();
let userInteractions = 0;
let timerInterval = null;

// Track user interactions
document.addEventListener('click', (e) => {
    userInteractions++;
    console.log(`User interaction detected: ${userInteractions} total`);
    checkShowInstallButton();
});

// Check if we should show the install button based on time and interactions
function checkShowInstallButton() {
    // Don't check if button is already shown
    if (installButtonShown) {
        return;
    }
    
    console.log('Checking if install button should be shown...');
    console.log(`Prompt available: ${deferredPrompt ? 'Yes' : 'No'}`);
    console.log(`Time spent: ${Date.now() - appStartTime}ms of ${MIN_USAGE_TIME}ms needed`);
    console.log(`Interactions: ${userInteractions} of ${USER_INTERACTIONS_NEEDED} needed`);
    
    const timeSpent = Date.now() - appStartTime;
    
    // Always show button after conditions are met, even if deferredPrompt isn't available yet
    if (timeSpent >= MIN_USAGE_TIME && userInteractions >= USER_INTERACTIONS_NEEDED) {
        console.log('Conditions met - showing install button');
        installButton.style.display = 'flex';
        installButtonShown = true;
        
        // Stop the timer now that we've shown the button
        if (timerInterval) {
            console.log('Stopping timer loop');
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }
}

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    console.log('Install prompt event detected!');
    
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // If conditions already met, show the button immediately
    if (installButtonShown) {
        installButton.style.display = 'flex';
    } else {
        // Otherwise check if conditions are met
        checkShowInstallButton();
    }
});

// If the app was already installed
window.addEventListener('appinstalled', (e) => {
    console.log('App was installed');
    // Hide the install button
    installButton.style.display = 'none';
    installButtonShown = false; // Reset in case we want to show it again later
    
    // Stop the timer if it's still running
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
});

installButton.addEventListener('click', async () => {
    console.log('Install button clicked');
    
    if (deferredPrompt) {
        try {
            // Show the install prompt
            deferredPrompt.prompt();
            console.log('Install prompt shown to user');
            
            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to install prompt: ${outcome}`);
            
            // We've used the prompt, and can't use it again, so clear it
            deferredPrompt = null;
            
            // Hide the install button
            installButton.style.display = 'none';
        } catch (err) {
            console.error('Error showing install prompt:', err);
        }
    } else {
        console.log('Install prompt not available');
        // As a fallback, try to show the install button anyway
        // This helps in cases where browsers don't support the beforeinstallprompt event
        alert('To install this app, tap the "Add to Home Screen" button in your browser menu.');
    }
});

// Start the check timer and store its ID so we can clear it later
timerInterval = setInterval(checkShowInstallButton, 5000); // Check every 5 seconds

// Immediately run a check when the script loads
setTimeout(checkShowInstallButton, 1000);