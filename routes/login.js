document.addEventListener('DOMContentLoaded', function() {
    const petitionForm = document.getElementById('login');
      
    petitionForm.addEventListener('submit', function(event) {
      event.preventDefault();
        
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const captcha = document.getElementById('g-recaptcha-response').value;

      if (captcha.length > 0 || true)
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
              if (response.redirected) {
                // Redirect to login page
                window.location.href = response.url;
              }
              else {
                console.log(response.statusText);
              }
          });
        }
      }
    });
});