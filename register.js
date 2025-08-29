document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const uid = document.getElementById('uid').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ uid, username, password })
        });

        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during registration.');
    }
});
