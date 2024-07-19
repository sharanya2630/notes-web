document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-button');
    const noteListContainer = document.querySelector('.note-list-container');

    const jwtToken = localStorage.getItem('token');

    // Redirect to login if no token is found
    if (!jwtToken) {
        window.location.href = '../pages/login.html';
        return; // Ensure to exit the function to prevent further execution
    }

    const displayNotes = (notes) => {
        noteListContainer.innerHTML = ''; // Clear the container before appending new notes

        const trashedNotes = notes.filter(note => note.deleted === true);
        if (trashedNotes.length === 0){
            const noTrashEl = document.createElement('h3');
            noTrashEl.textContent = 'Currently, Trash list is empty';
            noteListContainer.appendChild(noTrashEl);
        } else {
            const noteList = document.createElement('ul');
            noteList.classList.add('note-list');

            trashedNotes.forEach(note => {
                const listItem = document.createElement('li');
                listItem.classList.add('note-item');
                listItem.style.backgroundColor = note.backgroundColor || '#4699f2'; 
                listItem.innerHTML = `
                    <h3>${note.title}</h3>
                    <p>${note.content}</p>
                    <div class="color-picker-container">
                        <input type="color" class="color-picker" value="${note.backgroundColor || '#d92607'}">
                        <span class="tooltip">Change background color</span>
                    </div>
                    <div class='controls-container'>
                        <button class="untrash-btn">Untrash</button>
                        <button class="delete-btn">Delete</button>
                    </div>
                    
                `;

                // Add event listener for the color picker
                listItem.querySelector('.color-picker').addEventListener('input', (event) => {
                    const newColor = event.target.value;
                    listItem.style.backgroundColor = newColor;
                    updateNoteColor(note._id, newColor); // Update color on the server
                });

                // Event listener for untrashing a note
                listItem.querySelector('.untrash-btn').addEventListener('click', () => {
                    untrashNote(note._id);
                });

                // Event listener for permanently deleting a note
                listItem.querySelector('.delete-btn').addEventListener('click', () => {
                    deleteNotePermanently(note._id);
                });

                noteList.appendChild(listItem);
            });

            noteListContainer.appendChild(noteList);
        }
    };

    const getNotesListFromServer = async () => {
        try {
            const getNotesURL = 'https://notes-server-ebzv.onrender.com/api/notes';
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

    const untrashNote = async (noteId) => {
        try {
            const untrashURL = `https://notes-server-ebzv.onrender.com/api/notes/untrash/${noteId}`;
            const response = await fetch(untrashURL, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });

            if (response.ok) {
                getNotesListFromServer(); // Refresh the notes list
            } else {
                console.log('Failed to untrash note:', response.status);
            }
        } catch (error) {
            console.log('Error untrashing note:', error);
        }
    };

    const deleteNotePermanently = async (noteId) => {
        try {
            const deleteURL = `https://notes-server-ebzv.onrender.com/api/notes/delete/${noteId}`;
            const response = await fetch(deleteURL, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });

            if (response.ok) {
                getNotesListFromServer(); // Refresh the notes list
            } else {
                console.log('Failed to delete note:', response.status);
            }
        } catch (error) {
            console.log('Error deleting note:', error);
        }
    };

    getNotesListFromServer();

    const onClickLogout = () => {
        localStorage.removeItem('token');
        window.location.replace('./login.html');
    };
    
    logoutBtn.addEventListener('click', onClickLogout);
});
