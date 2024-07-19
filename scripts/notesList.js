document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-button');
    const noteListContainer = document.querySelector('.note-list-container');
    const sidebar = document.querySelector('.sidebar');
    const jwtToken = localStorage.getItem('token');

    if (!jwtToken) {
        window.location.href = '../pages/login.html';
        return;
    }

    const displayNotes = (notes) => {
        noteListContainer.innerHTML = '';
        console.log(notes);
        const filteredNotes = notes.filter(note => !note.deleted && !note.archived);
        if (filteredNotes.length === 0) {
            const noNotesEl = document.createElement('h3');
            noNotesEl.textContent = 'No notes available';
            noteListContainer.appendChild(noNotesEl);
        } else {
            const noteList = document.createElement('ul');
            noteList.classList.add('note-list');

            filteredNotes.forEach(note => {
                const listItem = document.createElement('li');
                listItem.classList.add('note-item');
                listItem.style.backgroundColor = note.backgroundColor || '#4699f2';
                listItem.innerHTML = `
                    <h3>${note.title}</h3>
                    <p>${note.content}</p>
                    <div class="label-list">
                        ${note.labels ? note.labels.map(label => `<span class="note-label">${label}</span>`).join('') : ''}
                    </div>
                    <div class="color-picker-container">
                        <input type="color" class="color-picker" value="${note.backgroundColor || '#d92607'}">
                        <span class="tooltip">Change background color</span>
                    </div>
                    <div class='note-controls-container'>
                        <i class="fa-solid fa-ellipsis-vertical" title="More options"></i>
                        <i class="fa-solid fa-trash-can" title="Delete note"></i>
                        <i class="fa-solid fa-box-archive" title="Archive note"></i>
                        <i class="fa-solid fa-tag" title="Add label"></i>
                        <div class="label-box" style="display: none;">
                            <input type="text" class="label-input" placeholder="Add label">
                        </div>
                    </div>
                `;

                listItem.querySelector('.color-picker').addEventListener('input', (event) => {
                    const newColor = event.target.value;
                    listItem.style.backgroundColor = newColor;
                    updateNoteColor(note._id, newColor);
                });

                listItem.querySelector('.fa-tag').addEventListener('click', () => {
                    const labelBox = listItem.querySelector('.label-box');
                    labelBox.style.display = labelBox.style.display === 'block' ? 'none' : 'block';
                });

                listItem.querySelector('.label-input').addEventListener('blur', async () => {
                    const labelInput = listItem.querySelector('.label-input');
                    const label = labelInput.value.trim();
                    if (label) {
                        await updateNoteLabel(note._id, label, 'add');
                        getNotesListFromServer();
                    }
                    labelInput.value = '';
                    listItem.querySelector('.label-box').style.display = 'none';
                });

                listItem.querySelector('.fa-trash-can').addEventListener('click', async () => {
                    if (confirm('Are you sure you want to delete this note?')) {
                        await updateNoteStatus(note._id, 'delete');
                        getNotesListFromServer();
                    }
                });

                listItem.querySelector('.fa-box-archive').addEventListener('click', async () => {
                    if (confirm('Are you sure you want to archive this note?')) {
                        await updateNoteStatus(note._id, 'archive');
                        getNotesListFromServer();
                    }
                });

                noteList.appendChild(listItem);
            });

            noteListContainer.appendChild(noteList);
        }
    };

    const getNotesListFromServer = async () => {
        try {
            const response = await fetch('https://notes-server-ebzv.onrender.com/api/notes', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                displayNotes(data);
                updateSidebarLabels(data);
            } else {
                console.log('Failed to fetch notes:', response.status);
            }
        } catch (error) {
            console.log('Error fetching notes:', error);
        }
    };

    const updateNoteColor = async (noteId, color) => {
        try {
            const response = await fetch(`https://notes-server-ebzv.onrender.com/api/notes/update/${noteId}/background-color`, {
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

    const updateNoteStatus = async (noteId, action) => {
        try {
            let updateStatusURL;
            let statusUpdate;
            if (action === 'delete') {
                updateStatusURL = `https://notes-server-ebzv.onrender.com/api/notes/delete/${noteId}`;
                statusUpdate = { deleted: true };
            } else if (action === 'archive') {
                updateStatusURL = `https://notes-server-ebzv.onrender.com/api/notes/archive/${noteId}`;
                statusUpdate = { archived: true };
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

            if (!response.ok) {
                console.log(`Failed to update note ${action} status:`, response.status);
            }
        } catch (error) {
            console.log(`Error updating note ${action} status:`, error);
        }
    };

    const updateNoteLabel = async (noteId, label, action) => {
        try {
            const endpoint = action === 'add' 
                ? `https://notes-server-ebzv.onrender.com/api/notes/update/${noteId}/label`
                : `https://notes-server-ebzv.onrender.com/api/notes/${noteId}/labels/remove`;

            const response = await fetch(endpoint, {
                method: 'PATCH',
                body: JSON.stringify({ label }),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${jwtToken}`,
                },
            });

            if (!response.ok) {
                console.log('Failed to update note label:', response.status);
            }
        } catch (error) {
            console.log('Error updating note label:', error);
        }
    };

    const updateSidebarLabels = (notes) => {
        const labelsContainer = document.getElementById('labels-container');
        labelsContainer.innerHTML = '';

        const labels = new Set();
        notes.forEach(note => {
            if (note.labels) {
                note.labels.forEach(label => labels.add(label));
            }
        });

        if (labels.size > 0) {
            labels.forEach(label => {
                if (labelsContainer.children.length < 9) { // Limit labels to 9
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `<a href="labels.html?label=${encodeURIComponent(label)}" class="sidebar-label">${label}</a>`;
                    labelsContainer.appendChild(listItem);
                }
            });
        } else {
            const noLabelsEl = document.createElement('li');
            noLabelsEl.textContent = 'No labels available';
            labelsContainer.appendChild(noLabelsEl);
        }
    };

    getNotesListFromServer();

    const onClickLogout = () => {
        localStorage.removeItem('token');
        window.location.replace('./login.html');
    };

    logoutBtn.addEventListener('click', onClickLogout);
});
