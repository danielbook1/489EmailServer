var myButton = document.getElementById('addEmail');

myButton.addEventListener('click', function() {
    console.log('Button clicked!');
    fetch('/addEmail', {
        method: 'POST'
    })
    .then(response => {
        console.log('Server response:', response);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});