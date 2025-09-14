import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
        
// Ativa o logging do Firestore para depuração
setLogLevel('debug');

const loginScreen = document.getElementById('login-screen');
const adminPanel = document.getElementById('admin-panel');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginMessage = document.getElementById('login-message');
const loadingIndicator = document.getElementById('loading-indicator');
const customModal = document.getElementById('custom-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');

// Configuração e inicialização do Firebase
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const __initial_auth_token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let userId = null;

// ==== Funções de Utilidade ====
function showLoading() {
    loadingIndicator.classList.remove('hidden');
}

function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

function showModal(title, message, isConfirm = false) {
    return new Promise(resolve => {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalConfirmBtn.classList.toggle('hidden', !isConfirm);
        modalCancelBtn.classList.toggle('hidden', !isConfirm);

        customModal.classList.remove('hidden');

        const confirmHandler = () => {
            customModal.classList.add('hidden');
            modalConfirmBtn.removeEventListener('click', confirmHandler);
            modalCancelBtn.removeEventListener('click', cancelHandler);
            resolve(true);
        };

        const cancelHandler = () => {
            customModal.classList.add('hidden');
            modalConfirmBtn.removeEventListener('click', confirmHandler);
            modalCancelBtn.removeEventListener('click', cancelHandler);
            resolve(false);
        };

        modalConfirmBtn.addEventListener('click', confirmHandler);
        modalCancelBtn.addEventListener('click', cancelHandler);
    });
}

function showMessage(message, isError = false) {
    modalTitle.textContent = isError ? "Erro" : "Sucesso";
    modalMessage.textContent = message;
    modalConfirmBtn.classList.add('hidden');
    modalCancelBtn.classList.add('hidden');
    customModal.classList.remove('hidden');
    setTimeout(() => {
        customModal.classList.add('hidden');
    }, 3000);
}

function renderUsers(users) {
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.className = 'bg-gray-50 p-4 rounded-lg flex justify-between items-center';
        li.innerHTML = `
            <div>
                <p class="font-bold text-gray-800">${user.username}</p>
                <p class="text-sm text-gray-600">ID: ${user.id}</p>
                <p class="text-sm text-gray-600">Saldo: Kz ${user.balance}</p>
            </div>
            <div class="space-x-2">
                <button class="bg-yellow-500 text-white p-2 rounded-md hover:bg-yellow-600 edit-user-btn" data-user-id="${user.id}">Editar</button>
                <button class="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 delete-user-btn" data-user-id="${user.id}">Excluir</button>
            </div>
        `;
        usersList.appendChild(li);
    });
}

function renderPackages(packages) {
    const packagesList = document.getElementById('packages-list');
    packagesList.innerHTML = '';
    packages.forEach(pkg => {
        const li = document.createElement('li');
        li.className = 'bg-gray-50 p-4 rounded-lg flex justify-between items-center';
        li.innerHTML = `
            <div>
                <p class="font-bold text-gray-800">${pkg.name}</p>
                <p class="text-sm text-gray-600">Min: Kz ${pkg.min_investment} | Max: Kz ${pkg.max_investment}</p>
                <p class="text-sm text-gray-600">Retorno Diário: ${pkg.daily_return_rate * 100}% | Duração: ${pkg.duration_days} dias</p>
            </div>
            <div class="space-x-2">
                <span class="inline-block px-2 py-1 rounded-full text-xs font-semibold ${pkg.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${pkg.status === 'active' ? 'Ativo' : 'Inativo'}</span>
                <button class="bg-yellow-500 text-white p-2 rounded-md hover:bg-yellow-600 edit-package-btn" data-package-id="${pkg.id}">Editar</button>
                <button class="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 delete-package-btn" data-package-id="${pkg.id}">Excluir</button>
            </div>
        `;
        packagesList.appendChild(li);
    });
}

function renderDeposits(deposits) {
    const depositsList = document.getElementById('deposits-list');
    depositsList.innerHTML = '';
    deposits.forEach(deposit => {
        const li = document.createElement('li');
        li.className = 'bg-gray-50 p-4 rounded-lg flex justify-between items-center';
        li.innerHTML = `
            <div>
                <p class="font-bold text-gray-800">Depósito de ${deposit.amount} Kz</p>
                <p class="text-sm text-gray-600">Utilizador ID: ${deposit.user_id}</p>
                <p class="text-sm text-gray-600">Status: <span class="font-semibold ${deposit.status === 'pending' ? 'text-yellow-500' : (deposit.status === 'approved' ? 'text-green-500' : 'text-red-500')}">${deposit.status}</span></p>
            </div>
            ${deposit.status === 'pending' ? `<div class="space-x-2">
                <button class="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 approve-deposit-btn" data-deposit-id="${deposit.id}">Aprovar</button>
                <button class="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 reject-deposit-btn" data-deposit-id="${deposit.id}">Rejeitar</button>
            </div>` : ''}
        `;
        depositsList.appendChild(li);
    });
}

