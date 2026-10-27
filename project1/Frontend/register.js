
document.getElementById('registration-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const salary = document.getElementById('salary').value;
    const age = document.getElementById('age').value;

    const message = document.getElementById('message');
    message.textContent = 'Registering...';

    try {
        const response = await fetch('http://localhost:5050/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password,
                firstname,
                lastname,
                salary,
                age
            })
        });

        const result = await response.json();

        message.textContent = result.message;

        if (response.ok && result.success) {
            message.style.color = 'green';
            document.getElementById('registration-form').reset();
        } else {
            message.style.color = 'red';
        }

    } catch (error) {
        message.textContent = 'Unable to connect to the server.';
        message.style.color = 'red';
        console.error(error);
    }
});
