import { env } from "@/lib/env";
import axios, { AxiosHeaders } from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  let githubCode = searchParams.get("code");

  if (!githubCode)
    return NextResponse.json(
      { message: "Failed to authenticate using github" },
      { status: 400 }
    );

  githubCode = githubCode.toString();

  const sp = new URLSearchParams();
  sp.append("client_id", env.GITHUB_CLIENT_ID);
  sp.append("client_secret", env.GITHUB_CLIENT_SECRET);
  sp.append("code", githubCode);
  sp.append("redirect_uri", env.GITHUB_REDIRECT_URL);

  let access_token: string;
  let token_type: string;
  let scope: string;

  try {
    const headers = new AxiosHeaders();
    headers.set("Accept", "application/json");

    const request = await axios.request({
      url: `https://github.com/login/oauth/access_token?${searchParams.toString()}`,
      headers,
    });

    console.log(request.data); // access_token=gho_oaNTFaBW9XYgchqmX&scope=repo&token_type=bearer

    if (!request.data.access_token)
      return NextResponse.json(
        { message: "Failed to get authentication code" },
        { status: 400 }
      );

    access_token = request.data.access_token;
    token_type = request.data.token_type;
    scope = request.data.scope;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Some error occured." },
      { status: 400 }
    );
  }

  return NextResponse.redirect(
    `http://localhost:5173?access_token=${access_token}&token_type=${token_type}&scope=${scope}`
  );
}
