'use client';

import { Edit, Eye, Loader2, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { sendNewsletterBroadcast, sendTestNewsletter } from '@/app/actions/admin-newsletter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function NewsletterBroadcaster() {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleSendTest = async () => {
    if (!subject || !content) {
      toast.error('Completa asunto y contenido');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('content', content);

    const res = await sendTestNewsletter(formData);
    setIsLoading(false);

    if (res.success) {
      toast.success(res.message ?? 'Test enviado correctamente');
    } else {
      toast.error(res.error ?? 'Error al enviar test');
    }
  };

  // Two-step confirm (replaces window.confirm): the button asks first, an
  // inline panel confirms — no browser dialog, and testable.
  const requestBroadcast = () => {
    if (!subject || !content) {
      toast.error('Completa asunto y contenido');
      return;
    }
    setConfirming(true);
  };

  const doBroadcast = async () => {
    setConfirming(false);
    setIsLoading(true);
    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('content', content);

    const res = await sendNewsletterBroadcast(formData);
    setIsLoading(false);

    if (res.success) {
      toast.success(res.message ?? 'Broadcast enviado correctamente');
      setSubject('');
      setContent('');
    } else {
      toast.error(res.error ?? 'Error al enviar broadcast');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">📧 Redactar Newsletter</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="subject" className="text-sm font-medium mb-1 block">
              Asunto
            </label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ej: Novedades de Diciembre"
            />
          </div>

          <div className="flex justify-end gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPreview(false)}
              className={isPreview ? '' : 'bg-muted'}
            >
              <Edit className="w-4 h-4 mr-2" /> Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPreview(true)}
              className={isPreview ? 'bg-muted' : ''}
            >
              <Eye className="w-4 h-4 mr-2" /> Previsualizar
            </Button>
          </div>

          {isPreview ? (
            <div className="min-h-[300px] border rounded-md p-4 prose dark:prose-invert max-w-none bg-background">
              <ReactMarkdown>{content.trim() || '*Nada para mostrar aún...*'}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[300px] p-4 rounded-md border bg-background font-mono text-sm focus:ring-2 focus:ring-primary outline-none"
              placeholder="Escribe tu contenido en Markdown...
# Título
Hola a todos,

- Item 1
- Item 2"
            />
          )}

          {confirming && (
            <div
              role="alertdialog"
              aria-label="Confirmar envío del broadcast"
              className="rounded-md border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-4"
            >
              <p className="font-medium text-red-800 dark:text-red-300 mb-3">
                ⚠️ ¿Enviar esto a <strong>TODOS</strong> los suscriptores? Esta acción no se puede
                deshacer.
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setConfirming(false)}>
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={doBroadcast}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Sí, enviar a todos
                </Button>
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-4 border-t mt-6">
            <Button
              variant="outline"
              onClick={handleSendTest}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : '🔬 '}
              Enviar Test (A mí)
            </Button>

            <Button
              variant="default"
              onClick={requestBroadcast}
              disabled={isLoading || confirming}
              className="flex-[2] bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Enviar Broadcast (A Todos)
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-300">
        <h3 className="font-bold mb-2">📝 Guía Rápida</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Usa <strong>Markdown</strong> para el formato.
          </li>
          <li>
            Usa <code>[Texto](url)</code> para enlaces.
          </li>
          <li>Las imágenes deben ser URLs públicas absolutas.</li>
          <li>El enlace de "Darse de baja" se agrega automáticamente al final.</li>
          <li>Se envía en lotes de 10 para evitar bloqueos.</li>
        </ul>
      </div>
    </div>
  );
}
