/* =========================================================
   script.js — Portfólio de Ruy Filho
   JavaScript puro (sem frameworks/bibliotecas). Funções:
   1. Tema claro/escuro (com preferência salva no navegador)
   2. Menu responsivo (hambúrguer no celular)
   3. Destaque do link da página atual no menu
   4. Ano atual no rodapé
   5. Validação e simulação de envio do formulário de contato
   ========================================================= */

// Aguarda o HTML ser carregado antes de executar o código
document.addEventListener("DOMContentLoaded", function () {
  iniciarTema();
  iniciarMenuResponsivo();
  destacarPaginaAtual();
  atualizarAnoRodape();
  iniciarFormularioContato();
});

/* ---------- 1. TEMA CLARO/ESCURO ---------- */
function iniciarTema() {
  const botaoTema = document.getElementById("botao-tema");
  if (!botaoTema) return;

  // Recupera o tema salvo. O try/catch evita erro caso o
  // navegador bloqueie o localStorage (ex.: modo privado).
  let temaSalvo = null;
  try {
    temaSalvo = localStorage.getItem("tema");
  } catch (erro) {
    temaSalvo = null;
  }

  // Sem tema salvo, segue a preferência do sistema operacional
  const sistemaEscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (temaSalvo === "escuro" || (temaSalvo === null && sistemaEscuro)) {
    document.body.classList.add("tema-escuro");
  }
  atualizarIconeTema(botaoTema);

  // Ao clicar, alterna a classe do <body> e salva a escolha
  botaoTema.addEventListener("click", function () {
    document.body.classList.toggle("tema-escuro");
    const escuro = document.body.classList.contains("tema-escuro");
    try {
      localStorage.setItem("tema", escuro ? "escuro" : "claro");
    } catch (erro) {
      /* Sem armazenamento: o tema vale só até recarregar a página */
    }
    atualizarIconeTema(botaoTema);
  });
}

// Troca o ícone e o texto acessível do botão conforme o tema
function atualizarIconeTema(botao) {
  const escuro = document.body.classList.contains("tema-escuro");
  botao.textContent = escuro ? "☀️" : "🌙";
  botao.setAttribute("aria-label", escuro ? "Ativar tema claro" : "Ativar tema escuro");
}

/* ---------- 2. MENU RESPONSIVO ---------- */
function iniciarMenuResponsivo() {
  const botaoMenu = document.getElementById("botao-menu");
  const menu = document.getElementById("menu");
  if (!botaoMenu || !menu) return;

  // Abre/fecha o menu no celular
  botaoMenu.addEventListener("click", function () {
    const aberto = menu.classList.toggle("aberto");
    botaoMenu.setAttribute("aria-expanded", aberto);
    botaoMenu.textContent = aberto ? "✕" : "☰";
  });

  // Fecha o menu ao escolher um link
  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      menu.classList.remove("aberto");
      botaoMenu.setAttribute("aria-expanded", "false");
      botaoMenu.textContent = "☰";
    });
  });
}

/* ---------- 3. LINK ATIVO NO MENU ---------- */
function destacarPaginaAtual() {
  // Remove "index.html" do fim para que ".../" e ".../index.html" sejam iguais
  function normalizar(url) {
    return url.split("#")[0].replace(/index\.html$/, "");
  }

  // Páginas internas (ex.: o simulador) podem indicar qual item destacar
  // pelo atributo data-menu-ativo no <body>
  const destaqueForcado = document.body.dataset.menuAtivo;
  const paginaAtual = normalizar(window.location.href);

  document.querySelectorAll(".menu a").forEach(function (link) {
    const arquivo = link.getAttribute("href").split("/").pop();
    const ehAtual = destaqueForcado
      ? arquivo === destaqueForcado
      : normalizar(link.href) === paginaAtual; // link.href já vem como endereço completo
    if (ehAtual) {
      link.classList.add("ativo");
      link.setAttribute("aria-current", "page");
    }
  });
}

/* ---------- 4. ANO NO RODAPÉ ---------- */
function atualizarAnoRodape() {
  const ano = document.getElementById("ano-atual");
  if (ano) ano.textContent = new Date().getFullYear();
}

/* ---------- 5. FORMULÁRIO DE CONTATO ---------- */
function iniciarFormularioContato() {
  const formulario = document.getElementById("form-contato");
  if (!formulario) return; // só existe na página de contato

  const modal = document.getElementById("modal-sucesso");
  const botaoFechar = document.getElementById("fechar-modal");

  formulario.addEventListener("submit", function (evento) {
    // Impede o envio real: o envio é apenas simulado
    evento.preventDefault();

    const nome = document.getElementById("nome");
    const email = document.getElementById("email");
    const mensagem = document.getElementById("mensagem");

    // Valida cada campo e guarda o resultado
    const nomeOk = validarCampo(nome, nome.value.trim().length >= 3,
      "Informe seu nome (mínimo de 3 letras).");
    const emailOk = validarCampo(email, emailValido(email.value.trim()),
      email.value.trim() === "" ? "Informe seu e-mail." : "E-mail inválido. Ex.: usuario@dominio.com");
    const mensagemOk = validarCampo(mensagem, mensagem.value.trim().length >= 10,
      "Escreva uma mensagem (mínimo de 10 caracteres).");

    // Se algum campo falhou, coloca o foco no primeiro inválido
    if (!nomeOk || !emailOk || !mensagemOk) {
      const primeiroInvalido = formulario.querySelector(".invalido input, .invalido textarea");
      if (primeiroInvalido) primeiroInvalido.focus();
      return;
    }

    // Tudo certo: simula o envio, limpa os campos e abre o modal
    formulario.reset();
    abrirModal(modal);
  });

  // Remove a mensagem de erro assim que o usuário corrige o campo
  formulario.querySelectorAll("input, textarea").forEach(function (campo) {
    campo.addEventListener("input", function () {
      limparErro(campo);
    });
  });

  // Formas de fechar o modal: botão, clique fora da caixa ou tecla Esc
  botaoFechar.addEventListener("click", function () {
    fecharModal(modal);
  });
  modal.addEventListener("click", function (evento) {
    if (evento.target === modal) fecharModal(modal);
  });
  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape") fecharModal(modal);
  });
}

// Verifica o formato do e-mail: texto@texto.texto (sem espaços)
function emailValido(email) {
  const padrao = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return padrao.test(email);
}

// Mostra ou limpa o erro de um campo; retorna se ele é válido
function validarCampo(campo, valido, textoErro) {
  const grupo = campo.closest(".campo");
  const erro = grupo.querySelector(".mensagem-erro");
  if (valido) {
    limparErro(campo);
    return true;
  }
  grupo.classList.add("invalido");
  campo.setAttribute("aria-invalid", "true");
  erro.textContent = textoErro;
  return false;
}

function limparErro(campo) {
  const grupo = campo.closest(".campo");
  grupo.classList.remove("invalido");
  campo.removeAttribute("aria-invalid");
  grupo.querySelector(".mensagem-erro").textContent = "";
}

function abrirModal(modal) {
  modal.classList.add("aberto");
  document.getElementById("fechar-modal").focus();
}

function fecharModal(modal) {
  modal.classList.remove("aberto");
}
