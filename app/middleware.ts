// middleware.ts
import { withAuth } from "next-auth/middleware";
import { createUploadthingMiddleware } from "uploadthing/next";

export const config = {
  matcher: ["/api/uploadthing"],
};

export default createUploadthingMiddleware();