function renderWithdrawals(withdrawals) {
    const withdrawalsList = document.getElementById('withdrawals-list');
    withdrawalsList.innerHTML = '';
    withdrawals.forEach(withdrawal => {
        const li = document.createElement('li');
        li.className = 'bg-gray-50 p-4 rounded-lg flex justify-between items-center';
        li.innerHTML = `
            <div>
                <p class="font-bold text-gray-800">Levantamento de ${withdrawal.actual_amount} Kz</p>
                <p class="text-sm text-gray-600">Utilizador ID: ${withdrawal.user_id}</p>
                <p class="text-sm text-gray-600">Status: <span class="font-semibold ${withdrawal.status === 'pending' ? 'text-yellow-500' : (withdrawal.status === 'approved' ? 'text-green-500' : 'text-red-500')}">${withdrawal.status}</span></p>
            </div>
            ${withdrawal.status === 'pending' ? `<div class="space-x-2">
                <button class="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 approve-withdrawal-btn" data-withdrawal-id="${withdrawal.id}">Aprovar</button>
                <button class="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 reject-withdrawal-btn" data-withdrawal-id="${withdrawal.id}">Rejeitar</button>
            </div>` : ''}
        `;
        withdrawalsList.appendChild(li);
    });
}

function renderBlogPosts(posts) {
    const blogPostsList = document.getElementById('blog-posts-list');
    blogPostsList.innerHTML = '';
    posts.forEach(post => {
        const li = document.createElement('li');
        li.className = 'bg-gray-50 p-4 rounded-lg flex justify-between items-center';
        li.innerHTML = `
            <div>
                <p class="font-bold text-gray-800">${post.title}</p>
                <p class="text-sm text-gray-600">Autor ID: ${post.author_id}</p>
                <p class="text-sm text-gray-600">Aprovado: <span class="font-semibold ${post.is_approved ? 'text-green-500' : 'text-yellow-500'}">${post.is_approved ? 'Sim' : 'Não'}</span></p>
            </div>
            <div class="space-x-2">
                <button class="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 view-post-btn" data-post-id="${post.id}">Ver</button>
                ${!post.is_approved ? `<button class="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 approve-post-btn" data-post-id="${post.id}">Aprovar</button>` : ''}
            </div>
        `;
        blogPostsList.appendChild(li);
    });
}

// ==== Funções de Manipulação de Dados (com Firestore) ====
async function updateDashboard() {
    if (!userId) return;
    showLoading();

    try {
        // Fetch de utilizadores
        const usersRef = collection(db, `artifacts/${appId}/public/data/users`);
        const usersSnap = await getDocs(usersRef);
        document.getElementById('total-users').textContent = usersSnap.size;

        // Fetch de depósitos pendentes
        const depositsRef = collection(db, `artifacts/${appId}/public/data/deposits`);
        const pendingDepositsQuery = query(depositsRef, where('status', '==', 'pending'));
        const pendingDepositsSnap = await getDocs(pendingDepositsQuery);
        document.getElementById('pending-deposits').textContent = pendingDepositsSnap.size;

        // Fetch de levantamentos pendentes
        const withdrawalsRef = collection(db, `artifacts/${appId}/public/data/withdrawals`);
        const pendingWithdrawalsQuery = query(withdrawalsRef, where('status', '==', 'pending'));
        const pendingWithdrawalsSnap = await getDocs(pendingWithdrawalsQuery);
        document.getElementById('pending-withdrawals').textContent = pendingWithdrawalsSnap.size;

         // Fetch de posts de blog pendentes
        const blogRef = collection(db, `artifacts/${appId}/public/data/blog_posts`);
        const pendingBlogPostsQuery = query(blogRef, where('is_approved', '==', false));
        const pendingBlogPostsSnap = await getDocs(pendingBlogPostsQuery);
        document.getElementById('pending-blog-posts').textContent = pendingBlogPostsSnap.size;

    } catch (error) {
        console.error("Erro ao atualizar o dashboard:", error);
        showMessage(`Erro ao carregar dados do dashboard: ${error.message}`, true);
    } finally {
        hideLoading();
    }
}

