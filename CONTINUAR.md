# Lito Lab · continuidad · 7 septiembre 2026

## Fuente de verdad y continuidad reconciliada

El roadmap vigente es el Excel original de Drive `148gnxlqyOBPhhzToJoa4ylJVDVpOPr2M`.
El 7 septiembre se reemplazó correctamente en el mismo ID: bloqueo de escritura
resuelto. Reconciliadas #20, #21, #22, #23, #26 y añadida #30, conservando las
descripciones de las 29 tareas originales. Recuentos: 20 hechas, 2 en curso,
8 sin empezar; 6 cruciales abiertas. START HERE de Drive enlaza esta continuidad
y la regla permanente de deploy.

## Producción

- URL: https://miguel-flores-garcia.github.io/lito-lab/
- GitHub Pages sirve `main` desde la raíz. No hay build de producción.
- PR #1 fusionada en `4d0a27a556ec2d1982a101e0dba93fcee9d1fbd5`, SW `ecos-v12`.
- Verificados en producción: carga, entrada como invitado e inventario nuevo.
- PR #2 fusionada en `f5d2384957036ea15104491ccb1bcd51581c107c`, SW `ecos-v13`.
- Verificado después del deploy: SW v13, pantalla de carga, perfil Invitado y estado sin insignias; cierre del diálogo y regreso al juego.

## Mejoras implementadas

| Roadmap | Cambio | Verificación |
| --- | --- | --- |
| #20 | Mochila compacta, cuatro huecos explícitos, ficha al tocar; equipar/quitar y venta con confirmación | 0/4 → 1/4 → 4/4, apertura y acciones en navegador |
| #21 | Resultado integrado de Equipar lo mejor: piezas, cambio CLIC/DPS y porcentajes, estado sin cambios | Equipar individual, automático y segunda pulsación sin cambios |
| #22 | Mascota fuera de la superficie de ataque | Coordenadas de mascota, etiqueta JEFE, nombre, vida y cronómetro sin intersección |
| #26 | Siete accesos móviles visibles; CLIC/DPS solo en Combate | Acceso a Mascotas, Talentos, Renacer, Ranking y Equipo |
| #30 (nuevo) | Pantalla breve de carga y marca Lito Lab | Arranque con salida de seguridad y prefers-reduced-motion |
| #23 | Nombre de la cuenta o Invitado, perfil y hasta tres insignias obtenidas, ordenables | Selección, límite de tres, reordenación; pruebas de persistencia |

QA móvil mediante documentos de 320×568, 390×844 y 430×932 en Chrome,
además de escritorio. Esto no sustituye una prueba en Safari/iPhone físico.
En pantallas muy cortas la arena permite scroll para evitar solapes.
La consola solo mostró mensajes de una extensión del navegador de pruebas.

## Roadmap sincronizado

Excel original guardado y verificado: versión ecos-v13, fuentes actuales,
recuentos automáticos y notas de QA. No usar el antiguo ZIP como continuidad.
La prueba de esta auditoría comprobó que el HTML público coincide con main
(blob e56cbf0e2ddff42e83a9b424d9b3479a5898c116) y sw.js sirve ecos-v13.
La moneda propia de #25 sigue pendiente. El fondo claro del popover ya existe;
no declarar completada la pasada visual global por ese cambio parcial.

## Próximas prioridades

1. Esperar las indicaciones de Miguel tras revisar pendientes; no iniciar nuevas mejoras automáticamente.
2. #6: conflictos simultáneos de guardado. Existe snapshot `save_prev`, pero
   falta control atómico de versiones. No declarar resuelto el incidente de Alberto.
3. #29: cuenta admin. **No está creada y no hay Usuario/PIN entregables.**
   Se requiere rol real comprobado en backend, denegación a usuarios normales,
   secretos fuera del repositorio y pruebas positivas/negativas de autorización.
4. #28: habilidades: estados/activación y desbloqueos avanzados.
5. #8: el trigger calcula ranking a partir del `save` del cliente; esto no es
   protección antitrampas completa. Sigue En curso.
6. #9 pipeline con pruebas/revisión/secretos; #25 pulido visual global; #4 fusión.

No se cambió configuración ni esquema del backend. Se comprobó en Supabase
que las políticas de players limitan SELECT/UPDATE/INSERT a auth.uid() = id.
La publishable key en config.js es pública por diseño; no sustituirla por secretos.

## Desarrollo

`npm run dev` inicia un servidor estático sin dependencias. Para el navegador
de pruebas del entorno Work se usa el preview supervisado. Los archivos
`qa.html` y `qa-fixture.html`, si quedan en scratch, son pruebas locales con datos
ficticios: **no añadirlos a Git ni publicarlos**. Incrementar `const C` en sw.js
en cada publicación. Trabajar en rama y fusionar mediante PR después de QA.

## Reglas universales para cualquier agente

Estas reglas son obligatorias para ChatGPT Plus, ChatGPT Business, Claude Code
o cualquier otro agente que trabaje sobre Lito Lab:

1. **Antes de modificar nada, sincronizar siempre con la última versión del repositorio.**
   No trabajar sobre una copia antigua ni asumir que el estado local está actualizado.
2. **Después de cada sesión de desarrollo, actualizar este archivo de continuidad antes del commit final.**
   Debe reflejar qué se cambió, qué quedó verificado, qué sigue pendiente y cuál es el siguiente paso.
3. **GitHub es la memoria compartida y la fuente operativa común entre agentes.**
   La continuidad no debe depender de la memoria interna de una IA concreta.
4. Si existen cambios remotos nuevos o conflictos, reconciliarlos antes de continuar y nunca
   sobrescribir trabajo previo sin comprobarlo.

## Pendientes completos tras reconciliación

En curso: #6 guardado simultáneo; #8 ranking validado en backend.
Sin empezar: #4 fusión, #9 pipeline, #10 autenticación/recuperación,
#24 avisos de hitos, #25 visual/moneda propia, #27 cabecera,
#28 habilidades y desbloqueos, #29 admin.

Regla de cierre: código → versión ecos/sw.js cuando cambia el juego → main
→ Pages → comprobar app publicada → actualizar Excel y estas notas.
Esta sesión solo sincroniza documentación; no cambia el juego ni necesita
incrementar ecos-v13. Verificación en Safari/iPhone físico aún no acreditada.
