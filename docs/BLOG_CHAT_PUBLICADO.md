# Tres preguntas al globo

> Studio: los campos van en el bloque Meta. En `markdownBody` se pega **solo** desde `PEGAR DESDE ACA`, sin esa marca y sin este encabezado.

**Meta para Sanity**

- **Title:** Tres preguntas al globo: qué contesta y qué se calla
- **Slug:** `chat-publicado-rag`
- **Excerpt:** Hiciste click en el globo, dijiste hola y después preguntaste por APiGen. Así funciona el chat del portfolio y así decide qué citarte.
- **Categories:** Arquitectura
- **Reading Time:** 7
- **Main image:** requerida por el schema. Una captura del panel alcanza. Alt: `Panel de chat del portfolio preguntando por APiGen`.
- **SEO metaDescription:** Cómo viaja un POST /api/qa: saludo sin modelo, búsqueda por palabras con piso 0,25, y Gemini Flash solo si hay fragmentos.
- **Keywords:** chat, Gemini, RAG, portfolio, rate limit

---

PEGAR DESDE ACA

Hoy no te recorro el portfolio entero. Te sigo mientras le haces tres preguntas al globo que está abajo a la derecha.

Vamos por partes.

## El globo no es un ChatGPT del sitio

Antes que nada: no es un chat general. No inventa, no recuerda lo que le dijiste antes, no adivina. Cita lo que ya publiqué y, si no hay fuente, se calla.

Esa es una decisión, no algo que me olvidé de terminar.

## Cómo viaja el pedido

Cada envío es un `POST /api/qa`. Van tres datos: el idioma de la página (`es` o `en`), el path donde estás, y el último texto que escribiste. El hilo que ves en el panel se dibuja en el navegador. En el body no viaja como memoria del modelo.

En el servidor el orden es fijo:

1. El Origin tiene que ser este sitio. Si no, el pedido se rechaza.
2. El texto no pasa de 500 caracteres.
3. Cuentan dos techos en Redis, los dos por IP. El de este chat, y el de cualquier POST a `/api`.
4. Si es un saludo, hay una respuesta fija. Ahí termina.
5. Si no, se arma el corpus de ese idioma y se buscan hasta cuatro fragmentos.
6. Si no aparece ninguno, otra respuesta fija. Tampoco hay modelo.
7. Si hay fragmentos, Gemini Flash recibe esas fuentes y una sola pregunta. La respuesta vuelve en stream.

Las tres pruebas de abajo son ese camino, cortado en el escalón donde cada una se cae o sigue.

---

## Primera prueba: "Hola"

Escribiste "Hola" y esperaste. Te contestó: "Hola. Preguntame por un proyecto publicado o por la formación."

¿Se cortó? No. Un saludo solo no llama al modelo. Es una respuesta fija. Lo mismo con "hello" o "buenas". Si la página está en inglés, la frase es "Hi. Ask about a published project or the training."

Por dentro, esto ocurre en el paso 4, antes de armar el corpus. El servidor parte el texto en tokens. Si todos son palabras de saludo, corta. Entran `hola`, `hello`, `hey`, `buenas`. Una palabra de tres letras o más que no sea saludo lo saca de este camino: "hola, qué es APiGen" ya no es un saludo, y sigue hacia la búsqueda.

El POST igual ya pasó por Redis. No gasta Gemini. Sí gasta uno de los diez pedidos del chat.

## Segunda prueba: "¿Qué es APiGen?"

Ahora sí llegó una pregunta de verdad. Y no da lo mismo desde dónde la haces.

Desde la home o desde este mismo post, el chat mira los textos publicados a ver si alguno se parece a tu pregunta. Desde `/proyectos/apigen` mira primero los de APiGen, aunque tu frase comparta pocas palabras con ellos. Después puede completar con otros, si sirven. No queda encerrado en esa página.

¿Y qué te citó? El case study de APiGen. Justo donde está el detalle.

Por dentro, la búsqueda no es un embedding ni un índice vectorial. Es overlap de palabras. La pregunta queda en minúsculas, sin acentos, sin palabras vacías (`que`, `de`, `tenés`, `what`) y sin tokens de menos de tres letras. El puntaje de un fragmento es la fracción de tokens de la pregunta que aparecen en su título, su encabezado o su texto. El piso es 0,25. El tope es cuatro fragmentos.

