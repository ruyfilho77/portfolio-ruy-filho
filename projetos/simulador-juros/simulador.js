/* =========================================================
   simulador.js — Simulador de Juros Compostos
   Calcula mês a mês o saldo de um investimento com aporte
   inicial, aportes mensais e taxa de juros anual.
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const formulario = document.getElementById("form-simulador");

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault(); // não recarrega a página
    simular();
  });

  simular(); // mostra um exemplo assim que a página abre
});

// Formata um número como moeda brasileira (ex.: R$ 1.234,56)
const formatarReais = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
}).format;

function simular() {
  // Lê e valida os valores digitados
  const inicial = lerNumero("inicial", 0);
  const mensal = lerNumero("mensal", 0);
  const taxaAnual = lerNumero("taxa", 0);
  const anos = lerNumero("anos", 1, 50);
  if ([inicial, mensal, taxaAnual, anos].includes(null)) return;

  // Converte a taxa anual em taxa mensal equivalente:
  // (1 + taxa anual)^(1/12) - 1
  const taxaMensal = Math.pow(1 + taxaAnual / 100, 1 / 12) - 1;

  let saldo = inicial;
  let investido = inicial;
  const linhas = [];

  // Laço mês a mês: aplica os juros e depois soma o aporte
  for (let mes = 1; mes <= anos * 12; mes++) {
    saldo = saldo * (1 + taxaMensal) + mensal;
    investido += mensal;

    // Ao fim de cada ano, guarda uma linha para a tabela
    if (mes % 12 === 0) {
      linhas.push({ ano: mes / 12, investido: investido, juros: saldo - investido, saldo: saldo });
    }
  }

  // Atualiza o resumo
  document.getElementById("valor-final").textContent = formatarReais(saldo);
  document.getElementById("total-investido").textContent = formatarReais(investido);
  document.getElementById("total-juros").textContent = formatarReais(saldo - investido);

  // Monta a tabela criando os elementos com JavaScript
  const corpo = document.getElementById("tabela-evolucao");
  corpo.innerHTML = "";
  linhas.forEach(function (linha) {
    const tr = document.createElement("tr");
    [linha.ano, formatarReais(linha.investido), formatarReais(linha.juros), formatarReais(linha.saldo)]
      .forEach(function (valor) {
        const td = document.createElement("td");
        td.textContent = valor;
        tr.appendChild(td);
      });
    corpo.appendChild(tr);
  });
}

// Lê um campo numérico; mostra erro e devolve null se for inválido
function lerNumero(id, minimo, maximo) {
  const campo = document.getElementById(id);
  const grupo = campo.closest(".campo");
  const erro = grupo.querySelector(".mensagem-erro");
  const valor = parseFloat(campo.value);

  let texto = "";
  if (isNaN(valor)) texto = "Informe um número.";
  else if (valor < minimo) texto = "O valor mínimo é " + minimo + ".";
  else if (maximo !== undefined && valor > maximo) texto = "O valor máximo é " + maximo + ".";

  grupo.classList.toggle("invalido", texto !== "");
  erro.textContent = texto;
  return texto === "" ? valor : null;
}
