document.addEventListener('DOMContentLoaded', function() {
    const petitionForm = document.getElementById('login');
      
    petitionForm.addEventListener('submit', function(event) {
      event.preventDefault();
        
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const captcha = document.getElementById('g-recaptcha-response').value;

      if (captcha.length > 0)
      {
          // submit form data
          fetch('/login', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, password})
          })
          .then(response => {
              if (response.redirected) {
                // Redirect to login page
                window.location.href = response.url;
              }
              else {
                console.log(response.statusText);
                triggerAlert('Login failed. Did you enter the right credentials?');
              }
          });
      }
    });
});

function triggerAlert(message) {
  // Create alert element
  const alert = document.createElement('div');
  alert.classList.add('alert');
  alert.textContent = message;
  
  const alertDisplay = document.getElementById('alertDisplay');
  alertDisplay.appendChild(alert);
  
  // Remove alert after some time (e.g., 3 seconds)
  setTimeout(() => {
      alertDisplay.remove();
  }, 5000);
  }