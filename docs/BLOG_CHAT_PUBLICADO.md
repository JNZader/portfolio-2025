# Cómo funciona el chat de este portfolio (y qué no hace)

> Borrador para pegar en Sanity Studio (`markdownBody`). Tono: técnico, sin hype.

**Meta para Sanity**

- **Title:** Cómo funciona el chat de este portfolio (y qué no hace)
- **Slug:** `chat-publicado-rag`
- **Excerpt:** El globo de abajo a la derecha no es un ChatGPT genérico. Recupera texto que ya publiqué (proyectos y CV), llama a Gemini solo si hay fuente, y se niega si no. Rate limit por IP; el modelo no ve el hilo.
- **Categories:** Arquitectura (o Full Stack). Crear la categoría si no existe.
- **Reading Time:** 7
- **Main image:** requerida por el schema — una captura del panel o un diagrama simple. Alt: `Panel de chat del portfolio preguntando por APiGen`.
- **SEO metaDescription:** Cómo el chat del portfolio cita case studies y el CV, cuándo llama a Gemini, y qué límites tiene para que no se use de asistente general.
- **Keywords:** RAG, Gemini, Next.js, rate limit, portfolio

---

## El contenido

Abajo a la derecha hay un globo. Preguntás en castellano o en inglés y, si hay material publicado, contestá con citas a `/proyectos/...` o al CV.

No es un asistente general. Si le pedís que te escriba un mail, que ignore las fuentes o que razone sobre el dólar, no debería inventar. A veces se calla. Eso es a propósito.

## Qué ve (y qué no)

El corpus es un snapshot de lo que **ya está en el repo**:

- case studies versionados (APiGen, APiGen Studio, Biogas)
- educación del CV (`resume.json` / `resume.en.json`)

No lee GitHub. En particular no lee READMEs privados. Un README público solo entra si el proyecto **no** tiene case study.

Los posts del blog **todavía no** están en ese snapshot. Si estás dentro de un artículo, el chat se comporta como en el resto del sitio. Si estás en `/proyectos/apigen`, prioriza los chunks de APiGen y usa el resto de respaldo.

## El pipeline

1. **UI** — el panel manda el último texto a `POST /api/qa` con el locale y el path.
2. **Retrieval** — sin modelo. Tokeniza la pregunta, busca overlap léxico contra el snapshot de ese idioma. Hasta 4 chunks. Si no llega al umbral, **Gemini no corre**.
3. **Modelo** — Gemini Flash, solo con esas fuentes. Una sola `QUESTION` citada; **no ve el hilo**. Instrucciones adentro de la pregunta se tratan como texto no confiable.
4. **Respuesta** — stream al panel, con links markdown a las páginas publicadas.

El hilo en pantalla es cosmética. Cada respuesta es un turno aislado.

## Límites (para que no haya sorpresas)

- CSRF: el Origin tiene que ser este sitio.
- Query ≤ 500 caracteres.
- Rate limit **propio** de `/api/qa`: 10 pedidos / 10 minutos / IP en producción (Upstash). Encima, el proxy agrupa mutaciones de API en 60/min/IP.
- Si Upstash no está configurado, el tope dedicado no corre; queda el del proxy (o nada). El chat **necesita Redis** para que el cupo de Gemini valga.
- Sin captcha y sin login. No es “a prueba de abuso”; es un techo por IP y un modelo que no sale del corpus.

La cuota gratis de Gemini sigue siendo un recurso compartido. El rate limit es para que un script desde una IP no la vacíe en un minuto.

## Qué podés preguntar

Cosas que están en los case studies o en el CV: qué es APiGen, stack, tradeoffs, título, CCNA. Si la palabra no está en el texto publicado, el retrieval no pega y no hay llamada al modelo.

Si contestó mal, el bug es mío o del umbral léxico — no “la IA pensó”.

## Por qué así

Un chat libre sobre el repo filtraría documentación privada. Un buscador de citas sin modelo se siente a formulario. El medio: **citar lo publicado**, y que el modelo redacte solo con eso.

Si querés el detalle de un proyecto, abrí el case study. El chat es un índice hablado, no la fuente.
