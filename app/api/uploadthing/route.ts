// app/api/uploadthing/route.ts
// app/api/uploadthing/route.ts
import { createUploadthing, createRouteHandler, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

const fileRouter = {
  resumeUploader: f({ "application/pdf": { maxFileSize: "4MB" } }).onUploadComplete(
    async ({ file }) => {
      const url = file.ufsUrl ?? file.url;
      console.log("📄 Resume uploaded:", url);
    }
  ),
  imageUploader: f({ image: { maxFileSize: "4MB" } }).onUploadComplete(
    async ({ file }) => {
      console.log("🖼️ Image uploaded:", file.ufsUrl ?? file.url);
    }
  ),
} satisfies FileRouter;

export const { GET, POST } = createRouteHandler({
  router: fileRouter,
});

