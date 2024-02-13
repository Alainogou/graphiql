
document.addEventListener('DOMContentLoaded', (event) => {
    let jwtToken = localStorage.getItem('jwtToken');
    
    
    if (jwtToken) {
        window.location.href="/dasbord.html"

          
    }else {
        
        document.querySelector('#loginForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const credentials = btoa(`${username}:${password}`);
            // console.log(username, password, credentials);
        
            fetch('https://learn.zone01dakar.sn/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Login failed');
                }
                return response.json();
            })
            .then(token => {
                localStorage.setItem('jwtToken', token); // Utilisez 'token' au lieu de 'Token'
                window.location.href="/index.html"
                
            })
            .catch(error => {
                let alert = document.querySelector("#alert");
                alert.style.color = "red";
                alert.style.fontSize = '12px';
                alert.textContent = "User does not exist or password incorrect";

                setTimeout(() => {
                    alert.innerHTML = '';
                },   5000);
            });
            
           
         });



    } 
    
    
});










