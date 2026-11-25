"""LoRA SFT on LiquidAI/LFM2.5-350M. Unsloth when it imports, otherwise TRL+PEFT."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from portfolio_ft.config import (
    DATASET_TRAIN,
    DEFAULT_BASE_MODEL,
    EPOCHS,
    LORA_RANK,
    MAX_SEQ_LENGTH,
    MERGED_DIR,
    SEED,
)

TARGET_MODULES = [
    "q_proj",
    "k_proj",
    "v_proj",
    "out_proj",
    "in_proj",
    "w1",
    "w2",
    "w3",
]


def _seed() -> None:
    import random

    import numpy as np
    import torch

    random.seed(SEED)
    np.random.seed(SEED)
    torch.manual_seed(SEED)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(SEED)
    torch.backends.cudnn.deterministic = True
    torch.use_deterministic_algorithms(True, warn_only=True)


def _rows(path: Path) -> list[dict]:
    rows = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip():
            rows.append(json.loads(line))
    if not rows:
        raise SystemExit(f"{path} está vacío")
    return rows


def _require_targets(model: object) -> None:
    found: set[str] = set()
    named = getattr(model, "named_modules")
    for name, module in named():
        if module.__class__.__name__ in {"Linear", "Conv1d"}:
            found.add(name.rsplit(".", 1)[-1])
    missing = [name for name in TARGET_MODULES if name not in found]
    if missing:
        raise SystemExit(
            "No encuentro estas capas para el LoRA: "
            + ", ".join(missing)
            + ". Capas lineales: "
            + ", ".join(sorted(found))
        )


def _fit(rows: list[dict], tokenizer: object) -> list[dict]:
    kept: list[dict] = []
    skipped = 0
    for row in rows:
        messages = row["messages"]
        try:
            ids = tokenizer.apply_chat_template(messages, tokenize=True, add_generation_prompt=False)
        except TypeError:
            ids = tokenizer.apply_chat_template(messages, tokenize=True)
        if len(ids) <= MAX_SEQ_LENGTH:
            kept.append({"messages": messages})
        else:
            skipped += 1
    print(f"ejemplos dentro de {MAX_SEQ_LENGTH} tokens: {len(kept)} (salteados {skipped})")
    if not kept:
        raise SystemExit("ningún ejemplo entra en la ventana de contexto")
    return kept


def _sft_config(output_dir: str):
    from trl import SFTConfig

    common = {
        "output_dir": output_dir,
        "num_train_epochs": EPOCHS,
        "per_device_train_batch_size": 1,
        "gradient_accumulation_steps": 8,
        "learning_rate": 2e-4,
        "bf16": True,
        "packing": False,
        "seed": SEED,
        "logging_steps": 10,
        "save_strategy": "epoch",
        "report_to": [],
        "gradient_checkpointing": True,
    }
    attempts = (
        {"max_length": MAX_SEQ_LENGTH, "completion_only_loss": True},
        {"max_seq_length": MAX_SEQ_LENGTH, "completion_only_loss": True},
        {"max_length": MAX_SEQ_LENGTH, "assistant_only_loss": True},
        {"max_seq_length": MAX_SEQ_LENGTH, "assistant_only_loss": True},
    )
    for extra in attempts:
        try:
            return SFTConfig(**common, **extra)
        except TypeError:
            continue
    raise SystemExit("TRL no aceptó max_length/completion_only_loss. Revisá la versión del extra train.")


def _trainer(model, tokenizer, dataset, config, peft_config):
    from trl import SFTTrainer

    try:
        return SFTTrainer(
            model=model,
            args=config,
            train_dataset=dataset,
            processing_class=tokenizer,
            peft_config=peft_config,
        )
    except TypeError:
        return SFTTrainer(
            model=model,
            args=config,
            train_dataset=dataset,
            tokenizer=tokenizer,
            peft_config=peft_config,
        )


def _train_trl(base: str, kept: list[dict], out: Path) -> None:
    import torch
    from datasets import Dataset
    from peft import LoraConfig
    from transformers import AutoModelForCausalLM, AutoTokenizer

    tokenizer = AutoTokenizer.from_pretrained(base)
    model = AutoModelForCausalLM.from_pretrained(
        base,
        torch_dtype=torch.bfloat16,
        device_map="auto",
    )
    _require_targets(model)
    peft_config = LoraConfig(
        r=LORA_RANK,
        lora_alpha=LORA_RANK,
        lora_dropout=0.0,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=TARGET_MODULES,
    )
    config = _sft_config(str(out / "checkpoints"))
    trainer = _trainer(model, tokenizer, Dataset.from_list(kept), config, peft_config)
    trainer.train()
    merged = trainer.model.merge_and_unload()
    merged.save_pretrained(out)
    tokenizer.save_pretrained(out)


def _train_unsloth(fast, base: str, kept: list[dict], out: Path) -> None:
    import torch
    from datasets import Dataset

    model, tokenizer = fast.from_pretrained(
        model_name=base,
        max_seq_length=MAX_SEQ_LENGTH,
        dtype=torch.bfloat16,
        load_in_4bit=False,
    )
    _require_targets(model)
    model = fast.get_peft_model(
        model,
        r=LORA_RANK,
        lora_alpha=LORA_RANK,
        lora_dropout=0.0,
        target_modules=TARGET_MODULES,
        use_gradient_checkpointing="unsloth",
    )
    config = _sft_config(str(out / "checkpoints"))
    trainer = _trainer(model, tokenizer, Dataset.from_list(kept), config, None)
    trainer.train()
    model.save_pretrained_merged(str(out), tokenizer, save_method="merged_16bit")


def main() -> None:
    parser = argparse.ArgumentParser(description="LoRA r=16, bf16, 3 épocas, semilla fija")
    parser.add_argument("--base", default=DEFAULT_BASE_MODEL)
    parser.add_argument("--train", default=str(DATASET_TRAIN))
    parser.add_argument("--out", default=str(MERGED_DIR))
    args = parser.parse_args()

    import torch

    if not torch.cuda.is_available():
        raise SystemExit("El entrenamiento pide CUDA. En esta máquina es la RTX 5060 Ti.")
    _seed()
    print(f"GPU {torch.cuda.get_device_name()} capability={torch.cuda.get_device_capability()}")
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    fast = None
    try:
        from unsloth import FastLanguageModel

        fast = FastLanguageModel
        print("backend=unsloth")
    except Exception as exc:
        print(f"backend=trl+peft ({exc.__class__.__name__}: {exc})")

    from transformers import AutoTokenizer

    tokenizer = AutoTokenizer.from_pretrained(args.base if fast is None else args.base)
    kept = _fit(_rows(Path(args.train)), tokenizer)
    if fast is None:
        _train_trl(args.base, kept, out)
    else:
        _train_unsloth(fast, args.base, kept, out)
    print(f"modelo fusionado en {out}")


if __name__ == "__main__":
    main()
