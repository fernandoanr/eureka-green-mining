/* Ponte para a página da Eureka e cartões de contato da equipe */
(function () {
  "use strict";

  var EUREKA = "https://eureka.maua.br/trabalho/Planejamento%20agregado%20em%20sistemas%20de%20log%C3%ADstica%20reversa:%20aplica%C3%A7%C3%A3o%20a%20Green%20Mining-934";

  /* Preencher com os dados que a equipe enviar; campo vazio não aparece no cartão */
  var EQUIPE = [
    { nome: "Fernando Andrade Rodrigues", email: "", linkedin: "", telefone: "" },
    { nome: "Gabriel Camargo Pinceli", email: "", linkedin: "", telefone: "" },
    { nome: "Isabella Ascenção", email: "", linkedin: "", telefone: "" },
    { nome: "Kaio Rocha Barbosa", email: "", linkedin: "", telefone: "" }
  ];
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
    el.innerHTML = '<span class="cartao-sigla" aria-hidden="true">' + iniciais(p.nome) + "</span>" +
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