async function fetchUsers() {
    if (!userId) return;
    const usersRef = collection(db, `artifacts/${appId}/public/data/users`);
    onSnapshot(usersRef, (snapshot) => {
        const users = [];
        snapshot.forEach(doc => {
            users.push({ id: doc.id, ...doc.data() });
        });
        renderUsers(users);
        attachListeners();
    });
}

async function fetchPackages() {
    if (!userId) return;
    const packagesRef = collection(db, `artifacts/${appId}/public/data/investment_packages`);
    onSnapshot(packagesRef, (snapshot) => {
        const packages = [];
        snapshot.forEach(doc => {
            packages.push({ id: doc.id, ...doc.data() });
        });
        renderPackages(packages);
        attachListeners();
    });
}

async function fetchDeposits() {
    if (!userId) return;
    const depositsRef = collection(db, `artifacts/${appId}/public/data/deposits`);
    onSnapshot(depositsRef, (snapshot) => {
        const deposits = [];
        snapshot.forEach(doc => {
            deposits.push({ id: doc.id, ...doc.data() });
        });
        renderDeposits(deposits);
        attachListeners();
    });
}

async function fetchWithdrawals() {
    if (!userId) return;
    const withdrawalsRef = collection(db, `artifacts/${appId}/public/data/withdrawals`);
    onSnapshot(withdrawalsRef, (snapshot) => {
        const withdrawals = [];
        snapshot.forEach(doc => {
            withdrawals.push({ id: doc.id, ...doc.data() });
        });
        renderWithdrawals(withdrawals);
        attachListeners();
    });
}

async function fetchBlogPosts() {
    if (!userId) return;
    const blogRef = collection(db, `artifacts/${appId}/public/data/blog_posts`);
    onSnapshot(blogRef, (snapshot) => {
        const posts = [];
        snapshot.forEach(doc => {
            posts.push({ id: doc.id, ...doc.data() });
        });
        renderBlogPosts(posts);
        attachListeners();
    });
}

// ==== Funções de Manipulação de Eventos (com Firestore) ====
async function handleLogin() {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;

    if (username === 'admin' && password === 'senha123') {
        try {
            await signInWithCustomToken(auth, __initial_auth_token);
            userId = auth.currentUser.uid;
            showMessage('Login bem-sucedido!');
            setTimeout(() => {
                loginScreen.classList.add('hidden');
                adminPanel.classList.remove('hidden');
                updateDashboard();
            }, 1000);
        } catch (error) {
            console.error("Erro de autenticação:", error);
            showMessage("Erro de autenticação. Tente novamente mais tarde.", true);
        }
    } else {
        showMessage('Nome de utilizador ou senha incorretos.', true);
    }
}

function handleLogout() {
    // Em uma aplicação real, você faria `auth.signOut()`. Aqui, apenas simulamos.
    adminPanel.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    document.getElementById('admin-username').value = '';
    document.getElementById('admin-password').value = '';
    loginMessage.classList.add('hidden');
    userId = null;
}

async function handleEditUser(event) {
    const userIdToEdit = event.currentTarget.dataset.userId;
    const newBalance = prompt("Insira o novo saldo para o utilizador:");
    if (newBalance === null || isNaN(newBalance)) {
        showMessage("Operação cancelada ou saldo inválido.", true);
        return;
    }
    try {
        const userDocRef = doc(db, `artifacts/${appId}/public/data/users`, userIdToEdit);
        await updateDoc(userDocRef, { balance: parseFloat(newBalance) });
        showMessage(`Saldo do utilizador ${userIdToEdit} atualizado.`);
    } catch (error) {
        console.error("Erro ao atualizar o saldo:", error);
        showMessage("Erro ao atualizar o saldo.", true);
    }
}

async function handleDeleteUser(event) {
    const userIdToDelete = event.currentTarget.dataset.userId;
    const confirmed = await showModal("Confirmar Exclusão", `Tem certeza que deseja excluir o utilizador ${userIdToDelete}?`, true);
    if (confirmed) {
        try {
            await deleteDoc(doc(db, `artifacts/${appId}/public/data/users`, userIdToDelete));
            showMessage(`Utilizador ${userIdToDelete} excluído.`);
        } catch (error) {
            console.error("Erro ao excluir utilizador:", error);
            showMessage("Erro ao excluir utilizador.", true);
        }
    }
}

