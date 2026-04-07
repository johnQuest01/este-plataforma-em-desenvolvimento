'use client';

import type { ChangeEvent, Dispatch, RefObject, SetStateAction } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';
import {
  getFormVideoAction,
  saveVideoReferenceAction,
  updateFormVideoAction,
} from '@/app/actions/video-bg-actions';
import type { VideoBackgroundType } from '@/schemas/video-bg-schema';

const VIDEO_BLOB_HANDLE_UPLOAD_RELATIVE_PATH = '/api/upload/video';

const VIDEO_FILE_INPUT_ACCEPT_ATTRIBUTE =
  'video/mp4,video/webm,video/quicktime,video/*,.mp4,.webm,.mov';

const PERSIST_SUCCESS_MESSAGE_VISIBLE_DURATION_MILLISECONDS = 3200;

interface ClientUploadProgressPayload {
  loaded: number;
  total: number;
  percentage: number;
}

function buildBlobPathnameForLoginBackgroundVideo(selectedFile: File): string {
  const trimmedOriginalFileName = selectedFile.name.trim();
  const fallbackFileName = 'background-video.mp4';
  const baseFileName =
    trimmedOriginalFileName.length > 0 ? trimmedOriginalFileName : fallbackFileName;
  const charactersSafeForPath = baseFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const maximumPathSegmentLength = 100;
  const cappedFileName = charactersSafeForPath.slice(0, maximumPathSegmentLength);
  const fileNameIncludesExtension = cappedFileName.includes('.');
  const fileNameWithExtension = fileNameIncludesExtension
    ? cappedFileName
    : `${cappedFileName}.mp4`;
  return `login-background/${fileNameWithExtension}`;
}

export interface UseVideoManagerResult {
  videoUrl: string;
  setVideoUrl: Dispatch<SetStateAction<string>>;
  isVideoActiveOnLogin: boolean;
  setIsVideoActiveOnLogin: Dispatch<SetStateAction<boolean>>;
  isLoadingInitialConfiguration: boolean;
  isSavingConfiguration: boolean;
  isUploadingVideo: boolean;
  uploadProgressPercentage: number | null;
  persistSuccessVisible: boolean;
  uploadErrorMessage: string | null;
  configurationSaveErrorMessage: string | null;
  videoFileInputAcceptAttribute: string;
  fileInputReference: RefObject<HTMLInputElement | null>;
  requestGalleryFileSelection: () => void;
  handleVideoFileInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  saveVideoConfiguration: () => Promise<void>;
  dismissPersistSuccess: () => void;
}

