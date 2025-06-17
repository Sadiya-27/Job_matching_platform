import { createUploadthing, type FileRouter } from "uploadthing/next";


const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .onUploadComplete(async ({ file }) => {
      const imageUrl = file.ufsUrl ?? file.url;
      console.log("✅ File uploaded:", imageUrl);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;