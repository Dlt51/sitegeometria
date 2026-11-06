// ============================================================
// MAPA ACESSÍVEL — ESTÁCIO NITERÓI
// Projeto de Geometria Analítica e Álgebra Linear
// ============================================================

// 1. CONFIGURAÇÃO DO MAPA
const mapa = L.map("mapa").setView([-22.89515, -43.12000], 18);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 21
}).addTo(mapa);


// 2. MEDIDAS INFORMADAS DOS PERCURSOS
const distanciasPercursos = {
    escadaria: 34.78,
    rampa: 76.62
};


// 3. PONTOS CADASTRADOS
// Os pontos finais permanecem sem coordenadas até serem identificados.
const pontos = [
    {
        id: 1,
        nome: "Entrada 1 — início da escadaria",
        latitude: -22.895081801034696,
        longitude: -43.120430484046075,
        tipo: "Entrada / Escadaria",
        acesso: "escadaria",
        posicao: "início",
        descricao: "Entrada identificada junto ao início da escadaria.",
        acessibilidade: "A presença de degraus pode representar uma barreira para pessoas que utilizam cadeira de rodas ou possuem mobilidade reduzida."
    },
    {
        id: 2,
        nome: "Final da escadaria",
        latitude: null,
        longitude: null,
        tipo: "Escadaria",
        acesso: "escadaria",
        posicao: "final",
        descricao: "Ponto final da escadaria. As coordenadas exatas ainda precisam ser registradas.",
        acessibilidade: "O comprimento informado para o percurso é de 34,78 metros."
    },
    {
        id: 3,
        nome: "Entrada 2 — início da rampa pela garagem",
        latitude: -22.895210286844318,
        longitude: -43.11946854251045,
        tipo: "Entrada / Rampa",
        acesso: "rampa",
        posicao: "início",
        descricao: "Entrada identificada junto ao início da rampa de acesso pela garagem.",
        acessibilidade: "A inclinação, a largura e as condições do piso precisam ser avaliadas para verificar a acessibilidade."
    },
    {
        id: 4,
        nome: "Final da rampa",
        latitude: null,
        longitude: null,
        tipo: "Rampa",
        acesso: "rampa",
        posicao: "final",
        descricao: "Ponto final da rampa. As coordenadas exatas ainda precisam ser registradas.",
        acessibilidade: "O comprimento informado para o percurso é de 76,62 metros."
    }
];


// 4. ELEMENTOS DO HTML
const campoOrigem = document.getElementById("origem");
const campoDestino = document.getElementById("destino");
const botaoBuscarRota = document.getElementById("buscarRota");
const elementoResultado = document.getElementById("resultado");
const listaObstaculos = document.getElementById("listaObstaculos");
const listaSolucoes = document.getElementById("listaSolucoes");


// 5. FUNÇÕES AUXILIARES
function temCoordenadas(ponto) {
    return ponto &&
        Number.isFinite(ponto.latitude) &&
        Number.isFinite(ponto.longitude);
}

function formatarMetros(valor) {
    if (!Number.isFinite(valor)) return "Não disponível";

    return valor.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + " m";
}

function formatarCoordenada(valor) {
    return Number.isFinite(valor) ? valor.toFixed(8) : "Não disponível";
}

function formatarNumero(valor) {
    return valor.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function obterDistanciaPercurso(acesso) {
    return distanciasPercursos[acesso] ?? null;
}

function escaparHTML(texto) {
    return String(texto).replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caractere]);
}


// 6. ÍCONES PERSONALIZADOS
// Escadaria: azul.
// Rampa: verde.
// Ponto A: roxo.
// Ponto B: laranja.
function criarIconePersonalizado(simbolo, classe, descricao) {
    let corFundo = "#475569";
    let corBorda = "#334155";

    if (classe === "icone-escadaria") {
        corFundo = "#2563eb";
        corBorda = "#1d4ed8";
    } else if (classe === "icone-rampa") {
        corFundo = "#22c55e";
        corBorda = "#15803d";
    } else if (classe === "icone-ponto-a") {
        corFundo = "#9333ea";
        corBorda = "#7e22ce";
    } else if (classe === "icone-ponto-b") {
        corFundo = "#f97316";
        corBorda = "#c2410c";
    }

    return L.divIcon({
        className: "marcador-personalizado",
        html: `
            <div
                class="icone-mapa ${classe}"
                title="${escaparHTML(descricao)}"
                role="img"
                aria-label="${escaparHTML(descricao)}"
                style="
                    background-color: ${corFundo};
                    border: 3px solid ${corBorda};
                    color: #ffffff;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 16px;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
                    box-sizing: border-box;
                "
            >
                <span>${simbolo}</span>
            </div>
        `,
        iconSize: [36, 42],
        iconAnchor: [18, 38],
        popupAnchor: [0, -36]
    });
}


// SINALIZAÇÃO FIXA DAS DUAS ENTRADAS DA FACULDADE
// Estes marcadores não são removidos ao desfazer A ou B.
const iconeEscadaria = criarIconePersonalizado(
    "1",
    "icone-escadaria",
    "Entrada 1 — escadaria"
);

const iconeRampa = criarIconePersonalizado(
    "2",
    "icone-rampa",
    "Entrada 2 — rampa pela garagem"
);

