import { useEffect, useRef, useState, useCallback } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/dashboard";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  children: ReactNode;
  variant?: "default" | "outline" | "ghost" | "secondary";
  accept?: string[];
}

export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760,
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
  variant = "default",
  accept,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [dashboardMounted, setDashboardMounted] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const uppyRef = useRef<Uppy | null>(null);

  const handleComplete = useCallback((result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    onComplete?.(result);
    setShowModal(false);
  }, [onComplete]);

  useEffect(() => {
    if (!showModal) {
      setDashboardMounted(false);
      return;
    }

    const timer = setTimeout(() => {
      setDashboardMounted(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [showModal]);

  useEffect(() => {
    if (!dashboardMounted || !dashboardRef.current) return;

    const restrictions: Record<string, unknown> = {
      maxNumberOfFiles,
      maxFileSize,
    };

    if (accept && accept.length > 0) {
      restrictions.allowedFileTypes = accept;
    }

    const uppy = new Uppy({
      restrictions,
      autoProceed: false,
    })
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: onGetUploadParameters,
      })
      .use(Dashboard, {
        inline: true,
        target: dashboardRef.current,
        proudlyDisplayPoweredByUppy: false,
        width: "100%",
        height: 350,
        theme: "dark",
        locale: {
          strings: {
            dropPasteFiles: "Arraste ficheiros aqui ou %{browseFiles}",
            browseFiles: "procure no computador",
            uploadComplete: "Upload completo",
            uploadPaused: "Upload em pausa",
            resumeUpload: "Continuar upload",
            pauseUpload: "Pausar upload",
            retryUpload: "Tentar novamente",
            cancelUpload: "Cancelar upload",
            xFilesSelected: {
              0: "%{smart_count} ficheiro selecionado",
              1: "%{smart_count} ficheiros selecionados",
            },
            uploadingXFiles: {
              0: "A carregar %{smart_count} ficheiro",
              1: "A carregar %{smart_count} ficheiros",
            },
            processingXFiles: {
              0: "A processar %{smart_count} ficheiro",
              1: "A processar %{smart_count} ficheiros",
            },
            done: "Concluído",
            addMoreFiles: "Adicionar mais ficheiros",
            removeFile: "Remover ficheiro",
            editFile: "Editar ficheiro",
            editing: "A editar %{file}",
            finishEditingFile: "Terminar edição",
            myDevice: "O meu dispositivo",
            dropPasteBoth: "Arraste ficheiros aqui, %{browseFiles} ou %{browseFolders}",
            dropPasteImportFiles: "Arraste ficheiros aqui, %{browseFiles} ou importe de:",
            dropPasteImportBoth: "Arraste ficheiros aqui, %{browseFiles}, %{browseFolders} ou importe de:",
            dropHint: "Largue os ficheiros aqui",
            browseFolders: "procurar pastas",
            back: "Voltar",
            importFrom: "Importar de %{name}",
          },
        },
      })
      .on("complete", handleComplete);

    uppyRef.current = uppy;

    return () => {
      uppy.destroy();
      uppyRef.current = null;
    };
  }, [dashboardMounted, maxNumberOfFiles, maxFileSize, onGetUploadParameters, accept, handleComplete]);

  const handleOpenChange = (open: boolean) => {
    setShowModal(open);
    if (!open && uppyRef.current) {
      uppyRef.current.clear();
    }
  };

  return (
    <div>
      <Button 
        onClick={() => setShowModal(true)} 
        className={buttonClassName}
        variant={variant}
        type="button"
        data-testid="button-upload-file"
      >
        {children}
      </Button>

      <Dialog open={showModal} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Carregar Ficheiro</DialogTitle>
            <DialogDescription>
              Arraste ficheiros para aqui ou clique para selecionar
            </DialogDescription>
          </DialogHeader>
          <div 
            ref={dashboardRef} 
            className="w-full min-h-[350px]"
            style={{ display: dashboardMounted ? 'block' : 'none' }}
          />
          {!dashboardMounted && showModal && (
            <div className="w-full h-[350px] flex items-center justify-center bg-gray-900 rounded-md">
              <span className="text-gray-400">A carregar...</span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
