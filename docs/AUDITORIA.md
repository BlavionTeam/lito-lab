# Auditoría de Lito Lab · 2026-09-11 (ecos-v26 → v27)

Medida sobre el código real, no a ojo. Cada número de aquí sale de una ejecución
reproducible; los comandos están al final de cada sección.

Resumen: **el juego está técnicamente sano**. Los problemas serios no están en el
rendimiento ni en la seguridad, sino en **el balance** — uno de los tres caminos de
progresión no funciona, y las recompensas que se añadieron en ecos-v24 inflaban la moneda
permanente.

---

## 1. Rendimiento del cliente · sin hallazgos

Medido en un móvil simulado de 390×844 con una partida avanzada (zona 80, nivel 60, 12
renaceres, mochila llena de 40 piezas, 70 trofeos), golpeando a 16 clics por segundo
durante cuatro segundos:

| Medida | Resultado |
| --- | --- |
| Carga hasta `load` | 324 ms |
| FPS medio en combate | 60,0 |
| Mediana entre fotogramas | 16,7 ms |
| Percentil 95 | 16,7 ms |
| Peor fotograma | 16,8 ms |
| Fotogramas de más de 32 ms | **0** |
| Memoria JS | 10 MB |
| Nodos del DOM | 1.408 |

Abrir cada panel: Equipo 97 ms, Talentos 48 ms, Campamento 44 ms, Mascotas 41 ms.

No hay nada que optimizar. El trabajo de BUG-007 (dejar de reconstruir el HUD sesenta
veces por segundo) se nota: el peor fotograma de toda la muestra es de 16,8 ms.

---

## 2. Accesibilidad · un hallazgo, corregido

Recorriendo todos los elementos visibles y componiendo el fondo real a través de los
ancestros translúcidos:

- **Contraste**: 0 textos por debajo del mínimo WCAG AA. También con la paleta nueva.
- **Área táctil**: 5 botones por debajo de 44×44 px — los cinco «Detalles» de las
  habilidades, de 102×32. **Corregido**: ahora 44 px en las tres medidas de pantalla.

Lo que la auditoría automática **no** cubre y sigue sin acreditar: lectores de pantalla
reales, y el coste de accesibilidad ya conocido de BUG-002 (bloquear el pellizco impide
ampliar con los dedos; fue una petición explícita).

---

## 3. Seguridad · aplicada en ecos-v25

Linter de seguridad y rendimiento de Supabase, cuatro hallazgos:

| Hallazgo | Decisión |
| --- | --- |
| `players_guard` con `search_path` mutable | **Corregido** (migración v8). Era el único con riesgo real. |
| RLS evaluando `auth.uid()` por fila | **Corregido** (migración v8). |
| Vista `ranking` es SECURITY DEFINER | **Aceptado**: es lo que permite ver el ranking sin abrir el resto de la tabla. Solo expone nombre, puntuación, zona, renaceres y nivel. |
| Funciones `admin_*` ejecutables por cualquier autenticado | **Aceptado**: todas comprueban el rol por dentro; sin rol devuelven cero filas o error. Verificado por SQL. |
| Protección de contraseñas filtradas desactivada | **Aceptado a propósito**: el juego usa PIN numérico y activarla rechazaría PINs comunes, dejando fuera a jugadores. |

Revisión de XSS en todo lo añadido (panel de administración, ranking, ficha de rival,
desafíos): los datos de otros jugadores pasan por `htmlText` o por `textContent`.

---

## 4. Balance · **los dos hallazgos serios de esta auditoría**

### 4.1 La ruta de solo compañeros no funciona

`npm run balance` simula tres formas de jugar sobre el código real:

| Ruta | Zona final | Muro |
| --- | --- | --- |
| Solo clic (4 clics/s) | 30 | jefe z30, 1 h de farmeo |
| **Solo compañeros (0,5 clics/s)** | **1** | **jefe z1: se queda 24,5× corto** |
| Mixta (2 clics/s) | 27 | jefe z27, 1 h de farmeo |

Un jugador que quiera jugar al juego **como idle** —contratar compañeros y dejarlos
trabajar— no pasa del primer jefe. No es un matiz de ajuste fino: es 24 veces corto.

En un clicker idle, poder avanzar sin tocar la pantalla es la mitad del género. Hoy Lito
Lab es un clicker puro con adorno idle. **Es la mejora de gameplay con más impacto
posible** y está desarrollada en la sección 6.

### 4.2 Las recompensas de progresión inflaban las almas · corregido

Las cadenas de desafíos de ecos-v24 pagaban `paso + 1` almas por escalón: 77 almas si se
completaban todas. El alma es la moneda **permanente**, la que no se pierde al renacer.

Medido contra las cuentas reales, lo que cada jugador habría cobrado de golpe al abrir la
pestaña Progresión por primera vez:

| Jugador | Almas que tenía | Cobraba antes | Cobra ahora |
| --- | --- | --- | --- |
| Campaña | 0 | 24 | 8 |
| Lito | 15 | 24 | 8 |
| alberto | 2 | **16 (×8)** | 2 |
| Junior | 0 | 2 | 0 |

**Corregido**: los escalones bajos pagan oro (que se reinicia al renacer y no descuadra
nada) con un 60 % extra de compensación, y las almas se reservan para los **dos últimos
escalones de cada cadena**, que son los que cuesta llegar. El total baja de 77 a 54 y el
golpe inicial deja de ser un salto de escala.