const iconePontoA = criarIconePersonalizado(
    "A",
    "icone-ponto-a",
    "Ponto A selecionado"
);

const iconePontoB = criarIconePersonalizado(
    "B",
    "icone-ponto-b",
    "Ponto B selecionado"
);


// 7. INFORMAÇÕES E FOTOGRAFIAS DOS ACESSOS
const informacoesAcessos = {
    escadaria: {
        titulo: "Escadaria de acesso",
        imagem: "imagens/escadaria.png",
        distancia: distanciasPercursos.escadaria,
        descricao: "O percurso apresenta degraus que podem representar uma barreira para pessoas que utilizam cadeira de rodas ou possuem mobilidade reduzida.",
        avaliacao: "É necessário verificar a existência de uma rota alternativa acessível, segura e adequada às necessidades dos usuários.",
        observacao: "O comprimento informado para o percurso é de 34,78 metros. Essa medida não corresponde necessariamente à distância em linha reta."
    },
    rampa: {
        titulo: "Rampa de acesso",
        imagem: "imagens/rampa.png",
        distancia: distanciasPercursos.rampa,
        descricao: "A rampa possui um percurso de extensão considerável. Suas condições precisam ser avaliadas para verificar a segurança e a acessibilidade.",
        avaliacao: "É necessário avaliar presencialmente a inclinação, a largura, as condições do piso e a existência de patamares.",
        observacao: "A inclinação exata ainda não foi medida. Para calculá-la, precisamos do desnível vertical e da projeção horizontal."
    }
};


// 8. GEOMETRIA ANALÍTICA — VETOR ENTRE DOIS PONTOS
function calcularVetor(origem, destino) {
    if (!temCoordenadas(origem) || !temCoordenadas(destino)) {
        return null;
    }

    const raioTerra = 6371000;
    const radianos = valor => valor * Math.PI / 180;

    const latitude1 = radianos(origem.latitude);
    const latitude2 = radianos(destino.latitude);
    const longitude1 = radianos(origem.longitude);
    const longitude2 = radianos(destino.longitude);

    const diferencaLatitude = latitude2 - latitude1;
    const diferencaLongitude = longitude2 - longitude1;
    const latitudeMedia = (latitude1 + latitude2) / 2;

    const x = raioTerra *
        Math.cos(latitudeMedia) *
        diferencaLongitude;

    const y = raioTerra * diferencaLatitude;
    const modulo = Math.sqrt(x ** 2 + y ** 2);

    return { x, y, modulo };
}


// 9. DISTÂNCIA GEOGRÁFICA — FÓRMULA DE HAVERSINE
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const raioTerra = 6371000;
    const radianos = valor => valor * Math.PI / 180;

    const latitude1 = radianos(lat1);
    const latitude2 = radianos(lat2);
    const diferencaLatitude = latitude2 - latitude1;
    const diferencaLongitude = radianos(lon2 - lon1);

    const a =
        Math.sin(diferencaLatitude / 2) ** 2 +
        Math.cos(latitude1) *
        Math.cos(latitude2) *
        Math.sin(diferencaLongitude / 2) ** 2;

    return raioTerra *
        2 *
        Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calcularDadosGeometricos(origem, destino) {
    const vetor = calcularVetor(origem, destino);

    if (!vetor) return null;

    return {
        vetor,
        distanciaGeografica: calcularDistancia(
            origem.latitude,
            origem.longitude,
            destino.latitude,
            destino.longitude
        )
    };
}


// 10. PAINEL DE GEOMETRIA ANALÍTICA
// Não desenha uma linha automática entre os marcadores fixos.
const inicioEscadaria = pontos.find(ponto => ponto.id === 1);
const inicioRampa = pontos.find(ponto => ponto.id === 3);

