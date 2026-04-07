'use client';

import type { ChangeEvent, Dispatch, RefObject, SetStateAction } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { prepareCloudinaryVideoUploadAction } from '@/app/actions/cloudinary-actions';
import {
  getFormVideoAction,
  saveVideoReferenceAction,
  updateFormVideoAction,
} from '@/app/actions/video-bg-actions';
import { buildOptimizedCloudinaryVideoDeliveryUrl } from '@/lib/cloudinary-video-delivery-url';
import { CloudinaryVideoUploadResponseSchema } from '@/schemas/cloudinary-video-upload-response-schema';
import {
  ClientVideoFileSelectionSchema,
  type VideoBackgroundType,
} from '@/schemas/video-bg-schema';

const VIDEO_FILE_INPUT_ACCEPT_ATTRIBUTE =
  'video/mp4,video/webm,video/quicktime,video/*,.mp4,.webm,.mov';

const PERSIST_SUCCESS_MESSAGE_VISIBLE_DURATION_MILLISECONDS = 3200;

const UPLOAD_PROGRESS_DEBOUNCE_MILLISECONDS = 120;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function extractCloudinaryErrorMessage(responseData: unknown): string | null {
  if (!isRecord(responseData)) {
    return null;
  }
  const errorField = responseData.error;
  if (typeof errorField === 'string') {
    return errorField;
  }
  if (isRecord(errorField) && typeof errorField.message === 'string') {
    return errorField.message;
  }
  return null;
}

export interface UseCloudinaryVideoResult {
  videoUrl: string;
  setVideoUrl: Dispatch<SetStateAction<string>>;
  cloudinaryPublicId: string;
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
  /** URL com f_auto,q_auto para o elemento de vídeo quando aplicável. */
  previewVideoSourceUrl: string;
}

