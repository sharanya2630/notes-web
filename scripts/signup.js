document.addEventListener('DOMContentLoaded', () => {
  const jwtToken = localStorage.getItem('token');

  // Redirect to home page if token is found
  if (jwtToken) {
      window.location.replace('../index.html'); // Redirect to the home page
      return; // Ensure no further code executes
  }

  const signupForm = document.getElementById('signup-form');

  const onSubmitForm = async (event) => {
      event.preventDefault();

      const username = document.getElementById('signup-username').value;
      const password = document.getElementById('signup-password').value;
      const errorMsg = document.getElementById('error-msg');

      const userDetails = { username, password };
      const url = 'https://notes-server-ebzv.onrender.com/api/users/register';

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
              alert('Account created successfully. Please log in.');
              window.location.replace('./login.html'); // Redirect to login page after signup
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

  signupForm.addEventListener('submit', onSubmitForm);
});
