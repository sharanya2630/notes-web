document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-button');
    const noteListContainer = document.querySelector('.note-list-container');
    const jwtToken = localStorage.getItem('token');

    // Redirect to login if no token is found
    if (!jwtToken) {
        window.location.href = '../pages/login.html';
        return; // Ensure to exit the function to prevent further execution
    }

    // Function to display notes
    const displayNotes = (notes) => {
        // Clear existing notes
        noteListContainer.innerHTML = '';

        const noteList = document.createElement('ul');
        noteList.classList.add('note-list');

        if (notes.length === 0) {
            const noNotesEl = document.createElement('h3');
            noNotesEl.textContent = 'Currently, no archived notes';
            noteListContainer.appendChild(noNotesEl);
        } else {
            notes.forEach(note => {
                const listItem = document.createElement('li');
                listItem.classList.add('note-item');
                listItem.style.backgroundColor = note.backgroundColor || '#4699f2'; // Use default color if no color is set
                listItem.innerHTML = `
                    <h3>${note.title}</h3>
                    <p>${note.content}</p>
                    <div class="color-picker-container">
                        <input type="color" class="color-picker" value="${note.backgroundColor || '#d92607'}">
                        <span class="tooltip">Change background color</span>
                    </div>
                    <div class='controls-container'>
                        <button class="unarchive-btn">Unarchive</button>
                        <button class="delete-btn">Delete</button>
                    </div>
                `;

                // Add event listener for the color picker
                listItem.querySelector('.color-picker').addEventListener('input', (event) => {
                    const newColor = event.target.value;
                    listItem.style.backgroundColor = newColor;
                    updateNoteColor(note._id, newColor); // Update color on the server
                });

                // Event listener for unarchive button
                listItem.querySelector('.unarchive-btn').addEventListener('click', async () => {
                    if (confirm('Are you sure you want to unarchive this note?')) {
                        await updateNoteStatus(note._id, 'unarchive');
                        getNotesListFromServer(); // Refresh the notes list after updating
                    }
                });

                // Event listener for delete button
                listItem.querySelector('.delete-btn').addEventListener('click', async () => {
                    if (confirm('Are you sure you want to delete this note?')) {
                        await updateNoteStatus(note._id, 'delete');
                        getNotesListFromServer(); // Refresh the notes list after updating
                    }
                });

                noteList.appendChild(listItem);
            });

            noteListContainer.appendChild(noteList);
        }
    };

    // Function to fetch notes from server
    const getNotesListFromServer = async () => {
        try {
            const getNotesURL = 'https://notes-server-ebzv.onrender.com/api/notes/archived';
            const response = await fetch(getNotesURL, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                displayNotes(data);
            } else {
                console.log('Failed to fetch notes:', response.status);
            }

        } catch (error) {
            console.log('Error fetching notes:', error);
        }
    };

    // Function to update note color
    const updateNoteColor = async (noteId, color) => {
        try {
            const updateColorURL = `https://notes-server-ebzv.onrender.com/api/notes/update/${noteId}/background-color`;
            const response = await fetch(updateColorURL, {
                method: 'PATCH',
                body: JSON.stringify({ backgroundColor: color }),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${jwtToken}`,
                },
            });

            if (!response.ok) {
                console.log('Failed to update note color:', response.status);
            }
        } catch (error) {
            console.log('Error updating note color:', error);
        }
    };

    // Function to update note status (archive, delete, unarchive)
    const updateNoteStatus = async (noteId, action) => {
        try {
            let updateStatusURL;
            let statusUpdate;
            if (action === 'delete') {
                updateStatusURL = `https://notes-server-ebzv.onrender.com/api/notes/delete/${noteId}`;
                statusUpdate = { deleted: true };
            } else if (action === 'unarchive') {
                updateStatusURL = `https://notes-server-ebzv.onrender.com/api/notes/unarchive/${noteId}`;
                statusUpdate = { archived: false };
            }

            const response = await fetch(updateStatusURL, {
                method: 'PATCH',
                body: JSON.stringify(statusUpdate),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${jwtToken}`,
                },
            });

            if (response.ok) {
                // No need to call `getNotesListFromServer` if you want to manually refresh the list
            } else {
                console.log(`Failed to update note ${action} status:`, response.status);
            }
        } catch (error) {
            console.log(`Error updating note ${action} status:`, error);
        }
    };

    getNotesListFromServer();

    const onClickLogout = () => {
        localStorage.removeItem('token');
        window.location.replace('./login.html');
    };

    logoutBtn.addEventListener('click', onClickLogout);
});
