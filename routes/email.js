document.addEventListener('DOMContentLoaded', function() {
    const sendButton = document.getElementById('send');
    const toInput = document.getElementById('To');
    const subjectInput = document.getElementById('Subject');
    const messageInput = document.getElementById('Message')
      
    sendButton.addEventListener('click', function(event) {
        event.preventDefault();
        
        fromAddress = "daniel@bookfamily.com",
        toAddress = "dannybok364@gmail.com",
        subject = "testing send from app.js",
        body = "test contents!\nwootwoot!"

        fetch('/sendEmail', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({fromAddress, toAddress, subject, body})
          })
    });
});

function loadFromEmail(){
    // Get the current URL
    const currentUrl = window.location.href;

    // Extract the email parameter from the URL
    const urlParams = new URLSearchParams(currentUrl.split('?')[1]);
    const email = urlParams.get('email');

    // Use the email parameter as needed
    const fromLabel = document.getElementById('From');
    fromLabel.innerHTML = email;
}

loadFromEmail();