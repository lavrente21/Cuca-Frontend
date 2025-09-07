// frontend/js/utils.js

/**
 * Exibe uma mensagem modal centrada que desaparece automaticamente.
 * @param {string} text O texto da mensagem a ser exibida.
 * @param {boolean} isError Se true, exibe a mensagem como erro.
 * @param {number} duration A duração em milissegundos (padrão: 3000ms).
 */
let messageTimeout; // evita múltiplos setTimeout concorrentes

export function showMessage(text, isError = false, duration = 3000) {
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');
    const modalBackdrop = document.getElementById('modal-backdrop');

    if (messageBox && messageText && modalBackdrop) {
        // limpa timeout anterior se existir
        if (messageTimeout) clearTimeout(messageTimeout);

        messageText.innerText = text;
        messageBox.style.display = 'flex';
        modalBackdrop.style.display = 'block';

        // Reseta classes antes de aplicar
        messageBox.classList.remove('error', 'success');
        messageBox.classList.add(isError ? 'error' : 'success');

        // Esconde após o tempo definido
        messageTimeout = setTimeout(() => {
            messageBox.style.display = 'none';
            modalBackdrop.style.display = 'none';
            messageBox.classList.remove('error', 'success');
        }, duration);
    } else {
        console.warn("utils.js: Elementos (message-box, message-text, modal-backdrop) não encontrados no HTML.");
    }
}

/**
 * Exibe ou oculta um indicador de carregamento de ecrã inteiro.
 * @param {boolean} show Se true, exibe; se false, oculta.
 */
export function showLoading(show) {
    const loadingIndicator = document.getElementById('loading-indicator');
    const modalBackdrop = document.getElementById('modal-backdrop');

    if (loadingIndicator && modalBackdrop) {
        loadingIndicator.style.display = show ? 'flex' : 'none';
        modalBackdrop.style.display = show ? 'block' : 'none';
    } else {
        console.warn("utils.js: Elementos (loading-indicator, modal-backdrop) não encontrados no HTML.");
    }
}
