// frontend/js/pageSpecific-pagina-inicial.js
// Lógica específica para a página inicial (Pagina inicial.html).

import { protectPage, setupLogoutButton } from './session.js'; // Corrigido para frontend/js
import { showMessage, showLoading } from './utils.js';         // Corrigido para frontend/js
import { API_BASE_URL } from './config.js';                   // Adicionada a API global

// Protege a página inicial - só pode ser acedida se estiver logado.
// Se não estiver logado, protectPage() irá redirecionar para Login.html.
protectPage();

document.addEventListener('DOMContentLoaded', async () => {
    showLoading(false); // Esconde o indicador de carregamento inicial

    const userToken = localStorage.getItem('userToken');
    const username = localStorage.getItem('username'); // Obtém o username do localStorage
    const userIdCode = localStorage.getItem('user_id_code'); // Obtém o user_id_code do localStorage

    if (!userToken || !username) {
        console.log("pageSpecific-pagina-inicial.js: Token ou Username ausente após protectPage. Isso não deveria acontecer.");
        return; // Sai da execução do script se o utilizador não estiver autenticado
    }

    // Atualiza o nome de utilizador e ID na interface
    const displayUsernameElement = document.querySelector('.user-info span');
    if (displayUsernameElement) {
        displayUsernameElement.innerText = username; 
    }

    // Caso precise puxar dados do dashboard do backend
    /*
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (response.ok) {
            console.log("Dados do dashboard carregados para a Página Inicial:", data);
            // Exemplo: document.getElementById('total-balance-homepage').innerText = `Kz ${data.balance.toFixed(2)}`;
        } else {
            console.error("Erro ao carregar dados do dashboard na Página Inicial:", data.message);
        }
    } catch (error) {
        console.error('Erro na requisição de dados do dashboard da Página Inicial:', error);
        showMessage('Não foi possível conectar ao servidor para obter os dados da página inicial.');
    } finally {
        showLoading(false);
    }
    */
});
