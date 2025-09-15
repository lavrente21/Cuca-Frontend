// curto-prazo.js
async function carregarPacotesCurtoPrazo() {
    try {
        const response = await fetch("https://cuca-project-5.onrender.com/api/packages", {
            headers: { "Accept": "application/json" }
        });

        if (!response.ok) {
            throw new Error("Falha ao buscar pacotes do servidor.");
        }

        const data = await response.json();

        const container = document.getElementById("packages");
        container.innerHTML = "";

        const pacotesCurto = data.curto || [];

        if (pacotesCurto.length === 0) {
            container.innerHTML = "<p>Nenhum pacote de curto prazo disponível no momento.</p>";
            return;
        }

        pacotesCurto.forEach(pkg => {
            const ganhoDiario = (parseFloat(pkg.min_investment) * (parseFloat(pkg.daily_return_rate) / 100)).toFixed(2);
            const receitaTotal = (ganhoDiario * parseInt(pkg.duration_days)).toFixed(2);

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
                const token = localStorage.getItem("userToken");
                if (!token) {
                    alert("Você precisa estar logado para investir.");
                    return;
                }

                const amount = pkg.min_investment;

                try {
                    // ✅ Verifica pacotes ativos do usuário
                    const verifyResponse = await fetch("https://cuca-project-5.onrender.com/api/user/active-packages", {
                        headers: { 
                            "Authorization": `Bearer ${token}`,
                            "Accept": "application/json"
                        }
                    });

                    if (!verifyResponse.ok) {
                        throw new Error("Erro ao verificar pacotes ativos.");
                    }

                    const activePackages = await verifyResponse.json();

                    const alreadyBought = activePackages.some(p => p.package_id === pkg.id && p.type === "curto");
                    if (alreadyBought) {
                        alert(`Você já comprou este pacote de curto prazo (${pkg.name}). Não é possível comprar novamente.`);
                        return;
                    }

                    // ✅ Faz o investimento
                    const investResponse = await fetch("https://cuca-project-5.onrender.com/api/invest", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({ packageId: pkg.id, amount })
                    });

                    const investData = await investResponse.json();
                    if (investResponse.ok) {
                        alert("✅ Investimento realizado com sucesso!");
                    } else {
                        alert(investData.message || "Erro ao criar investimento.");
                    }

                } catch (err) {
                    console.error("Erro ao investir:", err);
                    alert("Erro ao processar investimento.");
                }
            });
        });

    } catch (error) {
        console.error("Erro ao carregar pacotes:", error);
        const container = document.getElementById("packages");
        container.innerHTML = "<p>Erro ao carregar pacotes. Tente novamente mais tarde.</p>";
    }
}

document.addEventListener("DOMContentLoaded", carregarPacotesCurtoPrazo);