function mostrarPainelGeometria() {
    if (!elementoResultado) return;

    const dados = calcularDadosGeometricos(
        inicioEscadaria,
        inicioRampa
    );

    if (!dados) return;

    const vetor = dados.vetor;

    const diferencaPercursos =
        distanciasPercursos.rampa -
        distanciasPercursos.escadaria;

    elementoResultado.innerHTML = `
        <div class="painel-geometria">
            <h2>Geometria Analítica aplicada ao mapa</h2>

            <p>
                Este painel apresenta o deslocamento aproximado entre
                as coordenadas cadastradas para o início da escadaria
                e o início da rampa. Os sinalizadores identificam os
                pontos, sem desenhar uma linha entre as entradas.
            </p>

            <hr>

            <h3>1. Coordenadas dos pontos</h3>

            <p>
                <strong>Ponto A — Entrada 1 / escadaria</strong><br>
                Latitude: ${formatarCoordenada(inicioEscadaria.latitude)}<br>
                Longitude: ${formatarCoordenada(inicioEscadaria.longitude)}
            </p>

            <p>
                <strong>Ponto B — Entrada 2 / rampa</strong><br>
                Latitude: ${formatarCoordenada(inicioRampa.latitude)}<br>
                Longitude: ${formatarCoordenada(inicioRampa.longitude)}
            </p>

            <hr>

            <h3>2. Componentes do vetor</h3>

            <p>
                As coordenadas geográficas foram convertidas em
                deslocamentos locais aproximados, expressos em metros.
            </p>

            <div style="background:#f3e8ff;padding:16px;border-radius:10px;margin:14px 0;">
                <p>
                    <strong>Componente X — Leste/Oeste:</strong><br>
                    ${formatarMetros(vetor.x)}
                </p>

                <p>
                    <strong>Componente Y — Norte/Sul:</strong><br>
                    ${formatarMetros(vetor.y)}
                </p>

                <p>
                    <strong>Vetor de deslocamento:</strong><br>
                    v ≈ (${formatarNumero(vetor.x)}; ${formatarNumero(vetor.y)}) m
                </p>
            </div>

            <p>
                ${vetor.x >= 0
                    ? "O componente X indica deslocamento para leste."
                    : "O componente X indica deslocamento para oeste."}

                ${vetor.y >= 0
                    ? "O componente Y indica deslocamento para norte."
                    : "O componente Y indica deslocamento para sul."}
            </p>

            <hr>

            <h3>3. Cálculo do módulo do vetor</h3>

            <p style="background:#f8fafc;padding:14px;border-radius:8px;text-align:center;font-size:19px;">
                |v| = √(x² + y²)
            </p>

            <p>
                <strong>Módulo aproximado:</strong><br>
                ${formatarMetros(vetor.modulo)}
            </p>

            <p>
                <strong>Distância geográfica aproximada:</strong><br>
                ${formatarMetros(dados.distanciaGeografica)}
            </p>

            <p style="font-size:13px;color:#555;">
                O módulo do vetor usa uma aproximação local em metros.
                A distância geográfica utiliza a fórmula de Haversine;
                pequenas diferenças numéricas entre os resultados são esperadas.
            </p>

            <hr>

            <h3>4. Comparação dos percursos informados</h3>

            <p>
                <strong>Escadaria:</strong><br>
                ${formatarMetros(distanciasPercursos.escadaria)}
            </p>

            <p>
                <strong>Rampa:</strong><br>
                ${formatarMetros(distanciasPercursos.rampa)}
            </p>

            <p>
                <strong>Diferença entre os comprimentos:</strong><br>
                ${formatarMetros(diferencaPercursos)}
            </p>

            <p>
                A diferença entre os comprimentos informados compara
                os dois percursos. Ela não representa a distância
                entre os pontos iniciais.
            </p>

            <hr>

            <h3>5. Aplicação no projeto</h3>

            <p>
                O mapa utiliza coordenadas geográficas para localizar
                pontos e aplica conceitos de Geometria Analítica para
                calcular deslocamentos, representar vetores e comparar distâncias.
            </p>

            <div style="background:#fff8eb;padding:14px;border-left:4px solid #d97706;border-radius:6px;margin-top:14px;">
                <strong>Limitação do levantamento</strong>
                <p>
                    As coordenadas finais da escadaria e da rampa ainda
                    não foram registradas. Por isso, não é possível
                    calcular a distância em linha reta entre o início
                    e o final de cada percurso.
                </p>
            </div>
        </div>
    `;
}


// 11. EXIBIR RESULTADO DE UM PERCURSO
function mostrarResultadoAcesso(acesso, origem, destino) {
    const informacao = informacoesAcessos[acesso];

    if (!informacao || !elementoResultado) return;

    elementoResultado.innerHTML = `
        <div class="resultado-acessibilidade">
            <h3>Resultado do percurso: ${informacao.titulo}</h3>

            <p>
                <strong>Origem:</strong><br>
                ${escaparHTML(origem.nome)}
            </p>

            <p>
                <strong>Destino:</strong><br>
                ${escaparHTML(destino.nome)}
            </p>

            <div style="margin:18px 0;padding:18px;background:#eaf2f8;border-radius:8px;">
                <p style="margin:0 0 5px;">
                    <strong>Comprimento informado do percurso</strong>
                </p>

                <p style="margin:0;font-size:26px;font-weight:bold;color:#173f5f;">
                    ${formatarMetros(informacao.distancia)}
                </p>
            </div>

            <h3>Registro fotográfico</h3>

            <img
                src="${informacao.imagem}"
                alt="${informacao.titulo}"
                style="display:block;width:100%;max-width:600px;max-height:400px;object-fit:contain;margin:15px auto;border-radius:8px;background:#e5e7eb;"
                onerror="this.style.display='none';this.nextElementSibling.style.display='block';"
            >

            <p style="display:none;padding:12px;background:#fff8eb;border-radius:5px;">
                A fotografia não foi encontrada. Confira o arquivo:
                <strong>${informacao.imagem}</strong>
            </p>

            <h3>Análise de acessibilidade</h3>

            <p>${informacao.descricao}</p>

            <p>
                <strong>Aspectos a avaliar:</strong><br>
                ${informacao.avaliacao}
            </p>

            <p style="padding:12px;background:#f8fafc;border-left:4px solid #d97706;border-radius:5px;">
                ${informacao.observacao}
            </p>

            <p style="font-size:13px;color:#555;">
                O valor apresentado corresponde ao comprimento informado
                para o percurso completo. As coordenadas finais ainda
                precisam ser registradas.
            </p>

            <button type="button" id="voltar-geometria" style="padding:10px;cursor:pointer;">
                Voltar à análise matemática
            </button>
        </div>
    `;

    elementoResultado.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}


// 12. MARCADORES FIXOS E POPUPS
const marcadores = [];

