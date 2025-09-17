"use client";
import { env } from "@/lib/env";
import React, { useState } from "react";

export default function Home() {
  const urlSearchParams = new URLSearchParams();
  urlSearchParams.append("client_id", env?.NEXT_PUBLIC_GITHUB_CLIENT_ID);
  urlSearchParams.append("redirect_uri", env?.NEXT_PUBLIC_GITHUB_REDIRECT_URL!);
  urlSearchParams.append("scope", "repo,user:email");
  urlSearchParams.append("prompt", "select_account");

  const [hasAccessToken, setHasAccessToken] = useState(false);

  const [currentState, setCurrentState] = useState<
    "loading" | "in-queue" | "ready" | null
  >("loading");

  React.useEffect(() => {
    (async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const accessToken = searchParams.get("access_token");
      const tokenType = searchParams.get("token_type");
      const scope = searchParams.get("scope");

      if (accessToken)
        window.cookieStore.set({
          name: "access_token",
          value: accessToken,
          expires: Date.now() + 1000 * 60 * 60 * 24,
        });
      if (tokenType)
        window.cookieStore.set({
          name: "token_type",
          value: tokenType,
          expires: Date.now() + 1000 * 60 * 60 * 24,
        });
      if (scope)
        window.cookieStore.set({
          name: "scope",
          value: scope,
          expires: Date.now() + 1000 * 60 * 60 * 24,
        });

      if (accessToken || (await window.cookieStore.get("access_token")))
        setHasAccessToken(true);
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const req = await fetch("/api/check", {
          method: "POST",
        });
        const res = await req.json();

        setCurrentState(res.status);
      } catch (error) {}
    })();
  }, []);

  const handleBackup = async () => {
    try {
      const request = await fetch("/api/backup-profile", {
        method: "POST",
      });

      const response = await request.json();

      if ("url" in response)
        window.open(response.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error(error);
      alert("Request Failed");
    }
  };

  return (
    <main className="h-screen w-screen flex text-neutral-800 bg-neutral-100 justify-center items-center">
      <div className="border p-20 border-neutral-300 rounded-xl drop-shadow-lg bg-white">
        <div>
          <span className="font-bold text-xl">
            Backup all your gihub repository
          </span>
        </div>

        <div className="flex justify-center my-10">
          <a
            aria-disabled={hasAccessToken}
            href={
              !hasAccessToken
                ? `https://github.com/login/oauth/authorize?${urlSearchParams.toString()}`
                : undefined
            }
            className="px-3 aria-disabled:opacity-80 aria-disabled:cursor-not-allowed py-2 bg-emerald-600 text-white rounded-lg border border-emerbg-400 md:cursor-pointer"
          >
            Authenticate with Github
          </a>
        </div>

        <button
          onClick={handleBackup}
          className="px-3 py-2 disabled:hover:bg-neutral-50 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-100 md:cursor-pointer mb-5"
        >
          {currentState == "ready" ? "Download Your Repository Backup (zip)" : "Backup All Repository (Private Included)"}
        </button>

        <div className="text-lg font-medium text-center">
          {currentState == "in-queue" ? "We are processing your request. It would take around 10-20 minutes. You can check in while to download your repo." : currentState == "ready" ? <span>Your github backup is ready to download.</span>  : currentState == "loading" ? "Loading...": "Make a backup of your whole github repository including private repositories. So you always have a copy of your precious code."}
        </div>
      </div>
    </main>
  );
}
