// static/js/session-check.js
// Verifica e redireciona se o utilizador já estiver logado.
// Este script é projetado para ser carregado o mais cedo possível no HTML (<head> ou logo após <body>).

(function() {
    const userToken = localStorage.getItem('userToken');
    if (userToken) {
        // Se houver um token, redireciona imediatamente.
        // Isso minimiza qualquer renderização indesejada da página de login/registro.
        window.location.href = '/Pagina inicial.html';
    }
})();