### 4.3 Lo que sigue sin medir

Las tandas diaria y semanal pagan oro medido en enemigos de tu zona (un diario ≈ 320
enemigos ≈ 5 minutos de juego) y 2-3 almas por semanal. No está simulado a lo largo de
semanas. Si aparece inflación, los números están juntos en `POOL_DIA` y `POOL_SEMANA`.

---

## 5. Deuda técnica · un riesgo, sin urgencia

| Medida | Valor |
| --- | --- |
| `index.html` | 2.848 líneas · 248 KB |
| JavaScript del juego | 1.832 líneas · 145 KB · 143 funciones |
| CSS | 678 líneas |
| Líneas de más de 300 caracteres | 41 (la peor, 1.302) |
| Variables de estado a nivel de módulo | 17 |
| Suites de prueba | 12 archivos · 59 comprobaciones + CI de navegador |

Todo el juego vive en un archivo. Hoy **no es un problema**: carga en 324 ms, la red de
pruebas es densa y el archivo único simplifica el despliegue (Pages sirve la raíz, sin
compilación). El riesgo es de mantenimiento: 41 líneas de más de 300 caracteres son
difíciles de revisar, y un cambio en una de ellas es donde más fácil se cuela un error.

Recomendación: **no partir el archivo** mientras el proyecto siga siendo de una persona y
un agente. Sí acortar las líneas largas cuando se toquen, que es gratis.

---

## 6. Sugerencias de gameplay, por impacto

Ordenadas por lo que aportan frente a lo que cuestan. Las tres primeras salen de datos de
esta auditoría; las demás, de jugar al juego.

### 1. Arreglar la ruta idle · impacto alto, esfuerzo medio

El dato: solo compañeros no pasa del jefe z1. Propuesta concreta:

- Subir la potencia base de los dos primeros compañeros (Escudero 0,6 → 2; Arquera 5 → 12)
  para que el inicio sin clics sea viable.
- Que la maestría de compañeros (hoy +1 % por nivel hasta 100) arranque más rápido.
- Volver a correr `npm run balance` y no dar por bueno nada hasta que la ruta «solo
  compañeros» llegue al menos a la zona 12 (el primer renacer).

Sin esto, el botón «×2 daño cada 25 niveles» del campamento promete algo que el juego no
cumple.

### 2. Un uso para el oro tardío · impacto alto, esfuerzo bajo

Un jugador de zona 60 tiene billones de oro y nada que comprar: las mejoras están al
máximo y los compañeros suben de dos en dos. El oro deja de ser una decisión.

Propuesta: **reliquias de oro**, mejoras de coste exponencial sin tope (+1 % de daño cada
una, precio ×1,15) que se pierden al renacer. Convierte el oro sobrante en progreso y da
algo que hacer en la última hora antes de renacer.

### 3. Sets de equipo · impacto medio, esfuerzo medio

Hoy el equipo se resuelve solo: «Equipar lo mejor» y a otra cosa. No hay decisión.

Propuesta: que dos piezas de la misma rareza den un bono de conjunto (p. ej. dos épicas:
+15 % de daño crítico). De golpe hay que elegir entre la pieza más fuerte y la que
completa el conjunto — y la mochila deja de ser una lista ordenada por número.

### 4. Los jefes necesitan algo más que un cronómetro · impacto medio, esfuerzo medio

Ahora un jefe es un enemigo con más vida, tiempo límite y un punto débil que aparece solo.
Propuesta barata: **fases**. Al 50 % de vida, el jefe se «enfurece» (ya existe el estado
visual `fury`) y hace algo: acelera el temporizador, o hay que golpear tres puntos débiles
seguidos para quitarle un escudo. Cambia «aguanta» por «reacciona».

### 5. Enseñar el combo antes · impacto medio, esfuerzo bajo

El combo multiplica hasta ×5 el daño por clic y **solo se desbloquea al renacer**. Un
jugador nuevo juega horas sin saber que existe. Propuesta: enseñarlo en la zona 5 con un
nivel máximo de ×2, y que el renacer lo amplíe. El tutorial ya tiene un hueco para ello.

### 6. Fusión de mascotas · impacto bajo, esfuerzo bajo

Las mascotas repetidas suben de nivel y ya está. Con la forja de equipo ya construida,
aplicar lo mismo a mascotas (tres iguales → una de rareza superior) es casi gratis y le da
sentido a seguir comprando huevos cuando ya tienes las doce especies.

### 7. Una capa más de prestigio · impacto alto, esfuerzo alto

Para un jugador de 12 renaceres el bucle ya no sorprende. El género lo resuelve con una
segunda capa (renacer de renaceres) que reinicia las almas a cambio de una moneda nueva.
Es lo que da vida al juego pasadas las primeras semanas, pero es un proyecto en sí: no lo
abordaría hasta que la ruta idle (punto 1) esté arreglada.

---

## Cómo reproducir esta auditoría

```
npm run balance                      # simulación de progresión por rutas
npm test                             # 59 comprobaciones
node scripts/agent.mjs check         # coherencia de documentos e IDs
```

El rendimiento y la accesibilidad se midieron con Playwright sobre el juego servido en
local; los scripts son de usar y tirar y están descritos arriba con sus números para poder
repetirlos. Los datos de jugadores salen de consultas de solo lectura al proyecto de
Supabase.
