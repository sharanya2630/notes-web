document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-button');

    const onClickLogout = () => {
        localStorage.removeItem('token');
        window.location.replace('./login.html');
    };
    
    logoutBtn.addEventListener('click', onClickLogout);
})