async function handleAddPackage(event) {
    event.preventDefault();
    const packageName = document.getElementById('package-name').value;
    const packageDesc = document.getElementById('package-description').value;
    const packageMin = parseFloat(document.getElementById('package-min').value);
    const packageMax = parseFloat(document.getElementById('package-max').value);
    const packageRate = parseFloat(document.getElementById('package-rate').value);
    const packageDuration = parseInt(document.getElementById('package-duration').value);

    if (!packageName || !packageDesc || isNaN(packageMin) || isNaN(packageMax) || isNaN(packageRate) || isNaN(packageDuration)) {
        showMessage("Por favor, preencha todos os campos corretamente.", true);
        return;
    }

    try {
        await addDoc(collection(db, `artifacts/${appId}/public/data/investment_packages`), {
            name: packageName,
            description: packageDesc,
            min_investment: packageMin,
            max_investment: packageMax,
            daily_return_rate: packageRate,
            duration_days: packageDuration,
            status: 'active'
        });
        showMessage(`Pacote "${packageName}" adicionado com sucesso.`);
        event.target.reset();
    } catch (error) {
        console.error("Erro ao adicionar pacote:", error);
        showMessage("Erro ao adicionar o pacote.", true);
    }
}

async function handleApproveDeposit(event) {
    const depositId = event.currentTarget.dataset.depositId;
    const confirmed = await showModal("Confirmar Aprovação", `Tem certeza que deseja aprovar o depósito ${depositId}?`, true);
    if (confirmed) {
        try {
            await updateDoc(doc(db, `artifacts/${appId}/public/data/deposits`, depositId), { status: 'approved' });
            showMessage(`Depósito ${depositId} aprovado.`);
        } catch (error) {
            console.error("Erro ao aprovar depósito:", error);
            showMessage("Erro ao aprovar o depósito.", true);
        }
    }
}

async function handleRejectDeposit(event) {
    const depositId = event.currentTarget.dataset.depositId;
    const confirmed = await showModal("Confirmar Rejeição", `Tem certeza que deseja rejeitar o depósito ${depositId}?`, true);
    if (confirmed) {
        try {
            await updateDoc(doc(db, `artifacts/${appId}/public/data/deposits`, depositId), { status: 'rejected' });
            showMessage(`Depósito ${depositId} rejeitado.`);
        } catch (error) {
            console.error("Erro ao rejeitar depósito:", error);
            showMessage("Erro ao rejeitar o depósito.", true);
        }
    }
}

async function handleApproveWithdrawal(event) {
    const withdrawalId = event.currentTarget.dataset.withdrawalId;
    const confirmed = await showModal("Confirmar Aprovação", `Tem certeza que deseja aprovar o levantamento ${withdrawalId}?`, true);
    if (confirmed) {
        try {
            await updateDoc(doc(db, `artifacts/${appId}/public/data/withdrawals`, withdrawalId), { status: 'approved' });
            showMessage(`Levantamento ${withdrawalId} aprovado.`);
        } catch (error) {
            console.error("Erro ao aprovar levantamento:", error);
            showMessage("Erro ao aprovar o levantamento.", true);
        }
    }
}

async function handleRejectWithdrawal(event) {
    const withdrawalId = event.currentTarget.dataset.withdrawalId;
    const confirmed = await showModal("Confirmar Rejeição", `Tem certeza que deseja rejeitar o levantamento ${withdrawalId}?`, true);
    if (confirmed) {
        try {
            await updateDoc(doc(db, `artifacts/${appId}/public/data/withdrawals`, withdrawalId), { status: 'rejected' });
            showMessage(`Levantamento ${withdrawalId} rejeitado.`);
        } catch (error) {
            console.error("Erro ao rejeitar levantamento:", error);
            showMessage("Erro ao rejeitar o levantamento.", true);
        }
    }
}

