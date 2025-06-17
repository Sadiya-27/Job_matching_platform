import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export default function ResumeUploader({ onUpload }: { onUpload: (url: string) => void }) {
  return (
    <UploadButton<OurFileRouter>
      endpoint="resumeUploader"
      onClientUploadComplete={(res) => {
        if (res && res.length > 0) {
          console.log("Resume uploaded to:", res[0].url);
          onUpload(res[0].url);
        }
      }}
      onUploadError={(error) => {
        alert(`Upload failed: ${error.message}`);
      }}
    />
  );
}
