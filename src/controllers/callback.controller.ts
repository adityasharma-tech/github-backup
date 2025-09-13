import axios, { AxiosHeaders } from "axios";

import { env } from "../validators/env";
import { ApiError } from "../lib/api-error";
import { asyncHandler } from "../lib/async-handler";

const handleGithubCallback = asyncHandler(async (req, res) => {
  let githubCode = req.query.code;

  if (!githubCode)
    throw new ApiError(400, "Failed to authenticate through github");

  githubCode = githubCode.toString();

  const searchParams = new URLSearchParams();
  searchParams.append("client_id", env.GITHUB_CLIENT_ID);
  searchParams.append("client_secret", env.GITHUB_CLIENT_SECRET);
  searchParams.append("code", githubCode);
  searchParams.append("redirect_uri", env.GITHUB_REDIRECT_URL);

  let access_token: string;
  let token_type: string;
  let scope: string;

  try {
    const headers = new AxiosHeaders()
    headers.set('Accept', 'application/json')

    const request = await axios.request({
      url: `https://github.com/login/oauth/access_token?${searchParams.toString()}`,
      headers
    });

    console.log(request.data); // access_token=gho_oaNTFaBW9XYgchqmX&scope=repo&token_type=bearer

    if (!request.data.access_token)
      throw new ApiError(400, "Failed to get verification code");

    access_token = request.data.access_token;
    token_type = request.data.token_type;
    scope = request.data.scope;
  } catch (error) {
    console.error(error);
    throw new ApiError(400, "some error occured");
  }

  return res.redirect(
    `http://localhost:5173?access_token=${access_token}&token_type=${token_type}&scope=${scope}`
  );
});

export { handleGithubCallback };