async function handleAddPost(event) {
    event.preventDefault();
    const postTitle = document.getElementById('post-title').value;
    const postContent = document.getElementById('post-content').value;

    if (!postTitle || !postContent) {
        showMessage("Por favor, preencha todos os campos.", true);
        return;
    }

    try {
        await addDoc(collection(db, `artifacts/${appId}/public/data/blog_posts`), {
            title: postTitle,
            content: postContent,
            author_id: userId,
            is_approved: true
        });
        showMessage(`Post "${postTitle}" adicionado e aprovado com sucesso.`);
        event.target.reset();
    } catch (error) {
        console.error("Erro ao adicionar post:", error);
        showMessage("Erro ao adicionar o post.", true);
    }
}

async function handleApprovePost(event) {
    const postId = event.currentTarget.dataset.postId;
    const confirmed = await showModal("Confirmar Aprovação", `Tem certeza que deseja aprovar o post ${postId}?`, true);
    if (confirmed) {
        try {
            await updateDoc(doc(db, `artifacts/${appId}/public/data/blog_posts`, postId), { is_approved: true });
            showMessage(`Post ${postId} aprovado.`);
        } catch (error) {
            console.error("Erro ao aprovar post:", error);
            showMessage("Erro ao aprovar o post.", true);
        }
    }
}

function attachListeners() {
    // Remove listeners antigos para evitar duplicação
    document.querySelectorAll('.edit-user-btn').forEach(btn => btn.replaceWith(btn.cloneNode(true)));
    document.querySelectorAll('.delete-user-btn').forEach(btn => btn.replaceWith(btn.cloneNode(true)));
    document.querySelectorAll('.approve-deposit-btn').forEach(btn => btn.replaceWith(btn.cloneNode(true)));
    document.querySelectorAll('.reject-deposit-btn').forEach(btn => btn.replaceWith(btn.cloneNode(true)));
    document.querySelectorAll('.approve-withdrawal-btn').forEach(btn => btn.replaceWith(btn.cloneNode(true)));
    document.querySelectorAll('.reject-withdrawal-btn').forEach(btn => btn.replaceWith(btn.cloneNode(true)));
    document.querySelectorAll('.approve-post-btn').forEach(btn => btn.replaceWith(btn.cloneNode(true)));

    // Adiciona novos listeners
    document.querySelectorAll('.edit-user-btn').forEach(button => button.addEventListener('click', handleEditUser));
    document.querySelectorAll('.delete-user-btn').forEach(button => button.addEventListener('click', handleDeleteUser));
    document.querySelectorAll('.approve-deposit-btn').forEach(button => button.addEventListener('click', handleApproveDeposit));
    document.querySelectorAll('.reject-deposit-btn').forEach(button => button.addEventListener('click', handleRejectDeposit));
    document.querySelectorAll('.approve-withdrawal-btn').forEach(button => button.addEventListener('click', handleApproveWithdrawal));
    document.querySelectorAll('.reject-withdrawal-btn').forEach(button => button.addEventListener('click', handleRejectWithdrawal));
    document.querySelectorAll('.approve-post-btn').forEach(button => button.addEventListener('click', handleApprovePost));
}

// ==== Configuração de Event Listeners ====
document.addEventListener('DOMContentLoaded', () => {
    loginBtn.addEventListener('click', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    document.getElementById('add-package-form').addEventListener('submit', handleAddPackage);
    document.getElementById('add-post-form').addEventListener('submit', handleAddPost);

    // Adiciona listeners para os botões de navegação
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (event) => {
            const tabName = event.currentTarget.dataset.tab;
            // Remove 'active' de todos os itens do menu e conteúdo
            document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));

            // Adiciona 'active' ao item clicado
            event.currentTarget.classList.add('active');
            document.getElementById(tabName).classList.add('active');

            // Carrega dados da aba selecionada
            if (tabName === 'users') {
                fetchUsers();
            } else if (tabName === 'packages') {
                fetchPackages();
            } else if (tabName === 'deposits') {
                fetchDeposits();
            } else if (tabName === 'withdrawals') {
                fetchWithdrawals();
            } else if (tabName === 'blog') {
                fetchBlogPosts();
            } else if (tabName === 'dashboard') {
                updateDashboard();
            }
        });
    });

    // Autentica com o token inicial fornecido pelo ambiente
    if (__initial_auth_token) {
        signInWithCustomToken(auth, __initial_auth_token).then(() => {
            userId = auth.currentUser.uid;
            loginScreen.classList.add('hidden');
            adminPanel.classList.remove('hidden');
            updateDashboard();
        }).catch(error => {
            console.error("Falha na autenticação automática:", error);
            showMessage("Falha na autenticação automática. Por favor, faça login manualmente.", true);
        });
    }
});
