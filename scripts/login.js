document.addEventListener('DOMContentLoaded', () => {
  const jwtToken = localStorage.getItem('token');

  // Redirect to home page if token is found
  if (jwtToken) {
      window.location.replace('../index.html'); // Redirect to the home page
      return; // Ensure no further code executes
  }

  const loginForm = document.getElementById('login-form');

  const onSubmitForm = async (event) => {
      event.preventDefault();

      const username = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;
      const errorMsg = document.getElementById('error-msg');

      const userDetails = { username, password };
      const url = 'https://notes-server-ebzv.onrender.com/api/users/login';

      try {
          const response = await fetch(url, {
              method: 'POST',
              body: JSON.stringify(userDetails),
              headers: {
                  'Content-Type': 'application/json'
              }
          });

          const fetchedData = await response.json();
          if (response.ok) {
              console.log(response);
              const jwtToken = fetchedData.token;
              localStorage.setItem('token', jwtToken);
              window.location.replace('../index.html'); // Redirect to the home page
          } else {
              errorMsg.textContent = `*${fetchedData.error_msg}`;
              errorMsg.style.display = 'block';
          }
      } catch (error) {
          console.log(error);
          errorMsg.textContent = '*An error occurred. Please try again.';
          errorMsg.style.display = 'block';
      }
  };

  loginForm.addEventListener('submit', onSubmitForm);
});
