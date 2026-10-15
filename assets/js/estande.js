/* Como chegar ao estande: planta simplificada do ginásio e caminho animado do credenciamento ao estande 09 */
(function () {
  "use strict";

  var svg = document.getElementById("mapa-estande");
  if (!svg) return;
  var NS = "http://www.w3.org/2000/svg";
  var reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function el(tag, attrs, pai) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    (pai || svg).appendChild(e);
    return e;
  }
  function texto(t, attrs, pai) { var e = el("text", attrs, pai); e.textContent = t; return e; }

  /* Coordenadas tiradas da planta oficial do evento */
  var BLOCOS = [
    [590, 427, 913, 482], [1004, 427, 1384, 482],
    [463, 566, 566, 668], [778, 510, 880, 668], [913, 510, 1017, 668], [1228, 566, 1331, 668],
    [505, 720, 609, 824], [1070, 720, 1174, 824],
    [459, 915, 561, 1017], [773, 873, 878, 1033], [1224, 915, 1421, 1017]
  ];
  var LOSANGOS = [[660, 619], [1122, 619], [964, 765], [1278, 765], [666, 961], [1110, 961]];
  var MARCO = [909, 883, 1004, 1033];
  var FILEIRA = [540, 1068, 1452, 1118];
  var ESTANDE = [914, 1068, 961, 1118];
  var CRED = [1474, 672, 1490, 814];
  var CAMINHO = [[1458, 742], [1458, 1052], [938, 1052], [938, 1072]];

  el("rect", { class: "m-salao", x: 540, y: 400, width: 975, height: 725, rx: 6 });
  BLOCOS.forEach(function (b) { el("rect", { class: "m-bloco", x: b[0], y: b[1], width: b[2] - b[0], height: b[3] - b[1], rx: 4 }); });
  LOSANGOS.forEach(function (c) { el("rect", { class: "m-bloco", x: c[0] - 51, y: c[1] - 51, width: 102, height: 102, rx: 4, transform: "rotate(45 " + c[0] + " " + c[1] + ")" }); });
  el("rect", { class: "m-bloco m-marco", x: MARCO[0], y: MARCO[1], width: MARCO[2] - MARCO[0], height: MARCO[3] - MARCO[1], rx: 4 });
  texto("27 e 28", { class: "m-txt-peq", x: (MARCO[0] + MARCO[2]) / 2, y: 965 });
  el("rect", { class: "m-bloco", x: FILEIRA[0], y: FILEIRA[1], width: FILEIRA[2] - FILEIRA[0], height: FILEIRA[3] - FILEIRA[1], rx: 4 });
  texto("Estandes de 02 a 08", { class: "m-txt-peq", x: 1200, y: 1101 });

  el("rect", { class: "m-cred", x: CRED[0], y: CRED[1], width: CRED[2] - CRED[0], height: CRED[3] - CRED[1], rx: 4 });
  texto("Credenciamento", { class: "m-txt", x: 1492, y: 655, "text-anchor": "end" });
  texto("Entrada", { class: "m-txt-peq", x: 1545, y: 1024 });
  el("path", { class: "m-seta", d: "M1590,987 h-70 m12,-12 l-12,12 l12,12" });

  var d = "M" + CAMINHO.map(function (p) { return p.join(","); }).join(" L");
  el("path", { class: "m-trilha", d: d });
  var luz = el("path", { class: "m-luz", d: d });

  var alvo = el("g", { class: "m-alvo" });
  el("rect", { class: "m-aura", x: ESTANDE[0] - 10, y: ESTANDE[1] - 10, width: ESTANDE[2] - ESTANDE[0] + 20, height: ESTANDE[3] - ESTANDE[1] + 20, rx: 10 }, alvo);
  el("rect", { class: "m-estande", x: ESTANDE[0], y: ESTANDE[1], width: ESTANDE[2] - ESTANDE[0], height: ESTANDE[3] - ESTANDE[1], rx: 4 }, alvo);
  texto("09", { class: "m-num", x: (ESTANDE[0] + ESTANDE[2]) / 2, y: 1101 }, alvo);
  texto("Green Mining", { class: "m-txt m-txt-alvo", x: (ESTANDE[0] + ESTANDE[2]) / 2, y: 1160 });

  var inicio = el("circle", { class: "m-inicio", cx: CAMINHO[0][0], cy: CAMINHO[0][1], r: 11 });
  var andarilho = el("circle", { class: "m-andarilho", r: 13, cx: CAMINHO[0][0], cy: CAMINHO[0][1] });

  /* Comprimento de cada trecho, para acender o passo certo na lista */
  var trechos = [], total = 0;
  for (var i = 1; i < CAMINHO.length; i++) {
    var l = Math.abs(CAMINHO[i][0] - CAMINHO[i - 1][0]) + Math.abs(CAMINHO[i][1] - CAMINHO[i - 1][1]);
    trechos.push(l); total += l;
  }
  var passos = Array.prototype.slice.call(document.querySelectorAll("#passos-estande li"));
  function marca(n) { passos.forEach(function (li, k) { li.classList.toggle("atual", k === n); }); }

  /* Tela cheia: nativa quando o navegador deixa, e camada fixa como reserva (iPhone) */
  var caixa = document.getElementById("levar-mapa"), botao = document.getElementById("mapa-cheia");
  if (!caixa) botao = null;
  function cheia(liga) {
    caixa.classList.toggle("mapa-tela-cheia", liga);
    document.body.classList.toggle("sem-rolagem", liga);
    botao.textContent = liga ? "✕ Fechar" : "⛶ Tela cheia";
    botao.setAttribute("aria-label", liga ? "Fechar a tela cheia" : "Ver o mapa em tela cheia");
    var giro = screen.orientation;
    if (liga && caixa.requestFullscreen) {
      /* No Android o mapa já deita sozinho; no iPhone fica a dica de girar o celular */
      caixa.requestFullscreen().then(function () { if (giro && giro.lock) return giro.lock("landscape"); }).catch(function () {});
    }
    if (!liga) {
      if (giro && giro.unlock) try { giro.unlock(); } catch (e) {}
      if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
    }
  }
  if (botao) {
    botao.addEventListener("click", function () { cheia(!caixa.classList.contains("mapa-tela-cheia")); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && caixa.classList.contains("mapa-tela-cheia")) cheia(false); });
    document.addEventListener("fullscreenchange", function () { if (!document.fullscreenElement && caixa.classList.contains("mapa-tela-cheia")) cheia(false); });
  }

  luz.style.strokeDasharray = total;
  if (reduz) { luz.style.strokeDashoffset = 0; andarilho.setAttribute("cx", CAMINHO[3][0]); andarilho.setAttribute("cy", CAMINHO[3][1]); marca(-1); return; }

  var DUR = 6500, PAUSA = 1800, t0 = null;
  function quadro(t) {
    if (t0 === null) t0 = t;
    var e = (t - t0) % (DUR + PAUSA), f = Math.min(1, e / DUR);
    f = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
    var dist = f * total;
    luz.style.strokeDashoffset = total - dist;
    var p = luz.getPointAtLength(dist);
    andarilho.setAttribute("cx", p.x); andarilho.setAttribute("cy", p.y);
    var acum = 0, n = 0;
    while (n < trechos.length - 1 && dist > acum + trechos[n]) { acum += trechos[n]; n++; }
    marca(f >= 1 ? 2 : Math.min(n, 2));
    alvo.classList.toggle("chegou", f >= 1);
    requestAnimationFrame(quadro);
  }
  requestAnimationFrame(quadro);
  inicio.setAttribute("aria-hidden", "true");
})();
