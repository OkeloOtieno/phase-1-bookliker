document.addEventListener("DOMContentLoaded", function() {

    async function fetchCurrentUser(userId) {
        try {
            const res = await fetch('http://localhost:3000/users');
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            const users = await res.json();
            // Find the user with the matching ID
            const user = users.find(user => user.id === userId.toString());
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            console.error('Error fetching current user', error);
            return null; // Return null if fetching fails or user not found
        }
    }

    async function fetchBooks() {
        try {
            const res = await fetch('http://localhost:3000/books');
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await res.json();

            // Example user ID for demonstration
            const currentUserId = "2"; 
            const currentUser = await fetchCurrentUser(currentUserId);
            if (currentUser) {
                const currentUsername = currentUser.username;
                listBooks(data, currentUserId, currentUsername);
            } else {
                console.error('Could not fetch current user');
            }
        } catch (error) {
            console.error('Error fetching data', error);
        }
    }

    function listBooks(data, currentUserId, currentUsername) {
        const bookList = document.getElementById('list');
        bookList.innerHTML = '';

        data.forEach(book => {
            const listElement = document.createElement('li');
            listElement.innerText = book.title;
            listElement.addEventListener('click', () => {
                displayBooksDetails(book, currentUserId, currentUsername);
            });
            bookList.appendChild(listElement);
        });
    }

    function displayBooksDetails(book, currentUserId, currentUsername) {
        const showPanel = document.getElementById('show-panel');
        showPanel.innerHTML = '';

        let details = `
        <img src=${book.img_url} alt='${book.title}'/>
        <h2>${book.title}</h2>
        <h2>${book.author}</h2>
        <h3>${book.subtitle}</h3>
        <p>${book.description}</p>
        <ul>
        `;

        book.users.forEach(user => {
            details += `<li>${user.username}</li>`;
        });
        details += `</ul>
        <button id="like-button-${book.id}">Like</button>
        `;
        showPanel.innerHTML = details;

        document.getElementById(`like-button-${book.id}`).addEventListener('click', () => {
            likeBook(book.id, currentUserId, currentUsername);
        });
    }

    async function likeBook(bookId, userId, username) {
        try {
            const res = await fetch(`http://localhost:3000/books/${bookId}`);
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            let book = await res.json();

            const userAlreadyLiked = book.users.some(user => user.id === userId);
            if (userAlreadyLiked) {
                alert('You have already liked this book.');
                return;
            }

            book.users.push({ id: userId, username: username });

            const updateRes = await fetch(`http://localhost:3000/books/${bookId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(book),
            });

            if (!updateRes.ok) {
                throw new Error('Failed to update the book');
            }

            displayBooksDetails(book, userId, username);
        } catch (error) {
            console.error('Error liking the book', error);
        }
    }

    fetchBooks();
});
