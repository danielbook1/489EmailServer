document.addEventListener('DOMContentLoaded', function() {
  const petitionForm = document.getElementById('signUp');
    
  petitionForm.addEventListener('submit', function(event) {
    event.preventDefault();
      
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const captcha = document.getElementById('g-recaptcha-response').value;

    if(password.length >= 8 && password.includes('!') || password.includes('@') || password.includes('#') || password.includes('$') || password.includes('%') || password.includes('&') || password.includes('?'))
    {
      if (captcha.length > 0)
      {
        if (true) { //TODO: Add checks for valid username and password
          // submit form data
          fetch('/submitNewUser', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, password})
          })
          .then(response => {
              if (response.ok) {
                // Redirect to login page
                window.location.href = 'loginPage.html';
              } 
              else {
                console.error('Form submission failed');
                // Handle errors
              }
            })
        }
      }
    }
    else
    {
      triggerAlert('Password is too short or does not contain a special character')
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