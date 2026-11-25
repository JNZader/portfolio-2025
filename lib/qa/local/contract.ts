import type { LocalDevice, LocalDtype } from '@/lib/qa/local/model';

export interface LocalEngine {
  load(options: {
    device: LocalDevice;
    dtype: LocalDtype;
    onProgress: (progress: number) => void;
  }): Promise<void>;
  generate(options: {
    system: string;
    question: string;
    onToken: (text: string) => void;
  }): Promise<string>;
  dispose(): void;
}
