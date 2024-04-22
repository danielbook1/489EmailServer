document.addEventListener('DOMContentLoaded', function() {
    const sendButton = document.getElementById('send');
    const fromLabel = document.getElementById('From');
    const toInput = document.getElementById('To');
    const subjectInput = document.getElementById('Subject');
    const messageInput = document.getElementById('Message');
    loadFromEmail();
      
    sendButton.addEventListener('click', function(event) {
        event.preventDefault();
        
        let fromAddress = fromLabel.innerHTML;
        let toAddress = toInput.value;
        let subject = subjectInput.value;
        let body = messageInput.value;

        fetch('/sendEmail', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({fromAddress, toAddress, subject, body})
        });

        window.location.href = '/home.html';
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