import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { ORT_ASYNCIFY_MJS, ORT_ASYNCIFY_WASM } from './ort';

const FILES = [ORT_ASYNCIFY_MJS, ORT_ASYNCIFY_WASM] as const;

/** Copy the ORT wasm factory next to the site so CSP stays off the jsDelivr CDN. */
export function copyOrtWasm(root = process.cwd()): void {
  const require = createRequire(path.join(root, 'package.json'));
  const distDir = path.dirname(require.resolve('onnxruntime-web/webgpu'));
  const target = path.join(root, 'public', 'ort');
  mkdirSync(target, { recursive: true });

  for (const name of FILES) {
    const from = path.join(distDir, name);
    const to = path.join(target, name);
    if (!existsSync(from)) {
      throw new Error(`Missing ONNX Runtime file: ${from}`);
    }
    if (existsSync(to) && statSync(from).size === statSync(to).size) continue;
    copyFileSync(from, to);
  }
}
