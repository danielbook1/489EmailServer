document.addEventListener('DOMContentLoaded', function() {
    const petitionForm = document.getElementById('promoteUser');
      
    petitionForm.addEventListener('submit', function(event) {
      event.preventDefault();
        
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const formType = 'promoteUser'

      if (true) { //TODO: Add checks for valid username and password
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
        }
      
    });
});



document.addEventListener('DOMContentLoaded', function() {
    const deleteForm = document.getElementById('deleteUser');
      
    deleteForm.addEventListener('submit', function(event) {
      event.preventDefault();
        
      const username = document.getElementById('username2').value;
      const password = document.getElementById('password2').value;
      const formType = 'deleteUser'

      if (true) { //TODO: Add checks for valid username and password
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
        }
      
    });
});


document.addEventListener('DOMContentLoaded', function() {
    const deleteForm = document.getElementById('logOut');
      
    deleteForm.addEventListener('submit', function(event) {
      event.preventDefault();
        
      const username = '0'
      const password = '0'
      const formType = 'logOut'

      if (true) { //TODO: Add checks for valid username and password
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
            // Redirect to logour page
            window.location.href = 'logout.html';
            } 
            else {
            console.error('Form submission failed');
            // Handle errors
            }
        })
        }
      
    });
});