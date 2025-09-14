// static/js/lista-investimento-alto-auth.js
// Verifica se o utilizador está logado antes de carregar o conteúdo da página
document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    if (!username) {
        // Se não estiver logado, redireciona para a página de login
        window.location.href = '/login.html'; // Caminho corrigido
    }
});
