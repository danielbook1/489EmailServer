document.addEventListener('DOMContentLoaded', function() {
    const petitionForm = document.getElementById('login');
      
    petitionForm.addEventListener('submit', function(event) {
      event.preventDefault();
        
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const captcha = document.getElementById('captcha').value;

      if (captcha.length > 0)
      {
        if (true) { //TODO: Add checks for valid username and password
          // submit form data
          fetch('/login', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, password})
          })
          .then(response => {
              if (response.ok) {
                // Redirect to login page
                window.location.href = 'home.html';
              } 
              else {
                console.error('Form submission failed');
                // Handle errors
              }
            })
        }
      }
    });
});