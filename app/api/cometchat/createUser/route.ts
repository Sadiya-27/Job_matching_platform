// app/api/cometchat/createUser/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { uid, name } = await req.json();

  const apiKey = process.env.COMETCHAT_REST_API_KEY;
  const appId = process.env.NEXT_PUBLIC_COMETCHAT_APP_ID;
  const region = process.env.NEXT_PUBLIC_COMETCHAT_REGION;

  try {
    const res = await fetch(`https://${region}.api.cometchat.io/v3/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        appid: appId!,
        apikey: apiKey!,
      },
      body: JSON.stringify({
        uid,
        name,
      }),
    });

    const data = await res.json();

    if (!res.ok && data?.message !== "User already exists") {
      throw new Error(data?.message || "CometChat user creation failed");
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
