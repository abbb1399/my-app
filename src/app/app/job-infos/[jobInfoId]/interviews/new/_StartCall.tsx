"use client";

import { Button } from "@/components/ui/button";
import { env } from "@/data/env/client";
import { experienceLevels, JobInfoTable } from "@/drizzle/schema";
import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import { Loader2, MicIcon, MicOffIcon } from "lucide-react";
import { title } from "process";
import { de } from "zod/v4/locales";

export function StartCall({
  jobInfo,
  user,
  accessToken,
}: {
  jobInfo: Pick<
    typeof JobInfoTable.$inferInsert,
    "id" | "title" | "description" | "experienceLevel"
  >;
  user: {
    name: string;
    imageUrl: string;
  };
  accessToken: string;
}) {
  const { connect, disconnect, readyState } = useVoice();

  if (readyState === VoiceReadyState.IDLE) {
    return (
      <div className="flex justify-center items-center h-screen-header">
        <Button
          size="lg"
          onClick={async () =>
            connect({
              auth: { type: "accessToken", value: accessToken },
              configId: env.NEXT_PUBLIC_HUME_CONFIG_ID,
              sessionSettings: {
                type: "session_settings",
                variables: {
                  userName: user.name,
                  title: jobInfo.title || "정의 되지 않음.",
                  description: jobInfo.description,
                  experienceLevels: jobInfo.experienceLevel,
                },
              },
            })
          }
        >
          인터뷰 시작하기
        </Button>
      </div>
    );
  }

  if (
    readyState === VoiceReadyState.CONNECTING ||
    readyState === VoiceReadyState.CLOSED
  ) {
    return (
      <div className="h-screen-header flex items-center justify-center">
        <Loader2 className="animate-spin size-24" />
      </div>
    );
  }
  return (
    <div className="overflow-y-auto h-screen-header flex flex-col-reverse">
      <div className="container py-6 flex flex-col items-center justify-end">
        <Messages user={user} />
        <Controls />
      </div>
    </div>
  );
}

function Messages({ user }: { user: { name: string; imageUrl: string } }) {
  return <div>메세지</div>;
}

function Controls() {
  const { disconnect, isMuted, mute, unmute, micFft, callDurationTimestamp } =
    useVoice();

  return (
    <div className="flex gap-5 rounded border px-5 py-2 w-fit sticky bottom-6 bg-background items-center">
      <Button variant="ghost" size="icon" onClick={isMuted ? unmute : mute}>
        {isMuted ? <MicOffIcon className="text-destructive" /> : <MicIcon />}
        <span className="sr-only">{isMuted ? "음소거 해제" : "음소거"} </span>
      </Button>
      <div className="self-stretch">
        <FftVisualizer fft={micFft} />
      </div>
      <div className="text-sm text-muted-foreground tabular-nums">
        {callDurationTimestamp}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="-mx-3"
        onClick={disconnect}
      />
    </div>
  );
}

function FftVisualizer({ fft }: { fft: number[] }) {
  return <div>{fft.length}</div>;
}
