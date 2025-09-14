import React, { useCallback, useState } from "react";

export default function App() {
  const urlSearchParams = new URLSearchParams();
  urlSearchParams.append("client_id", import.meta.env.VITE_GIT_CLIENT_ID);
  urlSearchParams.append("redirect_uri", import.meta.env.VITE_GIT_REDIRECT_URI);
  urlSearchParams.append("scope", "repo,user:email");
  urlSearchParams.append("prompt", "select_account");

  const [hasAccessToken, setHasAccessToken] = useState(false);

  React.useEffect(() => {
    (async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const accessToken = searchParams.get("access_token");
      const tokenType = searchParams.get("token_type");
      const scope = searchParams.get("scope");

      if (accessToken) window.cookieStore.set("access_token", accessToken);
      if (tokenType) window.cookieStore.set("token_type", tokenType);
      if (scope) window.cookieStore.set("scope", scope);

      if (accessToken || (await window.cookieStore.get("access_token")))
        setHasAccessToken(true);
    })();
  }, []);

  return (
    <main className="h-screen w-screen flex bg-neutral-100 justify-center items-center">
      <div className="border p-20 border-neutral-300 rounded-xl drop-shadow-lg bg-white">
        <div>
          <span className="font-bold text-xl">
            Backup all your gihub repository
          </span>
        </div>

        <div className="flex justify-center my-10">
          <a
            href={`https://github.com/login/oauth/authorize?${urlSearchParams.toString()}`}
            className="px-3 py-2 bg-emerald-600 text-white rounded-lg border border-emerbg-400 md:cursor-pointer"
          >
            Authenticate with Github
          </a>
        </div>

        <a
        download
          href="http://localhost:5473/api/backup-all-repo"
          className="px-3 py-2 disabled:cursor-not-allowed disabled:hover:bg-neutral-50 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-100 md:cursor-pointer mb-5"
        >
          Backup All Repository (Private Included)
        </a>

        <div className="mt-5">Your github is already added to backup queue.</div>
        <div>We will mail you when your backup is ready.</div>
      </div>
    </main>
  );
}
