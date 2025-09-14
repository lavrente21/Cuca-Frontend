// frontend/js/pageSpecific-registro.js
// Lógica específica para a página de registo (Registro.html)

import { showMessage, showLoading } from './utils.js';
import { redirectIfLoggedIn } from './session.js';
import { API_BASE_URL } from './config.js';

console.log("pageSpecific-registro.js: Script a ser carregado.");

// Redireciona para a página inicial se o utilizador já estiver logado
redirectIfLoggedIn();

document.addEventListener('DOMContentLoaded', () => {
    console.log("pageSpecific-registro.js: DOMContentLoaded disparado.");

    // Obtém o código de convite da URL
    const urlParams = new URLSearchParams(window.location.search);
    const invitationCode = urlParams.get('invitation_code');
    console.log("pageSpecific-registro.js: Código de convite da URL:", invitationCode);

    // Preenche o campo oculto de convite, se existir
    const invitationCodeField = document.getElementById('invitation-code');
    if (invitationCodeField && invitationCode) {
        invitationCodeField.value = invitationCode;
        invitationCodeField.type = 'text';
        invitationCodeField.readOnly = true;
        invitationCodeField.placeholder = "Código de convite";
        console.log("pageSpecific-registro.js: Campo preenchido com o código de convite.");
    }

    const registerForm = document.getElementById('register-form');
    const registerButton = document.getElementById('register-btn');

    if (registerForm && registerButton) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            console.log("pageSpecific-registro.js: Evento 'submit' disparado.");

            showLoading(true);

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const transactionPassword = document.getElementById('transaction-password').value;

            // Garante que o código de convite seja enviado
            const referralCodeToSend = invitationCodeField && invitationCodeField.value
    ? invitationCodeField.value
    : invitationCode || null;


            if (!username || !password || !transactionPassword) {
                showMessage('Por favor, preencha todos os campos.', true);
                showLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        username, 
                        password, 
                        transactionPassword, 
                        referralCode: referralCodeToSend   // 🔑 agora bate com o backend
                    })
                });

                const data = await response.json();
                console.log("pageSpecific-registro.js: Resposta do backend:", response.status, data);

                if (response.ok) {
                    showMessage('Cadastro realizado com sucesso! Redirecionando para o login...', false, 2000);
                    setTimeout(() => {
                        window.location.href = 'Login.html';
                    }, 2000);
                } else {
                    console.error("pageSpecific-registro.js: Erro do backend:", data.message || "Erro desconhecido.");
                    showMessage(data.message || 'Erro no cadastro. Tente novamente.', true, 2000);
                }
            } catch (error) {
                console.error('pageSpecific-registro.js: Erro de rede ou servidor:', error);
                showMessage('Não foi possível conectar ao servidor. Verifique a sua conexão ou tente novamente mais tarde.', true, 3000);
            } finally {
                showLoading(false);
                console.log("pageSpecific-registro.js: Processo de registo finalizado.");
            }
        });
    } else {
        console.error("pageSpecific-registro.js: Formulário ou botão de registo não encontrados.");
    }
});
