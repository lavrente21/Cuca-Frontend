
// frontend/js/session.js
// Lida com toda a lógica de gestão de sessão: proteção de páginas, redirecionamento e logout.

import { showMessage, showLoading } from './utils.js';
import { API_BASE_URL } from './config.js'; // Importa a URL base da API

/**
 * Redireciona para a página de login se o utilizador não estiver autenticado.
 */
export function protectPage() {
    console.log("session.js: protectPage() a ser executado.");
    const userToken = localStorage.getItem('userToken');
    const username = localStorage.getItem('username');

    if (!userToken || !username) {
        console.log("session.js: Token ou Username ausente. Redirecionando para /Login.html");
        localStorage.clear();
        showMessage('Acesso negado. Por favor, faça login.', 1500);
        setTimeout(() => {
            window.location.href = '/Login.html';
        }, 1500);
    } else {
        console.log(`session.js: Token encontrado (${userToken.substring(0,10)}...), Username encontrado. Acesso concedido.`);
    }
}

/**
 * Redireciona para a página inicial se o utilizador já estiver autenticado.
 */
export function redirectIfLoggedIn() {
    console.log("session.js: redirectIfLoggedIn() a ser executado.");
    const userToken = localStorage.getItem('userToken');
    const username = localStorage.getItem('username');

    if (userToken && username) {
        console.log("session.js: Utilizador já logado. Redirecionando para /Pagina inicial.html");
        showMessage('Já estás logado(a). Redirecionando para a página inicial...', 1500);
        setTimeout(() => {
            window.location.href = '/Pagina inicial.html';
        }, 1500);
    } else {
        console.log("session.js: Token ou Username ausente. Permanecendo na página de login/registro.");
        if (userToken || username) {
            localStorage.clear();
            console.warn("session.js: Estado de localStorage inconsistente, foi limpo.");
        }
    }
}

/**
 * Configura o botão de logout.
 */
export function setupLogoutButton(buttonId = 'logout-button') {
    const logoutButton = document.getElementById(buttonId);
    if (logoutButton) {
        logoutButton.addEventListener('click', async (event) => {
            event.preventDefault();
            showLoading(true);

            try {
                const userToken = localStorage.getItem('userToken');
                if (!userToken) {
                    localStorage.clear();
                    showMessage('Não está logado. Redirecionando...', 1500);
                    setTimeout(() => { window.location.href = '/Login.html'; }, 1500);
                    return;
                }

                console.log("session.js: A fazer logout no backend...");
                const response = await fetch(`${API_BASE_URL}/api/logout`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${userToken}` }
                });

                const data = await response.json();
                if (response.ok) {
                    localStorage.clear();
                    showMessage('Logout bem-sucedido. Redirecionando...', 1500);
                    setTimeout(() => { window.location.href = '/Login.html'; }, 1500);
                } else {
                    showMessage('Erro ao fazer logout: ' + (data.message || 'Erro desconhecido.'), 2000);
                    localStorage.clear();
                    setTimeout(() => { window.location.href = '/Login.html'; }, 1500);
                }
            } catch (error) {
                console.error('session.js: Erro ao fazer logout:', error);
                showMessage('Não foi possível conectar ao servidor para logout.', 2000);
                localStorage.clear();
                setTimeout(() => { window.location.href = '/Login.html'; }, 1500);
            } finally {
                showLoading(false);
            }
        });
    } else {
        console.warn(`session.js: Botão de logout com ID '${buttonId}' não encontrado.`);
    }
}

// Centraliza lógica de proteção nas páginas de login/registro
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    if (path.includes('Login.html') || path.includes('Registro.html') || path === '/') {
        redirectIfLoggedIn();
    }
});