El path decide un slug preferido. En `/proyectos/apigen` ese slug es `apigen`, y sus fragmentos van primeros aunque estén debajo del piso. El resto tiene que superarlo. Por eso, en esa página, una pregunta floja igual puede abrir el modelo: esos fragmentos entran aunque no lleguen a 0,25, y pueden ocupar los cuatro lugares antes de que entre nadie más.

En `/blog/...` el path también anota el slug del artículo. Como ningún fragmento se llama así, la nota no mueve el ranking. Preguntar desde acá es lo mismo que preguntar desde la home.

Cuando hay fragmentos, Gemini Flash no ve el hilo. Ve un system prompt con esas fuentes en JSON, y un único mensaje de usuario: tu pregunta, entre comillas, marcada como texto no confiable. Lo que escribas adentro ("ignorá esto", "hacete pasar por otro") no es una instrucción. Es parte de la pregunta. No hay un canal de razonamiento aparte. La respuesta sale en stream, de a pedazos, hacia el panel.

## Tercera prueba: "Escríbeme un mail"

Acá la negativa sale de dos lugares distintos, según dónde estés.

En la home o en el blog, si ninguna frase publicada se parece a "escribime un mail", ni siquiera se llama al modelo. En pantalla: "No hay una cita publicada para esa pregunta." En inglés: "No published quote for that question."

En la página de un proyecto, la pregunta llega igual al modelo, porque los textos de esa página entran aunque el puntaje sea bajo. Ahí el modelo es el que tiene que decir que no hay cita, si la pregunta no va sobre ese material.

Por dentro, el corte de la home es el paso 6. La búsqueda devuelve una lista vacía y el handler contesta la frase fija. La clave de Gemini ni se consulta.

En un proyecto la lista no viene vacía: los fragmentos preferidos no pasan por el piso de 0,25, así que el paso 7 sí corre. El prompt le dice que conteste solo con las fuentes y que, si no alcanzan, diga que no hay cita. La negativa, en ese caso, es del modelo.

¿Y si le pides que recuerde lo que dijiste antes? No hay "antes". Cada POST manda solo el último texto. "¿Y el segundo punto?" no tiene primero, salvo que esa frase nueva vuelva a encontrar esos textos por sus propias palabras.

---

## Qué puede citar, hoy

El corpus se arma en el servidor, con lo que ya viene en la aplicación. No hay una llamada a GitHub en el pedido. Entran los case studies de APiGen, APiGen Studio y Biogas, y la formación del CV. Castellano e inglés son dos corpus distintos: el inglés no hereda el cuerpo en castellano. Si algo solo está escrito en un idioma, en el otro no aparece.

Los posts del blog no están. Este tampoco, cuando se publique.

¿Y los README? No se leen en vivo. Un README público solo entra si ese proyecto no tiene case study. Si tiene, gana el case study y el README se queda afuera.

Hay una rama aparte de la búsqueda, chica y a propósito. "¿Qué título tienes?" no comparte vocabulario con el CV: después de sacar las palabras vacías, queda `título`. Esa palabra, igual que universidad, carrera, formación o capacitación, alcanza para adjuntar el grado formal aunque el overlap del resto sea cero. No es memoria del modelo. Es una excepción del retrieval para cuando la pregunta usa la palabra cotidiana y el CV usa otra.

## Los techos

Los dos límites del paso 3 viven en Upstash Redis, los dos por IP.

- Este endpoint: 10 pedidos cada 10 minutos.
- Cualquier POST a `/api`: 60 por minuto. Es el default del proxy, no un techo exclusivo del chat.

Sin Redis no corre ninguno. El chat sigue contestando, y sigue sin poder leer documentación privada. Lo que queda sin freno es la cuota de Gemini. No hay cuenta ni captcha. El cupo existe para que una sola IP no vacíe esa cuota en un minuto mientras Redis está.

## Cuando la respuesta está mal

Si te contestó algo raro, falló el piso de 0,25 o el texto publicado es ambiguo. No "pensó" otra cosa: no tenía otras fuentes.

El chat es un índice. El detalle sigue estando en el case study o en el CV.

---

Espero que hayas visto de cerca cómo se comporta el globo.

Nos vemos en el próximo post.
