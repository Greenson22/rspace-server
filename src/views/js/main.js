// src/views/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('rspace_token');

    if (!token && !['/', '/register'].includes(window.location.pathname)) {
        window.location.href = '/';
        return;
    }

    if (token && ['/', '/register'].includes(window.location.pathname)) {
        window.location.href = '/dashboard';
        return;
    }

    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (navbarPlaceholder) {
        loadNavbar(token);
    }
});

async function loadNavbar(token) {
    try {
        const response = await fetch('/partials/navbar.html');
        const navbarHtml = await response.text();
        document.getElementById('navbar-placeholder').innerHTML = navbarHtml;
        setupNavbarFunctionality(token);
    } catch (error) {
        console.error('Gagal memuat navbar:', error);
    }
}

function setupNavbarFunctionality(token) {
    const usersLink = document.getElementById('users-link');
    const logoutBtn = document.getElementById('logout-btn');
    const navbarUsername = document.getElementById('navbar-username');
    const navbarProfilePic = document.getElementById('navbar-profile-picture');
    const welcomeMessage = document.getElementById('welcome-message');

    if (token) {
         fetch('/api/profile', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(res => {
            if (!res.ok) throw new Error('Sesi tidak valid, silakan login ulang.');
            return res.json();
        })
        .then(user => {
            if (!user) return;

            if (navbarUsername) navbarUsername.innerText = user.name || user.email;
            
            // ==> PERBAIKAN UTAMA DI SINI <==
            if (navbarProfilePic && user.profile_picture_path) {
                let relativePath = user.profile_picture_path;
                // Bersihkan path dari '/storage/' yang mungkin sudah ada
                relativePath = relativePath.replace(/^\/?storage\//, '');
                // Rakit URL yang bersih
                navbarProfilePic.src = `/storage/${relativePath}?v=${new Date().getTime()}`;
            }

            if (welcomeMessage) {
                welcomeMessage.innerText = 'Selamat Datang, ' + (user.name || user.email) + '!';
            }

            if (user.id === 1) {
                if (usersLink) usersLink.style.display = 'inline';
                const usersCardLink = document.getElementById('users-card-link');
                if (usersCardLink) usersCardLink.style.display = 'block';
            }
        })
        .catch(err => {
            console.error(err.message);
            localStorage.removeItem('rspace_token');
            window.location.href = '/';
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('rspace_token');
            window.location.href = '/';
        });
    }
}