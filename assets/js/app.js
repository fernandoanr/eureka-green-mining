(function () {
  "use strict";

  var D = window.TCC;
  var NS = "http://www.w3.org/2000/svg";
  var reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var f2 = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var f0 = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
  var pct = function (v) { return f2.format(v) + "%"; };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function html(tag, cls, txt, parent) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.innerHTML = txt;
    if (parent) parent.appendChild(e);
    return e;
  }

  /* ---------- Contadores ---------- */
  function animaContador(node) {
    var alvo = parseFloat(node.dataset.conta);
    var casas = parseInt(node.dataset.casas || "0", 10);
    var fmt = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
    if (reduz) { node.textContent = fmt.format(alvo); return; }
    var t0 = null, dur = 1400;
    function passo(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      node.textContent = fmt.format(alvo * e);
      if (p < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }
  var obsContador = new IntersectionObserver(function (ents) {
    ents.forEach(function (en) {
      if (en.isIntersecting) { animaContador(en.target); obsContador.unobserve(en.target); }
    });
  }, { threshold: 0.6 });
  $$("[data-conta]").forEach(function (n) { obsContador.observe(n); });

  /* ---------- Navegação, progresso, entrada das telas ---------- */
  var telas = $$(".tela");
  var obsTela = new IntersectionObserver(function (ents) {
    ents.forEach(function (en) {
      en.target.classList.toggle("fora", !en.isIntersecting);
      if (en.isIntersecting) {
        var id = en.target.id;
        $$(".barra-nav a").forEach(function (a) {
          a.classList.toggle("atual", a.getAttribute("href") === "#" + id);
        });
      }
    });
  }, { threshold: 0.25 });
  telas.forEach(function (t) { obsTela.observe(t); });
  window.addEventListener("scroll", function () {
    var h = document.documentElement.scrollHeight - innerHeight;
    $("#progresso").style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
  }, { passive: true });

  /* ---------- Som do teaser ---------- */
  var teaser = $("#teaser");
  $("#botao-som").addEventListener("click", function () {
    teaser.muted = !teaser.muted;
    if (!teaser.muted) { teaser.currentTime = 0; teaser.play(); }
    this.setAttribute("aria-pressed", String(!teaser.muted));
    this.textContent = teaser.muted ? "Ligar som do vídeo" : "Desligar som";
  });

  /* ---------- Mapa da rede ---------- */
  (function mapa() {
    var svg = $("#mapa");
    var terra = "M70,120 C120,60 220,40 300,58 C380,30 470,40 540,80 C600,110 630,170 610,240 C640,300 610,370 560,420 C500,470 420,480 360,470 C290,488 200,470 150,450 C80,470 30,430 28,370 C10,300 40,240 30,190 C25,160 45,140 70,120 Z";
    var defs = el("defs", {}, svg);
    var g = el("radialGradient", { id: "brilho" }, defs);
    el("stop", { offset: "0%", "stop-color": "#14e075", "stop-opacity": ".35" }, g);
    el("stop", { offset: "100%", "stop-color": "#14e075", "stop-opacity": "0" }, g);
    el("path", { d: terra, class: "terra" }, svg);
    for (var i = 0; i < 9; i++) {
      el("path", { class: "rua", d: "M" + (40 + i * 70) + ",60 C" + (70 + i * 60) + ",200 " + (20 + i * 72) + ",320 " + (60 + i * 66) + ",480" }, svg);
      el("path", { class: "rua", d: "M20," + (90 + i * 45) + " C200," + (60 + i * 48) + " 420," + (120 + i * 44) + " 630," + (80 + i * 46) }, svg);
    }
    var hub = D.unidades.find(function (u) { return u.tipo === "hub"; });
    var rotas = [];
    D.unidades.forEach(function (u) {
      if (u.tipo === "hub") return;
      var mx = (u.x + hub.x) / 2 + (u.y - hub.y) * 0.18, my = (u.y + hub.y) / 2 - (u.x - hub.x) * 0.18;
      rotas.push(el("path", { class: "rota", d: "M" + u.x + "," + u.y + " Q" + mx + "," + my + " " + hub.x + "," + hub.y }, svg));
    });
    var caminhao = el("circle", { r: 7, class: "caminhao" }, svg);
    var maxMassa = Math.max.apply(null, D.unidades.map(function (u) { return u.massa; }));
    var nos = {};
    D.unidades.forEach(function (u) {
      var grupo = el("g", { class: "no" + (u.tipo === "hub" ? " hub" : ""), tabindex: "0", role: "button", "aria-label": u.nome }, svg);
      el("circle", { class: "halo", cx: u.x, cy: u.y, r: 16 + 26 * Math.sqrt(u.massa / maxMassa) }, grupo);
      el("circle", { class: "miolo", cx: u.x, cy: u.y, r: u.tipo === "hub" ? 13 : 10 }, grupo);
      var dir = u.x > 480; var t = el("text", { x: u.x + (dir ? -18 : 18), y: u.y - 14, "text-anchor": dir ? "end" : "start" }, grupo);
      t.textContent = u.tipo === "hub" ? "Hub · " + u.nome : u.nome;
      grupo.addEventListener("click", function () { mostra(u.id); });
      grupo.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); mostra(u.id); } });
      nos[u.id] = grupo;
    });
    var ficha = $("#ficha");
    function mostra(id) {
      var u = D.unidades.find(function (x) { return x.id === id; });
      Object.keys(nos).forEach(function (k) { nos[k].classList.toggle("ativo", k === id); });
      var hubTxt = u.tipo === "hub";
      ficha.innerHTML =
        '<span class="tipo">' + (hubTxt ? "Hub central · também recebe entrada direta" : "Centro de coleta") + "</span>" +
        "<h3>" + u.nome + "</h3>" +
        "<dl>" +
        "<dt>" + (hubTxt ? "Chegadas diretas em 2025" : "Chegadas em 2025") + "</dt><dd>" + f0.format(u.chegadas) + "</dd>" +
        "<dt>Massa recebida no ano</dt><dd>" + f2.format(u.massa) + " kg</dd>" +
        "<dt>Massa por semana</dt><dd>" + f2.format(u.massa / 52) + " kg</dd>" +
        "<dt>Operadores</dt><dd>" + u.equipe + "</dd>" +
        "<dt>" + (hubTxt ? "Armazenamento compartilhado" : "Espaço de estoque") + "</dt><dd>" + u.estoque + " m³</dd>" +
        "</dl>" +
        '<div class="barra-massa" aria-hidden="true"><span style="width:' + (u.massa / maxMassa * 100) + '%"></span></div>' +
        '<p class="lead">' + (hubTxt
          ? "No hub o material é separado, prensado em fardos e armazenado até formar uma carga para o reciclador."
          : "O material fica guardado aqui até o estoque pedir a visita do caminhão.") + "</p>";
    }
    mostra("jabaquara");
    window.__mostraUnidade = mostra;
    if (!reduz) {
      var k = 0, t0 = performance.now();
      (function anda(t) {
        var p = ((t - t0) / 3200) % 1;
        if (p < 0.016) k = (k + 1) % rotas.length;
        var rota = rotas[k], L = rota.getTotalLength();
        var pt = rota.getPointAtLength(L * (p < 0.5 ? p * 2 : 2 - p * 2));
        caminhao.setAttribute("cx", pt.x); caminhao.setAttribute("cy", pt.y);
        requestAnimationFrame(anda);
      })(t0);
    } else { caminhao.remove(); }
  })();

  /* ---------- Fluxo animado das 8 etapas ---------- */
  var ETAPAS = [
    { t: ["Chegada ao", "centro de coleta"], z: 0, ico: "M-8,-2 a8,8 0 1 1 16,0 c0,8 -8,14 -8,14 c0,0 -8,-6 -8,-14 z M0,-2 m-3,0 a3,3 0 1 0 6,0 a3,3 0 1 0 -6,0",
      h: "Chegada ao centro de coleta",
      p: "Pessoas e comércios levam papelão, plástico e embalagens longa vida a um dos cinco centros de coleta.",
      f: ["21.388 chegadas nos centros em 2025", "382.416,20 kg no ano"] },
    { t: ["Pesagem e", "registro"], z: 0, ico: "M-12,10 h24 M0,10 v-14 M-10,-4 h20 M-10,-4 l-4,8 h8 z M10,-4 l-4,8 h8 z",
      h: "Pesagem e registro",
      p: "Cada entrega é recebida, pesada, registrada e separada por tipo de material. É aqui que o número de chegadas pesa, porque cada uma consome tempo da equipe.",
      f: ["4 min-operador por chegada", "2 operadores por centro, 3 em Embu das Artes"] },
    { t: ["Armazenamento", "nos centros"], z: 0, ico: "M-13,12 v-14 l13,-8 l13,8 v14 z M-6,12 v-9 h12 v9",
      h: "Armazenamento nos centros",
      p: "O material separado fica guardado no centro até juntar o suficiente para uma viagem do caminhão.",
      f: ["30 m³ em Pinheiros", "33 m³ nos demais centros"] },
    { t: ["Solicitação", "de coleta"], z: 1, ico: "M-9,-12 h18 v24 h-18 z M-5,-5 h10 M-5,0 h10 M-5,5 h6",
      h: "Solicitação de coleta",
      p: "Quando o estoque de um centro chega ao ponto de disparo, ele pede o caminhão. Se dois pedem juntos, vai primeiro o mais cheio.",
      f: ["Disparo a 15 m³", "Prioridade para o centro mais ocupado"] },
    { t: ["Transporte", "ao hub"], z: 1, ico: "M-14,6 v-12 h16 v12 z M2,-2 h7 l5,5 v3 h-12 M-8,9 a3,3 0 1 0 0.1,0 M8,9 a3,3 0 1 0 0.1,0",
      h: "Transporte ao hub",
      p: "Um único caminhão faz as viagens entre os centros e o hub. Como o material é leve e volumoso, o baú enche de espaço antes de chegar ao limite de peso.",
      f: ["Baú de 10 m³ a 95%", "461,50 kg por viagem", "Ciclo de 116,96 min", "22 viagens por semana"] },
    { t: ["Gestão de estoque", "e separação"], z: 2, ico: "M-14,12 v-18 h8 v18 M-4,12 v-18 h8 v18 M6,12 v-18 h8 v18",
      h: "Gestão de estoque e separação no hub",
      p: "O hub de Santo Amaro descarrega o caminhão, recebe também entregas diretas e organiza o material por família.",
      f: ["6 operadores", "493 m³ de armazenamento compartilhado", "655 chegadas diretas em 2025"] },
    { t: ["Prensagem e", "armazenamento"], z: 2, ico: "M-12,-12 h24 M0,-12 v8 M-8,-4 h16 v6 h-16 z M-12,12 h24 v-6 h-24 z",
      h: "Prensagem e armazenamento",
      p: "O material vira fardos compactos, que ocupam muito menos espaço e ficam prontos para venda.",
      f: ["2 prensas grandes e 4 pequenas", "Fardo de papelão de 200 kg"] },
    { t: ["Coleta pelo", "reciclador"], z: 3, ico: "M0,-12 l7,10 h-14 z M-12,10 l7,-10 l4,6 M12,10 l-7,-10",
      h: "Coleta pelo parceiro reciclador",
      p: "Quando os fardos de um material formam uma carga mínima, a expedição carrega o veículo do reciclador e a embalagem volta para a indústria.",
      f: ["6.400 kg de papelão", "1.900 kg de plástico", "6.480 kg de longa vida"] }
  ];
  var ZONAS = ["Centro de coleta", "Transporte", "Hub central", "Reciclador"];

  var etapaAtual = 0;
  (function fluxo() {
    var svg = $("#fluxo");
    var W = 1200, xs = [], ys = [];
    ETAPAS.forEach(function (_, i) { xs.push(80 + i * 148); ys.push(i % 2 ? 330 : 140); });
    var faixas = [[0, 3], [3, 5], [5, 7], [7, 8]];
    faixas.forEach(function (fx, z) {
      var x0 = z === 0 ? 8 : (xs[fx[0]] + xs[fx[0] - 1]) / 2;
      var x1 = z === 3 ? W - 8 : (xs[fx[1] - 1] + xs[fx[1]]) / 2;
      el("rect", { class: "zona", x: x0 + 4, y: 14, width: x1 - x0 - 8, height: 452, rx: 18 }, svg);
      var t = el("text", { class: "zona-rotulo", x: x0 + 20, y: 40 }, svg);
      t.textContent = ZONAS[z];
    });
    var d = "M" + xs[0] + "," + ys[0];
    for (var i = 1; i < xs.length; i++) {
      var cx = (xs[i - 1] + xs[i]) / 2;
      d += " C" + cx + "," + ys[i - 1] + " " + cx + "," + ys[i] + " " + xs[i] + "," + ys[i];
    }
    var caminho = el("path", { class: "caminho", d: d }, svg);
    var camadaParticulas = el("g", {}, svg);
    var nos = [];
    ETAPAS.forEach(function (e, i) {
      var g = el("g", { class: "etapa", tabindex: "0", role: "button", "aria-label": "Etapa " + (i + 1) + ": " + e.h, transform: "translate(" + xs[i] + "," + ys[i] + ")" }, svg);
      el("rect", { x: -66, y: -52, width: 132, height: 104 }, g);
      el("circle", { class: "n", cx: -50, cy: -36, r: 13 }, g);
      var n = el("text", { class: "n-txt", x: -50, y: -31 }, g); n.textContent = i + 1;
      el("path", { class: "ico", d: e.ico, transform: "translate(18,-22) scale(1.05)" }, g);
      e.t.forEach(function (linha, j) {
        var tt = el("text", { class: "rot", x: -54, y: 16 + j * 18 }, g); tt.textContent = linha;
      });
      g.addEventListener("click", function () { selecionaEtapa(i); });
      g.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); selecionaEtapa(i); } });
      nos.push(g);
    });
    var painel = $("#etapa-painel");
    function selecionaEtapa(i) {
      etapaAtual = i;
      nos.forEach(function (n, k) { n.classList.toggle("ativa", k === i); });
      var e = ETAPAS[i];
      painel.innerHTML = '<span class="olho">Etapa ' + (i + 1) + " de 8 · " + ZONAS[e.z] + "</span><h3>" + e.h + "</h3><p>" + e.p + '</p><div class="fatos">' +
        e.f.map(function (x) { return '<span class="fato">' + x + "</span>"; }).join("") + "</div>";
    }
    selecionaEtapa(0);
    window.__selecionaEtapa = selecionaEtapa;

    if (reduz) return;
    var L = caminho.getTotalLength();
    var cores = ["var(--papelao)", "var(--papelao)", "var(--plastico)", "var(--longavida)"];
    var particulas = [];
    var ultimo = 0;
    var corteFardo = null;
    (function () {
      // comprimento do caminho no ponto da etapa de prensagem
      var lo = 0, hi = L;
      for (var k = 0; k < 30; k++) { var m = (lo + hi) / 2; if (caminho.getPointAtLength(m).x < xs[6]) lo = m; else hi = m; }
      corteFardo = lo / L;
    })();
    function quadro(t) {
      if (t - ultimo > 220 && particulas.length < 60) {
        ultimo = t;
        var cor = cores[Math.floor(Math.random() * cores.length)];
        var c = el("circle", { r: 4.5, fill: cor, opacity: ".95" }, camadaParticulas);
        particulas.push({ n: c, p: 0, v: 0.0016 + Math.random() * 0.0009, off: (Math.random() - 0.5) * 18, cor: cor, fardo: false });
      }
      for (var i = particulas.length - 1; i >= 0; i--) {
        var q = particulas[i];
        // o caminhão leva em lote: as partículas aceleram no trecho de transporte
        var fator = (q.p > 0.33 && q.p < 0.6) ? 1.9 : 1;
        q.p += q.v * fator;
        if (q.p >= 1) { q.n.remove(); particulas.splice(i, 1); continue; }
        var pt = caminho.getPointAtLength(q.p * L);
        if (!q.fardo && q.p > corteFardo) {
          q.fardo = true; q.n.remove();
          q.n = el("rect", { width: 9, height: 7, rx: 1.5, fill: q.cor }, camadaParticulas);
        }
        if (q.fardo) { q.n.setAttribute("x", pt.x - 4.5); q.n.setAttribute("y", pt.y + q.off - 3.5); }
        else { q.n.setAttribute("cx", pt.x); q.n.setAttribute("cy", pt.y + q.off); }
      }
      requestAnimationFrame(quadro);
    }
    requestAnimationFrame(quadro);
  })();

  /* ---------- Visualizador do BPMN ---------- */
  (function bpmn() {
    var dlg = $("#bpmn"), area = $("#bpmn-area"), img = $("#bpmn-img");
    var s = 1, x = 0, y = 0, IW = 5654, IH = 1705;
    function aplica() { img.style.transform = "translate(" + x + "px," + y + "px) scale(" + s + ")"; }
    function ajusta() {
      var r = area.getBoundingClientRect();
      s = Math.min(r.width / IW, r.height / IH);
      x = (r.width - IW * s) / 2; y = (r.height - IH * s) / 2; aplica();
    }
    function zoom(f, cx, cy) {
      var r = area.getBoundingClientRect();
      if (cx == null) { cx = r.width / 2; cy = r.height / 2; }
      var ns = Math.max(0.05, Math.min(2.5, s * f));
      x = cx - (cx - x) * (ns / s); y = cy - (cy - y) * (ns / s); s = ns; aplica();
    }
    img.style.width = IW + "px"; img.style.height = IH + "px";
    $("#abrir-bpmn").addEventListener("click", function () { dlg.showModal(); requestAnimationFrame(ajusta); });
    $("#fechar-bpmn").addEventListener("click", function () { dlg.close(); });
    $$("[data-zoom]").forEach(function (b) {
      b.addEventListener("click", function () { var f = parseFloat(b.dataset.zoom); if (f === 0) ajusta(); else zoom(f); });
    });
    area.addEventListener("wheel", function (e) {
      e.preventDefault(); var r = area.getBoundingClientRect();
      zoom(e.deltaY < 0 ? 1.12 : 0.89, e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });
    var arr = null;
    area.addEventListener("pointerdown", function (e) { arr = { x: e.clientX - x, y: e.clientY - y }; area.setPointerCapture(e.pointerId); });
    area.addEventListener("pointermove", function (e) { if (!arr) return; x = e.clientX - arr.x; y = e.clientY - arr.y; aplica(); });
    area.addEventListener("pointerup", function () { arr = null; });
    window.addEventListener("resize", function () { if (dlg.open) ajusta(); });
  })();

  /* ---------- Gráfico de demanda ---------- */
  function eixos(svg, W, H, m, maxV, ticks, fmt) {
    for (var i = 0; i <= ticks; i++) {
      var v = maxV * i / ticks, y = H - m.b - (H - m.t - m.b) * i / ticks;
      el("line", { class: "grade", x1: m.l, x2: W - m.r, y1: y, y2: y }, svg);
      var t = el("text", { class: "rot", x: m.l - 8, y: y + 4, "text-anchor": "end" }, svg); t.textContent = fmt(v);
    }
  }
  var fmtCurto = function (v) {
    if (v >= 1e6) return f2.format(v / 1e6).replace(/,00$/, "") + " mi";
    if (v >= 1e3) return f0.format(v / 1e3) + " mil";
    return f0.format(v);
  };
  function graficoDemanda(serie) {
    var svg = $("#grafico-demanda"); svg.innerHTML = "";
    var W = 560, H = 340, m = { t: 30, r: 24, b: 34, l: 64 };
    var defs = el("defs", {}, svg), g = el("linearGradient", { id: "grad-area", x1: 0, x2: 0, y1: 0, y2: 1 }, defs);
    el("stop", { offset: "0%", "stop-color": "#14e075", "stop-opacity": ".28" }, g);
    el("stop", { offset: "100%", "stop-color": "#14e075", "stop-opacity": "0" }, g);
    var dados = D.demanda, vals = dados.map(function (d) { return d[serie]; });
    var maxV = Math.max.apply(null, vals) * 1.12;
    var fmt = serie === "porChegada" ? function (v) { return f0.format(v) + " kg"; } : fmtCurto;
    eixos(svg, W, H, m, maxV, 4, fmt);
    var X = function (i) { return m.l + (W - m.l - m.r) * i / (dados.length - 1); };
    var Y = function (v) { return H - m.b - (H - m.t - m.b) * v / maxV; };
    var dl = dados.map(function (d, i) { return (i ? "L" : "M") + X(i) + "," + Y(d[serie]); }).join(" ");
    el("path", { class: "area", d: dl + " L" + X(dados.length - 1) + "," + Y(0) + " L" + X(0) + "," + Y(0) + " Z" }, svg);
    var linha = el("path", { class: "linha", d: dl }, svg);
    if (!reduz) {
      var L = linha.getTotalLength();
      linha.style.strokeDasharray = L; linha.style.strokeDashoffset = L;
      linha.getBoundingClientRect();
      linha.style.transition = "stroke-dashoffset 1.2s ease"; linha.style.strokeDashoffset = 0;
    }
    dados.forEach(function (d, i) {
      el("circle", { class: d.obs ? "pt-obs" : "pt-proj", cx: X(i), cy: Y(d[serie]), r: 5 }, svg);
      var t = el("text", { class: "rot", x: X(i), y: H - 10, "text-anchor": "middle" }, svg); t.textContent = d.ano;
    });
    [1, dados.length - 1].forEach(function (i) {
      var v = dados[i][serie];
      var txt = serie === "porChegada" ? f2.format(v) + " kg" : serie === "massa" ? f2.format(v) + " kg" : f0.format(v);
      var t = el("text", { class: "rot-forte", x: X(i) + (i === 1 ? 8 : -6), y: Y(v) - 12, "text-anchor": i === 1 ? "start" : "end" }, svg);
      t.textContent = txt;
    });
  }
  function ligaAlternar(grupo, fn) {
    $$("button", grupo).forEach(function (b) {
      b.addEventListener("click", function () {
        $$("button", grupo).forEach(function (o) { o.classList.toggle("ativo", o === b); o.setAttribute("aria-pressed", String(o === b)); });
        fn(b.dataset.serie || b.dataset.ano);
      });
    });
  }
  graficoDemanda("massa");
  ligaAlternar($("#desafio .alternar"), graficoDemanda);

  /* ---------- Barras de utilização ---------- */
  function barras(cont, itens) {
    var maxV = Math.max(120, Math.ceil(Math.max.apply(null, itens.map(function (i) { return i.v; })) * 1.06 / 20) * 20);
    var existentes = $$(".barra-uso", cont);
    if (existentes.length !== itens.length) {
      cont.innerHTML = "";
      itens.forEach(function () {
        var b = html("div", "barra-uso", null, cont);
        b.innerHTML = '<span class="nome"></span><span class="trilho"><span class="enche"></span><span class="marca m85" data-rot="85%"></span><span class="marca m100" data-rot="100%"></span></span><span class="val"></span>';
      });
      existentes = $$(".barra-uso", cont);
    }
    itens.forEach(function (it, k) {
      var b = existentes[k];
      $(".nome", b).innerHTML = it.nome + (it.sub ? "<small>" + it.sub + "</small>" : "");
      $(".val", b).textContent = pct(it.v);
      $(".m85", b).style.left = (85 / maxV * 100) + "%";
      $(".m85", b).dataset.rot = maxV > 200 ? "" : "85%";
      $(".m100", b).style.left = (100 / maxV * 100) + "%";
      var e = $(".enche", b);
      e.className = "enche" + (it.v > 100 ? " estoura" : it.v > 85 ? " limite" : "");
      requestAnimationFrame(function () { e.style.width = Math.min(100, it.v / maxV * 100) + "%"; });
    });
  }

  /* ---------- Resultado 1: sem mudança ---------- */
  var RECADOS = {
    2025: "Hoje sobra capacidade. O caminhão é o recurso mais usado, a <b>72,43%</b>, e a rede ainda tem folga de <b>151.118,38 kg</b> no ano.",
    2026: "O caminhão chega a <b>97,79%</b>. Na média ainda cabe, mas a folga de 2025 é consumida em um único ano de crescimento.",
    2027: "O caminhão estoura e precisaria rodar <b>132,01%</b> do que consegue. É o primeiro limite real da rede.",
    2028: "O gargalo muda de dono. As equipes dos centros passam do limite, com <b>109,22%</b>, porque cada chegada consome tempo de atendimento.",
    2029: "Caminhão a <b>240,59%</b> e equipes dos centros a <b>216,50%</b>. Os dois recursos ficam muito além do que a estrutura atual entrega.",
    2030: "As equipes dos centros precisariam trabalhar <b>433,84%</b> do tempo disponível, e o estoque mais apertado encheria em <b>0,80 dia</b>."
  };
  var anoSem = 2025;
  function resultadoSem(ano) {
    anoSem = ano;
    var d = D.semMudanca[ano];
    barras($("#barras-sem"), [
      { nome: "Caminhão", sub: "transporte entre centros e hub", v: d.transporte },
      { nome: "Equipes dos centros", sub: "centro mais carregado", v: d.centros },
      { nome: "Equipe do hub", sub: "Santo Amaro", v: d.hub }
    ]);
    $("#recado-sem").innerHTML = RECADOS[ano];
    $$("#anos button").forEach(function (b) { b.setAttribute("aria-pressed", String(+b.dataset.ano === ano)); });
  }
  [2025, 2026, 2027, 2028, 2029, 2030].forEach(function (a) {
    var b = html("button", null, String(a), $("#anos"));
    b.type = "button"; b.dataset.ano = a; b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", function () { resultadoSem(a); });
  });
  resultadoSem(2025);
  window.__resultadoSem = resultadoSem;

  /* ---------- Resultado 2: medidas isoladas ---------- */
  function isoladas(ano) {
    var cont = $("#isoladas-grade");
    var maxV = ano == 2027 ? 140 : 460;
    if (!cont.children.length) {
      D.medidasIsoladas.forEach(function (m) {
        var c = html("div", "iso", null, cont);
        c.innerHTML = "<h3>" + m.medida + '</h3><div class="par"><div class="col"><span></span><div class="b"></div><small>Caminhão</small></div><div class="col"><span></span><div class="b"></div><small>Equipes</small></div></div>';
      });
    }
    D.medidasIsoladas.forEach(function (m, i) {
      var c = cont.children[i], cols = $$(".col", c);
      [m["t" + ano], m["e" + ano]].forEach(function (v, k) {
        $("span", cols[k]).textContent = pct(v);
        var b = $(".b", cols[k]);
        b.classList.toggle("estoura", v > 100);
        b.style.height = Math.max(4, v / maxV * 120) + "px";
      });
    });
  }
  isoladas(2027);
  ligaAlternar($("#alternar-isoladas"), isoladas);

  /* ---------- Resultado 3: linha do tempo ---------- */
  D.plano.forEach(function (p) {
    var li = html("li", null, null, $("#linha-tempo"));
    li.innerHTML = '<span class="ano">' + p.ano + '</span><span class="tag">' + p.tag + '</span>' +
      '<div class="bloco"><b>Conta agregada</b><p>' + p.rccp + '</p><span class="pico">recurso mais carregado a ' + pct(p.pico) + "</span></div>" +
      '<div class="bloco"><b>Ajuste da simulação</b><p>' + p.simul + "</p></div>";
  });

  /* ---------- Resultado 4: comparação ---------- */
  function graficoComp(serie) {
    var svg = $("#grafico-comp"); svg.innerHTML = "";
    var W = 560, H = 340, m = { t: 30, r: 16, b: 34, l: 58 };
    var a = serie === "recusa" ? "recusaRccp" : "estoqueHubRccp", b = serie === "recusa" ? "recusaAjustada" : "estoqueHubAjustado";
    var maxV = serie === "recusa" ? 70 : 500;
    var fmt = serie === "recusa" ? function (v) { return f0.format(v) + "%"; } : function (v) { return f0.format(v) + " m³"; };
    eixos(svg, W, H, m, maxV, 5, fmt);
    var Y = function (v) { return H - m.b - (H - m.t - m.b) * v / maxV; };
    if (serie === "estoque") {
      el("line", { class: "ref", x1: m.l, x2: W - m.r, y1: Y(493), y2: Y(493) }, svg);
      var tr = el("text", { class: "rot", x: W - m.r, y: Y(493) - 6, "text-anchor": "end" }, svg); tr.textContent = "capacidade do hub, 493 m³";
    }
    var n = D.comparacao.length, larg = (W - m.l - m.r) / n, bw = Math.min(34, larg * 0.32);
    D.comparacao.forEach(function (d, i) {
      var cx = m.l + larg * i + larg / 2;
      [[a, "barra-a", -1], [b, "barra-b", 1]].forEach(function (s) {
        var v = d[s[0]]; if (v == null) return;
        var x = d[b] == null ? cx - bw / 2 : cx + (s[2] < 0 ? -bw - 3 : 3);
        var r = el("rect", { class: s[1], x: x, width: bw, y: Y(0), height: 0, rx: 3 }, svg);
        var y = Y(v), h = Y(0) - y;
        if (reduz) { r.setAttribute("y", y); r.setAttribute("height", h); }
        else setTimeout(function () { r.style.transition = "all .8s cubic-bezier(.2,.8,.2,1)"; r.setAttribute("y", y); r.setAttribute("height", h); }, 30 + i * 90);
        var t = el("text", { class: "rot-forte", x: x + bw / 2, y: y - 6, "text-anchor": "middle" }, svg);
        t.textContent = serie === "recusa" ? f2.format(v) + "%" : f2.format(v);
        t.style.fontSize = "11px";
      });
      var ta = el("text", { class: "rot", x: cx, y: H - 10, "text-anchor": "middle" }, svg); ta.textContent = d.ano;
    });
  }
  graficoComp("recusa");
  ligaAlternar($("#alternar-comp"), graficoComp);

  /* ---------- E se? ---------- */
  var ese = { ano: 2028 };
  var campos = {
    massa: $("#ese-massa"), chegadas: $("#ese-chegadas"), prensas: $("#ese-prensas"),
    bau: $("#ese-bau"), caminhoes: $("#ese-caminhoes"), operadores: $("#ese-operadores")
  };
  [2025, 2026, 2027, 2028, 2029, 2030].forEach(function (a) {
    var b = html("button", null, String(a), $("#ese-anos"));
    b.type = "button"; b.dataset.ano = a;
    b.addEventListener("click", function () { ese.ano = a; calculaEse(); });
  });
  var NOMES = { transporte: "o caminhão", centros: "as equipes dos centros", hub: "a equipe do hub" };
  function calculaEse() {
    $("#out-massa").textContent = campos.massa.value + "%";
    $("#out-chegadas").textContent = campos.chegadas.value + "%";
    $("#out-caminhoes").textContent = campos.caminhoes.value;
    $("#out-operadores").textContent = campos.operadores.value;
    $$("#ese-anos button").forEach(function (b) { b.setAttribute("aria-pressed", String(+b.dataset.ano === ese.ano)); });
    var o = {
      ano: ese.ano, crescMassa: campos.massa.value / 100, crescChegadas: campos.chegadas.value / 100,
      prensas: +campos.prensas.value, bau: +campos.bau.value, caminhoes: +campos.caminhoes.value, operadores: +campos.operadores.value
    };
    var r;
    try { r = window.Simulador.calcular(o); } catch (err) { $("#ese-veredito").innerHTML = '<span class="titulo">Não foi possível calcular</span><p>Volte para a estrutura atual e tente de novo.</p>'; return; }
    barras($("#ese-barras"), [
      { nome: "Caminhão", sub: o.caminhoes + (o.caminhoes > 1 ? " caminhões" : " caminhão") + ", baú de " + o.bau + " m³", v: r.transporte },
      { nome: "Equipes dos centros", sub: "mais carregada, " + r.centroNome, v: r.centros },
      { nome: "Equipe do hub", sub: "Santo Amaro", v: r.hub }
    ]);
    var usos = { transporte: r.transporte, centros: r.centros, hub: r.hub };
    var pior = Object.keys(usos).sort(function (a, b) { return usos[b] - usos[a]; })[0], pico = usos[pior];
    var ver = $("#ese-veredito");
    var p = D.presets[ese.ano];
    var ehPlano = +campos.massa.value === 35 && +campos.chegadas.value === 105 && p.prensas === o.prensas && p.bau === o.bau && p.caminhoes === o.caminhoes && p.operadores === o.operadores;
    var extra = ehPlano && ese.ano > 2025 ? " Esta é a configuração indicada pelo TCC para " + ese.ano + "." : "";
    if (pico <= 85) { ver.className = "veredito ok"; ver.innerHTML = '<span class="titulo">Atende com folga</span><p>O recurso mais carregado é ' + NOMES[pior] + ", a " + pct(pico) + ", abaixo da margem de 85%." + extra + "</p>"; }
    else if (pico <= 100) { ver.className = "veredito limite"; ver.innerHTML = '<span class="titulo">Atende, mas no limite</span><p>' + cap(NOMES[pior]) + " fica a " + pct(pico) + ", acima da margem de 85% para os imprevistos." + extra + "</p>"; }
    else { ver.className = "veredito estoura"; ver.innerHTML = '<span class="titulo">Não atende</span><p>' + cap(NOMES[pior]) + " precisaria de " + pct(pico) + " da capacidade. " + dica(pior) + "</p>"; }
    $("#ese-mini").innerHTML =
      "<div><b>" + f0.format(r.demandaSemana) + " kg</b><span>a transportar por semana</span></div>" +
      "<div><b>" + f0.format(r.chegadasSemana) + "</b><span>chegadas por semana nos centros</span></div>" +
      "<div><b>" + f2.format(r.cargaViagem) + " kg</b><span>por viagem, " + f0.format(r.viagens) + " viagens possíveis</span></div>";
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function dica(pior) {
    if (pior === "transporte") return "Experimente prensas nos centros, um baú maior ou mais um caminhão.";
    if (pior === "centros") return "Experimente colocar mais operadores nos centros.";
    return "O hub é o último recurso a apertar na conta agregada.";
  }
  Object.keys(campos).forEach(function (k) { campos[k].addEventListener("input", calculaEse); });
  function aplicaPreset(ano, plano) {
    var p = plano ? D.presets[ano] : D.presets[2025];
    campos.massa.value = 35; campos.chegadas.value = 105;
    campos.prensas.value = p.prensas; campos.bau.value = p.bau; campos.caminhoes.value = p.caminhoes; campos.operadores.value = p.operadores;
    calculaEse();
  }
  $("#ese-atual").addEventListener("click", function () { aplicaPreset(ese.ano, false); });
  $("#ese-plano").addEventListener("click", function () { aplicaPreset(ese.ano, true); });
  calculaEse();
  window.__ese = { ano: function (a) { ese.ano = a; }, preset: aplicaPreset };

  /* ---------- Modelo do SIMUL8 anotado ---------- */
  (function () {
    var W = 2466, H = 760;
    var ROTULOS = [[410, "Embu das Artes"], [820, "Pinheiros"], [1240, "Jabaquara"], [1720, "Paraisópolis"], [2180, "Brooklin"]];
    var MARCAS = [
      [790, 30, "Chegadas de material", "Cada seta é uma família de material, papelão, plástico ou longa vida, chegando ao centro de coleta."],
      [665, 108, "Recebimento e pesagem", "A equipe confere e pesa cada material que chega."],
      [980, 140, "Equipe do centro", "Os operadores que atendem as chegadas, com seus turnos."],
      [810, 160, "Estoque do centro", "O material fica aqui até juntar uma carga e o caminhão ser chamado."],
      [773, 385, "Rota até o hub", "O caminho da carga de cada centro até o hub."],
      [1375, 385, "Caminhão", "O veículo que liga os cinco centros ao hub, com baú de 10 m³."],
      [1240, 22, "Material recusado", "O que não cabe no estoque sai por aqui. É assim que a simulação mede a recusa."],
      [1247, 455, "Descarga no hub", "O caminhão chega e a carga entra no hub central."],
      [1385, 575, "Chegadas diretas no hub", "O hub também recebe material na própria porta."],
      [1197, 610, "Equipe do hub", "Os operadores do recebimento, da separação e das prensas."],
      [1710, 465, "Prensas", "Transformam o material solto em fardos compactos."],
      [1900, 455, "Expedição", "Os fardos são carregados e seguem para o reciclador."]
    ];
    var caixa = $("#modelo-img"), faixa = $("#modelo-faixa");
    ROTULOS.forEach(function (r) {
      var s = document.createElement("span"); s.className = "modelo-rotulo"; s.textContent = r[1];
      s.style.left = (r[0] / W * 100) + "%"; faixa.appendChild(s);
    });
    var hub = document.createElement("span"); hub.className = "modelo-rotulo hub"; hub.textContent = "Hub central";
    hub.style.left = (1560 / W * 100) + "%"; hub.style.top = (560 / H * 100) + "%"; caixa.appendChild(hub);
    var botoes = [], atual = 0;
    function marca(i) {
      atual = (i + MARCAS.length) % MARCAS.length;
      botoes.forEach(function (b, k) { b.classList.toggle("ativa", k === atual); b.setAttribute("aria-pressed", String(k === atual)); });
      $("#modelo-n").textContent = atual + 1;
      $("#modelo-titulo").textContent = MARCAS[atual][2];
      $("#modelo-texto").textContent = MARCAS[atual][3];
    }
    MARCAS.forEach(function (m, i) {
      var b = document.createElement("button"); b.type = "button"; b.className = "marca"; b.textContent = i + 1;
      b.style.left = (m[0] / W * 100) + "%"; b.style.top = (m[1] / H * 100) + "%";
      b.setAttribute("aria-label", (i + 1) + ". " + m[2]); b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () { marca(i); });
      caixa.appendChild(b); botoes.push(b);
    });
    $("#modelo-ant").addEventListener("click", function () { marca(atual - 1); });
    $("#modelo-prox").addEventListener("click", function () { marca(atual + 1); });
    marca(0);
    window.__marcaModelo = marca;
  })();

  /* ---------- Vídeo do SIMUL8 ---------- */
  (function () {
    var v = $("#simul8");
    var bts = [].slice.call(document.querySelectorAll("#velocidade button"));
    function velocidade(x) {
      v.playbackRate = x;
      bts.forEach(function (b) { var on = Number(b.dataset.v) === x; b.classList.toggle("ativo", on); b.setAttribute("aria-pressed", String(on)); });
    }
    bts.forEach(function (b) { b.addEventListener("click", function () { velocidade(Number(b.dataset.v)); if (v.paused) v.play().catch(function () {}); }); });
    v.addEventListener("ratechange", function () { var x = v.playbackRate; bts.forEach(function (b) { var on = Number(b.dataset.v) === x; b.classList.toggle("ativo", on); b.setAttribute("aria-pressed", String(on)); }); });
    window.__videoSimul8 = function (x) { velocidade(x); v.play().catch(function () {}); };
  })();

  /* ---------- Slider imagem/vídeo e tela cheia ---------- */
  (function () {
    var abas = [].slice.call(document.querySelectorAll("#midia-abas button"));
    var slides = [].slice.call(document.querySelectorAll(".midia-slide"));
    var trilho = $("#midia-trilho"), v = $("#simul8"), legenda = $("#midia-legenda");
    var LEGENDAS = [
      legenda.innerHTML,
      "O modelo rodando uma semana de operação. O relógio no canto mostra o dia e o turno simulados."
    ];
    var slide = 0;
    function vai(i) {
      var antes = slide; slide = i;
      if (i !== antes) slides[i].classList.remove("entra-dir", "entra-esq"), void slides[i].offsetWidth, slides[i].classList.add(i > antes ? "entra-dir" : "entra-esq");
      abas.forEach(function (b, k) { b.classList.toggle("ativo", k === i); b.setAttribute("aria-selected", String(k === i)); });
      slides.forEach(function (sl, k) { sl.setAttribute("aria-hidden", String(k !== i)); });
      legenda.innerHTML = LEGENDAS[i];
      if (i !== 1 && !v.paused) v.pause();
    }
    abas.forEach(function (b, k) { b.addEventListener("click", function () { vai(k); }); });
    var toque = null;
    trilho.addEventListener("touchstart", function (e) { toque = e.touches[0].clientX; }, { passive: true });
    trilho.addEventListener("touchend", function (e) {
      if (toque === null) return;
      var dx = e.changedTouches[0].clientX - toque; toque = null;
      if (e.target.closest(".modelo-img")) return;
      if (Math.abs(dx) > 60) vai(dx < 0 ? 1 : 0);
    });
    vai(0);

    var sair = $("#sair-tela"), aberto = null, entrouNativo = false;
    function abre() {
      aberto = slide === 0 ? $("#modelo") : $("#video-simul8");
      aberto.classList.add("tela-cheia"); document.body.classList.add("com-tela-cheia"); sair.hidden = false;
      var d = document.documentElement;
      if (!document.fullscreenElement && d.requestFullscreen) { d.requestFullscreen().then(function () { entrouNativo = true; }).catch(function () {}); }
    }
    function fecha() {
      if (!aberto) return;
      aberto.classList.remove("tela-cheia"); document.body.classList.remove("com-tela-cheia"); sair.hidden = true; aberto = null;
      if (entrouNativo && document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
      entrouNativo = false;
    }
    $("#tela-cheia").addEventListener("click", abre);
    sair.addEventListener("click", fecha);
    document.addEventListener("keydown", function (e) {
      if (!aberto) return;
      if (e.key === "Escape") fecha();
      else if (aberto.id === "modelo" && (e.key === "ArrowRight" || e.key === "ArrowDown")) { e.preventDefault(); $("#modelo-prox").click(); }
      else if (aberto.id === "modelo" && (e.key === "ArrowLeft" || e.key === "ArrowUp")) { e.preventDefault(); $("#modelo-ant").click(); }
    });
    document.addEventListener("fullscreenchange", function () { if (entrouNativo && !document.fullscreenElement) { entrouNativo = false; fecha(); } });
    window.__midia = { vai: vai, fecha: fecha };
  })();

  /* ---------- Modo estande ---------- */
  var estande = /[?&]modo=estande/.test(location.search);
  var botaoEstande = $("#botao-estande");
  var ROTEIRO = [
    { id: "inicio", s: 14 },
    { id: "resumo", s: 14 },
    { id: "problema", s: 12 },
    { id: "rede", s: 12, f: function (t) { ["pinheiros", "jabaquara", "brooklin", "embu", "santoamaro"].forEach(function (u, i) { t(function () { window.__mostraUnidade(u); }, 2200 * i); }); } },
    { id: "operacao", s: 20, f: function (t) { for (var i = 0; i < 8; i++) (function (k) { t(function () { window.__selecionaEtapa(k); }, 2400 * k); })(i); } },
    { id: "desafio", s: 13, f: function (t) { t(function () { $('[data-serie="chegadas"]', $("#desafio")).click(); }, 5000); t(function () { $('[data-serie="porChegada"]', $("#desafio")).click(); }, 9000); } },
    { id: "metodo", s: 12 },
    { id: "lentes", s: 26, f: function (t) {
      window.__midia.vai(0);
      for (var i = 0; i < 12; i++) (function (k) { t(function () { window.__marcaModelo(k); }, 1500 * k); })(i);
      t(function () { window.__midia.vai(1); window.__videoSimul8(8); }, 18500);
      t(function () { window.__midia.vai(0); }, 25800);
    } },
    { id: "resultados", s: 16, f: function (t) { [2025, 2026, 2027, 2028, 2029, 2030].forEach(function (a, i) { t(function () { window.__resultadoSem(a); }, 2500 * i); }); } },
    { id: "isoladas", s: 11, f: function (t) { t(function () { $('[data-ano="2030"]', $("#alternar-isoladas")).click(); }, 5500); } },
    { id: "plano", s: 14 },
    { id: "comparacao", s: 14, f: function (t) { t(function () { $('[data-serie="estoque"]', $("#alternar-comp")).click(); }, 7000); } },
    { id: "e-se", s: 16, f: function (t) { [2026, 2028, 2030].forEach(function (a, i) { t(function () { window.__ese.ano(a); window.__ese.preset(a, false); }, 5000 * i); t(function () { window.__ese.preset(a, true); }, 5000 * i + 2500); }); } },
    { id: "valor", s: 14 },
    { id: "equipe", s: 14 }
  ];
  var timers = [], emTour = false, ocioso = null;
  var OCIOSO_MS = 60000;
  function limpa() { timers.forEach(clearTimeout); timers = []; }
  function agenda(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function tour(i) {
    emTour = true; $("#aviso-estande").hidden = false;
    var passo = ROTEIRO[i % ROTEIRO.length];
    var alvo = document.getElementById(passo.id);
    window.scrollTo({ top: alvo.offsetTop - 48, behavior: reduz ? "auto" : "smooth" });
    if (passo.f) passo.f(agenda);
    agenda(function () { tour(i + 1); }, passo.s * 1000);
  }
  function paraTour() {
    if (emTour) { limpa(); emTour = false; $("#aviso-estande").hidden = true; }
    clearTimeout(ocioso);
    if (estande) ocioso = setTimeout(function () { tour(0); }, OCIOSO_MS);
  }
  function ligaEstande(on) {
    estande = on;
    document.body.classList.toggle("estande", on);
    botaoEstande.setAttribute("aria-pressed", String(on));
    if (on) {
      if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(function () {});
      paraTour();
    } else {
      limpa(); emTour = false; clearTimeout(ocioso); $("#aviso-estande").hidden = true;
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
    }
  }
  botaoEstande.addEventListener("click", function (e) { e.stopPropagation(); ligaEstande(!estande); });
  ["pointerdown", "keydown", "wheel", "touchstart"].forEach(function (ev) {
    window.addEventListener(ev, function (e) { if (e.target === botaoEstande) return; if (estande) paraTour(); }, { passive: true });
  });
  /* Setas do teclado trocam de seção no modo estande */
  var telas = [].slice.call(document.querySelectorAll("main > section.tela"));
  function telaAtual() {
    var y = window.scrollY + window.innerHeight * 0.35, idx = 0;
    telas.forEach(function (t, i) { if (t.offsetTop <= y) idx = i; });
    return idx;
  }
  function vaiPara(i) {
    var alvo = telas[Math.max(0, Math.min(telas.length - 1, i))];
    window.scrollTo({ top: alvo.offsetTop - 48, behavior: reduz ? "auto" : "smooth" });
  }
  window.addEventListener("keydown", function (e) {
    if (!estande || e.altKey || e.ctrlKey || e.metaKey) return;
    if (document.querySelector("dialog[open]") || document.body.classList.contains("com-tela-cheia")) return;
    var el = document.activeElement;
    if (el && (/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName) || el.isContentEditable)) return;
    var proximo = ["ArrowDown", "ArrowRight", "PageDown"].indexOf(e.key) >= 0;
    var anterior = ["ArrowUp", "ArrowLeft", "PageUp"].indexOf(e.key) >= 0;
    if (!proximo && !anterior) return;
    e.preventDefault();
    vaiPara(telaAtual() + (proximo ? 1 : -1));
  });
  if (estande) ligaEstande(true);
})();
