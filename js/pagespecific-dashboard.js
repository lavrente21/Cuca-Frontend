// static/js/pageSpecific-dashboard.js

// Importa as funções showMessage e showLoading do ficheiro utils.js
import { showMessage, showLoading } from './utils.js';
import { protectPage, setupLogoutButton } from './session.js'; // Importa setupLogoutButton
import { API_BASE_URL } from './config.js'; // ✅ Corrigido para a mesma pasta (js/)

console.log("pageSpecific-dashboard.js: Script a ser carregado.");

// Protege esta página - só pode ser acedida se estiver logado.
protectPage(); // Esta função é chamada no início da execução do script

document.addEventListener('DOMContentLoaded', async () => {
    console.log("pageSpecific-dashboard.js: DOMContentLoaded disparado.");
    // Esconde o indicador de carregamento ao iniciar a página
    showLoading(false);

    // Obtém o token de autenticação do utilizador armazenado localmente
    const userToken = localStorage.getItem('userToken');
    const username = localStorage.getItem('username');
    const userIdCode = localStorage.getItem('user_id_code');

    // Mostra o valor do token (parcialmente) e se o username foi encontrado
    console.log(`pageSpecific-dashboard.js: userToken do localStorage: ${userToken ? userToken.substring(0,10) + '...' : 'Não encontrado'}`);
    console.log(`pageSpecific-dashboard.js: username do localStorage: ${username ? username : 'Não encontrado'}`);

    // Se não houver token ou username, protectPage() já deve ter redirecionado.
    // Esta é uma verificação de segurança adicional antes de tentar usar os dados.
    if (!userToken || !username) {
        console.warn("pageSpecific-dashboard.js: Token ou Username ausente. Nenhuma requisição ao dashboard será feita.");
        return; // Sai da execução se a autenticação falhou
    }

    const displayUsername = document.getElementById('display-username');
    const displayPhoneId = document.getElementById('display-phone-id');
    const userInitialCircle = document.getElementById('user-initial');
    const totalBalanceDisplay = document.getElementById('total-balance-display');
    const investmentBalanceDisplay = document.getElementById('investment-balance-display');
    const withdrawableBalanceDisplay = document.getElementById('withdrawable-balance-display');
    const logoutButton = document.getElementById('logout-button'); // Certifica-te de que este ID existe no HTML

    // Define o nome de utilizador e o ID do telefone
    if (displayUsername) displayUsername.innerText = username;
    if (displayPhoneId) displayPhoneId.innerText = `092****${userIdCode} 【${userIdCode}】`;
    if (userInitialCircle && username) userInitialCircle.innerText = username.charAt(0).toUpperCase();

    // ==========================================================
    // Lógica para carregar os dados do utilizador
    // ==========================================================
async function loadUserData() {
    console.log("pageSpecific-dashboard.js: loadUserData a ser executado.");
    showLoading(true); 
    try {
        console.log("pageSpecific-dashboard.js: A fazer requisição para /api/dashboard com token...");
        const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });

        let data;
        try {
            data = await response.json(); // tenta parsear JSON
        } catch {
            data = {}; // evita quebrar se não for JSON
        }

        console.log("pageSpecific-dashboard.js: Resposta do dashboard recebida:", response.status, data);

        if (response.ok) {
            if (displayUsername) displayUsername.innerText = data.username || 'Utilizador';
            if (displayPhoneId) {
                displayPhoneId.innerText = `ID: ${data.userIdCode || 'N/A'}`; 
                localStorage.setItem('user_id_code', data.userIdCode); 
            }
            if (userInitialCircle && data.username) userInitialCircle.innerText = data.username.charAt(0).toUpperCase();

            if (totalBalanceDisplay) totalBalanceDisplay.innerText = `Kz ${parseFloat(data.balance || 0).toFixed(2)}`;
            if (investmentBalanceDisplay) investmentBalanceDisplay.innerText = `Kz ${parseFloat(data.balance_recharge || 0).toFixed(2)}`;
            if (withdrawableBalanceDisplay) withdrawableBalanceDisplay.innerText = `Kz ${parseFloat(data.balance_withdraw || 0).toFixed(2)}`;
        
            console.log("pageSpecific-dashboard.js: Dados do dashboard atualizados na UI.");
        } else {
            console.error('pageSpecific-dashboard.js: Erro do servidor ao carregar dados:', data);
            
            if (response.status === 401 || response.status === 403) {
                console.warn("⚠️ Autenticação falhou, redirecionando para Login...");
                localStorage.clear(); 
                window.location.href = '/Login.html'; // 🔥 redireciona direto
                return;
            }

            showMessage('Erro ao carregar dados do utilizador: ' + (data.message || 'Erro desconhecido.'), 2000);
        }
    } catch (error) {
        console.error('pageSpecific-dashboard.js: Erro na requisição de dados do utilizador (fetch):', error);
        showMessage('Não foi possível conectar ao servidor para obter os dados do utilizador.', 2000);
    } finally {
        showLoading(false);
        console.log("pageSpecific-dashboard.js: loadUserData finalizado.");
    }
}

    // Chama a função para carregar os dados do utilizador ao carregar a página
    await loadUserData();

    // ==========================================================
    // Lógica de Logout
    // ==========================================================
    setupLogoutButton('logout-button'); // Define o listener para o botão de logout
});
