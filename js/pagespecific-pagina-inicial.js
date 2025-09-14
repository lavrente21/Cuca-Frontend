// frontend/js/pageSpecific-pagina-inicial.js
// Lógica específica para a página inicial

import { showMessage, showLoading, hideModal, showModal } from './utils.js';
import { protectPage } from './session.js';
import { API_BASE_URL } from './config.js'; // Importa a URL base da API

protectPage();

document.addEventListener('DOMContentLoaded', () => {
    // Adiciona o event listener para os botões de investimento
    const investButtons = document.querySelectorAll('.invest-button');
    const modal = document.getElementById('investimento-modal');
    const modalTitle = document.getElementById('investimento-modal-title');
    const modalDetails = document.getElementById('investimento-modal-details');
    const modalBackdrop = document.getElementById('modal-backdrop');

    investButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // Previne a navegação padrão do link
            event.preventDefault();

            // Encontra o card do produto pai
            const productCard = event.target.closest('.product-card');

            // Extrai os dados do produto do DOM
            const title = productCard.querySelector('h3').textContent;
            const price = productCard.querySelector('.product-details p:nth-child(1) .value').textContent;
            const yieldDays = productCard.querySelector('.product-details p:nth-child(2) .value').textContent;
            const dailyEarnings = productCard.querySelector('.product-details p:nth-child(3) .value').textContent;
            const totalRevenue = productCard.querySelector('.product-details p:nth-child(4) .value').textContent;
            
            // Preenche o modal com os dados
            modalTitle.textContent = title;
            modalDetails.innerHTML = `
                <p>Preço: <span>${price}</span></p>
                <p>Rendimento: <span>${yieldDays}</span></p>
                <p>Ganhos diários: <span>${dailyEarnings}</span></p>
                <p>Receita total: <span>${totalRevenue}</span></p>
            `;

            // Exibe o modal e o backdrop
            showModal('investimento-modal');
        });
    });

    // Evento para fechar o modal clicando no backdrop
    modalBackdrop.addEventListener('click', () => {
        hideModal('investimento-modal');
    });

    // Evento para fechar o modal clicando no botão de fechar
    const closeButton = modal.querySelector('.close-button');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            hideModal('investimento-modal');
        });
    }
});
