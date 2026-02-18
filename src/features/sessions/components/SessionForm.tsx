"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SessionTable } from "@/drizzle/schema/session";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sessionSchema } from "../schemas";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { createSession, updateSession } from "../actions";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

type SessionFormData = z.infer<typeof sessionSchema>;

const emotionalStateOptions = [
  { value: "anxious", label: "불안" },
  { value: "depressed", label: "우울" },
  { value: "happy", label: "행복" },
  { value: "angry", label: "분노" },
  { value: "sad", label: "슬픔" },
  { value: "neutral", label: "무감각" },
  { value: "hopeful", label: "희망" },
  { value: "stressed", label: "스트레스" },
];

const topicTagOptions = [
  { value: "work_stress", label: "직장 스트레스" },
  { value: "relationships", label: "대인관계" },
  { value: "sleep", label: "수면" },
  { value: "self_esteem", label: "자존감" },
  { value: "family", label: "가족" },
  { value: "career", label: "진로" },
  { value: "health", label: "건강" },
  { value: "finances", label: "재정" },
];

export function SessionForm({
  session,
}: {
  session?: Pick<
    typeof SessionTable.$inferSelect,
    | "id"
    | "title"
    | "description"
    | "moodRating"
    | "emotionalState"
    | "topicTags"
  >;
}) {
  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: session ?? {
      title: null,
      description: null,
      moodRating: null,
      emotionalState: null,
      topicTags: null,
    },
  });

  async function onSubmit(values: SessionFormData) {
    const action = session
      ? updateSession.bind(null, session.id)
      : createSession;

    const res = await action(values);

    if (res.error) {
      toast.error(res.message);
    }
  }

  function toggleTag(field: "emotionalState" | "topicTags", value: string) {
    const current = form.getValues(field) ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    form.setValue(field, next);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              </FormControl>
              <FormDescription>
                상담 세션의 제목을 입력해주세요.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>설명</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="오늘 상담에서 다루고 싶은 내용을 자유롭게 적어주세요."
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="moodRating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>현재 기분 점수 ({field.value ?? "-"} / 10)</FormLabel>
              <FormControl>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={field.value != null ? [field.value] : [5]}
                  onValueChange={([v]) => field.onChange(v)}
                />
              </FormControl>
              <FormDescription>1(매우 나쁨) ~ 10(매우 좋음)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="emotionalState"
          render={({ field }) => (
            <FormItem>
              <FormLabel>감정 상태</FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {emotionalStateOptions.map((option) => (
                    <Badge
                      key={option.value}
                      variant={
                        (field.value ?? []).includes(option.value)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => toggleTag("emotionalState", option.value)}
                    >
                      {option.label}
                    </Badge>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="topicTags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>상담 주제</FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {topicTagOptions.map((option) => (
                    <Badge
                      key={option.value}
                      variant={
                        (field.value ?? []).includes(option.value)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => toggleTag("topicTags", option.value)}
                    >
                      {option.label}
                    </Badge>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          disabled={form.formState.isSubmitting}
          type="submit"
          className="w-full"
        >
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            저장
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
