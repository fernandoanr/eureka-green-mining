/* Versão rápida: sete telas, navegação por setas, clique ou deslize */
(function () {
  "use strict";

  var D = window.TCC;
  var NS = "http://www.w3.org/2000/svg";
  var reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var f2 = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  var telas = $$(".r-tela");
  var atual = -1;
  var aoEntrar = {}, aoSair = {};

  /* ---------- 1. Mapa da rede ---------- */
  (function () {
    var svg = $("#r-mapa");
    var hub = D.unidades.filter(function (u) { return u.tipo === "hub"; })[0];
    var centros = D.unidades.filter(function (u) { return u.tipo === "centro"; });
    centros.forEach(function (c) { el("line", { class: "lig", x1: c.x, y1: c.y, x2: hub.x, y2: hub.y }, svg); });
    var todos = centros.concat([hub]);
    todos.forEach(function (u, i) {
      var g = el("g", { class: "no", style: "animation-delay:" + (0.25 * i) + "s" }, svg);
      el("circle", { class: u.tipo === "hub" ? "hub" : "cc", cx: u.x, cy: u.y, r: u.tipo === "hub" ? 22 : 14 }, g);
      var t = el("text", { x: u.x, y: u.y - (u.tipo === "hub" ? 32 : 24), "text-anchor": "middle" }, g);
      t.textContent = u.tipo === "hub" ? "Hub " + u.nome : u.nome;
    });
    var caminhao = el("rect", { class: "caminhao", width: 18, height: 11, rx: 3 }, svg);
    var k = 0, p = 0, raf = null;
    function anda() {
      var c = centros[k];
      var ida = p < 0.5 ? p * 2 : 2 - p * 2;
      var x = c.x + (hub.x - c.x) * ida, y = c.y + (hub.y - c.y) * ida;
      caminhao.setAttribute("x", x - 9); caminhao.setAttribute("y", y - 5.5);
      p += 0.006;
      if (p >= 1) { p = 0; k = (k + 1) % centros.length; }
      raf = requestAnimationFrame(anda);
    }
    aoEntrar[0] = function () { if (!reduz && !raf) anda(); };
    aoSair[0] = function () { cancelAnimationFrame(raf); raf = null; };
  })();

  /* ---------- 2. Contador do desafio ---------- */
  (function () {
    var n = $(".r-gigante .num");
    var alvo = parseFloat(n.dataset.alvo), raf = null;
    aoEntrar[1] = function () {
      if (reduz) { n.textContent = f2.format(alvo); return; }
      var t0 = null;
      function passo(t) {
        if (!t0) t0 = t;
        var x = Math.min(1, (t - t0) / 1600), e = 1 - Math.pow(1 - x, 3);
        n.textContent = f2.format(1 + (alvo - 1) * e);
        if (x < 1) raf = requestAnimationFrame(passo);
      }
      raf = requestAnimationFrame(passo);
    };
    aoSair[1] = function () { cancelAnimationFrame(raf); };
  })();

  /* ---------- 3. Fluxograma simplificado ---------- */
  (function () {
    var svg = $("#r-fluxo"), legenda = $("#r-legenda-fluxo");
    var ICO = {
      chegada: "M-8,-2 a8,8 0 1 1 16,0 c0,8 -8,14 -8,14 c0,0 -8,-6 -8,-14 z M0,-2 m-3,0 a3,3 0 1 0 6,0 a3,3 0 1 0 -6,0",
      pesagem: "M-12,10 h24 M0,10 v-14 M-10,-4 h20 M-10,-4 l-4,8 h8 z M10,-4 l-4,8 h8 z",
      estoque: "M-13,12 v-14 l13,-8 l13,8 v14 z M-6,12 v-9 h12 v9",
      caminhao: "M-14,6 v-12 h16 v12 z M2,-2 h7 l5,5 v3 h-12 M-8,9 a3,3 0 1 0 0.1,0 M8,9 a3,3 0 1 0 0.1,0",
      separacao: "M-14,12 v-18 h8 v18 M-4,12 v-18 h8 v18 M6,12 v-18 h8 v18",
      prensa: "M-12,-12 h24 M0,-12 v8 M-8,-4 h16 v6 h-16 z M-12,12 h24 v-6 h-24 z",
      reciclador: "M0,-12 l7,10 h-14 z M-12,10 l7,-10 l4,6 M12,10 l-7,-10"
    };
    var ETAPAS = [
      { nome: "Chegada", ico: "chegada", txt: "Pessoas e comércios levam papelão, plástico e longa vida a um dos <b>5 centros de coleta</b>." },
      { nome: "Pesagem", ico: "pesagem", txt: "Cada entrega é pesada e registrada pela equipe, com <b>4 minutos</b> de trabalho por chegada." },
      { nome: "Estoque", ico: "estoque", txt: "O material fica guardado no centro até juntar uma carga e o caminhão ser chamado." },
      { nome: "Caminhão", ico: "caminhao", txt: "<b>Um único caminhão</b> leva as cargas dos cinco centros até o hub, com <b>22 viagens</b> possíveis por semana." },
      { nome: "Separação", ico: "separacao", txt: "No <b>hub de Santo Amaro</b>, a carga é descarregada e organizada por tipo de material." },
      { nome: "Prensa", ico: "prensa", txt: "As prensas transformam o material solto em <b>fardos</b> compactos, prontos para venda." },
      { nome: "Reciclador", ico: "reciclador", txt: "Os fardos seguem para o reciclador e a embalagem <b>volta para a indústria</b>." }
    ];
    var ZONAS = [["Centro de coleta", 0, 2], ["Transporte", 3, 3], ["Hub central", 4, 5], ["Reciclador", 6, 6]];
    var CORES = ["#c89b62", "#57b6ff", "#e9e6dc"];
    var estreito = window.matchMedia("(max-width: 560px)");
    var grupos = [], pontos = [], camada = null, raf = null, ciclo = null, idx = 0, L = null;

    /* Desenha na horizontal (tela larga) ou na vertical (celular) */
    function monta() {
      var v = estreito.matches;
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      L = v
        ? { v: true, P: function (i) { return 60 + i * 92; }, C: 196, larg: 236, alt: 58, faixa: 34, w: 360, h: 660 }
        : { v: false, P: function (i) { return 95 + i * 168; }, C: 200, larg: 132, alt: 92, faixa: 134, w: 1200, h: 330 };
      svg.setAttribute("viewBox", "0 0 " + L.w + " " + L.h);
      svg.classList.toggle("vertical", v);
      ZONAS.forEach(function (z) {
        var t;
        if (v) {
          var y0 = L.P(z[1]) - L.alt / 2 - 24, y1 = L.P(z[2]) + L.alt / 2 + 8;
          el("rect", { class: "zona", x: 16, y: y0, width: L.w - 32, height: y1 - y0, rx: 14 }, svg);
          t = el("text", { class: "zona-txt", x: L.w - 28, y: y0 + 17, "text-anchor": "end" }, svg);
        } else {
          var x0 = L.P(z[1]) - L.larg / 2 - 14, x1 = L.P(z[2]) + L.larg / 2 + 14;
          el("rect", { class: "zona", x: x0, y: 70, width: x1 - x0, height: 230, rx: 16 }, svg);
          t = el("text", { class: "zona-txt", x: (x0 + x1) / 2, y: 100, "text-anchor": "middle" }, svg);
        }
        t.textContent = z[0];
      });
      var ini = L.P(0), fim = L.P(6);
      var linha = v ? { x1: L.C, y1: ini, x2: L.C, y2: fim } : { x1: ini, y1: L.C, x2: fim, y2: L.C };
      el("line", Object.assign({ class: "caminho" }, linha), svg);
      el("line", Object.assign({ class: "caminho-luz" }, linha), svg);
      grupos = ETAPAS.map(function (e, i) {
        var pos = v ? L.C + "," + L.P(i) : L.P(i) + "," + L.C;
        var g = el("g", { class: "etapa", tabindex: 0, role: "button", "aria-label": e.nome, transform: "translate(" + pos + ")" }, svg);
        el("rect", { x: -L.larg / 2, y: -L.alt / 2, width: L.larg, height: L.alt, rx: 14 }, g);
        el("path", { class: "ico", d: ICO[e.ico], transform: v ? "translate(-84,0)" : "translate(0,-14)" }, g);
        var t = el("text", v ? { x: 14, y: 6 } : { y: 30 }, g); t.textContent = e.nome;
        g.addEventListener("click", function () { para(); acende(i); });
        g.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); para(); acende(i); } });
        return g;
      });
      camada = el("g", {}, svg);
      var passo = (L.P(1) - L.P(0)) * 0.44;
      pontos = [];
      for (var i = 0; i < 14; i++) pontos.push({ p: ini - i * passo, c: CORES[i % 3], n: null });
      acende(idx);
    }
    function acende(i) {
      idx = i;
      grupos.forEach(function (g, k) { g.classList.toggle("acesa", k === i); });
      legenda.innerHTML = ETAPAS[i].txt;
    }
    function anima() {
      var ini = L.P(0), fim = L.P(6), vel = L.v ? 0.9 : 1.6;
      pontos.forEach(function (q) {
        q.p += q.p > L.P(2) && q.p < L.P(4) ? vel * 2 : vel;
        if (q.p > fim) q.p = ini - 40;
        var fardo = q.p > L.P(5);
        if (!q.n || q.f !== fardo) {
          if (q.n) q.n.remove();
          q.n = fardo ? el("rect", { class: "ponto", width: 14, height: 10, rx: 2, fill: q.c }, camada) : el("circle", { class: "ponto", r: 6, fill: q.c }, camada);
          q.f = fardo;
        }
        q.n.style.opacity = q.p >= ini - 10 ? 1 : 0;
        var a = q.p, b = L.faixa;
        var x = L.v ? b : a, y = L.v ? a : b;
        if (fardo) { q.n.setAttribute("x", x - 7); q.n.setAttribute("y", y - 5); }
        else { q.n.setAttribute("cx", x); q.n.setAttribute("cy", y); }
      });
      raf = requestAnimationFrame(anima);
    }
    function para() { clearInterval(ciclo); ciclo = null; }
    monta();
    var aoMudar = function () { monta(); };
    if (estreito.addEventListener) estreito.addEventListener("change", aoMudar); else estreito.addListener(aoMudar);
    aoEntrar[2] = function () {
      acende(0);
      if (!reduz && !raf) anima();
      para(); ciclo = setInterval(function () { acende((idx + 1) % ETAPAS.length); }, 2600);
    };
    aoSair[2] = function () { cancelAnimationFrame(raf); raf = null; para(); };
  })();

  /* ---------- 4. Vídeo do SIMUL8 ---------- */
  (function () {
    var v = $("#r-simul8");
    aoEntrar[3] = function () { v.playbackRate = 8; var p = v.play(); if (p) p.catch(function () {}); };
    aoSair[3] = function () { v.pause(); };
    v.addEventListener("loadedmetadata", function () { v.playbackRate = 8; });
  })();

  /* ---------- 5. Barras sem mudança ---------- */
  (function () {
    var ANOS = [2025, 2026, 2027, 2028, 2029, 2030], MAX = 450;
    var RECADOS = {
      2025: "Em 2025 tudo cabe. O caminhão é o recurso mais carregado da rede.",
      2026: "Em 2026 o caminhão já trabalha perto do limite.",
      2027: "Em 2027 o caminhão não dá conta. A estrutura atual precisaria de mais transporte.",
      2028: "Em 2028 as equipes dos centros também passam do limite.",
      2029: "Em 2029 os dois gargalos já passam do dobro da capacidade.",
      2030: "Em 2030, sem mudanças, a rede precisaria de mais de três vezes a capacidade atual."
    };
    var barras = $("#r-barras"), anos = $("#r-anos"), recado = $("#r-recado");
    var linhas = [["Caminhão", "transporte"], ["Equipes dos centros", "centros"]].map(function (r) {
      var d = document.createElement("div"); d.className = "r-barra";
      d.innerHTML = "<b>" + r[0] + '</b><div class="r-trilho"><i></i><span class="limite" style="left:' + (100 / MAX * 100) + '%"></span></div><span class="r-valor"></span>';
      barras.appendChild(d);
      return { chave: r[1], barra: $("i", d), valor: $(".r-valor", d) };
    });
    var escala = document.createElement("p"); escala.className = "r-escala"; escala.textContent = "A linha branca marca 100% da capacidade"; barras.appendChild(escala);
    var botoes = ANOS.map(function (a, i) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = a; b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () { para(); mostra(i); });
      anos.appendChild(b); return b;
    });
    function mostra(i) {
      var a = ANOS[i], d = D.semMudanca[a];
      botoes.forEach(function (b, k) { b.setAttribute("aria-pressed", String(k === i)); });
      linhas.forEach(function (l) {
        var v = d[l.chave], estoura = v > 100;
        l.barra.style.width = Math.min(100, v / MAX * 100) + "%";
        l.barra.classList.toggle("estoura", estoura);
        l.valor.textContent = f2.format(v) + "%";
        l.valor.classList.toggle("estoura", estoura);
      });
      recado.textContent = RECADOS[a];
    }
    var ciclo = null, idx = 0;
    function para() { clearInterval(ciclo); ciclo = null; }
    mostra(0);
    aoEntrar[4] = function () {
      idx = 0; mostra(0); para();
      ciclo = setInterval(function () { idx++; if (idx >= ANOS.length) { para(); return; } mostra(idx); }, 2200);
    };
    aoSair[4] = para;
  })();

  /* ---------- 6. Linha do tempo do plano ---------- */
  (function () {
    var CURTO = {
      2026: "Realocar duas prensas que já existem no hub",
      2027: "Manter a configuração de 2026",
      2028: "Prensa em todos os centros, baú maior, reforço de equipe e segundo caminhão",
      2029: "Reforço de equipe, com 7 operadores a mais",
      2030: "Nova doca no hub e 18 operadores a mais"
    };
    var lista = $("#r-linha"), timers = [];
    var itens = D.plano.map(function (p) {
      var li = document.createElement("li");
      li.innerHTML = '<span class="ano">' + p.ano + '</span><span class="tag">' + p.tag + "</span><p>" + CURTO[p.ano] + "</p>";
      lista.appendChild(li); return li;
    });
    aoEntrar[5] = function () {
      itens.forEach(function (li) { li.classList.remove("mostra"); });
      itens.forEach(function (li, i) { timers.push(setTimeout(function () { li.classList.add("mostra"); }, reduz ? 0 : 350 * i + 200)); });
    };
    aoSair[5] = function () { timers.forEach(clearTimeout); timers = []; itens.forEach(function (li) { li.classList.add("mostra"); }); };
  })();

  /* ---------- Navegação ---------- */
  var progresso = $("#r-progresso");
  var marcas = telas.map(function (t, i) {
    var b = document.createElement("button"); b.type = "button"; b.setAttribute("role", "tab");
    b.setAttribute("aria-label", (i + 1) + ". " + t.getAttribute("aria-label"));
    b.addEventListener("click", function () { vai(i); });
    progresso.appendChild(b); return b;
  });
  function vai(i) {
    i = Math.max(0, Math.min(telas.length - 1, i));
    if (i === atual) return;
    if (atual >= 0 && aoSair[atual]) aoSair[atual]();
    telas.forEach(function (t, k) {
      t.classList.toggle("ativa", k === i);
      t.classList.toggle("antes", k < i);
      t.setAttribute("aria-hidden", String(k !== i));
    });
    marcas.forEach(function (b, k) {
      b.classList.toggle("atual", k === i); b.classList.toggle("feito", k < i);
      b.setAttribute("aria-selected", String(k === i));
    });
    atual = i;
    $("#r-contador").textContent = (i + 1) + " / " + telas.length;
    $("#r-mais").href = "../#" + telas[i].dataset.mais;
    $("#r-ant").disabled = i === 0;
    $("#r-prox").disabled = i === telas.length - 1;
    telas[i].scrollTop = 0;
    if (history.replaceState) history.replaceState(null, "", location.pathname + location.search + "#" + (i + 1));
    if (aoEntrar[i]) aoEntrar[i]();
  }
  $("#r-ant").addEventListener("click", function () { vai(atual - 1); });
  $("#r-prox").addEventListener("click", function () { vai(atual + 1); });
  document.addEventListener("keydown", function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (["ArrowRight", "ArrowDown", "PageDown", " "].indexOf(e.key) >= 0) { e.preventDefault(); vai(atual + 1); }
    else if (["ArrowLeft", "ArrowUp", "PageUp"].indexOf(e.key) >= 0) { e.preventDefault(); vai(atual - 1); }
    else if (e.key === "Home") vai(0);
    else if (e.key === "End") vai(telas.length - 1);
  });
  var toque = null;
  var palco = $("#r-palco");
  palco.addEventListener("touchstart", function (e) { toque = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
  palco.addEventListener("touchend", function (e) {
    if (!toque) return;
    var dx = e.changedTouches[0].clientX - toque.x, dy = e.changedTouches[0].clientY - toque.y; toque = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) vai(atual + (dx < 0 ? 1 : -1));
  });
  $("#r-tela-cheia").addEventListener("click", function () {
    var d = document.documentElement;
    if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
    else if (d.requestFullscreen) d.requestFullscreen().catch(function () {});
  });

  /* Modo estande: avança sozinho quando ninguém mexe */
  var agenda = null;
  if (/[?&]modo=estande/.test(location.search)) {
    document.body.classList.add("estande");
    var TEMPO = [14, 14, 22, 16, 16, 14, 18], auto = null;
    agenda = function () { clearTimeout(auto); auto = setTimeout(function () { vai(atual === telas.length - 1 ? 0 : atual + 1); agenda(); }, TEMPO[atual] * 1000); };
    ["pointerdown", "keydown", "touchstart"].forEach(function (ev) { window.addEventListener(ev, function () { clearTimeout(auto); auto = setTimeout(agenda, 45000); }, { passive: true }); });
  }

  var inicial = parseInt((location.hash || "").replace("#", ""), 10);
  vai(inicial >= 1 && inicial <= telas.length ? inicial - 1 : 0);
  if (agenda) agenda();
})();