function criarPopupPonto(ponto) {
    const distanciaPercurso = obterDistanciaPercurso(ponto.acesso);

    const informacaoDistancia = distanciaPercurso !== null
        ? `
            <hr>
            <p>
                <strong>Comprimento informado do percurso:</strong><br>
                ${formatarMetros(distanciaPercurso)}
            </p>
        `
        : "";

    return `
        <div class="popup-mapa" style="min-width:240px;">
            <h3>${escaparHTML(ponto.nome)}</h3>

            <p>
                <strong>Tipo:</strong>
                ${escaparHTML(ponto.tipo)}
            </p>

            <p>${escaparHTML(ponto.descricao)}</p>

            <p>
                <strong>Acessibilidade:</strong><br>
                ${escaparHTML(ponto.acessibilidade)}
            </p>

            ${informacaoDistancia}

            <p>
                <strong>Latitude:</strong><br>
                ${formatarCoordenada(ponto.latitude)}
            </p>

            <p>
                <strong>Longitude:</strong><br>
                ${formatarCoordenada(ponto.longitude)}
            </p>

            <hr>

            <p><strong>Utilizar este ponto no cálculo:</strong></p>

            <button
                type="button"
                class="selecionar-cadastrado"
                data-id="${ponto.id}"
                data-papel="A"
                style="width:100%;padding:9px;margin-bottom:6px;cursor:pointer;"
            >
                Definir como ponto A
            </button>

            <button
                type="button"
                class="selecionar-cadastrado"
                data-id="${ponto.id}"
                data-papel="B"
                style="width:100%;padding:9px;cursor:pointer;"
            >
                Definir como ponto B
            </button>
        </div>
    `;
}


// Criar e manter os dois marcadores fixos das entradas.
// As etiquetas permanecem visíveis mesmo quando os popups são fechados.
pontos.forEach(ponto => {
    if (!temCoordenadas(ponto)) return;

    const icone = ponto.acesso === "escadaria"
        ? iconeEscadaria
        : iconeRampa;

    const marcador = L.marker(
        [ponto.latitude, ponto.longitude],
        {
            icon: icone,
            title: ponto.nome,
            alt: ponto.nome,
            zIndexOffset: 500
        }
    ).addTo(mapa);

    marcador.bindPopup(criarPopupPonto(ponto));

    marcador.bindTooltip(
        ponto.acesso === "escadaria"
            ? "🔵 Entrada da faculdade — Escadaria"
            : "🟢 Entrada da faculdade — Rampa pela garagem",
        {
            permanent: true,
            direction: "top",
            offset: [0, -30],
            opacity: 1,
            interactive: false,
            className: "etiqueta-entrada-faculdade"
        }
    );

    marcadores.push(marcador);
});

if (marcadores.length > 0) {
    mapa.fitBounds(
        L.featureGroup(marcadores).getBounds(),
        {
            padding: [45, 45],
            maxZoom: 19
        }
    );
}


// 13. SELEÇÃO DOS PONTOS A E B
let pontoASelecionado = null;
let pontoBSelecionado = null;

let marcadorASelecionado = null;
let marcadorBSelecionado = null;

let linhaEntreSelecionados = null;

// Guarda temporariamente a escolha enquanto o usuário confirma ou cancela.
let selecaoPendente = null;


function limparMarcadorSelecao(papel) {
    if (papel === "A" && marcadorASelecionado) {
        mapa.removeLayer(marcadorASelecionado);
        marcadorASelecionado = null;
    }

    if (papel === "B" && marcadorBSelecionado) {
        mapa.removeLayer(marcadorBSelecionado);
        marcadorBSelecionado = null;
    }
}

function limparLinhaSelecao() {
    if (linhaEntreSelecionados) {
        mapa.removeLayer(linhaEntreSelecionados);
        linhaEntreSelecionados = null;
    }
}

function definirPontoSelecao(papel, ponto) {
    if (!temCoordenadas(ponto)) {
        alert("Este ponto ainda não possui coordenadas registradas.");
        return;
    }

    limparMarcadorSelecao(papel);
    limparLinhaSelecao();

    const pontoFormatado = {
        latitude: ponto.latitude,
        longitude: ponto.longitude,
        nome: ponto.nome || "Local escolhido no mapa"
    };

    if (papel === "A") {
        pontoASelecionado = pontoFormatado;

        marcadorASelecionado = L.marker(
            [ponto.latitude, ponto.longitude],
            {
                icon: iconePontoA,
                title: "Ponto A selecionado",
                alt: "Ponto A selecionado",
                zIndexOffset: 1000
            }
        ).addTo(mapa);

        marcadorASelecionado.bindTooltip(
            `A — ${escaparHTML(pontoFormatado.nome)}`,
            {
                direction: "top",
                offset: [0, -12]
            }
        );

        configurarCliqueParaDesfazer(
            marcadorASelecionado,
            "A"
        );

    } else if (papel === "B") {
        pontoBSelecionado = pontoFormatado;

        marcadorBSelecionado = L.marker(
            [ponto.latitude, ponto.longitude],
            {
                icon: iconePontoB,
                title: "Ponto B selecionado",
                alt: "Ponto B selecionado",
                zIndexOffset: 1000
            }
        ).addTo(mapa);

        marcadorBSelecionado.bindTooltip(
            `B — ${escaparHTML(pontoFormatado.nome)}`,
            {
                direction: "top",
                offset: [0, -12]
            }
        );

        configurarCliqueParaDesfazer(
            marcadorBSelecionado,
            "B"
        );
    }

    if (pontoASelecionado && pontoBSelecionado) {
        calcularPontosSelecionados();
    } else {
        mostrarOrientacaoSelecao();
    }
}


