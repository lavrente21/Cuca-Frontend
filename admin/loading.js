// loading.js
export function showLoading() {
    let loader = document.getElementById('global-loading');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'global-loading';
        loader.className = 'fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 hidden';
        loader.innerHTML = `
            <div class="bg-white p-6 rounded-lg flex items-center space-x-3 shadow-lg">
                <i class="fas fa-spinner fa-spin text-2xl"></i>
                <span>Processando...</span>
            </div>
        `;
        document.body.appendChild(loader);
    }
    loader.classList.remove('hidden');
}

export function hideLoading() {
    const loader = document.getElementById('global-loading');
    if (loader) loader.classList.add('hidden');
}
