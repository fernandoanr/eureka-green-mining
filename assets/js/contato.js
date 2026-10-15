/* Ponte para a página da Eureka e cartões de contato da equipe */
(function () {
  "use strict";

  var EUREKA = "https://eureka.maua.br/trabalho/Planejamento%20agregado%20em%20sistemas%20de%20log%C3%ADstica%20reversa:%20aplica%C3%A7%C3%A3o%20a%20Green%20Mining-934";

  var EQUIPE = [
    { nome: "Fernando Andrade Rodrigues", foto: "fernando", email: "farcorporation@hotmail.com", linkedin: "https://www.linkedin.com/in/fernando-andrade-rodrigues", telefone: "+55 11 99688-3068" },
    { nome: "Gabriel Camargo Pinceli", foto: "gabriel", email: "gabrielpinceli@gmail.com", linkedin: "https://www.linkedin.com/in/gabriel-camargo-pinceli-419a82231", telefone: "+55 11 98604-0660" },
    { nome: "Isabella Ascenção", foto: "isabella", email: "bella.ascencao@gmail.com", linkedin: "https://www.linkedin.com/in/isabella-ascencao-b1685123b", telefone: "+55 11 99275-9788" },
    { nome: "Kaio Rocha Barbosa", foto: "kaio", email: "kaiorochabarbosa@gmail.com", linkedin: "https://www.linkedin.com/in/kaio-rocha-barbosa-", telefone: "+55 11 95268-9556" }
  ];
  /* Caminho das fotos relativo à página (raiz, rapido/ ou contato/) */
  var BASE = (document.querySelector('script[src*="contato.js"]').getAttribute("src").split("assets/js/")[0]);
  var ORG = "Engenharia de Produção - Instituto Mauá de Tecnologia";

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function iniciais(n) { var p = n.split(" "); return (p[0][0] + p[p.length - 1][0]).toUpperCase(); }

  function vcard(p) {
    var partes = p.nome.split(" ");
    var linhas = ["BEGIN:VCARD", "VERSION:3.0", "FN:" + p.nome, "N:" + partes.slice(1).join(" ") + ";" + partes[0] + ";;;", "ORG:" + ORG, "NOTE:TCC Green Mining - Eureka 2026"];
    if (p.email) linhas.push("EMAIL;TYPE=INTERNET:" + p.email);
    if (p.telefone) linhas.push("TEL;TYPE=CELL:" + p.telefone);
    if (p.linkedin) linhas.push("URL:" + p.linkedin);
    linhas.push("END:VCARD");
    return linhas.join("\r\n");
  }
  function salva(p) {
    var blob = new Blob([vcard(p)], { type: "text/vcard;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = p.nome.replace(/\s+/g, "-") + ".vcf";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  function cartao(p) {
    var el = document.createElement("article");
    el.className = "cartao";
    var vias = [];
    if (p.email) vias.push('<a href="mailto:' + esc(p.email) + '">' + esc(p.email) + "</a>");
    if (p.telefone) vias.push('<a href="tel:' + esc(p.telefone.replace(/[^\d+]/g, "")) + '">' + esc(p.telefone) + "</a>");
    if (p.linkedin) vias.push('<a href="' + esc(p.linkedin) + '" target="_blank" rel="noopener">LinkedIn</a>');
    var rosto = p.foto ? '<img class="cartao-foto" src="' + BASE + "assets/img/equipe/" + p.foto + '.jpg" alt="Foto de ' + esc(p.nome) + '" width="240" height="240" loading="lazy">' : '<span class="cartao-sigla" aria-hidden="true">' + iniciais(p.nome) + "</span>";
    el.innerHTML = rosto +
      '<div class="cartao-dados"><strong>' + esc(p.nome) + "</strong>" +
      (vias.length ? '<p class="cartao-vias">' + vias.join("") + "</p>" : '<p class="cartao-vias vazio">Contato a preencher</p>') +
      "</div>" + '<button type="button" class="cartao-salvar">Salvar contato</button>';
    el.querySelector(".cartao-salvar").addEventListener("click", function () { salva(p); });
    return el;
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-cartoes]"), function (caixa) {
    EQUIPE.forEach(function (p) { caixa.appendChild(cartao(p)); });
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-eureka]"), function (a) {
    a.href = EUREKA; a.target = "_blank"; a.rel = "noopener";
  });

  var dlg = document.getElementById("contato");
  if (dlg) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-abre-contato]"), function (b) {
      b.addEventListener("click", function () { dlg.showModal(); });
    });
    dlg.querySelector("[data-fecha]").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  }
})();
