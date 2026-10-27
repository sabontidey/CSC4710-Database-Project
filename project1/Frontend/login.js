
document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');

    message.textContent = 'Logging in...';

    try {
        const response = await fetch('http://localhost:5050/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const result = await response.json();

        message.textContent = result.message;

        if (response.ok && result.success) {
            message.style.color = 'green';

            // Redirect to homepage after successful login
            setTimeout(function() {
                window.location.href = 'index.html';
            }, 1500);

        } else {
            message.style.color = 'red';
        }

    } catch (error) {
        message.textContent = 'Unable to connect to the server.';
        message.style.color = 'red';
        console.error(error);
    }
});
