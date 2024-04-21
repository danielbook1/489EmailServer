let currentEmail = ''

document.addEventListener('DOMContentLoaded', function() {
    const addButton = document.getElementById('addEmail');
    const logoutButton = document.getElementById('logout');
    const inboxButton = document.getElementById('inbox');
    const sentButton = document.getElementById('sent');
    const spamButton = document.getElementById('spam');
    const trashButton = document.getElementById('trash');
      
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

    inboxButton.addEventListener('click', function(event) {
        event.preventDefault();
        folder = "inbox";
        fetch('/loadRecentMessages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({currentEmail, folder})
        })
        .then(async response => {
            if (response.ok) {
                messageInfo = await response.json();
                populateEmailPreviews(messageInfo);
            } 
            else {
              console.error('Could not load messages');
            }
        })
    });

    sentButton.addEventListener('click', function(event) {
        event.preventDefault();
        folder = "sent";
        fetch('/loadRecentMessages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({currentEmail, folder})
        })
        .then(async response => {
            if (response.ok) {
                messageInfo = await response.json();
                populateEmailPreviews(messageInfo);
            } 
            else {
              console.error('Could not load messages');
            }
        })
    });

    spamButton.addEventListener('click', function(event) {
        event.preventDefault();
        folder = "spam";
        fetch('/loadRecentMessages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({currentEmail, folder})
        })
        .then(async response => {
            if (response.ok) {
                messageInfo = await response.json();
                populateEmailPreviews(messageInfo);
            } 
            else {
              console.error('Could not load messages');
            }
        })
    });

    trashButton.addEventListener('click', function(event) {
        event.preventDefault();
        folder = "trash";
        fetch('/loadRecentMessages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({currentEmail, folder})
        })
        .then(async response => {
            if (response.ok) {
                messageInfo = await response.json();
                populateEmailPreviews(messageInfo);
            } 
            else {
              console.error('Could not load messages');
            }
        })
    });
});

function loadEmails() {
    fetch('/loadEmails')
    .then(response => response.json())
    .then(emails => {
        const emailButtons = document.querySelector('.userEmailList');
        emails.forEach(email => {
            const button = document.createElement('button');
            // populate button with correct info
            button.setAttribute('type', 'button');
            button.setAttribute('class', 'list-group-item userEmailListButton');
            button.setAttribute('id', email.email)
            button.textContent = email.email;
            emailButtons.appendChild(button);

            // dynamically load the event listeners
            button.addEventListener('click', function(event){
                event.preventDefault();
                currentEmail = event.target.id;
                folder = "inbox";
                fetch('/loadRecentMessages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({currentEmail, folder})
                })
                .then(async response => {
                    if (response.ok) {
                        messageInfo = await response.json();
                        populateEmailPreviews(messageInfo);
                    } 
                    else {
                      console.error('Could not load messages');
                    }
                })
            });
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function populateEmailPreviews(messageInfo) {
    const emailPreviewList = document.querySelector('.emailPreviewList');
    if (messageInfo){
        emailPreviewList.innerHTML = ''

        messageInfo.forEach(message => {
            // get subject, date, sender, snippet from messageInfo[0]
            let snippet = message.snippet;
            let headers = message.payload.headers;

            let subjectHeader = headers.find(header => header.name === 'Subject');
            let subject = subjectHeader ? subjectHeader.value : 'No subject';

            let dateHeader = headers.find(header => header.name === 'Date');
            let date = dateHeader ? dateHeader.value : 'No date';

            let senderHeader = headers.find(header => header.name === 'From');
            let sender = senderHeader ? senderHeader.value : 'No sender';

            let newButton = document.createElement('button');
            newButton.setAttribute('type','button');
            newButton.setAttribute('class','list-group-item emailListElement');

            // build html string
            let html = '<div class="d-flex justify-content-between">\
                            <p>Subject: ' + subject + '</p>\
                            <p>'+ date +'</p>\
                        </div>\
                        <div class="d-flex justify-content-between">\
                            <p>From: '+sender+'</p>\
                        </div>\
                        <div class="row">\
                            <p>Preview: '+snippet+'</p>\
                        </div>';

            //set html string
            newButton.innerHTML = html;
            emailPreviewList.appendChild(newButton);
        });
        
    }
    else{
        emailPreviewList.innerHTML ='<button type="button" class="list-group-item emailListElement">\
                                         <div class="d-flex justify-content-between">\
                                             <p>Subject: </p>\
                                             <p></p>\
                                         </div>\
                                         <div class="d-flex justify-content-between">\
                                             <p>From: </p>\
                                         </div>\
                                         <div class="row">\
                                             <p>Preview: </p>\
                                         </div>\
                                     </button>';
    }
}

loadEmails();