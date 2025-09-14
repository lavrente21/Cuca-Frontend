async function carregarPacotesLongo() {
    try {
        const response = await fetch("https://cuca-project-5.onrender.com/api/packages");
        const data = await response.json();

        const container = document.getElementById("packages");
        container.innerHTML = "";

        // Verifica se há pacotes de longo prazo
        if (!data.longo || data.longo.length === 0) {
            container.innerHTML = "<p>Nenhum pacote de longo prazo disponível.</p>";
            return;
        }

        data.longo.forEach(pkg => {
            const ganhoDiario = (pkg.min_investment * pkg.daily_return_rate / 100).toFixed(2); // Ajusta percentagem
            const receitaTotal = (ganhoDiario * pkg.duration_days).toFixed(2);

            const card = document.createElement("div");
            card.className = "product-card product-cuca";

            card.innerHTML = `
                <div class="product-header">
                    <div class="cuca-logo-placeholder">
                        <img src="/assets/logo.png.png" alt="cuca-logo-svg" height="100px" width="120px">
                    </div>
                </div>
                <div class="product-body">
                    <h3>${pkg.name}</h3>
                    <div class="product-details">
                        <p>Preço: <span class="value">Kz ${pkg.min_investment}</span></p>
                        <p>Duração: <span class="value">${pkg.duration_days} Dias</span></p>
                        <p>Ganhos diários: <span class="value">Kz ${ganhoDiario}</span></p>
                        <p>Receita total: <span class="value">Kz ${receitaTotal}</span></p> 
                    </div>
                </div>
                <button class="invest-button">Investir Agora</button> 
            `;

            container.appendChild(card);
            container.appendChild(document.createElement("br"));

            const button = card.querySelector(".invest-button");
            button.addEventListener("click", async () => {
                const amount = pkg.min_investment;
                try {
                    const token = localStorage.getItem("userToken");
                    const investResponse = await fetch("https://cuca-project-5.onrender.com/api/invest", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            packageId: pkg.id,
                            amount: amount
                        })
                    });

                    const investData = await investResponse.json();

                    if (investResponse.ok) {
                        alert("Investimento realizado com sucesso!");
                    } else {
                        alert("Saldo de Recarga Insuficiente");
                    }
                } catch (err) {
                    console.error(err);
                    alert("Erro ao processar investimento.");
                }
            });
        });

    } catch (error) {
        console.error("Erro ao carregar pacotes:", error);
        container.innerHTML = "<p>Erro ao carregar pacotes. Tente novamente mais tarde.</p>";
    }
}

document.addEventListener("DOMContentLoaded", carregarPacotesLongo);
