# Investigación primaria: experiencia cinematográfica Real Madrid

Fecha de corte: 11 de agosto de 2026  
Alcance: referencia Rockstar Games / GTA VI, presencia oficial contemporánea de Real Madrid y requisitos técnicos de GSAP, Next.js, accesibilidad y rendimiento.

## Convenciones de evidencia

- **[O] Observación directa:** comportamiento o contenido visible en una página oficial revisada.
- **[D] Documentado:** afirmación respaldada explícitamente por documentación, especificación o contenido oficial.
- **[I] Inferencia:** interpretación o decisión propuesta para este proyecto; no se presenta como implementación interna del sitio de referencia.
- **[L] Límite:** algo que esta fase no verificó y que debe comprobarse con navegador o medición posterior.

Esta distinción es importante: no se inspeccionó ni se pretende reconstruir el código privado de Rockstar o Real Madrid. Las inferencias describen una traducción de principios, no un clon.

## Resumen ejecutivo

1. **[O]** El micrositio de GTA VI construye una narrativa larga con navegación mínima, imágenes dominantes, trailers, personajes y lugares organizados como capítulos. La home anticipa explícitamente que hay más contenido al hacer scroll; la página “Only in Leonida” alterna personajes, citas, medios, repetición de vídeo y destinos explorables. [GTA VI oficial](https://www.rockstargames.com/VI), [Only in Leonida](https://www.rockstargames.com/VI/only-in-leonida)
2. **[I]** Lo transferible no es su composición literal, paleta ni arte: es la secuencia de capítulos, la jerarquía de medios sobre interfaz, el texto breve y la continuidad entre escenas.
3. **[O]** La web oficial de Real Madrid combina contenido institucional, calendario, noticias, comunidad, comercio, estadio, historia y palmarés. **[D]** La voz oficial se apoya en excelencia, espíritu ganador, compromiso, universalidad, respeto, solidaridad y humildad. [Home oficial](https://www.realmadrid.com/en-US), [Valores oficiales](https://www.realmadrid.com/en-US/the-club/values)
4. **[I]** La dirección adecuada es una base sobria blanca, navy y metálica, fotografía monumental y datos históricos como prueba; reservar el lenguaje cinematográfico intenso para el Bernabéu, los grandes momentos y el palmarés.
5. **[D]** El stack debe evitar dos APIs obsoletas desde el inicio: en Next.js 16, `next/image priority` está deprecado en favor de `preload`; en GSAP, `ScrollTrigger.matchMedia()` está deprecado en favor de `gsap.matchMedia()`. [Next.js Image](https://nextjs.org/docs/app/api-reference/components/image), [GSAP: API deprecada](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.matchMedia%28%29/), [GSAP: API vigente](https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/)
6. **[D]** Objetivos “buenos” de Core Web Vitals al percentil 75: LCP ≤ 2,5 s, INP ≤ 200 ms y CLS ≤ 0,1. [Umbrales oficiales de Core Web Vitals](https://web.dev/articles/defining-core-web-vitals-thresholds)
7. **[D]** El contenido y las marcas del sitio oficial de Real Madrid no quedan licenciados por el mero acceso; su aviso legal restringe reproducción, modificación y comunicación pública sin autorización. **[I]** El prototipo público debe usar material propio, licenciado o expresamente autorizado, y no afirmar afiliación oficial. [Aviso legal de Real Madrid](https://www.realmadrid.com/en-US/legal/legal-notice)

## 1. Rockstar Games / GTA VI

### Comportamiento observado

- **[O]** La home actual presenta un enlace para saltar al contenido, navegación expandible, CTA de reserva, fecha de lanzamiento y plataformas antes de desarrollar la narrativa. Esto mantiene las acciones esenciales accesibles aunque el resto sea muy visual. [GTA VI oficial](https://www.rockstargames.com/VI)
- **[O]** Tras el bloque inicial aparece una secuencia extensa de imágenes y la instrucción “Scroll for more content”, seguida por trailers, ediciones, bonos, sinopsis, acceso a “People & Places”, descargas y noticias. [GTA VI oficial](https://www.rockstargames.com/VI)
- **[O]** “Only in Leonida” alterna repetidamente nombre de personaje, cita corta, descripción, imagen o vídeo, control “Rewatch Video” y enlaces para explorar lugares. La página funciona como una sucesión de capítulos editoriales, no como un catálogo uniforme. [Only in Leonida](https://www.rockstargames.com/VI/only-in-leonida)
- **[O]** Rockstar entrega por separado un póster de gran formato y el logotipo del póster, ambos con parámetros de ancho/densidad. Esto demuestra separación de recursos visuales en la entrega; no prueba por sí solo el número exacto de capas animadas del hero. [Póster oficial](https://www.rockstargames.com/VI/_next/static/media/poster_full.0az_iud2g3y4j.jpg?akim=1&imdensity=1&imwidth=3840), [logotipo de póster](https://www.rockstargames.com/VI/_next/static/media/poster_logo.0m-7c805zusl7.png?akim=1&imdensity=1&imwidth=3840)

### Lectura de diseño

- **[I]** La sensación cinematográfica proviene de tratar el scroll como montaje: cada bloque introduce sujeto, contexto y transición; el medio visual lleva el peso y el texto actúa como titular o pie editorial.
- **[I]** Para Real Madrid, la equivalencia narrativa más sólida es: escudo → Bernabéu → equipo → Europa → historia → momentos → futuro. No se deben trasladar personajes, paleta, logotipos, ilustraciones, copy ni composición exacta de GTA VI.
- **[I]** La navegación debe ofrecer salidas claras y anclas reales incluso cuando haya secuencias `pinned`; una experiencia inmersiva no debe encerrar al visitante en la timeline.
- **[I]** Las transiciones principales deben ser continuidad de escena —por escala, máscara o cambio de plano— y no una cadena de fades independientes.

### Lo que falta observar en prototipo

- **[L]** Esta fase documenta la arquitectura y recursos oficiales disponibles, pero no constituye QA visual multipantalla ni una medición de FPS del sitio de Rockstar.
- **[L]** Antes de congelar la dirección visual hay que registrar en navegador real, como evidencia separada, 1920×1080, 2560×1440, 1440×900, tablet, iPhone y Android: pinning, duración relativa de escenas, crop, carga, transiciones, hover y fallback móvil.
- **[L]** Cualquier afirmación futura sobre curvas, distancias o implementación probable deberá etiquetarse como inferencia salvo evidencia reproducible.

## 2. Real Madrid: sitio e identidad contemporánea

### Ecosistema oficial observado

- **[O]** La home abre el ecosistema con accesos a Madridistas, entradas, hospitality, tour, tienda y RM Play; después combina actualidad, próximos eventos, comunidad, colecciones oficiales, palmarés, estadio y especiales. [Home oficial](https://www.realmadrid.com/en-US)
- **[O]** La historia oficial está organizada por décadas y combina crónica con hitos y logros cuantificados. En la etapa 2021–2030 destaca la 15.ª Copa de Europa de 2024 y el bloque “Six Champions League titles in 10 years”. [Historia oficial del primer equipo](https://www.realmadrid.com/en-US/the-club/history/football/first-team/)
- **[O]** El palmarés se expresa mediante números grandes y categorías —Copas de Europa, Mundiales de Clubes, Supercopas, ligas y copas—, una materia prima natural para tipografía monumental. [Historia del club](https://www.realmadrid.com/en-US/the-club/history)
- **[D]** La página de valores define excelencia, compromiso, espíritu ganador, trabajo en equipo, respeto, universalidad, solidaridad y humildad; cierra con el lema institucional “Until the end”. [Valores oficiales](https://www.realmadrid.com/en-US/the-club/values)
- **[D]** La experiencia oficial “Bernabéu Infinito” utiliza Apple Vision Pro, vídeo inmersivo 180°, 3D estereoscópico, 8K y audio espacial. Esto respalda que inmersión, estadio y tecnología son una asociación contemporánea auténtica para la marca. [Anuncio oficial de Bernabéu Infinito](https://www.realmadrid.com/en-US/news/club/madridistas/bernabeu-infinito-la-nueva-experiencia-inmersiva-del-tour-bernabeu-sin-coste-para-socios-y-madridistas-platinum-14-07-2026)
- **[D]** La megastore oficial del Bernabéu emplea más de 40 metros de pantallas LED y dos túneles inmersivos; el estadio se posiciona también como destino de entretenimiento. [Anuncio oficial de la megastore](https://www.realmadrid.com/en-US/news/club/latest-news/nueva-tienda-05-06-2024), [Bernabéu oficial](https://bernabeu.realmadrid.com/en-US)

### Traducción propuesta

- **[I]** Base visual: blanco luminoso y navy institucional; negro para capítulos de memoria/trofeos; metal/plata como eco arquitectónico del Bernabéu. Estos son lineamientos del proyecto, no una reproducción declarada de un manual de marca.
- **[I]** El prestigio debe demostrarse: fecha, trofeo, estadio, rival, momento y fotografía contextual. Evitar claims vacíos o una estética genérica de lujo.
- **[I]** La arquitectura del Bernabéu puede actuar como motivo de transición: lamas, túneles, anillo, césped y luz. Su uso debe ser abstracto y propio, no una copia del diseño de otra campaña.
- **[I]** Una tipografía display de gran escala puede cargar la emoción; metadatos compactos y legibles deben sostener el contexto histórico.
- **[I]** El número 15 es válido como hecho histórico en el corte de esta investigación, pero debe provenir de datos centralizados para poder actualizarse si cambia el palmarés.

### Propiedad intelectual y contenido

- **[D]** El aviso legal afirma que textos, fotografías, gráficos, imágenes, iconos, audiovisuales, diseño y código pertenecen a Real Madrid o terceros; el acceso no concede derechos de explotación sobre marcas ni contenido. [Aviso legal](https://www.realmadrid.com/en-US/legal/legal-notice)
- **[D]** El mismo aviso prohíbe reproducir, alterar, distribuir o comunicar públicamente contenido fuera de lo autorizado y prohíbe insinuar patrocinio o aprobación inexistentes. [Aviso legal](https://www.realmadrid.com/en-US/legal/legal-notice)
- **[I]** Para un repositorio público de prueba: utilizar fotografía y vídeo propios o con licencia explícita, documentar autor/licencia, evitar hotlinking a `assets.realmadrid.com`, no reutilizar el escudo oficial salvo base jurídica/autorización, y mostrar un aviso claro de proyecto conceptual no afiliado.

## 3. GSAP y ScrollTrigger

### Capacidades y requisitos actuales

- **[D]** ScrollTrigger se importa y registra explícitamente; soporta `pin`, `scrub`, `snap`, callbacks, marcadores de desarrollo, scroll vertical/horizontal y recálculo al redimensionar. No aplica scroll-jacking por defecto. [Documentación oficial de ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- **[D]** ScrollTrigger calcula posiciones de inicio/fin por adelantado, agrupa eventos de scroll y sincroniza actualizaciones con el refresco de pantalla; recalcula tras resize. [Documentación oficial de ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- **[D]** La documentación advierte no animar directamente el elemento fijado porque altera las mediciones; se debe fijar un contenedor y animar descendientes. [Documentación oficial de ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- **[D]** `ScrollTrigger.refresh()` recalcula posiciones; crear triggers en orden visual y refrescar después de que medios/tipografías cambien el layout reduce offsets incorrectos. [Documentación oficial de refresh](https://gsap.com/docs/v3/Plugins/ScrollTrigger/refresh%28%29/)
- **[D]** `gsap.matchMedia()` crea contextos que revierten automáticamente animaciones y ScrollTriggers al dejar de coincidir una media query, y admite condiciones de viewport y `prefers-reduced-motion`. [Documentación oficial de gsap.matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/)
- **[D]** `ScrollTrigger.matchMedia()` está deprecado desde GSAP 3.11 en favor de `gsap.matchMedia()`. [Aviso oficial](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.matchMedia%28%29/)
- **[D]** En React, `useGSAP()` de `@gsap/react` encapsula el contexto, limita selectores mediante `scope` y revierte animaciones/ScrollTriggers al desmontar; callbacks tardíos deben envolverse con `contextSafe()` y los listeners propios deben eliminarse. [Repositorio oficial de @gsap/react](https://github.com/greensock/react)

### Reglas para este proyecto

- **[I]** Una timeline por escena profunda; no un trigger por cada palabra o elemento ornamental.
- **[I]** Limitar `pin` + `scrub` a escenas protagonistas y crear variantes móviles más cortas. La ausencia de animación debe dejar todo el contenido visible y en orden semántico.
- **[I]** Usar `markers` solo en desarrollo; no embarcarlos en producción.
- **[I]** Crear triggers en orden DOM, después de conocer dimensiones críticas; usar `invalidateOnRefresh` cuando los valores dependan del viewport y un `ScrollTrigger.refresh(true)` controlado tras carga de medios/fuentes cuando sea necesario.
- **[I]** Animar principalmente `transform` y `opacity`; aplicar `clip-path` con moderación. Evitar escrituras/lecturas de layout mezcladas en `onUpdate`.
- **[I]** No usar la API deprecada `ScrollTrigger.matchMedia()`.
- **[I]** No introducir smooth scroll hasta que la narrativa funcione con scroll nativo. Si se añade Lenis, debe ser una mejora reversible, desactivarse con movimiento reducido y validarse en teclado, touch y restauración de scroll.

## 4. Next.js Image y Font

### Imágenes

- **[D]** `next/image` sirve tamaños adecuados, formatos modernos, carga diferida fuera del viewport y reserva dimensiones para reducir layout shift. [Guía oficial de imágenes](https://nextjs.org/docs/app/getting-started/images)
- **[D]** En Next.js 16, `priority` está deprecado; la API vigente ofrece `preload`. La carga predeterminada es `lazy`, mientras `eager` fuerza carga inmediata. [Referencia oficial de Image](https://nextjs.org/docs/app/api-reference/components/image)
- **[D]** Con `fill`, el padre debe establecer contexto de posicionamiento y `sizes` debe describir el ancho renderizado. Sin un `sizes` correcto, el navegador puede asumir `100vw` y descargar una variante excesiva. [Referencia oficial de Image](https://nextjs.org/docs/app/api-reference/components/image)
- **[I]** Reservar `preload` para un único candidato LCP inequívoco. Si hay duda o el recurso no es LCP, preferir `fetchPriority="high"` o `loading="eager"` según el caso y medir el waterfall.
- **[I]** No colocar `preload` en todos los layers del hero: competirían por ancho de banda. Cargar primero el plano visual que construye el LCP y diferir capas atmosféricas.

### Fuentes

- **[D]** `next/font` autoaloja fuentes locales o de Google, elimina solicitudes externas en runtime y ofrece `display`, `preload`, `fallback`, `adjustFontFallback` y variables CSS. [Referencia oficial de Font](https://nextjs.org/docs/app/api-reference/components/font)
- **[D]** `display` usa `swap` por defecto; el preload de las fuentes seleccionadas está activo por defecto. Las fuentes definidas en el root layout se precargan para todas sus rutas. [Referencia oficial de Font](https://nextjs.org/docs/app/api-reference/components/font)
- **[I]** Usar como máximo una familia display y una de interfaz, preferiblemente variables y con subconjuntos mínimos. Centralizar su definición para no crear instancias duplicadas.
- **[I]** Si no existe licencia para una tipografía de marca, escoger una alternativa licenciada y documentar la licencia; no extraer archivos de la web oficial.

## 5. Movimiento reducido y WCAG 2.2

- **[D]** `prefers-reduced-motion` detecta si el usuario ha solicitado minimizar movimiento no esencial; sus valores son `no-preference` y `reduce`. [Media Queries Level 5](https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion)
- **[D]** WCAG 2.2 SC 2.3.3 señala que la animación no esencial provocada por interacción debe poder desactivarse; W3C identifica parallax y movimiento adicional durante scroll como posibles desencadenantes vestibulares. [Comprender SC 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)
- **[D]** WCAG 2.2 SC 2.2.2 exige mecanismo para pausar, detener u ocultar movimiento automático que dura más de cinco segundos y aparece en paralelo con otro contenido, salvo que sea esencial. [Comprender SC 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide)
- **[D]** WCAG 2.2 también exige contraste, foco visible, estructura y operación por teclado; el contenido que aparece por hover/focus debe ser descartable, hoverable y persistente en los casos cubiertos. [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [Contenido en hover o focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)

### Contrato de modo reducido

- **[I]** Desactivar smooth scroll, parallax, `scrub`, desplazamientos grandes, zooms y máscaras expansivas.
- **[I]** No ocultar inicialmente contenido esperando una timeline que ya no se reproducirá; renderizar el estado final estable.
- **[I]** Sustituir vídeo decorativo autoplay por poster y pausar cualquier reproducción ya iniciada.
- **[I]** Conservar transiciones breves de opacidad solo si no comunican información imprescindible y no producen malestar.
- **[I]** Exponer la preferencia como una decisión común a CSS y JavaScript; probar el cambio en caliente mediante `gsap.matchMedia()`.

## 6. Core Web Vitals y presupuesto

- **[D]** Core Web Vitals actuales: LCP mide carga percibida del contenido principal; INP, respuesta a interacciones; CLS, estabilidad visual. [Definición oficial](https://web.dev/articles/defining-core-web-vitals-thresholds)
- **[D]** Umbrales “buenos” al percentil 75: LCP ≤ 2,5 s, INP ≤ 200 ms y CLS ≤ 0,1. Umbrales “pobres”: LCP > 4 s, INP > 500 ms y CLS > 0,25. [Umbrales oficiales](https://web.dev/articles/defining-core-web-vitals-thresholds)
- **[D]** La evaluación debe apoyarse en datos de campo; la librería `web-vitals` permite instrumentar LCP, INP y CLS para RUM. [Web Vitals oficial](https://web.dev/articles/vitals)
- **[I]** Lighthouse y pruebas de laboratorio son puertas de CI, no sustitutos de CrUX/RUM. Al existir tráfico, evaluar el percentil 75 por tipo de página y dispositivo.
- **[I]** Presupuesto inicial propuesto para el prototipo: un único recurso LCP priorizado; cero shift atribuible a imagen/fuente; JavaScript de animación cargado solo en la experiencia; ninguna tarea larga evitable durante apertura de menú/galería.
- **[I]** Medir por escena: bytes de imagen/vídeo, tiempo de main thread, memoria, FPS durante scroll, long tasks, LCP, INP y CLS. La meta de 60 FPS es un objetivo de producto que debe registrarse en hardware definido, no una afirmación previa.

## 7. Optimización de imagen y vídeo

### Imagen

- **[D]** AVIF o WebP pueden acompañarse de fallback; imágenes responsive y `sizes` permiten que el navegador elija una variante acorde al espacio renderizado. [Formatos de imagen](https://web.dev/articles/choose-the-right-image-format), [Imágenes responsive](https://web.dev/articles/serve-responsive-images)
- **[D]** El recurso LCP no debe cargarse de forma lazy; la carga diferida es para contenido fuera del viewport. [Impacto del lazy loading en LCP](https://web.dev/articles/lcp-lazy-loading)
- **[I]** Exportar por uso, no solo por dispositivo: hero, escena full bleed, retrato editorial, thumbnail y poster. Definir `sizes` según layout real y auditar el recurso elegido en Network.
- **[I]** Evitar una fotografía de 6000 px para una miniatura; conservar variantes de alta resolución solo donde la composición full-screen lo justifique.

### Vídeo

- **[D]** Para reproducción iniciada por el usuario, `preload="none"` evita solicitar el vídeo de antemano; `metadata` solicita solo metadatos de forma aproximada. Un `poster` ofrece contexto antes de reproducir. [Rendimiento de vídeo](https://web.dev/learn/performance/video-performance)
- **[D]** Un autoplay decorativo debe ser `muted` y `playsinline`; los vídeos autoplay comienzan a descargar aunque estén fuera del viewport, por lo que deben diferirse conscientemente. [Rendimiento de vídeo](https://web.dev/learn/performance/video-performance)
- **[D]** WebM y MP4 pueden ofrecerse como fuentes alternativas; el orden de `<source>` determina cuál selecciona primero el navegador entre formatos compatibles. [Rendimiento de vídeo](https://web.dev/learn/performance/video-performance)
- **[D]** Eliminar la pista de audio de un vídeo puramente decorativo reduce bytes; un embed de terceros puede bloquear el main thread, por lo que una fachada activada por clic puede ser preferible. [Rendimiento de vídeo](https://web.dev/learn/performance/video-performance)
- **[I]** Preparar `desktop-high`, `desktop-medium`, `mobile` y `poster`; no servir 4K a móvil. Pausar vídeos lejos del viewport y desconectar fuentes si no volverán a usarse pronto.
- **[I]** El hero debe ser útil con poster aunque el vídeo falle, esté bloqueado, use ahorro de datos o el usuario prefiera movimiento reducido.

## 8. Diálogos accesibles para vídeo y menú

- **[D]** En un diálogo modal, el contenido de fondo debe quedar inerte; `Tab` y `Shift+Tab` permanecen en el diálogo, `Escape` cierra y al cerrar el foco vuelve normalmente al disparador. [Patrón oficial de diálogo modal](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- **[D]** El contenedor requiere `role="dialog"`, `aria-modal="true"` y nombre mediante `aria-labelledby` o `aria-label`. Debe existir un control visible de cierre. [Patrón oficial de diálogo modal](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- **[D]** Para contenido largo o estructurado, WAI recomienda enfocar un encabezado o elemento estático con `tabindex="-1"`; `aria-describedby` puede omitirse si convertiría estructura compleja en una lectura plana. [Patrón oficial de diálogo modal](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- **[I]** Al abrir vídeo: conservar el disparador, mover foco al título o control adecuado, activar el medio solo tras acción explícita y no iniciar audio automáticamente.
- **[I]** Al cerrar: pausar, limpiar estado fullscreen si existe, devolver foco y restaurar scroll sin salto. El botón cerrar debe tener nombre accesible y objetivo táctil suficiente.
- **[I]** El menú fullscreen comparte requisitos modales si bloquea el resto de la página. Si se implementa como navegación no modal, no debe declarar `aria-modal` ni atrapar foco.

## 9. Decisiones que deben pasar al prototipo

1. Construir primero un hero con un candidato LCP claro, poster estable y 2–3 capas reales; añadir capas solo si la diferencia visual supera el coste.
2. Probar una transición hero → Bernabéu con contenedor pinned y descendientes animados; variante móvil sin pin largo.
3. Implementar el modo reducido antes de añadir la timeline completa.
4. Probar un jugador editorial y un cambio de jugador operable por teclado, touch y controles visibles; el scroll horizontal es una presentación, no el único mecanismo de acceso.
5. Probar un modal de vídeo contra el patrón WAI-ARIA completo.
6. Usar `useGSAP()` con `scope`, `contextSafe()` para callbacks tardíos y cleanup verificable.
7. Usar `gsap.matchMedia()`, nunca `ScrollTrigger.matchMedia()`.
8. Usar `next/image preload` solo para LCP; nunca la prop deprecada `priority` en Next.js 16.
9. Medir Network, LCP/CLS/INP, long tasks y FPS antes de aprobar una escena.
10. Mantener el contenido en DOM semántico y legible aunque JavaScript, vídeo o animación fallen.

## 10. Matriz de verificación posterior

| Área | Evidencia requerida | Criterio de salida |
|---|---|---|
| Referencia | Grabación/screenshot por viewport del sitio de referencia | Observación separada de inferencia |
| Hero | Waterfall, LCP element y tamaños descargados | Un solo LCP priorizado; sin lazy en LCP |
| Scroll | Perfil de rendimiento y grabación | Sin saltos de pin; interacción nativa preservada |
| Mobile | 390×844 y 430×932 en navegador real | Sin overflow, pin excesivo ni vídeo desktop |
| Reduced motion | Captura y prueba automatizada de media query | Contenido inmediato; sin scrub/parallax |
| Modal | Prueba de teclado y lector de pantalla | Foco entra, queda contenido, Escape cierra y foco vuelve |
| Imágenes | Network por breakpoint | `sizes` coincide con render; formatos y dimensiones adecuados |
| Vídeo | Network antes/después de intersección/acción | No descarga prematura fuera del viewport |
| Web Vitals | Lighthouse + RUM cuando haya tráfico | LCP ≤ 2,5 s; INP ≤ 200 ms; CLS ≤ 0,1 al p75 |
| Legal | Inventario de assets y licencias | Ningún asset sin procedencia/autorización |

## 11. Fuentes primarias consultadas

- [Rockstar Games — Grand Theft Auto VI](https://www.rockstargames.com/VI)
- [Rockstar Games — Only in Leonida](https://www.rockstargames.com/VI/only-in-leonida)
- [Real Madrid — web oficial](https://www.realmadrid.com/en-US)
- [Real Madrid — valores](https://www.realmadrid.com/en-US/the-club/values)
- [Real Madrid — historia del primer equipo](https://www.realmadrid.com/en-US/the-club/history/football/first-team/)
- [Real Madrid — aviso legal](https://www.realmadrid.com/en-US/legal/legal-notice)
- [GSAP — ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [GSAP — gsap.matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/)
- [GreenSock — @gsap/react](https://github.com/greensock/react)
- [Next.js — Image](https://nextjs.org/docs/app/api-reference/components/image)
- [Next.js — Font](https://nextjs.org/docs/app/api-reference/components/font)
- [W3C — Media Queries Level 5](https://www.w3.org/TR/mediaqueries-5/)
- [W3C — WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WAI-ARIA APG — Dialog modal](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [web.dev — Core Web Vitals](https://web.dev/articles/defining-core-web-vitals-thresholds)
- [web.dev — rendimiento de vídeo](https://web.dev/learn/performance/video-performance)

