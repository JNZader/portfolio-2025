# Fine-tune del chat chico

Pipeline para entrenar un LoRA de [LiquidAI/LFM2.5-350M](https://huggingface.co/LiquidAI/LFM2.5-350M) con el corpus que ya usa el chat, exportarlo a ONNX q4 y q4f16, y publicarlo si pasa el gate. El sitio sigue contestando con `onnx-community/LFM3-1.7B-ONNX`. `lib/qa/local/small-model.json` guarda la revisión del modelo chico y el worker no la carga.

El entrenamiento es RAG, no un libro cerrado. Cada ejemplo trae el system prompt de producción (`publishedSystemPrompt`) y unos pocos chunks. La respuesta sale de esos chunks, cita `[título](href)` de ellos, o dice exactamente `No tengo una cita publicada sobre eso.`

## Gate

Se publican pesos nuevos solo si las 12 preguntas fijas cumplen todo esto:

- puntaje útil ≥ 8 (configurable con `FT_MIN_USEFUL`; útil = `faithful` o `refusal-correct`)
- cada pregunta que debía rechazarse salió `refusal-correct`
- las inventadas de esas 12 no superan a las del reporte ya publicado
- ninguna pregunta automática sobre contenido nuevo trae una URL que no esté en los chunks

Si falta un reporte anterior (el repo todavía no existe), el techo de inventadas no se aplica. Una URL o un href markdown que no está en los chunks cuenta como inventada, aunque el resto de la frase sea correcto. La frase de rechazo y el sentinel `NO_PUBLISHED_QUOTE` cuentan como rechazo. Un saludo o una búsqueda vacía no llama al modelo: se puntúa el sentinel de producción (`PUBLISHED_QA_GREETING` o `NO_PUBLISHED_QUOTE`). La evaluación del modelo es greedy para que el puntaje no se mueva; en el navegador el muestreo sigue en temperatura 0.2.

Si el gate falla, el job termina mal y no sube nada. La revisión anterior queda.

## Registrar el runner en Pop!_OS

La máquina es la PC con la RTX 5060 Ti. El workflow pide las etiquetas `self-hosted`, `linux` y `gpu`.

1. En el repo de GitHub: Settings → Actions → Runners → New self-hosted runner.
2. Elegí Linux x64 y copiá el comando de registro. Las etiquetas tienen que incluir `self-hosted`, `linux` y `gpu`.
3. En la PC, descomprimí el runner en un directorio propio (por ejemplo `~/actions-runner`), no dentro de este repo.
4. `./config.sh` con la URL y el token que muestra GitHub. Cuando pregunte por las etiquetas, dejalas en `self-hosted,linux,gpu`.
5. Instalá y arrancá el servicio para que sobreviva al logout:

```bash
sudo ./svc.sh install
sudo ./svc.sh start
sudo ./svc.sh status
```

El workflow no tiene trigger de pull request. Un PR de un fork no puede enganchar esta máquina. El job solo corre en `main` de `JNZader/portfolio-2025`, por push a los paths del corpus o con `workflow_dispatch`.

En Settings → Actions → General → Workflow permissions, el `GITHUB_TOKEN` necesita permiso de lectura y escritura para poder abrir el PR que actualiza `small-model.json`. No hace push a `main`.

## Secreto y prerrequisitos

Creá el secreto `HF_TOKEN` en Settings → Secrets and variables → Actions. Es un token de Hugging Face con permiso de escritura sobre `JNZader/portfolio-chat-lfm2.5-350m-ONNX` (o el repo que pongas en `FT_REPO`).

En la PC:

- Driver NVIDIA 595, que ya cubre Blackwell. No hace falta instalar el toolkit de CUDA de Ubuntu encima: las wheels de PyTorch traen el runtime.
- La 5060 Ti es `sm_120`. Hace falta una wheel de PyTorch compilada para esa arquitectura. Las wheels `cu128` (PyTorch 2.7 en adelante) la incluyen. El `pyproject.toml` pide `torch` en el índice `https://download.pytorch.org/whl/cu128`.
- [uv](https://docs.astral.sh/uv/) y Python 3.12 (`uv python install 3.12`).
- Node 22, el mismo rango que el resto del repo, para el script que vuelca el corpus.
- Unos 30 GB libres. El entorno de entrenamiento, el de LiquidONNX y los ONNX intermedios conviven.

Comprobación rápida después de sincronizar el extra `train`:

```bash
uv run --directory ml python -c "import torch; print(torch.cuda.get_device_capability())"
```

Tiene que imprimir `(12, 0)`.

## Correr cada paso a mano

Desde la raíz del repo, con `npm ci` ya hecho:

```bash
uv python install 3.12
uv sync --directory ml --extra test --extra train --extra publish --extra export

uv run --directory ml python -m portfolio_ft.corpus
uv run --directory ml python -m portfolio_ft.dataset
uv run --directory ml python -m portfolio_ft.train_lora
uv run --directory ml python -m portfolio_ft.evaluate
HF_TOKEN=... uv run --directory ml python -m portfolio_ft.pipeline
```

`corpus` ejecuta `buildPublishedSnapshot` vía Vitest y escribe `ml/data/corpus.json`. `dataset` le pide al mismo puente el system prompt y el wrapper `QUESTION`, así Python no reimplementa el retrieval. `--teacher` existe y está apagado: si lo pasás, el proceso sale sin llamar a ningún modelo.

`train_lora` usa Unsloth si importa, y si no TRL+PEFT. LoRA r=16, bf16, contexto 2048, 3 épocas, semilla 42, y al final fusiona los pesos. `evaluate` arma las 12 preguntas fijas más, si hay un `corpus.json` en la revisión anterior, preguntas sobre los chunks que cambiaron. `pipeline` aplica el gate, exporta y publica.

Los tests de CPU no necesitan la GPU:

```bash
uv sync --directory ml --extra test
uv run --directory ml pytest
```

## Tiempos orientativos en la 5060 Ti

| Paso | Tiempo | Disco |
| --- | --- | --- |
| Corpus y dataset | menos de un minuto | unos MB |
| LoRA, 3 épocas | 20–40 minutos | el checkpoint fusionado pesa ~0,7 GB |
| Evaluación greedy | unos minutos | el reporte |
| Export ONNX q4 + q4f16 | 15–40 minutos, en CPU a propósito | q4 ~300 MB, q4f16 ~260 MB; el fp32 intermedio (~1,5 GB) se borra |
| Subida | unos minutos | |

La primera sincronización de PyTorch y del exporter baja varios GB. Reservá los 30 GB antes de lanzar el job.

## Export ONNX

El exportador es [Liquid4All/onnx-export](https://github.com/Liquid4All/onnx-export) clavado en `5ae758991464f2acd77c4ba5b654a9f32dbd60ea`. Ese commit escribe un grafo que Transformers.js 4.3.2 sabe cargar: `past_conv` / `past_key_values`, embedding `GatherBlockQuantized` y `MatMulNBits` simétrico con bloque 32. Los commits posteriores arman carpetas de onnxruntime-genai. Esas no cargan en el navegador. `optimum-cli` tampoco sirve: no traza la caché de la conv híbrida.

Esa revisión exporta `q4` y no `q4f16`. El paso siguiente convierte el grafo q4 con `onnxruntime.transformers.float16` (onnxruntime **≥ 1.30**, el mismo piso que el `pyproject.toml` de ese exporter) y deja la caché en fp16 y los logits en fp32. La conversión corre en CPU (`CUDA_VISIBLE_DEVICES` vacío) para no mezclar la wheel de Blackwell del entrenamiento con el torch del exporter.

El manifiesto queda en `export-manifest.json` junto al modelo.

## Volver atrás

1. El chat en producción no mira esta revisión. Revertir el PR del bump no cambia las respuestas del sitio.
2. `small-model.json` guarda `revision`. Para deshacerla, volvé ese campo al tag anterior (o revertí el PR).
3. No borres el tag viejo en Hugging Face. El reporte y el `corpus.json` de esa revisión siguen ahí, y el próximo gate los usa como techo de inventadas.
4. El workflow no pushea a `main`. Si un job quedó a medias, la revisión publicada anterior no se pisa.

## Qué mira el push a main

El job de GPU se dispara si cambia algo que entra al corpus o al prompt:

- `lib/data/**` (casos y los dos CV)
- `lib/qa/chunk.ts`, `snapshot.ts`, `retrieve.ts`, `prompt.ts`, `text.ts`, `types.ts`, `path.ts`
- `lib/qa/local/prepare.ts` (saludo y rechazo antes del modelo)
- `lib/seo/locale-url.ts` (los `href` de las citas)

Un cambio solo de este directorio no reentrena. Después de mergear, registrá el runner, cargá `HF_TOKEN` y lanzá el workflow a mano una vez.
