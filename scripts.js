document.addEventListener('DOMContentLoaded', () => {
    const jwtToken = localStorage.getItem('token');

    // Redirect to login if no token is found
    if (!jwtToken) {
        window.location.href = './pages/login.html';
        return; // Ensure to exit the function to prevent further execution
    }

    const noteForm = document.getElementById('note-form');
    const noteTitle = document.getElementById('note-title');
    const noteContent = document.getElementById('note-content');
    const resetButton = document.getElementById('reset-button');
    const logoutBtn = document.getElementById('logout-button');


    noteForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const title = noteTitle.value;
        const content = noteContent.value;

        if (title && content) {
            await addNoteToList(title, content);
            noteForm.reset();
        }
    });

    const addNoteToList = async (title, content) => {
        try {
            const jwtToken = localStorage.getItem('token');

            const saveNoteURL = 'https://notes-server-ebzv.onrender.com/api/notes/create-note';
            const notes = {
                title,
                content
            };

            const response = await fetch(saveNoteURL, {
                method: 'POST',
                body: JSON.stringify(notes),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${jwtToken}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                // Optionally, provide feedback to the user
                alert('Note created successfully...');
            } else {
                console.log(data.error_msg);
                // Handle error or provide user feedback
            }
        } catch (error) {
            console.log('Error:', error);
            // Handle network errors or exceptions
        }
    };

    resetButton.addEventListener('click', () => {
        noteForm.reset();
    });

    
    const onClickLogout = () => {
        localStorage.removeItem('token');
        window.location.replace('./pages/login.html');
    };
    
    logoutBtn.addEventListener('click', onClickLogout);
});