// 14. CONFIRMAÇÃO ANTES DE DEFINIR OS PONTOS A E B
function pedirConfirmacaoSelecao(papel, ponto, latlng) {
    if (!temCoordenadas(ponto)) {
        alert("Este ponto ainda não possui coordenadas válidas.");
        return;
    }

    selecaoPendente = {
        papel,
        ponto
    };

    const posicao = latlng || L.latLng(
        ponto.latitude,
        ponto.longitude
    );

    const nomePonto = escaparHTML(
        ponto.nome || "Local escolhido no mapa"
    );

    L.popup({
        closeButton: true,
        autoClose: true,
        closeOnClick: false,
        maxWidth: 280
    })
        .setLatLng(posicao)
        .setContent(`
            <div style="min-width:210px;text-align:center;">
                <h3 style="margin:0 0 8px;">
                    Confirmar ponto ${papel}
                </h3>

                <p style="margin:0 0 10px;">
                    Você realmente deseja definir este local como ponto ${papel}?
                </p>

                <p style="font-size:13px;margin:0 0 12px;">
                    <strong>${nomePonto}</strong><br>
                    ${formatarCoordenada(ponto.latitude)},
                    ${formatarCoordenada(ponto.longitude)}
                </p>

                <button
                    type="button"
                    class="confirmar-selecao"
                    data-papel="${papel}"
                    style="padding:9px 12px;border:0;border-radius:5px;background:#0f766e;color:#fff;cursor:pointer;margin-right:6px;"
                >
                    Confirmar
                </button>

                <button
                    type="button"
                    class="cancelar-selecao"
                    style="padding:9px 12px;border:1px solid #cbd5e1;border-radius:5px;background:#fff;cursor:pointer;"
                >
                    Cancelar
                </button>
            </div>
        `)
        .openOn(mapa);
}

function confirmarSelecaoPendente(papel) {
    if (!selecaoPendente || selecaoPendente.papel !== papel) {
        return;
    }

    const ponto = selecaoPendente.ponto;
    selecaoPendente = null;

    mapa.closePopup();

    // Se A e B já estavam preenchidos, começar uma nova seleção.
    if (pontoASelecionado && pontoBSelecionado) {
        limparSelecaoCompleta();
        papel = "A";
    }

    definirPontoSelecao(papel, ponto);
}


// Ao clicar no mapa, mostrar a confirmação antes de selecionar o ponto.
mapa.on("click", function(evento) {
    const papel = !pontoASelecionado
        ? "A"
        : (!pontoBSelecionado ? "B" : "A");

    const novoPonto = {
        latitude: evento.latlng.lat,
        longitude: evento.latlng.lng,
        nome: "Local escolhido no mapa"
    };

    pedirConfirmacaoSelecao(
        papel,
        novoPonto,
        evento.latlng
    );
});


// 15. PAINEL DE ORIENTAÇÃO DA SELEÇÃO
function mostrarOrientacaoSelecao() {
    if (!elementoResultado) return;

    elementoResultado.innerHTML = `
        <div class="painel-selecao">
            <h3>Seleção de pontos no mapa</h3>

            <p>
                Clique em dois locais do mapa para calcular a distância
                em linha reta e o vetor entre eles. A seleção só será
                realizada depois da confirmação.
            </p>

            <div style="padding:14px;background:#f8fafc;border-radius:8px;margin:12px 0;">
                <p>
                    <strong>Ponto A:</strong><br>
                    ${pontoASelecionado
                        ? `${escaparHTML(pontoASelecionado.nome)}<br>${formatarCoordenada(pontoASelecionado.latitude)}, ${formatarCoordenada(pontoASelecionado.longitude)}`
                        : "Aguardando seleção no mapa"}
                </p>

                <p>
                    <strong>Ponto B:</strong><br>
                    ${pontoBSelecionado
                        ? `${escaparHTML(pontoBSelecionado.nome)}<br>${formatarCoordenada(pontoBSelecionado.latitude)}, ${formatarCoordenada(pontoBSelecionado.longitude)}`
                        : "Aguardando seleção no mapa"}
                </p>
            </div>

            <p>
                ${pontoASelecionado && !pontoBSelecionado
                    ? "Agora clique no mapa para definir o ponto B."
                    : "Clique no mapa para definir o ponto A."}
            </p>

            <button
                type="button"
                id="novo-calculo"
                style="padding:10px;cursor:pointer;"
            >
                Reiniciar seleção
            </button>
        </div>
    `;
}


