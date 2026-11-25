"""Upload q4 and q4f16 to the Hugging Face repo and tag the revision."""

from __future__ import annotations

import json
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from portfolio_ft.config import CORPUS_PATH, DEFAULT_BASE_MODEL, DEFAULT_REPO, EVAL_REPORT


def revision_for(corpus_hash: str, now: datetime | None = None) -> str:
    stamp = (now or datetime.now(timezone.utc)).strftime("%Y%m%d%H%M")
    return f"ft-{corpus_hash[:12]}-{stamp}"


def model_card(report: dict[str, Any], revision: str, repo: str) -> str:
    fixed = report["fixed"]
    auto = report["auto"]
    return f"""---
library_name: transformers.js
license: other
license_name: lfm1.0
license_link: https://huggingface.co/{DEFAULT_BASE_MODEL}/blob/main/LICENSE
base_model: {DEFAULT_BASE_MODEL}
pipeline_tag: text-generation
tags:
  - lfm2.5
  - onnx
  - portfolio
---

# Chat del portfolio (LFM2.5-350M, ONNX)

Fine-tune LoRA (rango 16, bf16, 3 épocas) de [{DEFAULT_BASE_MODEL}](https://huggingface.co/{DEFAULT_BASE_MODEL}), fusionado y exportado a ONNX **q4** y **q4f16** para `@huggingface/transformers` 4.3.2.

No memoriza el portfolio en cerrado. Hay que pasarle los fragmentos `SOURCES` del retrieval de producción y el system prompt de producción. Si las fuentes no alcanzan, responde exactamente: `No tengo una cita publicada sobre eso.`

Revisión: `{revision}`

## Licencia

Los pesos base se publican bajo la **LFM Open License 1.0**. Este repositorio es un derivado (los pesos cambiaron) y hereda esa licencia. No es el checkpoint original de Liquid AI. La licencia tiene condiciones de uso comercial: leé el texto, en particular el apartado de uso comercial, antes de usarlo en un producto.

<https://huggingface.co/{DEFAULT_BASE_MODEL}/blob/main/LICENSE>

## Métricas del gate

| Conjunto | Útil | Total | Inventadas | Rechazos rotos |
| --- | --- | --- | --- | --- |
| 12 preguntas fijas | {fixed["useful"]} | {fixed["total"]} | {fixed["invented"]} | {fixed["refusalsBroken"]} |
| Contenido nuevo | {auto["useful"]} | {auto["total"]} | {auto["invented"]} | {auto["refusalsBroken"]} |

La evaluación es greedy (`do_sample: false`). En el navegador el muestreo sigue en temperatura 0.2. Una URL que no está en los fragmentos cuenta como inventada.

## Uso

```js
import {{ pipeline }} from "@huggingface/transformers";

const generator = await pipeline("text-generation", "{repo}", {{
  dtype: "q4f16",
  device: "webgpu",
  revision: "{revision}",
}});
```

`dtype: "q4"` carga `onnx/model_q4.onnx`. `q4f16` carga `onnx/model_q4f16.onnx` (pesos int4, activaciones y caché en fp16).
"""


def publish_folder(model_dir: Path, report: dict[str, Any], repo: str) -> str:
    from huggingface_hub import HfApi

    revision = revision_for(str(report["corpusSha256"]))
    card = model_card(report, revision, repo)
    (model_dir / "README.md").write_text(card, encoding="utf-8")
    shutil.copyfile(CORPUS_PATH, model_dir / "corpus.json")
    (model_dir / "eval-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    api = HfApi()
    api.create_repo(repo_id=repo, exist_ok=True, repo_type="model")
    uploaded = api.upload_folder(
        repo_id=repo,
        folder_path=str(model_dir),
        commit_message=f"publica {revision}",
    )
    oid = getattr(uploaded, "oid", None)
    api.create_tag(repo_id=repo, tag=revision, revision=oid)
    print(f"publicado {repo}@{revision}")
    return revision


def previous_eval_report(repo: str, revision: str) -> dict[str, Any] | None:
    try:
        from huggingface_hub import hf_hub_download
    except ImportError as exc:
        raise SystemExit("falta huggingface_hub (extra publish) para leer el reporte anterior") from exc
    try:
        path = hf_hub_download(repo_id=repo, filename="eval-report.json", revision=revision)
    except Exception as exc:
        name = type(exc).__name__
        status = getattr(getattr(exc, "response", None), "status_code", None)
        if name in {"RepositoryNotFoundError", "EntryNotFoundError", "RevisionNotFoundError"} or status == 404:
            return None
        raise
    payload = json.loads(Path(path).read_text(encoding="utf-8"))
    return payload if isinstance(payload, dict) else None


def main() -> None:
    raise SystemExit("Usá python -m portfolio_ft.pipeline para publicar: el gate corre antes.")


if __name__ == "__main__":
    main()
