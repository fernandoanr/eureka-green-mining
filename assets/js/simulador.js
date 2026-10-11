/* Camada "E se" sobre o motor RCCP v16 (rccp-model.js + rccp-baseline.js).
   Projeta o cenário-base de 2025 para o ano escolhido e aplica a escada de intervenções do TCC. */
(function (root) {
  "use strict";

  function projetar(ano, crescMassa, crescChegadas) {
    var s = root.RCCPBaseline.create();
    var n = ano - 2025;
    var fm = Math.pow(1 + crescMassa, n);
    var fa = Math.pow(1 + crescChegadas, n);
    s.routes.forEach(function (r) {
      r.demand *= fm;
      r.materials.forEach(function (m) { m.annualMass *= fm; });
    });
    s.centers.forEach(function (c) {
      ["visitsPerWeek", "visitsPerCalendarWeek", "visitsPerObservedCoverageWeek", "arrivalVisits"].forEach(function (k) { c[k] *= fa; });
    });
    s.hub.directVisitsPerWeek *= fa;
    s.hub.directWeeklyMass *= fm;
    s.hub.directMaterials.forEach(function (m) { m.annualMass *= fm; });
    s.hub.materials.forEach(function (m) { m.annualMass *= fm; });
    return s;
  }

  function prensaNoCentro(c, tipo) {
    var g = tipo === "grande";
    c.localPress = Object.assign({}, c.localPress, {
      enabled: true, pressCount: 1,
      largePressCount: g ? 1 : 0, smallPressCount: g ? 0 : 1,
      largePercent: { "Papelão": g ? 100 : 0, "Plástico": g ? 100 : 0, "Longa vida": g ? 100 : 0 }
    });
  }

  /* opcoes: { ano, crescMassa, crescChegadas, prensas: 0|1|2, bau: 10|15, caminhoes, operadores } */
  function montar(o) {
    var s = projetar(o.ano, o.crescMassa, o.crescChegadas);
    var C = function (nome) { return s.centers.find(function (c) { return c.name === nome; }); };
    if (o.prensas >= 1) {
      prensaNoCentro(C("Pinheiros"), "grande");
      prensaNoCentro(C("Jabaquara"), "pequena");
      s.hub.largePressCount = 1; s.hub.smallPressCount = 3;
    }
    if (o.prensas >= 2) {
      prensaNoCentro(C("Paraisópolis"), "pequena");
      prensaNoCentro(C("Embu das Artes"), "pequena");
      prensaNoCentro(C("Brooklin"), "pequena");
      s.hub.smallPressCount = 1;
    }
    s.truckVolume = o.bau || 10;
    s.truckCount = o.caminhoes || 1;
    for (var i = 0; i < (o.operadores || 0); i++) {
      var r = root.RCCPModel.calculateIntegrated(s);
      var topo = r.collectionCenters.centerResults.slice().sort(function (a, b) { return b.utilization - a.utilization; })[0];
      C(topo.name).staff += 1;
    }
    return s;
  }

  function calcular(o) {
    var s = montar(o);
    var r = root.RCCPModel.calculateIntegrated(s);
    var cs = r.collectionCenters.centerResults;
    var topo = cs.slice().sort(function (a, b) { return b.utilization - a.utilization; })[0];
    return {
      transporte: r.transport.effectiveUtilization,
      centros: topo.utilization,
      centroNome: topo.name,
      hub: r.hub.utilization,
      demandaSemana: r.transport.totalDemand,
      chegadasSemana: cs.reduce(function (a, c) { return a + c.visitsPerWeek; }, 0),
      viagens: r.transport.effectiveTrips,
      cargaViagem: r.transport.tripCapacity
    };
  }

  root.Simulador = { calcular: calcular };
})(window);
