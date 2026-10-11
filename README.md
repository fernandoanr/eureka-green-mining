# Green Mining · Capacidade até 2030

Site interativo do TCC "Planejamento agregado em sistemas de logística reversa: aplicação à Green Mining", apresentado na Eureka 2026 (Stand 9, PMN01).

## Como abrir

O site é estático. Para rodar no computador:

```bash
python3 -m http.server 8000
```

e abrir `http://localhost:8000`. Para o monitor do estande, use `http://localhost:8000/?modo=estande` (ou o botão "Modo estande"): tela cheia e apresentação automática depois de 1 minuto sem interação. No modo estande, as setas do teclado trocam de seção.

## Onde mexer

- Textos: `index.html`
- Visual: `assets/css/style.css`
- Números do TCC usados nos gráficos: `assets/js/dados.js`
- Simulador "E se": `assets/js/simulador.js`, sobre o motor RCCP v16 em `assets/js/rccp/`
- Vídeo do SIMUL8: salvar como `assets/video/simul8.mp4` (MP4 H.264). Enquanto o arquivo não existe, aparece a imagem do modelo.
