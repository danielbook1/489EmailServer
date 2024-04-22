document.addEventListener('DOMContentLoaded', function() {
    const petitionForm = document.getElementById('promoteUser');
    const logoutButton = document.getElementById('logout');
    const deleteForm = document.getElementById('deleteUser');
      
    petitionForm.addEventListener('submit', function(event) {
      event.preventDefault();
        
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const formType = 'promoteUser'

        // submit form data
        fetch('/admin', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({username, password, formType})
        })
        .then(response => {
            if (response.ok) {
            // Redirect to login page
            console.log("It worked")
            } 
            else {
            console.error('Form submission failed');
            // Handle errors
            }
        })
        
      
    });

    logoutButton.addEventListener('click', function(event) {
        event.preventDefault();
  
        fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
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
    });
      
    deleteForm.addEventListener('submit', function(event) {
      event.preventDefault();
        
      const username = document.getElementById('username2').value;
      const password = document.getElementById('password2').value;
      const formType = 'deleteUser'

    
        // submit form data
        fetch('/admin', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({username, password, formType})
        })
        .then(response => {
            if (response.ok) {
            // Redirect to login page
            console.log("It worked")
            } 
            else {
            console.error('Form submission failed');
            // Handle errors
            }
        })
        
      
    });
});