// 16. CALCULAR DISTÂNCIA E VETOR ENTRE A E B
function calcularPontosSelecionados() {
    if (
        !pontoASelecionado ||
        !pontoBSelecionado ||
        !elementoResultado
    ) {
        return;
    }

    limparLinhaSelecao();

    const dados = calcularDadosGeometricos(
        pontoASelecionado,
        pontoBSelecionado
    );

    if (!dados) return;

    const vetor = dados.vetor;

    // A linha só é desenhada entre os pontos A e B escolhidos pelo usuário.
    // Os marcadores fixos das entradas continuam sem ligação automática.
    linhaEntreSelecionados = L.polyline(
        [
            [
                pontoASelecionado.latitude,
                pontoASelecionado.longitude
            ],
            [
                pontoBSelecionado.latitude,
                pontoBSelecionado.longitude
            ]
        ],
        {
            color: "#0f766e",
            weight: 4,
            dashArray: "6, 6",
            opacity: 0.95
        }
    ).addTo(mapa);

    linhaEntreSelecionados.bindTooltip(
        `Distância aproximada: ${formatarMetros(dados.distanciaGeografica)}`,
        { sticky: true }
    );

    elementoResultado.innerHTML = `
        <div class="resultado-geometria">
            <h3>Resultado do cálculo entre A e B</h3>

            <p>
                A linha verde tracejada representa o deslocamento
                em linha reta entre os dois pontos selecionados manualmente.
            </p>

            <hr>

            <h3>1. Coordenadas dos pontos</h3>

            <p>
                <strong>Ponto A:</strong><br>
                ${escaparHTML(pontoASelecionado.nome)}<br>
                Latitude: ${formatarCoordenada(pontoASelecionado.latitude)}<br>
                Longitude: ${formatarCoordenada(pontoASelecionado.longitude)}
            </p>

            <p>
                <strong>Ponto B:</strong><br>
                ${escaparHTML(pontoBSelecionado.nome)}<br>
                Latitude: ${formatarCoordenada(pontoBSelecionado.latitude)}<br>
                Longitude: ${formatarCoordenada(pontoBSelecionado.longitude)}
            </p>

            <hr>

            <h3>2. Distância em linha reta</h3>

            <p style="font-size:26px;font-weight:bold;color:#0f766e;">
                ${formatarMetros(dados.distanciaGeografica)}
            </p>

            <p>
                O resultado foi obtido com a fórmula de Haversine,
                que estima a distância sobre a superfície terrestre.
            </p>

            <hr>

            <h3>3. Componentes do vetor</h3>

            <p>
                <strong>Componente X — Leste/Oeste:</strong><br>
                ${formatarMetros(vetor.x)}
            </p>

            <p>
                <strong>Componente Y — Norte/Sul:</strong><br>
                ${formatarMetros(vetor.y)}
            </p>

            <p>
                <strong>Vetor de deslocamento:</strong><br>
                v ≈ (${formatarNumero(vetor.x)}; ${formatarNumero(vetor.y)}) m
            </p>

            <hr>

            <h3>4. Cálculo do módulo</h3>

            <p style="padding:14px;background:#f8fafc;border-radius:8px;text-align:center;font-size:18px;">
                |v| = √(x² + y²)
            </p>

            <p>
                <strong>Resultado do módulo:</strong><br>
                ${formatarMetros(vetor.modulo)}
            </p>

            <p style="font-size:13px;color:#555;">
                O módulo do vetor utiliza uma aproximação local e pode
                apresentar pequena diferença em relação à distância
                geográfica calculada pela fórmula de Haversine.
            </p>

            <button
                type="button"
                id="novo-calculo"
                style="width:100%;padding:11px;cursor:pointer;margin-top:12px;"
            >
                Escolher outros pontos
            </button>
        </div>
    `;

    elementoResultado.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}


// 17. REINICIAR A SELEÇÃO
function limparSelecaoCompleta() {
    limparMarcadorSelecao("A");
    limparMarcadorSelecao("B");
    limparLinhaSelecao();

    pontoASelecionado = null;
    pontoBSelecionado = null;

    mostrarOrientacaoSelecao();
}


// 18. DESFAZER INDIVIDUALMENTE O PONTO A OU O PONTO B
function desfazerPontoSelecao(papel) {
    const pontoSelecionado = papel === "A"
        ? pontoASelecionado
        : pontoBSelecionado;

    if (!pontoSelecionado) return;

    limparMarcadorSelecao(papel);
    limparLinhaSelecao();

    if (papel === "A") {
        pontoASelecionado = null;
    } else if (papel === "B") {
        pontoBSelecionado = null;
    }

    // A outra seleção é preservada.
    // Os marcadores fixos das entradas também são preservados.
    mostrarOrientacaoSelecao();
}

function configurarCliqueParaDesfazer(marcador, papel) {
    if (!marcador) return;

    marcador.on("click", function() {
        const pontoSelecionado = papel === "A"
            ? pontoASelecionado
            : pontoBSelecionado;

        if (!pontoSelecionado) return;

        const conteudoPopup = `
            <div style="min-width:190px;text-align:center;">
                <h3 style="margin:0 0 8px;">
                    Ponto ${papel}
                </h3>

                <p style="margin:0 0 10px;">
                    ${escaparHTML(pontoSelecionado.nome)}
                </p>

                <button
                    type="button"
                    class="desfazer-ponto"
                    data-papel="${papel}"
                    style="width:100%;padding:10px;border:0;border-radius:6px;background:#dc2626;color:#fff;font-weight:bold;cursor:pointer;"
                >
                    Desfazer ponto ${papel}
                </button>
            </div>
        `;

        L.popup({
            closeButton: true,
            autoClose: true,
            closeOnClick: false
        })
            .setLatLng(marcador.getLatLng())
            .setContent(conteudoPopup)
            .openOn(mapa);
    });
}