export function useCloudinaryVideo(): UseCloudinaryVideoResult {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState<string>('');
  const [videoMetadata, setVideoMetadata] = useState<Record<string, unknown> | undefined>(
    undefined
  );
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
  const progressDebounceTimeoutReference = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const latestDebouncedProgressReference = useRef<number>(0);

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

  const flushDebouncedUploadProgress = useCallback(() => {
    if (progressDebounceTimeoutReference.current !== undefined) {
      clearTimeout(progressDebounceTimeoutReference.current);
      progressDebounceTimeoutReference.current = undefined;
    }
    setUploadProgressPercentage(latestDebouncedProgressReference.current);
  }, []);

  const scheduleDebouncedUploadProgress = useCallback(
    (percentage: number) => {
      latestDebouncedProgressReference.current = percentage;
      if (progressDebounceTimeoutReference.current !== undefined) {
        return;
      }
      progressDebounceTimeoutReference.current = setTimeout(() => {
        progressDebounceTimeoutReference.current = undefined;
        setUploadProgressPercentage(latestDebouncedProgressReference.current);
      }, UPLOAD_PROGRESS_DEBOUNCE_MILLISECONDS);
    },
    []
  );

  useEffect(() => {
    return () => {
      if (persistSuccessTimeoutReference.current !== undefined) {
        clearTimeout(persistSuccessTimeoutReference.current);
      }
      if (progressDebounceTimeoutReference.current !== undefined) {
        clearTimeout(progressDebounceTimeoutReference.current);
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
        setCloudinaryPublicId(configuration.cloudinaryPublicId);
        setVideoMetadata(configuration.metadata);
        setIsVideoActiveOnLogin(configuration.isActive);
      }
      setIsLoadingInitialConfiguration(false);
    };

    void loadInitialVideoConfiguration();

    return () => {
      isComponentMounted = false;
    };
  }, []);

  const saveVideoConfiguration = useCallback(async () => {
    setIsSavingConfiguration(true);
    setConfigurationSaveErrorMessage(null);
    dismissPersistSuccess();

    const payload: VideoBackgroundType = {
      videoUrl,
      cloudinaryPublicId,
      isActive: isVideoActiveOnLogin,
      metadata: videoMetadata,
    };

    const response = await updateFormVideoAction(payload);

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
    cloudinaryPublicId,
    isVideoActiveOnLogin,
    videoMetadata,
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

      const fileValidation = ClientVideoFileSelectionSchema.safeParse(selectedVideoFile);
      if (!fileValidation.success) {
        const issueMessage = fileValidation.error.issues[0]?.message;
        setUploadErrorMessage(
          typeof issueMessage === 'string' && issueMessage.length > 0
            ? issueMessage
            : 'Ficheiro de vídeo inválido.'
        );
        return;
      }

      setIsUploadingVideo(true);
      setUploadErrorMessage(null);
      setConfigurationSaveErrorMessage(null);
      dismissPersistSuccess();
      latestDebouncedProgressReference.current = 0;
      setUploadProgressPercentage(0);

      try {
        const preparationResponse = await prepareCloudinaryVideoUploadAction();
        if (!preparationResponse.success) {
          setUploadErrorMessage(
            preparationResponse.error ??
              'Não foi possível preparar o upload no Cloudinary.'
          );
          return;
        }

        const preparation = preparationResponse.data;
        const uploadEndpoint = `https://api.cloudinary.com/v1_1/${preparation.cloudName}/video/upload`;

        const multipartBody = new FormData();
        multipartBody.append('file', selectedVideoFile);
        multipartBody.append('upload_preset', preparation.uploadPreset);

        const publicUnsignedRaw =
          process.env.NEXT_PUBLIC_CLOUDINARY_UNSIGNED_UPLOAD?.trim().toLowerCase() ?? '';
        const clientForcesUnsignedOnlyUpload =
          publicUnsignedRaw === 'true' ||
          publicUnsignedRaw === '1' ||
          publicUnsignedRaw === 'yes' ||
          publicUnsignedRaw === 'on';

        const shouldAppendSignedUploadParameters =
          preparation.mode === 'signed' && !clientForcesUnsignedOnlyUpload;

        if (shouldAppendSignedUploadParameters) {
          multipartBody.append('timestamp', String(preparation.timestamp));
          multipartBody.append('signature', preparation.signature);
          multipartBody.append('api_key', preparation.apiKey);
        }

        const uploadHttpResponse = await axios.post<unknown>(
          uploadEndpoint,
          multipartBody,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
              const totalBytes = progressEvent.total;
              const loadedBytes = progressEvent.loaded;
              let percentage = 0;
              if (typeof totalBytes === 'number' && totalBytes > 0) {
                percentage = Math.round((loadedBytes / totalBytes) * 100);
              }
              scheduleDebouncedUploadProgress(percentage);
            },
          }
        );

        flushDebouncedUploadProgress();

        const cloudinaryErrorMessage = extractCloudinaryErrorMessage(uploadHttpResponse.data);
        if (cloudinaryErrorMessage !== null) {
          setUploadErrorMessage(cloudinaryErrorMessage);
          return;
        }

        const parsedUploadPayload = CloudinaryVideoUploadResponseSchema.safeParse(
          uploadHttpResponse.data
        );

        if (!parsedUploadPayload.success) {
          setUploadErrorMessage(
            'Resposta inválida do Cloudinary após o upload. Tente novamente.'
          );
          return;
        }

        const uploadPayload = parsedUploadPayload.data;
        const optimizedVideoUrl = buildOptimizedCloudinaryVideoDeliveryUrl(
          uploadPayload.secure_url
        );

        const metadataRecord: Record<string, unknown> = {};
        if (uploadPayload.bytes !== undefined) {
          metadataRecord.bytes = uploadPayload.bytes;
        }
        if (uploadPayload.format !== undefined) {
          metadataRecord.format = uploadPayload.format;
        }
        if (uploadPayload.duration !== undefined) {
          metadataRecord.duration = uploadPayload.duration;
        }

        const persistResponse = await saveVideoReferenceAction({
          videoUrl: optimizedVideoUrl,
          cloudinaryPublicId: uploadPayload.public_id,
          metadata:
            Object.keys(metadataRecord).length > 0 ? metadataRecord : undefined,
        });

        if (!persistResponse.success) {
          const errorText =
            persistResponse.error ?? 'Falha ao guardar a referência do vídeo na base de dados.';
          setUploadErrorMessage(errorText);
          return;
        }

        setVideoUrl(optimizedVideoUrl);
        setCloudinaryPublicId(uploadPayload.public_id);
        setVideoMetadata(
          Object.keys(metadataRecord).length > 0 ? metadataRecord : undefined
        );
        setIsVideoActiveOnLogin(true);
        schedulePersistSuccessHide();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const body = error.response?.data;
          const fromBody = extractCloudinaryErrorMessage(body);
          if (fromBody !== null) {
            setUploadErrorMessage(fromBody);
            return;
          }
          const status = error.response?.status;
          if (status === 401 || status === 403) {
            setUploadErrorMessage(
              'Upload recusado. Confirme o preset no Cloudinary (signed vs unsigned), CLOUDINARY_UNSIGNED_UPLOAD no .env e o desbloqueio do admin.'
            );
            return;
          }
        }
        const rawMessage =
          error instanceof Error ? error.message : 'Falha no envio para o Cloudinary.';
        setUploadErrorMessage(rawMessage);
      } finally {
        if (progressDebounceTimeoutReference.current !== undefined) {
          clearTimeout(progressDebounceTimeoutReference.current);
          progressDebounceTimeoutReference.current = undefined;
        }
        setIsUploadingVideo(false);
        setUploadProgressPercentage(null);
      }
    },
    [
      dismissPersistSuccess,
      flushDebouncedUploadProgress,
      scheduleDebouncedUploadProgress,
      schedulePersistSuccessHide,
    ]
  );

  const previewVideoSourceUrl =
    videoUrl.length > 0 ? buildOptimizedCloudinaryVideoDeliveryUrl(videoUrl) : '';

  return {
    videoUrl,
    setVideoUrl,
    cloudinaryPublicId,
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
    previewVideoSourceUrl,
  };
}
