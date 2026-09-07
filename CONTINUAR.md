# Lito Lab · continuidad · 7 septiembre 2026

## Fuente de verdad y bloqueo actual

El roadmap es el Excel de Drive `148gnxlqyOBPhhzToJoa4ylJVDVpOPr2M`.
Se leyó completo antes de modificar código. La conexión puede leerlo, pero
Drive rechaza el reemplazo con `403 appNotAuthorizedToFile`: la aplicación no
tiene autorización de escritura sobre ese archivo. No confundir esto con
permisos de la cuenta humana, que sí figura como editora. Hace falta que Miguel
autorice ese archivo para la conexión. No marcar en el Excel original nada
que no se haya podido guardar realmente.

## Producción

- URL: https://miguel-flores-garcia.github.io/lito-lab/
- GitHub Pages sirve `main` desde la raíz. No hay build de producción.
- PR #1 fusionada en `4d0a27a556ec2d1982a101e0dba93fcee9d1fbd5`, SW `ecos-v12`.
- Verificados en producción: carga, entrada como invitado e inventario nuevo.
- Lote siguiente: perfil e insignias (#23), SW `ecos-v13`.

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

## Roadmap preparado

Se preparó una versión del Excel con las cinco tareas del primer lote hechas,
nueva fila #30, tabla filtrable por prioridad/estado, validaciones, contadores
automáticos y filas 1–4 fijas. Se verificó que las descripciones de las 29
tareas originales no cambiaron. El reemplazo de Drive fue rechazado.
Actualizar también #23 a Hecho una vez comprobada su publicación.

## Próximas prioridades

1. Resolver autorización del archivo Drive y reconciliar sus estados con este documento.
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
