document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const menuToggle = document.getElementById('menu-toggle');
    const menuClose = document.getElementById('menu-close');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileNavLinks = mobileMenu.querySelectorAll('.mobile-nav-link');

    // User Authentication Elements
    const userActions = document.querySelector('.header .user-actions');
    const authButtons = userActions?.querySelector('.auth-buttons');
    const userInfo = userActions?.querySelector('.user-info');
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutButton = document.getElementById('logout-button');

    const userActionsMobile = document.querySelector('.mobile-menu .user-actions-mobile');
    const authButtonsMobile = userActionsMobile?.querySelector('.auth-buttons-mobile');
    const userInfoMobile = userActionsMobile?.querySelector('.user-info-mobile');
    const welcomeMessageMobile = document.getElementById('welcome-message-mobile');
    const logoutButtonMobile = document.getElementById('logout-button-mobile');

    // Account Listing Elements (on index.html)
    const accountGrid = document.getElementById('account-grid');
    const searchInput = document.getElementById('search-input');
    const rankFilter = document.getElementById('rank-filter');
    const loadingMessage = document.getElementById('loading-message');
    const noResultsMessage = document.getElementById('no-results-message');

    // Login Form Elements (on login.html)
    const loginForm = document.getElementById('login-form');
    const loginUsernameInput = document.getElementById('username');
    const loginError = document.getElementById('login-error');

    // Register Form Elements (on register.html)
    const registerForm = document.getElementById('register-form');
    const regUsername = document.getElementById('reg-username');
    const regEmail = document.getElementById('reg-email');
    const regPassword = document.getElementById('reg-password');
    const regConfirmPassword = document.getElementById('reg-confirm-password');
    const registerMessage = document.getElementById('register-message');

    // --- State ---
    let allAccounts = []; // To store accounts fetched from JSON
    const loggedInUserKey = 'ffShopUser'; // localStorage key

    // --- Functions ---

    // Mobile Menu Toggle
    const toggleMobileMenu = () => mobileMenu?.classList.toggle('active');

    // Update UI based on Login Status
    const checkLoginStatus = () => {
        const username = localStorage.getItem(loggedInUserKey);
        const isLoggedIn = !!username; // True if username exists

        // Header UI
        if (authButtons && userInfo && welcomeMessage) {
            authButtons.style.display = isLoggedIn ? 'none' : 'flex';
            userInfo.style.display = isLoggedIn ? 'flex' : 'none';
            if (isLoggedIn) welcomeMessage.textContent = `Chào, ${username}!`;
        }
        // Mobile Menu UI
        if (authButtonsMobile && userInfoMobile && welcomeMessageMobile) {
            authButtonsMobile.style.display = isLoggedIn ? 'none' : 'flex';
            userInfoMobile.style.display = isLoggedIn ? 'flex' : 'none';
            if (isLoggedIn) welcomeMessageMobile.textContent = `Chào, ${username}!`;
        }
    };

    // Handle Logout
    const handleLogout = () => {
        localStorage.removeItem(loggedInUserKey);
        checkLoginStatus(); // Update UI immediately
        // Optional: Redirect to home or refresh if needed
        // window.location.href = 'index.html';
    };

    // Format Currency (Vietnamese Dong)
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return '';
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    // Create Account Card HTML
    const createAccountCardHTML = (account) => {
        const formattedPrice = formatCurrency(account.price);
        const formattedOldPrice = account.old_price ? formatCurrency(account.old_price) : '';
        // !!! IMPORTANT: Replace with your actual email address !!!
        const yourEmail = 'youremail@example.com';
        const mailSubject = `Quan tâm Acc FF: ${account.id} - ${account.title}`;
        const mailBody = `Xin chào,\n\nTôi quan tâm đến tài khoản Free Fire sau:\n\nMã số: ${account.id}\nTên: ${account.title}\nGiá: ${formattedPrice}\n\nVui lòng tư vấn thêm.\n\nCảm ơn!`;
        const mailtoLink = `mailto:${yourEmail}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

        return `
            <div class="account-card animate-zoom-in">
                <div class="card-image">
                     <img src="${account.image}" alt="${account.title}" loading="lazy"> <!-- Lazy loading -->
                     <span class="account-id">#${account.id}</span>
                     ${account.rank ? `<span class="account-rank">${account.rank}</span>` : ''}
                </div>
                <div class="card-content">
                    <h3>${account.title}</h3>
                    <p class="description">${account.description}</p>
                    <div class="price-tag">
                        ${formattedOldPrice ? `<span class="old-price">${formattedOldPrice}</span>` : ''}
                        <span class="current-price">${formattedPrice}</span>
                    </div>
                    <a href="${mailtoLink}" class="btn btn-primary btn-block">Liên Hệ Mua</a>
                </div>
            </div>
        `;
    };

    // Display Accounts on the Grid
    const displayAccounts = (accountsToDisplay) => {
        if (!accountGrid) return; // Only run on index.html

        // Hide loading message if it exists
        if (loadingMessage) loadingMessage.style.display = 'none';

        accountGrid.innerHTML = ''; // Clear previous accounts

        if (accountsToDisplay.length === 0) {
            if (noResultsMessage) noResultsMessage.style.display = 'block';
        } else {
            if (noResultsMessage) noResultsMessage.style.display = 'none';
            accountsToDisplay.forEach(account => {
                accountGrid.innerHTML += createAccountCardHTML(account);
            });
            // Re-trigger animation observation if necessary (simple way: assume already done)
        }
    };

    // Filter and Search Accounts
    const filterAndSearchAccounts = () => {
        if (!searchInput || !rankFilter) return; // Only on index.html

        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedRank = rankFilter.value;

        const filteredAccounts = allAccounts.filter(account => {
            const matchesSearch = searchTerm === '' ||
                                  account.title.toLowerCase().includes(searchTerm) ||
                                  account.description.toLowerCase().includes(searchTerm) ||
                                  account.id.toLowerCase().includes(searchTerm);
            const matchesRank = selectedRank === '' || account.rank === selectedRank;

            return matchesSearch && matchesRank;
        });

        displayAccounts(filteredAccounts);
    };

    // Fetch Accounts from JSON
    const loadAccounts = async () => {
        if (!accountGrid) return; // Only run on index.html

        try {
            const response = await fetch('data/accounts.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allAccounts = await response.json();
            displayAccounts(allAccounts); // Display all initially
        } catch (error) {
            console.error("Could not fetch accounts:", error);
            if (accountGrid && loadingMessage) {
                loadingMessage.textContent = 'Lỗi khi tải danh sách tài khoản.';
                loadingMessage.style.color = 'red';
            }
        }
    };

    // Handle Login Form Submission (Simulation)
    const handleLogin = (event) => {
        event.preventDefault(); // Prevent actual form submission
        if (!loginUsernameInput) return;

        const username = loginUsernameInput.value.trim();

        if (username) {
            localStorage.setItem(loggedInUserKey, username);
            window.location.href = 'index.html'; // Redirect to homepage after "login"
        } else {
            if (loginError) {
                loginError.textContent = 'Vui lòng nhập Tên đăng nhập (Demo).';
                loginError.style.display = 'block';
            }
        }
    };

     // Handle Register Form Submission (Simulation)
     const handleRegister = (event) => {
        event.preventDefault();
        if (!registerMessage || !regPassword || !regConfirmPassword) return;

        const password = regPassword.value;
        const confirmPassword = regConfirmPassword.value;

        // Reset message
        registerMessage.textContent = '';
        registerMessage.className = 'message'; // Reset class
        registerMessage.style.display = 'none';


        // Very basic validation (add more if needed)
        if (!regUsername.value || !regEmail.value || !password || !confirmPassword) {
             registerMessage.textContent = 'Vui lòng điền đầy đủ thông tin.';
             registerMessage.classList.add('error');
             registerMessage.style.display = 'block';
             return;
        }

        if (password !== confirmPassword) {
            registerMessage.textContent = 'Mật khẩu xác nhận không khớp.';
             registerMessage.classList.add('error');
             registerMessage.style.display = 'block';
            return;
        }

        // Simulate success
        registerMessage.textContent = 'Đăng ký thành công (Demo)! Bạn có thể đăng nhập ngay.';
        registerMessage.classList.add('success');
        registerMessage.style.display = 'block';

        // Optionally clear form or redirect after a delay
        // registerForm.reset();
        // setTimeout(() => {
        //     window.location.href = 'login.html';
        // }, 2000);
    };


    // --- Event Listeners ---

    // Mobile Menu
    menuToggle?.addEventListener('click', toggleMobileMenu);
    menuClose?.addEventListener('click', toggleMobileMenu);
    // Close mobile menu when a nav link is clicked (useful for single page feel)
    mobileNavLinks?.forEach(link => {
        link.addEventListener('click', () => {
             if (mobileMenu?.classList.contains('active')) {
                 // Check if it's an internal link before closing
                 const href = link.getAttribute('href');
                 if (href && href.startsWith('index.html#')) {
                      toggleMobileMenu();
                 }
                 // Allow external links or other page links to navigate normally
             }
        });
    });

    // Logout Buttons
    logoutButton?.addEventListener('click', handleLogout);
    logoutButtonMobile?.addEventListener('click', handleLogout);

    // Account Filtering/Searching (on index.html)
    searchInput?.addEventListener('input', filterAndSearchAccounts);
    rankFilter?.addEventListener('change', filterAndSearchAccounts);

    // Login Form (on login.html)
    loginForm?.addEventListener('submit', handleLogin);

    // Register Form (on register.html)
     registerForm?.addEventListener('submit', handleRegister);

    // Animation Observer (Keep the existing simple animation trigger)
    const animatedElements = document.querySelectorAll('.animate-fade-in-up, .animate-zoom-in, .animate-slide-in-left, .animate-slide-in-right');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1'; // Trigger animation by making visible
                    // Optionally add a class: entry.target.classList.add('start-animation');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        animatedElements.forEach(el => observer.observe(el));
    } else {
        // Fallback for older browsers
        animatedElements.forEach(el => { el.style.opacity = '1'; });
    }


    // --- Initial Setup ---
    checkLoginStatus(); // Check login status on every page load
    loadAccounts(); // Attempt to load accounts (will only work fully on index.html)

}); // End DOMContentLoaded