// 19. CLIQUES NOS BOTÕES DOS POPUPS
document.addEventListener("click", function(evento) {
    if (!(evento.target instanceof Element)) return;

    // DESFAZER PONTO A OU B
    const botaoDesfazer = evento.target.closest(".desfazer-ponto");

    if (botaoDesfazer) {
        evento.preventDefault();
        evento.stopPropagation();

        const papel = botaoDesfazer.dataset.papel;

        if (papel === "A" || papel === "B") {
            mapa.closePopup();
            desfazerPontoSelecao(papel);
        }

        return;
    }

    // ESCOLHER UM DOS PONTOS CADASTRADOS
    const botaoSelecionar = evento.target.closest(".selecionar-cadastrado");

    if (botaoSelecionar) {
        evento.preventDefault();
        evento.stopPropagation();

        const id = Number(botaoSelecionar.dataset.id);
        const papel = botaoSelecionar.dataset.papel;
        const ponto = pontos.find(item => item.id === id);

        if (!ponto) return;

        if (!temCoordenadas(ponto)) {
            alert(
                "Este ponto ainda não possui coordenadas. " +
                "Registre a localização antes de utilizá-lo."
            );
            return;
        }

        if (papel !== "A" && papel !== "B") return;

        // Em vez de selecionar imediatamente, solicita confirmação.
        mapa.closePopup();

        pedirConfirmacaoSelecao(
            papel,
            ponto,
            L.latLng(ponto.latitude, ponto.longitude)
        );

        return;
    }

    // CONFIRMAR A SELEÇÃO
    const botaoConfirmar = evento.target.closest(".confirmar-selecao");

    if (botaoConfirmar) {
        evento.preventDefault();
        evento.stopPropagation();

        confirmarSelecaoPendente(
            botaoConfirmar.dataset.papel
        );

        return;
    }

    // CANCELAR A SELEÇÃO
    const botaoCancelar = evento.target.closest(".cancelar-selecao");

    if (botaoCancelar) {
        evento.preventDefault();
        evento.stopPropagation();

        selecaoPendente = null;
        mapa.closePopup();

        return;
    }

    // VOLTAR AO PAINEL MATEMÁTICO
    if (evento.target.closest("#voltar-geometria")) {
        evento.preventDefault();
        mostrarPainelGeometria();
        return;
    }

    // REINICIAR OU ESCOLHER OUTROS PONTOS
    if (evento.target.closest("#novo-calculo")) {
        evento.preventDefault();
        limparSelecaoCompleta();
    }
});


// 20. PREENCHER OS SELETORES DE ORIGEM E DESTINO
function preencherSeletores() {
    if (!campoOrigem || !campoDestino) {
        console.warn("Seletores de origem e destino não encontrados.");
        return;
    }

    campoOrigem.innerHTML =
        '<option value="">Selecione a origem</option>';

    campoDestino.innerHTML =
        '<option value="">Selecione o destino</option>';

    pontos.forEach(ponto => {
        const opcaoOrigem = document.createElement("option");

        opcaoOrigem.value = ponto.id;
        opcaoOrigem.textContent = ponto.nome;

        campoOrigem.appendChild(opcaoOrigem);

        const opcaoDestino = document.createElement("option");

        opcaoDestino.value = ponto.id;
        opcaoDestino.textContent = ponto.nome;

        campoDestino.appendChild(opcaoDestino);
    });
}

preencherSeletores();


