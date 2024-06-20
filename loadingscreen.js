// Select the form, loading screen, and loading message
const loadingScreen = document.querySelector('.loading-screen');
const loadingMessage = document.querySelector('.loading-message');

// Set the source of the loading screen GIF
loadingScreen.src = 'computerloading.gif';

// Add an event listener for the form submission
form.addEventListener('submit', (event) => {
  event.preventDefault();

  // Hide the form and show the loading screen and message
  form.style.display = 'none';
  loadingScreen.style.display = 'block';
  loadingMessage.style.display = 'block';
});

// Create a mutation observer to watch for changes in the api-output-container
const observer = new MutationObserver((mutationsList, observer) => {
    for(let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        loadingScreen.style.display = 'none';
        form.style.display = 'block';
        loadingMessage.style.display = 'none';
      }
    }
  });
  
  // Start observing the api-output-container for configured mutations
  observer.observe(document.querySelector('#api-output-container'), { childList: true });