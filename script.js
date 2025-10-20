document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
        window.location.href = 'index.html';
        return;
    }

    // Parse current user data
    const userData = JSON.parse(storedUser);
    
    // DOM Elements
    const menuItems = document.querySelectorAll('.menu-item');
    const contentSections = document.querySelectorAll('.content-section');
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    const pageTitle = document.getElementById('pageTitle');
    
    // Modal Elements
    const modal = document.getElementById('staffModal');
    const detailModal = document.getElementById('detailModal');
    const staffForm = document.getElementById('staffForm');
    const modalTitle = document.getElementById('modalTitle');
    const detailModalTitle = document.getElementById('detailModalTitle');
    const staffDetailContent = document.getElementById('staffDetailContent');
    const closeModal = document.querySelectorAll('.close');
    const cancelBtn = document.getElementById('cancelBtn');
    const submitBtn = document.getElementById('submitBtn');
    const tanggalJoinInput = document.getElementById('tanggalJoin');
    const masaKerjaInput = document.getElementById('masaKerja');
    const staffIdInput = document.getElementById('staffId');
    const editModeInput = document.getElementById('editMode');
    
    // Tambah Staff Buttons
    const tambahStaffHatoribet = document.getElementById('tambahStaffHatoribet');
    const tambahStaffLivitoto = document.getElementById('tambahStaffLivitoto');
    const tambahStaffHmd29 = document.getElementById('tambahStaffHmd29');
    
    // Users Elements
    const tambahUserBtn = document.getElementById('tambahUserBtn');
    
    // Peraturan Elements
    const tambahPeraturanBtn = document.getElementById('tambahPeraturanBtn');
    
    // Noted Elements
    const tambahNotedBtn = document.getElementById('tambahNotedBtn');
    
    // Table Bodies
    const hatoribetTableBody = document.getElementById('hatoribetTableBody');
    const livitotoTableBody = document.getElementById('livitotoTableBody');
    const hmd29TableBody = document.getElementById('hmd29TableBody');
    const peraturanTableBody = document.getElementById('peraturanTableBody');
    const notedTableBody = document.getElementById('notedTableBody');
    
    // Activity List
    const activityList = document.getElementById('activityList');

    // State
    let currentDepartment = '';
    let staffData = {
        hatoribet: [],
        livitoto: [],
        hmd29: []
    };

    // SOP Data
    let sopData = {
        "PERATURAN PERUSAHAAN": []
    };

    // Noted Data
    let notedData = [];

    // Users Data - Load from localStorage with password data
    let usersData = JSON.parse(localStorage.getItem('usersData') || '[]');

    // Current logged in user - Use the authenticated user
    const currentUser = userData;

    // Activities log
    let activities = [];

    // Initialize dashboard
    initializeDashboard();

    function initializeDashboard() {
        loadFromLocalStorage();
        setupEventListeners();
        renderAllTables();
        renderUsers();
        renderPeraturanTable();
        renderNotedTable();
        updateStats();
        updateActivities();
        updatePermissions();
        updateUserProfile();
        
        // Set default tanggal join to today
        const today = new Date().toISOString().split('T')[0];
        if (tanggalJoinInput) {
            tanggalJoinInput.value = today;
            calculateMasaKerja();
        }
        
        // Load active menu from localStorage setelah semua inisialisasi
        setTimeout(() => {
            loadActiveMenu();
        }, 100);
    }

    function saveActiveMenu(menuContent) {
        localStorage.setItem('activeMenu', menuContent);
    }

    function loadActiveMenu() {
        const activeMenu = localStorage.getItem('activeMenu');
        if (activeMenu && activeMenu !== 'home') {
            // Find menu item dengan data-content yang sesuai
            const targetMenuItem = document.querySelector(`.menu-item[data-content="${activeMenu}"]`);
            if (targetMenuItem) {
                // Trigger click event pada menu item
                targetMenuItem.click();
            }
        }
    }

    function updateUserProfile() {
        // Update user profile in header
        const userProfileImg = document.querySelector('.user-profile img');
        const userProfileName = document.querySelector('.user-profile span');
        
        if (userProfileImg && currentUser.avatar) {
            userProfileImg.src = currentUser.avatar;
            userProfileImg.alt = currentUser.username;
        }
        
        if (userProfileName) {
            userProfileName.textContent = currentUser.username;
            
            // Add logout button if not exists
            if (!document.querySelector('.logout-btn')) {
                const logoutBtn = document.createElement('button');
                logoutBtn.className = 'logout-btn';
                logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
                logoutBtn.title = 'Logout';
                logoutBtn.style.marginLeft = '10px';
                logoutBtn.style.padding = '8px 12px';
                logoutBtn.style.background = '#e74c3c';
                logoutBtn.style.color = 'white';
                logoutBtn.style.border = 'none';
                logoutBtn.style.borderRadius = '5px';
                logoutBtn.style.cursor = 'pointer';
                logoutBtn.style.fontSize = '14px';
                logoutBtn.onclick = logout;
                
                document.querySelector('.user-profile').appendChild(logoutBtn);
            }
        }
    }

    function setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Menu navigation
        menuItems.forEach(item => {
            item.addEventListener('click', function() {
                console.log('Menu item clicked:', this.getAttribute('data-content'));
                const targetContent = this.getAttribute('data-content');
                
                // Update active menu item
                menuItems.forEach(mi => mi.classList.remove('active'));
                this.classList.add('active');
                
                // Show target content
                contentSections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === `${targetContent}-content`) {
                        section.classList.add('active');
                        console.log('Showing content:', section.id);
                    }
                });
                
                // Update page title
                const menuText = this.querySelector('span').textContent;
                if (pageTitle) {
                    pageTitle.textContent = menuText;
                }
                
                // Save active menu to localStorage
                saveActiveMenu(targetContent);
                
                // Close sidebar on mobile after selection
                if (window.innerWidth <= 768) {
                    sidebar.classList.add('collapsed');
                }
            });
        });

        // Sidebar toggle
        if (menuToggle) {
            menuToggle.addEventListener('click', function() {
                sidebar.classList.toggle('collapsed');
            });
        }

        // Modal events
        closeModal.forEach(closeBtn => {
            closeBtn.addEventListener('click', function() {
                if (modal) modal.style.display = 'none';
                if (detailModal) detailModal.style.display = 'none';
                closeUserModal();
                closePeraturanModal();
                closeNotedModal();
            });
        });
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModalHandler);
        }
        
        // Tambah Staff buttons
        if (tambahStaffHatoribet) {
            tambahStaffHatoribet.addEventListener('click', () => openTambahStaffModal('hatoribet'));
        }
        if (tambahStaffLivitoto) {
            tambahStaffLivitoto.addEventListener('click', () => openTambahStaffModal('livitoto'));
        }
        if (tambahStaffHmd29) {
            tambahStaffHmd29.addEventListener('click', () => openTambahStaffModal('hmd29'));
        }
        
        // Users button
        if (tambahUserBtn) {
            tambahUserBtn.addEventListener('click', openTambahUserModal);
        }
        
        // Peraturan button
        if (tambahPeraturanBtn) {
            tambahPeraturanBtn.addEventListener('click', openTambahPeraturanModal);
        }
        
        // Noted button
        if (tambahNotedBtn) {
            tambahNotedBtn.addEventListener('click', openTambahNotedModal);
        }
        
        // Form submission
        if (staffForm) {
            staffForm.addEventListener('submit', handleFormSubmit);
        }
        
        // Auto-calculate masa kerja when tanggal join changes
        if (tanggalJoinInput) {
            tanggalJoinInput.addEventListener('change', calculateMasaKerja);
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModalHandler();
            }
            if (event.target === detailModal) {
                detailModal.style.display = 'none';
            }
            if (event.target.classList.contains('user-modal')) {
                closeUserModal();
            }
            if (event.target.classList.contains('peraturan-modal')) {
                closePeraturanModal();
            }
            if (event.target.classList.contains('noted-modal')) {
                closeNotedModal();
            }
            if (event.target.classList.contains('peraturan-detail-modal')) {
                const modal = document.querySelector('.peraturan-detail-modal');
                if (modal) modal.remove();
            }
            if (event.target.classList.contains('noted-detail-modal')) {
                const modal = document.querySelector('.noted-detail-modal');
                if (modal) modal.remove();
            }
        });

        console.log('Event listeners setup completed');
    }

    function updatePermissions() {
        const isAdmin = currentUser.role === 'Administrator';
        
        // Show/hide tambah staff buttons based on role
        if (tambahStaffHatoribet) {
            tambahStaffHatoribet.style.display = isAdmin ? 'flex' : 'none';
        }
        if (tambahStaffLivitoto) {
            tambahStaffLivitoto.style.display = isAdmin ? 'flex' : 'none';
        }
        if (tambahStaffHmd29) {
            tambahStaffHmd29.style.display = isAdmin ? 'flex' : 'none';
        }
        if (tambahUserBtn) {
            tambahUserBtn.style.display = isAdmin ? 'flex' : 'none';
        }
        if (tambahPeraturanBtn) {
            tambahPeraturanBtn.style.display = isAdmin ? 'flex' : 'none';
        }
        if (tambahNotedBtn) {
            tambahNotedBtn.style.display = isAdmin ? 'flex' : 'none';
        }
    }

    function openTambahStaffModal(department) {
        if (currentUser.role !== 'Administrator') {
            showNotification('Hanya Administrator yang dapat menambah staff', 'error');
            return;
        }
        
        currentDepartment = department;
        const departmentNames = {
            hatoribet: 'Hatoribet',
            livitoto: 'Livitoto',
            hmd29: 'Hmd29'
        };
        
        modalTitle.textContent = `Tambah Staff Baru - ${departmentNames[department]}`;
        submitBtn.textContent = 'Simpan Staff';
        editModeInput.value = 'false';
        staffIdInput.value = '';
        
        // Reset form
        staffForm.reset();
        
        // Set default tanggal join to today
        const today = new Date().toISOString().split('T')[0];
        tanggalJoinInput.value = today;
        
        calculateMasaKerja();
        modal.style.display = 'block';
    }

    function openEditStaffModal(department, staffId) {
        if (currentUser.role !== 'Administrator') {
            showNotification('Hanya Administrator yang dapat mengedit staff', 'error');
            return;
        }
        
        const staff = staffData[department].find(s => s.id === staffId);
        if (!staff) return;
        
        currentDepartment = department;
        const departmentNames = {
            hatoribet: 'Hatoribet',
            livitoto: 'Livitoto',
            hmd29: 'Hmd29'
        };
        
        modalTitle.textContent = `Edit Staff - ${departmentNames[department]}`;
        submitBtn.textContent = 'Update Staff';
        editModeInput.value = 'true';
        staffIdInput.value = staff.id;
        
        // Fill form with existing data
        document.getElementById('namaStaff').value = staff.namaStaff;
        document.getElementById('inisial').value = staff.inisial;
        document.getElementById('tanggalJoin').value = staff.tanggalJoin;
        document.getElementById('idAdmin').value = staff.idAdmin;
        document.getElementById('gmail').value = staff.gmail;
        document.getElementById('bank').value = staff.bank;
        document.getElementById('noRekGaji').value = staff.noRekGaji;
        document.getElementById('namaRekGaji').value = staff.namaRekGaji;
        document.getElementById('tanggalLahir').value = staff.tanggalLahir;
        document.getElementById('gedung').value = staff.gedung || '';
        document.getElementById('noKamar').value = staff.noKamar || '';
        
        calculateMasaKerja();
        modal.style.display = 'block';
    }

    function openTambahUserModal() {
        if (currentUser.role !== 'Administrator') {
            showNotification('Hanya Administrator yang dapat menambah user', 'error');
            return;
        }
        
        const userModalHTML = `
            <div class="modal user-modal" style="display: block;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Tambah User Baru</h3>
                        <span class="close">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="userForm" class="staff-form">
                            <div class="form-group">
                                <label for="username">USERNAME</label>
                                <input type="text" id="username" name="username" required>
                            </div>
                            <div class="form-group">
                                <label for="email">EMAIL</label>
                                <input type="email" id="email" name="email" required>
                            </div>
                            <div class="form-group">
                                <label for="password">PASSWORD</label>
                                <input type="password" id="password" name="password" required>
                            </div>
                            <div class="form-group">
                                <label for="role">ROLE</label>
                                <select id="role" name="role" required>
                                    <option value="">Pilih Role</option>
                                    <option value="Administrator">Administrator</option>
                                    <option value="Kasir">Kasir</option>
                                </select>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" id="cancelUserBtn">Batal</button>
                                <button type="submit" class="btn-primary">Simpan User</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing user modal if any
        const existingModal = document.querySelector('.user-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', userModalHTML);
        
        // Add event listeners for the new modal
        const userModal = document.querySelector('.user-modal');
        const userForm = document.getElementById('userForm');
        const cancelUserBtn = document.getElementById('cancelUserBtn');
        const userCloseBtn = userModal.querySelector('.close');
        
        userForm.addEventListener('submit', handleUserFormSubmit);
        cancelUserBtn.addEventListener('click', closeUserModal);
        userCloseBtn.addEventListener('click', closeUserModal);
        
        userModal.addEventListener('click', function(event) {
            if (event.target === userModal) {
                closeUserModal();
            }
        });
    }

    function closeUserModal() {
        const userModal = document.querySelector('.user-modal');
        if (userModal) {
            userModal.remove();
        }
    }

    function handleUserFormSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');
        const role = formData.get('role');
        
        const newUser = {
            id: Date.now().toString(),
            username: username,
            email: email,
            password: password,
            role: role,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=0366d6&color=fff`,
            createdAt: new Date().toISOString()
        };
        
        usersData.push(newUser);
        saveToLocalStorage();
        renderUsers();
        closeUserModal();
        
        addActivity(`User ${username} ditambahkan dengan role ${role}`);
        showNotification(`User ${username} berhasil ditambahkan`, 'success');
    }

    function closeModalHandler() {
        if (modal) modal.style.display = 'none';
        if (staffForm) staffForm.reset();
        
        // Reset tanggal join to today
        const today = new Date().toISOString().split('T')[0];
        if (tanggalJoinInput) {
            tanggalJoinInput.value = today;
            calculateMasaKerja();
        }
    }

    function calculateMasaKerja() {
        if (!tanggalJoinInput || !masaKerjaInput) return;
        
        const tanggalJoin = new Date(tanggalJoinInput.value);
        const today = new Date();
        
        if (tanggalJoin && tanggalJoin <= today) {
            const diffTime = Math.abs(today - tanggalJoin);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            const years = Math.floor(diffDays / 365);
            const months = Math.floor((diffDays % 365) / 30);
            const days = diffDays % 30;
            
            let masaKerjaText = '';
            
            if (years > 0) {
                masaKerjaText += `${years} TAHUN `;
            }
            if (months > 0) {
                masaKerjaText += `${months} BULAN `;
            }
            if (days > 0 || (years === 0 && months === 0)) {
                masaKerjaText += `${days} HARI`;
            }
            
            masaKerjaInput.value = masaKerjaText.trim();
        } else {
            masaKerjaInput.value = '0 HARI';
        }
    }

    function calculateMasaKerjaFromDate(tanggalJoin) {
        const joinDate = new Date(tanggalJoin);
        const today = new Date();
        
        if (joinDate && joinDate <= today) {
            const diffTime = Math.abs(today - joinDate);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            const years = Math.floor(diffDays / 365);
            const months = Math.floor((diffDays % 365) / 30);
            const days = diffDays % 30;
            
            let masaKerjaText = '';
            
            if (years > 0) {
                masaKerjaText += `${years} TAHUN `;
            }
            if (months > 0) {
                masaKerjaText += `${months} BULAN `;
            }
            if (days > 0 || (years === 0 && months === 0)) {
                masaKerjaText += `${days} HARI`;
            }
            
            return masaKerjaText.trim();
        }
        return '0 HARI';
    }

    function handleFormSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(staffForm);
        const isEditMode = editModeInput.value === 'true';
        const staffId = staffIdInput.value || Date.now().toString();
        
        const staff = {
            id: staffId,
            namaStaff: formData.get('namaStaff'),
            inisial: formData.get('inisial'),
            tanggalJoin: formData.get('tanggalJoin'),
            idAdmin: formData.get('idAdmin'),
            gmail: formData.get('gmail'),
            bank: formData.get('bank'),
            noRekGaji: formData.get('noRekGaji'),
            namaRekGaji: formData.get('namaRekGaji'),
            tanggalLahir: formData.get('tanggalLahir'),
            gedung: formData.get('gedung'),
            noKamar: formData.get('noKamar'),
            masaKerja: calculateMasaKerjaFromDate(formData.get('tanggalJoin')),
            status: 'active',
            department: currentDepartment
        };
        
        if (isEditMode) {
            // Edit existing staff
            const staffIndex = staffData[currentDepartment].findIndex(s => s.id === staffId);
            if (staffIndex !== -1) {
                staffData[currentDepartment][staffIndex] = staff;
                addActivity(`Staff ${staff.namaStaff} diperbarui di ${currentDepartment}`);
                showNotification(`Staff ${staff.namaStaff} berhasil diperbarui`, 'success');
            }
        } else {
            // Add new staff
            staffData[currentDepartment].push(staff);
            addActivity(`Staff ${staff.namaStaff} ditambahkan ke ${currentDepartment}`);
            showNotification(`Staff ${staff.namaStaff} berhasil ditambahkan ke ${currentDepartment}`, 'success');
        }
        
        // Save to localStorage
        saveToLocalStorage();
        
        // Render updated table
        renderTable(currentDepartment);
        
        // Close modal
        closeModalHandler();
        
        // Update stats
        updateStats();
    }

    function renderAllTables() {
        renderTable('hatoribet');
        renderTable('livitoto');
        renderTable('hmd29');
    }

    function renderTable(department) {
        let tableBody;
        switch(department) {
            case 'hatoribet':
                tableBody = hatoribetTableBody;
                break;
            case 'livitoto':
                tableBody = livitotoTableBody;
                break;
            case 'hmd29':
                tableBody = hmd29TableBody;
                break;
            default:
                return;
        }
        
        if (!tableBody) return;
        
        const data = staffData[department];
        
        if (data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="13" class="empty-state">
                        <i class="fas fa-users"></i>
                        <p>Belum ada data staff.<br>Klik tombol "Tambah Staff" untuk menambahkan.</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = data.map(staff => `
            <tr>
                <td>
                    <div class="staff-info">
                        <div class="staff-details">
                            <div class="staff-name">${staff.namaStaff}</div>
                        </div>
                    </div>
                </td>
                <td>${staff.inisial}</td>
                <td>${formatDate(staff.tanggalJoin)}</td>
                <td>${staff.idAdmin}</td>
                <td>${staff.gmail}</td>
                <td>${staff.bank}</td>
                <td>${staff.noRekGaji}</td>
                <td>${staff.namaRekGaji}</td>
                <td>${formatDate(staff.tanggalLahir)}</td>
                <td>${staff.gedung || '-'}</td>
                <td>${staff.noKamar || '-'}</td>
                <td>
                    <span class="masa-kerja-badge ${getMasaKerjaClass(staff.masaKerja)}">
                        ${staff.masaKerja}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="viewStaff('${department}', '${staff.id}')" title="Lihat Detail">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-action btn-edit" onclick="editStaff('${department}', '${staff.id}')" title="Edit" ${currentUser.role !== 'Administrator' ? 'disabled style="opacity: 0.5;"' : ''}>
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteStaff('${department}', '${staff.id}')" title="Hapus" ${currentUser.role !== 'Administrator' ? 'disabled style="opacity: 0.5;"' : ''}>
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function renderUsers() {
        const usersTableBody = document.getElementById('usersTableBody');
        if (!usersTableBody) return;
        
        if (usersData.length === 0) {
            usersTableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-state">
                        <i class="fas fa-users"></i>
                        <p>Belum ada data user.<br>Klik tombol "Tambah User" untuk menambahkan.</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        usersTableBody.innerHTML = usersData.map(user => `
            <tr>
                <td>
                    <div class="staff-info">
                        <div class="staff-details">
                            <div class="staff-name">${user.username}</div>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>
                    <span class="role ${user.role.toLowerCase()}">${user.role}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="editUser('${user.id}')" ${user.id === '1' || currentUser.role !== 'Administrator' ? 'disabled style="opacity: 0.5;"' : ''}>
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteUser('${user.id}')" ${user.id === '1' || currentUser.role !== 'Administrator' ? 'disabled style="opacity: 0.5;"' : ''}>
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // ========== PERATURAN FUNCTIONS ==========

    function openTambahPeraturanModal() {
        if (currentUser.role !== 'Administrator') {
            showNotification('Hanya Administrator yang dapat menambah peraturan', 'error');
            return;
        }
        
        const peraturanModalHTML = `
            <div class="modal peraturan-modal" style="display: block;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Tambah Peraturan Baru</h3>
                        <span class="close">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="peraturanForm" class="staff-form">
                            <div class="form-group">
                                <label for="judulPeraturan">JUDUL PERATURAN</label>
                                <input type="text" id="judulPeraturan" name="judulPeraturan" required>
                            </div>
                            <div class="form-group">
                                <label for="keteranganPeraturan">KETERANGAN</label>
                                <textarea id="keteranganPeraturan" name="keteranganPeraturan" required rows="4"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="sanksiPeraturan">SANKSI</label>
                                <textarea id="sanksiPeraturan" name="sanksiPeraturan" required rows="3"></textarea>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" id="cancelPeraturanBtn">Batal</button>
                                <button type="submit" class="btn-primary">Simpan Peraturan</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing peraturan modal if any
        const existingModal = document.querySelector('.peraturan-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', peraturanModalHTML);
        
        // Add event listeners untuk modal baru
        const peraturanModal = document.querySelector('.peraturan-modal');
        const peraturanForm = document.getElementById('peraturanForm');
        const cancelPeraturanBtn = document.getElementById('cancelPeraturanBtn');
        const peraturanCloseBtn = peraturanModal.querySelector('.close');
        
        peraturanForm.addEventListener('submit', handlePeraturanFormSubmit);
        cancelPeraturanBtn.addEventListener('click', closePeraturanModal);
        peraturanCloseBtn.addEventListener('click', closePeraturanModal);
        
        peraturanModal.addEventListener('click', function(event) {
            if (event.target === peraturanModal) {
                closePeraturanModal();
            }
        });
    }

    function closePeraturanModal() {
        const peraturanModal = document.querySelector('.peraturan-modal');
        if (peraturanModal) {
            peraturanModal.remove();
        }
    }

    function handlePeraturanFormSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const judul = formData.get('judulPeraturan');
        const keterangan = formData.get('keteranganPeraturan');
        const sanksi = formData.get('sanksiPeraturan');
        
        const newPeraturan = {
            id: Date.now().toString(),
            judul: judul,
            keterangan: keterangan,
            sanksi: sanksi,
            createdAt: new Date().toISOString()
        };
        
        // Simpan ke SOP data
        if (!sopData["PERATURAN PERUSAHAAN"]) {
            sopData["PERATURAN PERUSAHAAN"] = [];
        }
        sopData["PERATURAN PERUSAHAAN"].push(newPeraturan);
        
        // Save to localStorage
        saveToLocalStorage();
        
        // Render ulang tabel peraturan
        renderPeraturanTable();
        
        // Tutup modal
        closePeraturanModal();
        
        addActivity(`Peraturan "${judul}" ditambahkan`);
        showNotification(`Peraturan "${judul}" berhasil ditambahkan`, 'success');
    }

    function renderPeraturanTable() {
        const peraturanTableBody = document.getElementById('peraturanTableBody');
        if (!peraturanTableBody) return;
        
        const peraturanData = sopData["PERATURAN PERUSAHAAN"] || [];
        
        if (peraturanData.length === 0) {
            peraturanTableBody.innerHTML = `
                <tr>
                    <td colspan="2" class="empty-state">
                        <i class="fas fa-book"></i>
                        <p>Belum ada data peraturan.<br>Klik tombol "Tambah Peraturan" untuk menambahkan.</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        peraturanTableBody.innerHTML = peraturanData.map(peraturan => `
            <tr>
                <td>
                    <div class="staff-info">
                        <div class="staff-details">
                            <div class="staff-name">${peraturan.judul}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="viewPeraturan('${peraturan.id}')" title="Lihat Detail">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-action btn-edit" onclick="editPeraturan('${peraturan.id}')" title="Edit" ${currentUser.role !== 'Administrator' ? 'disabled style="opacity: 0.5;"' : ''}>
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="deletePeraturan('${peraturan.id}')" title="Hapus" ${currentUser.role !== 'Administrator' ? 'disabled style="opacity: 0.5;"' : ''}>
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // ========== END PERATURAN FUNCTIONS ==========

    // ========== NOTED FUNCTIONS ==========
    function openTambahNotedModal() {
        if (currentUser.role !== 'Administrator') {
            showNotification('Hanya Administrator yang dapat menambah noted', 'error');
            return;
        }
        
        const notedModalHTML = `
            <div class="modal noted-modal" style="display: block;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Tambah Noted Baru</h3>
                        <span class="close">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="notedForm" class="staff-form">
                            <div class="form-group">
                                <label for="judulNoted">JUDUL NOTED</label>
                                <input type="text" id="judulNoted" name="judulNoted" required>
                            </div>
                            <div class="form-group">
                                <label for="keteranganNoted">KETERANGAN</label>
                                <textarea id="keteranganNoted" name="keteranganNoted" required rows="6"></textarea>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" id="cancelNotedBtn">Batal</button>
                                <button type="submit" class="btn-primary">Simpan Noted</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing noted modal if any
        const existingModal = document.querySelector('.noted-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', notedModalHTML);
        
        // Add event listeners untuk modal baru
        const notedModal = document.querySelector('.noted-modal');
        const notedForm = document.getElementById('notedForm');
        const cancelNotedBtn = document.getElementById('cancelNotedBtn');
        const notedCloseBtn = notedModal.querySelector('.close');
        
        notedForm.addEventListener('submit', handleNotedFormSubmit);
        cancelNotedBtn.addEventListener('click', closeNotedModal);
        notedCloseBtn.addEventListener('click', closeNotedModal);
        
        notedModal.addEventListener('click', function(event) {
            if (event.target === notedModal) {
                closeNotedModal();
            }
        });
    }

    function closeNotedModal() {
        const notedModal = document.querySelector('.noted-modal');
        if (notedModal) {
            notedModal.remove();
        }
    }

    function handleNotedFormSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const judul = formData.get('judulNoted');
        const keterangan = formData.get('keteranganNoted');
        
        const newNoted = {
            id: Date.now().toString(),
            judul: judul,
            keterangan: keterangan,
            createdAt: new Date().toISOString()
        };
        
        notedData.push(newNoted);
        
        // Save to localStorage
        saveToLocalStorage();
        
        // Render ulang tabel noted
        renderNotedTable();
        
        // Tutup modal
        closeNotedModal();
        
        addActivity(`Noted "${judul}" ditambahkan`);
        showNotification(`Noted "${judul}" berhasil ditambahkan`, 'success');
    }

    function renderNotedTable() {
        if (!notedTableBody) return;
        
        if (notedData.length === 0) {
            notedTableBody.innerHTML = `
                <tr>
                    <td colspan="2" class="empty-state">
                        <i class="fas fa-sticky-note"></i>
                        <p>Belum ada data noted.<br>Klik tombol "Tambah Noted" untuk menambahkan.</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        notedTableBody.innerHTML = notedData.map(noted => `
            <tr>
                <td>
                    <div class="staff-info">
                        <div class="staff-details">
                            <div class="staff-name">${noted.judul}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="viewNoted('${noted.id}')" title="Lihat Detail">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-action btn-edit" onclick="editNoted('${noted.id}')" title="Edit" ${currentUser.role !== 'Administrator' ? 'disabled style="opacity: 0.5;"' : ''}>
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteNoted('${noted.id}')" title="Hapus" ${currentUser.role !== 'Administrator' ? 'disabled style="opacity: 0.5;"' : ''}>
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // ========== END NOTED FUNCTIONS ==========

    function getMasaKerjaClass(masaKerja) {
        if (masaKerja.includes('TAHUN')) {
            return 'senior';
        } else if (masaKerja.includes('BULAN') && parseInt(masaKerja) >= 6) {
            return 'mid';
        } else {
            return 'new';
        }
    }

    function formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        
        return `${day} ${month} ${year}`;
    }

    function saveToLocalStorage() {
        localStorage.setItem('staffData', JSON.stringify(staffData));
        localStorage.setItem('usersData', JSON.stringify(usersData));
        localStorage.setItem('activities', JSON.stringify(activities));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('sopData', JSON.stringify(sopData));
        localStorage.setItem('notedData', JSON.stringify(notedData));
    }

    function loadFromLocalStorage() {
        const savedStaffData = localStorage.getItem('staffData');
        const savedUsersData = localStorage.getItem('usersData');
        const savedActivities = localStorage.getItem('activities');
        const savedSopData = localStorage.getItem('sopData');
        const savedNotedData = localStorage.getItem('notedData');
        
        if (savedStaffData) {
            staffData = JSON.parse(savedStaffData);
        }
        
        if (savedUsersData) {
            // Keep password data for authentication
            usersData = JSON.parse(savedUsersData);
        }
        
        if (savedActivities) {
            activities = JSON.parse(savedActivities);
        }
        
        if (savedSopData) {
            sopData = JSON.parse(savedSopData);
        }
        
        if (savedNotedData) {
            notedData = JSON.parse(savedNotedData);
        }
    }

    function updateStats() {
        // Calculate total staff
        const totalStaff = Object.values(staffData).reduce((total, dept) => total + dept.length, 0);
        
        // Calculate staff per department
        const hatoribetCount = staffData.hatoribet.length;
        const livitotoCount = staffData.livitoto.length;
        const hmd29Count = staffData.hmd29.length;
        
        // Calculate average masa kerja in days
        let totalDays = 0;
        let staffCount = 0;
        
        Object.values(staffData).forEach(dept => {
            dept.forEach(staff => {
                const joinDate = new Date(staff.tanggalJoin);
                const today = new Date();
                const diffTime = Math.abs(today - joinDate);
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                totalDays += diffDays;
                staffCount++;
            });
        });
        
        const avgMasaKerja = staffCount > 0 ? Math.round(totalDays / staffCount) : 0;
        
        // Update DOM
        const statNumbers = document.querySelectorAll('.stat-number');
        const staffHatoribetCount = document.getElementById('staffHatoribetCount');
        const staffLivitotoCount = document.getElementById('staffLivitotoCount');
        const staffHmd29Count = document.getElementById('staffHmd29Count');
        
        if (statNumbers.length >= 1) {
            statNumbers[0].textContent = totalStaff;
        }
        
        if (staffHatoribetCount) {
            staffHatoribetCount.textContent = hatoribetCount;
        }
        
        if (staffLivitotoCount) {
            staffLivitotoCount.textContent = livitotoCount;
        }
        
        if (staffHmd29Count) {
            staffHmd29Count.textContent = hmd29Count;
        }
    }

    // ========== UPDATED ACTIVITY FUNCTIONS ==========
    function addActivity(message) {
        const now = new Date();
        const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
        
        const activity = {
            id: Date.now(),
            message: message,
            timestamp: timestamp,
            userEmail: currentUser.email,
            timeAgo: 'Baru saja'
        };
        
        activities.unshift(activity);
        
        // Keep only last 5 activities
        if (activities.length > 5) {
            activities = activities.slice(0, 5);
        }
        
        updateActivities();
        saveToLocalStorage();
    }

    function updateActivities() {
        if (!activityList) return;
        
        if (activities.length === 0) {
            activityList.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="activity-content">
                        <p>Tidak ada aktivitas terbaru</p>
                        <span class="activity-time">-</span>
                    </div>
                </div>
            `;
            return;
        }
        
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-user-plus"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-header">
                        <span class="activity-timestamp">${activity.timestamp}</span>
                        <span class="activity-user">${activity.userEmail}</span>
                    </div>
                    <p class="activity-message">${activity.message}</p>
                </div>
            </div>
        `).join('');
    }
    // ========== END UPDATED ACTIVITY FUNCTIONS ==========

    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Logout function
    function logout() {
        if (confirm('Apakah Anda yakin ingin logout?')) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('activeMenu'); // Clear active menu on logout
            window.location.href = 'index.html';
        }
    }

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('collapsed');
        } else {
            sidebar.classList.add('collapsed');
        }
    });

    // Initialize responsive behavior
    if (window.innerWidth <= 768) {
        sidebar.classList.add('collapsed');
    }

    // Global functions for view, edit and delete staff
    window.viewStaff = function(department, staffId) {
        const staff = staffData[department].find(s => s.id === staffId);
        if (staff) {
            detailModalTitle.textContent = `Detail Staff - ${staff.namaStaff}`;
            staffDetailContent.innerHTML = `
                <div class="detail-item">
                    <span class="detail-label">Nama Staff</span>
                    <span class="detail-value">${staff.namaStaff}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Inisial</span>
                    <span class="detail-value">${staff.inisial}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Tanggal Join</span>
                    <span class="detail-value">${formatDate(staff.tanggalJoin)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">ID Admin</span>
                    <span class="detail-value">${staff.idAdmin}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Gmail</span>
                    <span class="detail-value">${staff.gmail}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Bank</span>
                    <span class="detail-value">${staff.bank}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">No Rek Gaji</span>
                    <span class="detail-value">${staff.noRekGaji}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Nama Rek Gaji</span>
                    <span class="detail-value">${staff.namaRekGaji}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Tanggal Lahir</span>
                    <span class="detail-value">${formatDate(staff.tanggalLahir)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Gedung</span>
                    <span class="detail-value">${staff.gedung || '-'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">No Kamar</span>
                    <span class="detail-value">${staff.noKamar || '-'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Masa Kerja</span>
                    <span class="detail-value">${staff.masaKerja}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status</span>
                    <span class="detail-value">${staff.status}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Departemen</span>
                    <span class="detail-value">${staff.department}</span>
                </div>
            `;
            detailModal.style.display = 'block';
        }
    };

    window.editStaff = function(department, staffId) {
        openEditStaffModal(department, staffId);
    };

    window.deleteStaff = function(department, staffId) {
        if (currentUser.role !== 'Administrator') {
            showNotification('Hanya Administrator yang dapat menghapus staff', 'error');
            return;
        }
        
        const staff = staffData[department].find(s => s.id === staffId);
        if (staff && confirm(`Apakah Anda yakin ingin menghapus staff ${staff.namaStaff}?`)) {
            staffData[department] = staffData[department].filter(s => s.id !== staffId);
            
            // Save to localStorage
            saveToLocalStorage();
            
            addActivity(`Staff ${staff.namaStaff} dihapus dari ${department}`);
            renderTable(department);
            updateStats();
            showNotification(`Staff ${staff.namaStaff} berhasil dihapus`, 'success');
        }
    };

    // Global functions for peraturan
    window.viewPeraturan = function(peraturanId) {
        const peraturan = sopData["PERATURAN PERUSAHAAN"].find(p => p.id === peraturanId);
        if (peraturan) {
            const detailModalHTML = `
                <div class="modal peraturan-detail-modal" style="display: block;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Detail Peraturan</h3>
                            <span class="close">&times;</span>
                        </div>
                        <div class="modal-body">
                            <div class="staff-detail">
                                <div class="detail-item full-width">
                                    <span class="detail-label">Judul Peraturan</span>
                                    <span class="detail-value">${peraturan.judul}</span>
                                </div>
                                <div class="detail-item full-width">
                                    <span class="detail-label">Keterangan</span>
                                    <span class="detail-value" style="text-align: left; white-space: pre-wrap;">${peraturan.keterangan}</span>
                                </div>
                                <div class="detail-item full-width">
                                    <span class="detail-label">Sanksi</span>
                                    <span class="detail-value" style="text-align: left; white-space: pre-wrap;">${peraturan.sanksi}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Remove existing detail modal if any
            const existingModal = document.querySelector('.peraturan-detail-modal');
            if (existingModal) {
                existingModal.remove();
            }
            
            document.body.insertAdjacentHTML('beforeend', detailModalHTML);
            
            // Add event listeners untuk modal detail
            const detailModal = document.querySelector('.peraturan-detail-modal');
            const detailCloseBtn = detailModal.querySelector('.close');
            
            detailCloseBtn.addEventListener('click', function() {
                detailModal.remove();
            });
            
            detailModal.addEventListener('click', function(event) {
                if (event.target === detailModal) {
                    detailModal.remove();
                }
            });
        }
    };

    window.editPeraturan = function(peraturanId) {
        if (currentUser.role !== 'Administrator') {
            showNotification('Hanya Administrator yang dapat mengedit peraturan', 'error');
            return;
        }
        
        const peraturan = sopData["PERATURAN PERUSAHAAN"].find(p => p.id === peraturanId);
        if (!peraturan) return;
        
        const editModalHTML = `
            <div class="modal peraturan-modal" style="display: block;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Edit Peraturan</h3>
                        <span class="close">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="peraturanForm" class="staff-form">
                            <input type="hidden" id="peraturanId" value="${peraturan.id}">
                            <div class="form-group">
                                <label for="judulPeraturan">JUDUL PERATURAN</label>
                                <input type="text" id="judulPeraturan" name="judulPeraturan" value="${peraturan.judul}" required>
                            </div>
                            <div class="form-group">
                                <label for="keteranganPeraturan">KETERANGAN</label>
                                <textarea id="keteranganPeraturan" name="keteranganPeraturan" required rows="4">${peraturan.keterangan}</textarea>
                            </div>
                            <div class="form-group">
                                <label for="sanksiPeraturan">SANKSI</label>
                                <textarea id="sanksiPeraturan" name="sanksiPeraturan" required rows="3">${peraturan.sanksi}</textarea>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" id="cancelPeraturanBtn">Batal</button>
                                <button type="submit" class="btn-primary">Update Peraturan</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing peraturan modal if any
        const existingModal = document.querySelector('.peraturan-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', editModalHTML);
        
        // Add event listeners untuk modal edit
        const peraturanModal = document.querySelector('.peraturan-modal');
        const peraturanForm = document.getElementById('peraturanForm');
        const cancelPeraturanBtn = document.getElementById('cancelPeraturanBtn');
        const peraturanCloseBtn = peraturanModal.querySelector('.close');
        
        peraturanForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const formData = new FormData(peraturanForm);
            const peraturanId = document.getElementById('peraturanId').value;
            
            const updatedPeraturan = {
                id: peraturanId,
                judul: formData.get('judulPeraturan'),
                keterangan: formData.get('keteranganPeraturan'),
                sanksi: formData.get('sanksiPeraturan'),
                createdAt: peraturan.createdAt
            };
            
            // Update data peraturan
            const peraturanIndex = sopData["PERATURAN PERUSAHAAN"].findIndex(p => p.id === peraturanId);
            if (peraturanIndex !== -1) {
                sopData["PERATURAN PERUSAHAAN"][peraturanIndex] = updatedPeraturan;
                
                // Save to localStorage
                saveToLocalStorage();
                
                // Render ulang tabel
                renderPeraturanTable();
                
                // Tutup modal
                closePeraturanModal();
                
                addActivity(`Peraturan "${updatedPeraturan.judul}" diperbarui`);
                showNotification(`Peraturan "${updatedPeraturan.judul}" berhasil diperbarui`, 'success');
            }
        });
        
        cancelPeraturanBtn.addEventListener('click', closePeraturanModal);
        peraturanCloseBtn.addEventListener('click', closePeraturanModal);
        
        peraturanModal.addEventListener('click', function(event) {
            if (event.target === peraturanModal) {
                closePeraturanModal();
            }
        });
    };

    window.deletePeraturan = function(peraturanId) {
        if (currentUser.role !== 'Administrator') {
            showNotification('Hanya Administrator yang dapat menghapus peraturan', 'error');
            return;
        }
        
        const peraturan = sopData["PERATURAN PERUSAHAAN"].find(p => p.id === peraturanId);
        if (peraturan && confirm(`Apakah Anda yakin ingin menghapus peraturan "${peraturan.judul}"?`)) {
            sopData["PERATURAN PERUSAHAAN"] = sopData["PERATURAN PERUSAHAAN"].filter(p => p.id !== peraturanId);
            
            // Save to localStorage
            saveToLocalStorage();
            
            // Render ulang tabel
            renderPeraturanTable();
            
            addActivity(`Peraturan "${peraturan.judul}" dihapus`);
            showNotification(`Peraturan "${peraturan.judul}" berhasil dihapus`, 'success');
        }
    };

    // Global functions for noted
    window.viewNoted = function(notedId) {
        const noted = notedData.find(n => n.id === notedId);
        if (noted) {
            const detailModalHTML = `
                <div class="modal noted-detail-modal" style="display: block;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Detail Noted</h3>
                            <span class="close">&times;</span>
                        </div>
                        <div class="modal-body">
                            <div class="staff-detail">
                                <div class="detail-item full-width">
                                    <span class="detail-label">Judul Noted</span>
                                    <span class="detail-value">${noted.judul}</span>
                                </div>
                                <div class="detail-item full-width">
                                    <span class="detail-label">Keterangan</span>
                                    <span class="detail-value" style="text-align: left; white-space: pre-wrap;">${noted.keterangan}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Remove existing detail modal if any
            const existingModal = document.querySelector('.noted-detail-modal');
            if (existingModal) {
                existingModal.remove();
            }
            
            document.body.insertAdjacentHTML('beforeend', detailModalHTML);
            
            // Add event listeners untuk modal detail
            const detailModal = document.querySelector('.noted-detail-modal');
            const detailCloseBtn = detailModal.querySelector('.close');
            
            detailCloseBtn.addEventListener('click', function() {
                detailModal.remove();
            });
            
            detailModal.addEventListener('click', function(event) {
                if (event.target === detailModal) {
                    detailModal.remove();
                }
            });
        }
    };

    window.editNoted = function(notedId) {
        if (currentUser.role !== 'Administrator') {
            showNotification('Hanya Administrator yang dapat mengedit noted', 'error');
            return;
        }
        
        const noted = notedData.find(n => n.id === notedId);
        if (!noted) return;
        
        const editModalHTML = `
            <div class="modal noted-modal" style="display: block;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Edit Noted</h3>
                        <span class="close">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="notedForm" class="staff-form">
                            <input type="hidden" id="notedId" value="${noted.id}">
                            <div class="form-group">
                                <label for="judulNoted">JUDUL NOTED</label>
                                <input type="text" id="judulNoted" name="judulNoted" value="${noted.judul}" required>
                            </div>
                            <div class="form-group">
                                <label for="keteranganNoted">KETERANGAN</label>
                                <textarea id="keteranganNoted" name="keteranganNoted" required rows="6">${noted.keterangan}</textarea>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" id="cancelNotedBtn">Batal</button>
                                <button type="submit" class="btn-primary">Update Noted</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing noted modal if any
        const existingModal = document.querySelector('.noted-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', editModalHTML);
        
        // Add event listeners untuk modal edit
        const notedModal = document.querySelector('.noted-modal');
        const notedForm = document.getElementById('notedForm');
        const cancelNotedBtn = document.getElementById('cancelNotedBtn');
        const notedCloseBtn = notedModal.querySelector('.close');
        
        notedForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const formData = new FormData(notedForm);
            const notedId = document.getElementById('notedId').value;
            
            const updatedNoted = {
                id: notedId,
                judul: formData.get('judulNoted'),
                keterangan: formData.get('keteranganNoted'),
                createdAt: noted.createdAt
            };
            
            // Update data noted
            const notedIndex = notedData.findIndex(n => n.id === notedId);
            if (notedIndex !== -1) {
                notedData[notedIndex] = updatedNoted;
                
                // Save to localStorage
                saveToLocalStorage();
                
                // Render ulang tabel
                renderNotedTable();
                
                // Tutup modal
                closeNotedModal();
                
                addActivity(`Noted "${updatedNoted.judul}" diperbarui`);
                showNotification(`Noted "${updatedNoted.judul}" berhasil diperbarui`, 'success');
            }
        });
        
        cancelNotedBtn.addEventListener('click', closeNotedModal);
        notedCloseBtn.addEventListener('click', closeNotedModal);
        
        notedModal.addEventListener('click', function(event) {
            if (event.target === notedModal) {
                closeNotedModal();
            }
        });
    };

    window.deleteNoted = function(notedId) {
        if (currentUser.role !== 'Administrator') {
            showNotification('Hanya Administrator yang dapat menghapus noted', 'error');
            return;
        }
        
        const noted = notedData.find(n => n.id === notedId);
        if (noted && confirm(`Apakah Anda yakin ingin menghapus noted "${noted.judul}"?`)) {
            notedData = notedData.filter(n => n.id !== notedId);
            
            // Save to localStorage
            saveToLocalStorage();
            
            // Render ulang tabel
            renderNotedTable();
            
            addActivity(`Noted "${noted.judul}" dihapus`);
            showNotification(`Noted "${noted.judul}" berhasil dihapus`, 'success');
        }
    };

    // Global functions for users
    window.editUser = function(userId) {
        if (currentUser.role !== 'Administrator') {
            showNotification('Hanya Administrator yang dapat mengedit user', 'error');
            return;
        }
        
        const user = usersData.find(u => u.id === userId);
        if (!user) return;
        
        const userModalHTML = `
            <div class="modal user-modal" style="display: block;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Edit User</h3>
                        <span class="close">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="userForm" class="staff-form">
                            <div class="form-group">
                                <label for="username">USERNAME</label>
                                <input type="text" id="username" name="username" value="${user.username}" required>
                            </div>
                            <div class="form-group">
                                <label for="email">EMAIL</label>
                                <input type="email" id="email" name="email" value="${user.email}" required>
                            </div>
                            <div class="form-group">
                                <label for="password">PASSWORD (Kosongkan jika tidak diubah)</label>
                                <input type="password" id="password" name="password">
                            </div>
                            <div class="form-group">
                                <label for="role">ROLE</label>
                                <select id="role" name="role" required>
                                    <option value="Administrator" ${user.role === 'Administrator' ? 'selected' : ''}>Administrator</option>
                                    <option value="Kasir" ${user.role === 'Kasir' ? 'selected' : ''}>Kasir</option>
                                </select>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" id="cancelUserBtn">Batal</button>
                                <button type="submit" class="btn-primary">Update User</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing user modal if any
        const existingModal = document.querySelector('.user-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', userModalHTML);
        
        // Add event listeners for the new modal
        const userModal = document.querySelector('.user-modal');
        const userForm = document.getElementById('userForm');
        const cancelUserBtn = document.getElementById('cancelUserBtn');
        const userCloseBtn = userModal.querySelector('.close');
        
        userForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(userForm);
            
            const updatedUser = {
                ...user,
                username: formData.get('username'),
                email: formData.get('email'),
                role: formData.get('role'),
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.get('username'))}&background=0366d6&color=fff`
            };
            
            // Update password only if provided
            const newPassword = formData.get('password');
            if (newPassword) {
                updatedUser.password = newPassword;
            }
            
            const userIndex = usersData.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                usersData[userIndex] = updatedUser;
                saveToLocalStorage();
                renderUsers();
                closeUserModal();
                
                addActivity(`User ${updatedUser.username} diperbarui`);
                showNotification(`User ${updatedUser.username} berhasil diperbarui`, 'success');
            }
        });
        
        cancelUserBtn.addEventListener('click', closeUserModal);
        userCloseBtn.addEventListener('click', closeUserModal);
        
        userModal.addEventListener('click', function(event) {
            if (event.target === userModal) {
                closeUserModal();
            }
        });
    };

    window.deleteUser = function(userId) {
        if (currentUser.role !== 'Administrator') {
            showNotification('Hanya Administrator yang dapat menghapus user', 'error');
            return;
        }
        
        const user = usersData.find(u => u.id === userId);
        if (user && confirm(`Apakah Anda yakin ingin menghapus user ${user.username}?`)) {
            usersData = usersData.filter(u => u.id !== userId);
            saveToLocalStorage();
            renderUsers();
            
            addActivity(`User ${user.username} dihapus`);
            showNotification(`User ${user.username} berhasil dihapus`, 'success');
        }
    };

    // Expose logout function globally
    window.logout = logout;
});