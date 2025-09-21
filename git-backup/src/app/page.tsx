"use client";
import { env } from "@/lib/env";
import { useRouter } from "next/navigation";
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

  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const checkIt = async () => {
    try {
        const req = await fetch("/api/check", {
          method: "POST",
        });
        const res = await req.json();

        setCurrentState(res.status);
      } catch (error) {}
  }

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

      if (accessToken)
        router.push("/", {
          scroll: true,
        });
    })();
  }, []);

  React.useEffect(() => {
    checkIt()
  }, []);

  const handleBackup = async () => {
    setLoading(true)
    try {
      const request = await fetch("/api/backup-profile", {
        method: "POST",
      });

      const response = await request.json();

      if ("url" in response)
        window.open(response.url, "_blank", "noopener,noreferrer");

      await checkIt()
    } catch (error) {
      console.error(error);
      alert("Request Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-screen w-screen flex text-neutral-800 bg-neutral-100 justify-center items-center">
      <div className="border p-20 border-neutral-300 max-h-[80vh] max-w-[50vw] rounded-xl drop-shadow-lg bg-white">
        <div className="text-center">
          <span className="font-bold text-xl text-center w-full">
            Backup all your gihub repository
          </span>
          <div className="text-sm">
            Authorize with GitHub to create a private, read-only backup of all
            your repositories. Your archive is encrypted, stored temporarily,
            and expires in 24 hours — no risk, no permanent storage.
          </div>
        </div>

        <div className="flex justify-center w-full text-center my-10">
          <a
            aria-disabled={hasAccessToken}
            href={
              !hasAccessToken
                ? `https://github.com/login/oauth/authorize?${urlSearchParams.toString()}`
                : undefined
            }
            className="px-5 flex gap-x-3 items-center aria-disabled:opacity-80 aria-disabled:cursor-not-allowed py-2 bg-green-700 text-white rounded-lg border border-emerbg-400 md:cursor-pointer"
          >
            <span>
              {hasAccessToken
                ? "Github Authorized (read-only private repo)"
                : "Authorize Github (read-only private repo)"}
            </span>
            <svg width="1em" height="1em" viewBox="0 0 20 20">
              <path
                d="M10 0c5.523 0 10 4.59 10 10.253 0 4.529-2.862 8.371-6.833 9.728-.507.101-.687-.219-.687-.492 0-.338.012-1.442.012-2.814 0-.956-.32-1.58-.679-1.898 2.227-.254 4.567-1.121 4.567-5.059 0-1.12-.388-2.034-1.03-2.752.104-.259.447-1.302-.098-2.714 0 0-.838-.275-2.747 1.051A9.396 9.396 0 0010 4.958a9.375 9.375 0 00-2.503.345C5.586 3.977 4.746 4.252 4.746 4.252c-.543 1.412-.2 2.455-.097 2.714-.639.718-1.03 1.632-1.03 2.752 0 3.928 2.335 4.808 4.556 5.067-.286.256-.545.708-.635 1.371-.57.262-2.018.715-2.91-.852 0 0-.529-.985-1.533-1.057 0 0-.975-.013-.068.623 0 0 .655.315 1.11 1.5 0 0 .587 1.83 3.369 1.21.005.857.014 1.665.014 1.909 0 .271-.184.588-.683.493C2.865 18.627 0 14.783 0 10.253 0 4.59 4.478 0 10 0"
                fill="#fff"
                fillRule="evenodd"
              />
            </svg>
          </a>
        </div>

        <div className="flex w-full">
          <button
          disabled={loading}
            onClick={handleBackup}
            className="px-5 py-2 flex justify-center gap-x-3 items-center font-semibold transition-all mx-auto disabled:hover:bg-neutral-900 bg-neutral-900 rounded-lg text-neutral-50 hover:opacity-80 md:cursor-pointer mb-5"
          >
            {currentState == "ready"
              ? "Ready to Download Your Repository Backup (zip)"
              : "Start Backup All Repository (Private Included)"}

            {loading && <svg className="size-5 animate-spin fill-white" viewBox="0 0 16 16">
              <path d="M8 1v1.8A5.2 5.2 0 112.8 8H1a7 7 0 107-7z" />
            </svg>}
          </button>
        </div>
        <div className="text-sm font-medium text-center flex justify-center">
          {currentState == "in-queue" ? (
            "We are processing your request. It would take around 10-20 minutes. You can check in while to download your repo."
          ) : currentState == "ready" ? (
            <span>Your github backup is ready to download.</span>
          ) : currentState == "loading" ? (
            <svg className="size-8 animate-spin" viewBox="0 0 16 16">
              <path d="M8 1v1.8A5.2 5.2 0 112.8 8H1a7 7 0 107-7z" />
            </svg>
          ) : (
            "Click above button to start processing backup of your github repositories."
          )}
        </div>
      </div>
    </main>
  );
}