export function useVideoManager(): UseVideoManagerResult {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isVideoActiveOnLogin, setIsVideoActiveOnLogin] = useState<boolean>(true);
  const [isLoadingInitialConfiguration, setIsLoadingInitialConfiguration] =
    useState<boolean>(true);
  const [isSavingConfiguration, setIsSavingConfiguration] = useState<boolean>(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState<boolean>(false);
  const [uploadProgressPercentage, setUploadProgressPercentage] = useState<number | null>(
    null
  );
  const [persistSuccessVisible, setPersistSuccessVisible] = useState<boolean>(false);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(null);
  const [configurationSaveErrorMessage, setConfigurationSaveErrorMessage] = useState<
    string | null
  >(null);

  const fileInputReference = useRef<HTMLInputElement>(null);
  const persistSuccessTimeoutReference = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const dismissPersistSuccess = useCallback(() => {
    setPersistSuccessVisible(false);
    if (persistSuccessTimeoutReference.current !== undefined) {
      clearTimeout(persistSuccessTimeoutReference.current);
      persistSuccessTimeoutReference.current = undefined;
    }
  }, []);

  const schedulePersistSuccessHide = useCallback(() => {
    if (persistSuccessTimeoutReference.current !== undefined) {
      clearTimeout(persistSuccessTimeoutReference.current);
    }
    setPersistSuccessVisible(true);
    persistSuccessTimeoutReference.current = setTimeout(() => {
      setPersistSuccessVisible(false);
      persistSuccessTimeoutReference.current = undefined;
    }, PERSIST_SUCCESS_MESSAGE_VISIBLE_DURATION_MILLISECONDS);
  }, []);

  useEffect(() => {
    return () => {
      if (persistSuccessTimeoutReference.current !== undefined) {
        clearTimeout(persistSuccessTimeoutReference.current);
      }
    };
  }, []);

  useEffect(() => {
    let isComponentMounted = true;

    const loadInitialVideoConfiguration = async () => {
      const response = await getFormVideoAction();
      if (!isComponentMounted) {
        return;
      }
      if (response.success && response.data) {
        const configuration: VideoBackgroundType = response.data;
        setVideoUrl(configuration.videoUrl);
        setIsVideoActiveOnLogin(configuration.isActive ?? true);
      }
      setIsLoadingInitialConfiguration(false);
    };

    loadInitialVideoConfiguration();

    return () => {
      isComponentMounted = false;
    };
  }, []);

  const saveVideoConfiguration = useCallback(async () => {
    setIsSavingConfiguration(true);
    setConfigurationSaveErrorMessage(null);
    dismissPersistSuccess();

    const response = await updateFormVideoAction({
      videoUrl,
      isActive: isVideoActiveOnLogin,
    });

    setIsSavingConfiguration(false);

    if (response.success) {
      schedulePersistSuccessHide();
    } else {
      const errorText =
        response.error ?? 'Não foi possível guardar a configuração do vídeo.';
      setConfigurationSaveErrorMessage(errorText);
    }
  }, [
    videoUrl,
    isVideoActiveOnLogin,
    dismissPersistSuccess,
    schedulePersistSuccessHide,
  ]);

  const requestGalleryFileSelection = useCallback(() => {
    setUploadErrorMessage(null);
    fileInputReference.current?.click();
  }, []);

  const handleVideoFileInputChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const selectedVideoFile = event.target.files?.[0];
      event.target.value = '';

      if (!selectedVideoFile) {
        return;
      }

      setIsUploadingVideo(true);
      setUploadErrorMessage(null);
      setConfigurationSaveErrorMessage(null);
      dismissPersistSuccess();
      setUploadProgressPercentage(0);

      try {
        const blobPathname = buildBlobPathnameForLoginBackgroundVideo(selectedVideoFile);

        const uploadResult = await upload(blobPathname, selectedVideoFile, {
          access: 'public',
          handleUploadUrl: VIDEO_BLOB_HANDLE_UPLOAD_RELATIVE_PATH,
          multipart: true,
          contentType:
            selectedVideoFile.type.length > 0 ? selectedVideoFile.type : undefined,
          onUploadProgress: (progressPayload: ClientUploadProgressPayload) => {
            setUploadProgressPercentage(progressPayload.percentage);
          },
        });

        const persistResponse = await saveVideoReferenceAction(uploadResult.url);

        if (!persistResponse.success) {
          const errorText =
            persistResponse.error ?? 'Falha ao guardar a URL do vídeo na base de dados.';
          setUploadErrorMessage(errorText);
          return;
        }

        setVideoUrl(uploadResult.url);
        setIsVideoActiveOnLogin(true);
        schedulePersistSuccessHide();
      } catch (error) {
        const rawMessage =
          error instanceof Error ? error.message : 'Falha no envio para o armazenamento.';
        const isForbiddenResponse = rawMessage.includes('403');
        const friendlyMessage = isForbiddenResponse
          ? 'Desbloqueie o painel de administração (cadeado) antes de enviar o vídeo.'
          : rawMessage;
        setUploadErrorMessage(friendlyMessage);
      } finally {
        setIsUploadingVideo(false);
        setUploadProgressPercentage(null);
      }
    },
    [dismissPersistSuccess, schedulePersistSuccessHide]
  );

  return {
    videoUrl,
    setVideoUrl,
    isVideoActiveOnLogin,
    setIsVideoActiveOnLogin,
    isLoadingInitialConfiguration,
    isSavingConfiguration,
    isUploadingVideo,
    uploadProgressPercentage,
    persistSuccessVisible,
    uploadErrorMessage,
    configurationSaveErrorMessage,
    videoFileInputAcceptAttribute: VIDEO_FILE_INPUT_ACCEPT_ATTRIBUTE,
    fileInputReference,
    requestGalleryFileSelection,
    handleVideoFileInputChange,
    saveVideoConfiguration,
    dismissPersistSuccess,
  };
}
