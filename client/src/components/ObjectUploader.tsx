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

interface UploaderLocale {
  dialogTitle: string;
  dialogDescription: string;
  dropPasteFiles: string;
  browseFiles: string;
  uploadComplete: string;
  done: string;
  removeFile: string;
  myDevice: string;
  dropHint: string;
}

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
  "data-testid"?: string;
  locale?: UploaderLocale;
}

const defaultLocale: UploaderLocale = {
  dialogTitle: "Carregar Ficheiro",
  dialogDescription: "Arraste ficheiros para aqui ou clique para selecionar",
  dropPasteFiles: "Arraste ficheiros aqui ou %{browseFiles}",
  browseFiles: "procure no computador",
  uploadComplete: "Upload completo",
  done: "Concluído",
  removeFile: "Remover ficheiro",
  myDevice: "O meu dispositivo",
  dropHint: "Largue os ficheiros aqui",
};

export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760,
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
  variant = "default",
  accept,
  "data-testid": dataTestId,
  locale = defaultLocale,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const uppyRef = useRef<Uppy | null>(null);

  // Keep latest callbacks in refs so the Uppy instance is NOT destroyed and
  // recreated when the parent re-renders (which loses added files and leaves
  // a dead dashboard whose upload button does nothing).
  const onGetUploadParametersRef = useRef(onGetUploadParameters);
  const onCompleteRef = useRef(onComplete);
  const localeRef = useRef(locale);
  useEffect(() => {
    onGetUploadParametersRef.current = onGetUploadParameters;
    onCompleteRef.current = onComplete;
    localeRef.current = locale;
  });

  const handleComplete = useCallback((result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    onCompleteRef.current?.(result);
    setShowModal(false);
  }, []);

  const acceptKey = accept?.join(",") ?? "";

  useEffect(() => {
    if (!showModal) return;

    let uppy: Uppy | null = null;
    
    const timeoutId = setTimeout(() => {
      if (!dashboardRef.current) return;

      const restrictions: Record<string, unknown> = {
        maxNumberOfFiles,
        maxFileSize,
      };

      if (acceptKey) {
        restrictions.allowedFileTypes = acceptKey.split(",");
      }

      uppy = new Uppy({
        restrictions,
        autoProceed: false,
      })
        .use(AwsS3, {
          shouldUseMultipart: false,
          getUploadParameters: () => onGetUploadParametersRef.current(),
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
              dropPasteFiles: localeRef.current.dropPasteFiles,
              browseFiles: localeRef.current.browseFiles,
              uploadComplete: localeRef.current.uploadComplete,
              done: localeRef.current.done,
              removeFile: localeRef.current.removeFile,
              myDevice: localeRef.current.myDevice,
              dropHint: localeRef.current.dropHint,
            },
          },
        })
        .on("complete", handleComplete);

      uppyRef.current = uppy;
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (uppy) {
        uppy.destroy();
      }
      uppyRef.current = null;
    };
  }, [showModal, maxNumberOfFiles, maxFileSize, acceptKey, handleComplete]);

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
        data-testid={dataTestId || "button-upload-file"}
      >
        {children}
      </Button>

      <Dialog open={showModal} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{locale.dialogTitle}</DialogTitle>
            <DialogDescription>
              {locale.dialogDescription}
            </DialogDescription>
          </DialogHeader>
          <div 
            ref={dashboardRef} 
            className="w-full min-h-[350px]"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