// 21. CALCULAR DISTÂNCIA PELOS SELETORES
if (botaoBuscarRota) {
    botaoBuscarRota.addEventListener("click", function() {
        const idOrigem = Number(campoOrigem?.value);
        const idDestino = Number(campoDestino?.value);

        if (!idOrigem || !idDestino) {
            if (elementoResultado) {
                elementoResultado.textContent =
                    "Selecione a origem e o destino.";
            }

            return;
        }

        if (idOrigem === idDestino) {
            if (elementoResultado) {
                elementoResultado.textContent =
                    "Selecione dois pontos diferentes.";
            }

            return;
        }

        const origem = pontos.find(
            ponto => ponto.id === idOrigem
        );

        const destino = pontos.find(
            ponto => ponto.id === idDestino
        );

        if (!origem || !destino) return;

        const mesmoPercurso =
            origem.acesso === destino.acesso &&
            origem.posicao !== destino.posicao;

        if (mesmoPercurso) {
            mostrarResultadoAcesso(
                origem.acesso,
                origem,
                destino
            );

            return;
        }

        if (!temCoordenadas(origem) || !temCoordenadas(destino)) {
            if (elementoResultado) {
                elementoResultado.innerHTML = `
                    <div class="resultado-pendente">
                        <h3>Coordenadas pendentes</h3>

                        <p>
                            Um dos pontos selecionados ainda não possui
                            coordenadas geográficas registradas.
                        </p>

                        <p>
                            <strong>Escadaria:</strong>
                            ${formatarMetros(distanciasPercursos.escadaria)}
                        </p>

                        <p>
                            <strong>Rampa:</strong>
                            ${formatarMetros(distanciasPercursos.rampa)}
                        </p>

                        <p>
                            Os comprimentos informados foram preservados,
                            mas não substituem as coordenadas que faltam.
                        </p>
                    </div>
                `;
            }

            return;
        }

        const dados = calcularDadosGeometricos(origem, destino);

        if (!dados || !elementoResultado) return;

        const vetor = dados.vetor;

        elementoResultado.innerHTML = `
            <div class="resultado-geometria">
                <h3>Resultado do cálculo</h3>

                <p>
                    <strong>Origem:</strong><br>
                    ${escaparHTML(origem.nome)}
                </p>

                <p>
                    <strong>Destino:</strong><br>
                    ${escaparHTML(destino.nome)}
                </p>

                <hr>

                <h3>Distância em linha reta</h3>

                <p style="font-size:24px;font-weight:bold;">
                    ${formatarMetros(dados.distanciaGeografica)}
                </p>

                <h3>Vetor de deslocamento</h3>

                <p>
                    <strong>Componente X:</strong><br>
                    ${formatarMetros(vetor.x)}
                </p>

                <p>
                    <strong>Componente Y:</strong><br>
                    ${formatarMetros(vetor.y)}
                </p>

                <p>
                    <strong>Vetor:</strong><br>
                    v ≈ (${formatarNumero(vetor.x)}; ${formatarNumero(vetor.y)}) m
                </p>

                <p>
                    <strong>Módulo do vetor:</strong><br>
                    ${formatarMetros(vetor.modulo)}
                </p>

                <p>
                    <strong>Fórmula:</strong><br>
                    |v| = √(x² + y²)
                </p>

                <p style="font-size:13px;color:#555;">
                    Os componentes do vetor são aproximações em um
                    sistema de coordenadas local.
                </p>
            </div>
        `;

        elementoResultado.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    });
}


// 22. BARREIRAS DE ACESSIBILIDADE
const obstaculos = [
    {
        titulo: "Escadaria na entrada",
        descricao: "A presença de degraus pode representar uma barreira para pessoas que não conseguem utilizá-los. O comprimento informado do percurso é de 34,78 metros."
    },
    {
        titulo: "Rampa com inclinação ainda não avaliada",
        descricao: "O percurso informado da rampa é de 76,62 metros. A inclinação exata, a largura e as condições do piso precisam ser avaliadas presencialmente."
    },
    {
        titulo: "Rota acessível independente a confirmar",
        descricao: "A existência de uma rota acessível independente precisa ser confirmada por meio de levantamento presencial."
    }
];

if (listaObstaculos) {
    listaObstaculos.innerHTML = "";

    obstaculos.forEach(obstaculo => {
        const artigo = document.createElement("article");
        const titulo = document.createElement("h3");
        const descricao = document.createElement("p");

        titulo.textContent = obstaculo.titulo;
        descricao.textContent = obstaculo.descricao;

        artigo.append(titulo, descricao);
        listaObstaculos.appendChild(artigo);
    });
}


// 23. PROPOSTAS DE MELHORIA
const solucoes = [
    {
        titulo: "Identificação dos pontos de acesso",
        descricao: "Registrar o início e o final da escadaria e da rampa no mapa usando coordenadas geográficas."
    },
    {
        titulo: "Aplicação de Geometria Analítica",
        descricao: "Utilizar coordenadas, distâncias entre pontos, componentes de vetores e cálculo do módulo para representar e comparar deslocamentos."
    },
    {
        titulo: "Avaliação técnica da rampa",
        descricao: "Medir o desnível vertical e a projeção horizontal para calcular o percentual de inclinação."
    },
    {
        titulo: "Adequação da rota acessível",
        descricao: "Avaliar alternativas para oferecer um percurso acessível, seguro e independente até a entrada da faculdade."
    },
    {
        titulo: "Melhoria da sinalização",
        descricao: "Identificar os acessos e informar quais rotas foram verificadas como adequadas para pessoas com mobilidade reduzida."
    }
];

if (listaSolucoes) {
    listaSolucoes.innerHTML = "";

    solucoes.forEach(solucao => {
        const artigo = document.createElement("article");
        const titulo = document.createElement("h3");
        const descricao = document.createElement("p");

        titulo.textContent = solucao.titulo;
        descricao.textContent = solucao.descricao;

        artigo.append(titulo, descricao);
        listaSolucoes.appendChild(artigo);
    });
}


// 24. INICIALIZAÇÃO
mostrarPainelGeometria();

console.log("Mapa Acessível — Estácio Niterói");
console.log("Pontos cadastrados:", pontos.length);

console.log(
    "Pontos com coordenadas:",
    pontos.filter(temCoordenadas).length
);

console.log(
    "Comprimento informado da escadaria:",
    formatarMetros(distanciasPercursos.escadaria)
);

console.log(
    "Comprimento informado da rampa:",
    formatarMetros(distanciasPercursos.rampa)
);

const vetorInicial = calcularVetor(
    inicioEscadaria,
    inicioRampa
);

if (vetorInicial) {
    console.log(
        "Vetor entre as coordenadas dos acessos:",
        vetorInicial
    );

    console.log(
        "Módulo aproximado do vetor:",
        formatarMetros(vetorInicial.modulo)
    );
}

setTimeout(() => mapa.invalidateSize(), 300);