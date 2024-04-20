document.addEventListener('DOMContentLoaded', function() {
    const addButton = document.getElementById('addEmail');
      
    addButton.addEventListener('click', function(event) {
        event.preventDefault();
  
        fetch('/addEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add email');
            }
            // Parse the response JSON to extract the authorizationUrl
            return response.json();
        })
        .then(data => {
            // Redirect the user to the authorizationUrl
            window.location.href = data.authorizationUrl;
        })
        .catch(error => {
            console.error('Error:', error);
            // Handle error
        });
    });
});
