import "server-only";

import { createHash } from "node:crypto";

const getCloudinaryConfig = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary configuration is missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  return { cloudName, apiKey, apiSecret, folder };
};

const createUploadSignature = ({
  folder,
  timestamp,
  apiSecret,
}: {
  folder?: string;
  timestamp: number;
  apiSecret: string;
}) => {
  const signatureBase = [folder ? `folder=${folder}` : null, `timestamp=${timestamp}`]
    .filter(Boolean)
    .join("&");

  return createHash("sha1").update(`${signatureBase}${apiSecret}`).digest("hex");
};

type CloudinaryUploadResponse = {
  secure_url?: string;
  error?: {
    message?: string;
  };
};

export const uploadImages = async (files: File[]) => {
  if (!files.length) {
    return [];
  }

  const { cloudName, apiKey, apiSecret, folder } = getCloudinaryConfig();
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  return Promise.all(
    files.map(async (file) => {
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = createUploadSignature({ folder, timestamp, apiSecret });
      const formData = new FormData();

      formData.append("file", file, file.name);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);

      if (folder) {
        formData.append("folder", folder);
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as CloudinaryUploadResponse;

      if (!response.ok || !payload.secure_url) {
        throw new Error(payload.error?.message ?? "Unable to upload product image.");
      }

      return payload.secure_url;
    }),
  );
};
