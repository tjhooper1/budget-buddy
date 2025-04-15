// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/budget-buddy/sw.js')
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
const installButton = document.createElement('button');
installButton.style.display = 'none';
installButton.classList.add('install-button');
installButton.innerHTML = '<i class="fas fa-download"></i> Install App';
document.body.appendChild(installButton);

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show the install button
    installButton.style.display = 'block';
});

installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        // We've used the prompt, and can't use it again, so clear it
        deferredPrompt = null;
        // Hide the install button
        installButton.style.display = 'none';
    }
});