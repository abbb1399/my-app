"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { experienceLevels, SessionTable } from "@/drizzle/schema/session";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sessionSchema } from "../schemas";
import { formatExperienceLevel } from "../lib/formatters";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { createSession, updateSession } from "../actions";
import { toast } from "sonner";

type SessionFormData = z.infer<typeof sessionSchema>;

export function SessionForm({
  jobInfo,
}: {
  jobInfo?: Pick<
    typeof SessionTable.$inferSelect,
    "id" | "name" | "title" | "experienceLevel" | "description"
  >;
}) {
  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: jobInfo ?? {
      name: "",
      title: null,
      description: "",
      experienceLevel: "junior",
    },
  });

  async function onSubmit(values: SessionFormData) {
    const action = jobInfo
      ? updateSession.bind(null, jobInfo.id)
      : createSession;

    const res = await action(values);

    if (res.error) {
      toast.error(res.message);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                이름은 쉽게 식별할 수 있도록 UI에 표시됩니다.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>직무</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormDescription>
                  선택사항입니다. 지원하는 직무가 있는 경우 입력해주세요.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="experienceLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>경력 레벨</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {formatExperienceLevel(level)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>설명</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Next.js 15와 React 19를 사용하는  풀스택 웹 개발자 입니다."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                최대한 구체적으로 입력해주세요. 더 많은 정보를 제공할수록 면접
                질문이 더 좋아집니다.
              </FormDescription>
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
