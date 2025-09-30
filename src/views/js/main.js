// src/views/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('rspace_token');

    // Jika tidak ada token di halaman selain login/register, paksa kembali
    if (!token && !['/', '/register'].includes(window.location.pathname)) {
        window.location.href = '/';
        return;
    }

    // Jika ada token tapi user di halaman login/register, arahkan ke dashboard
    if (token && ['/', '/register'].includes(window.location.pathname)) {
        window.location.href = '/dashboard';
        return;
    }

    // Muat navbar hanya jika ada placeholder-nya (artinya bukan di halaman login/register)
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

        // Setelah navbar dimuat, tambahkan fungsionalitasnya
        setupNavbarFunctionality(token);
    } catch (error) {
        console.error('Gagal memuat navbar:', error);
    }
}

function setupNavbarFunctionality(token) {
    const usersLink = document.getElementById('users-link');
    const logoutBtn = document.getElementById('logout-btn');

    // Cek status admin untuk menampilkan link "Kelola Pengguna"
    if (usersLink) {
         fetch('/api/profile', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(res => res.json())
        .then(data => {
            if (data && data.id === 1) {
                usersLink.style.display = 'inline';
                
                // Cek jika ada kartu admin di dashboard untuk ditampilkan juga
                const usersCardLink = document.getElementById('users-card-link');
                if (usersCardLink) {
                    usersCardLink.style.display = 'block';
                }
            }
        });
    }

    // Tambahkan event listener untuk logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('rspace_token');
            window.location.href = '/';
        });
    }
}