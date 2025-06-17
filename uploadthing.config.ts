// uploadthing.config.ts
// uploadthing.config.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } }).onUploadComplete(
    async ({ file }) => {
      const imageUrl = file.ufsUrl ?? file.url;
      console.log("✅ File uploaded:", imageUrl);
    }
  ),

  resumeUploader: f({ "application/pdf": { maxFileSize: "4MB" } }).onUploadComplete(
    async ({ file }) => {
      const resumeUrl = file.ufsUrl ?? file.url;
      console.log("📄 Resume uploaded:", resumeUrl);
    }
  ),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
