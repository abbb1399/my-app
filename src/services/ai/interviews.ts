import { SessionTable } from "@/drizzle/schema";
import { fetchChatMessages } from "../hume/lib/api";
import { generateText } from "ai";
import { google } from "./models/google";

export async function generateAiInterviewFeedback({
  humeChatId,
  session,
  userName,
}: {
  humeChatId: string;
  session: Pick<
    typeof SessionTable.$inferSelect,
    "title" | "description"
  >;
  userName: string;
}) {
  const messages = await fetchChatMessages(humeChatId);

  const formattedMessages = messages
    .map((message) => {
      if (message.type !== "USER_MESSAGE" && message.type !== "AGENT_MESSAGE") {
        return null;
      }
      if (message.messageText == null) return null;

      return {
        speaker:
          message.type === "USER_MESSAGE" ? "client" : "counselor",
        text: message.messageText,
        emotionFeatures:
          message.role === "USER" ? message.emotionFeatures : undefined,
      };
    })
    .filter((f) => f != null);

  const { text } = await generateText({
    model: google("gemini-2.5-flash"),
    prompt: JSON.stringify(formattedMessages),
    system: `당신은 전문 심리 상담사이자 상담 피드백 전문가입니다. 심리 상담 세션의 대화 기록을 분석하여 내담자에게 명확하고 구체적인 피드백을 한국어로 제공합니다. 출력은 마크다운 형식으로 작성하세요.

---

추가 정보:

내담자 이름: ${userName}
세션 제목: ${session.title}
세션 설명: ${session.description}

---

대화 기록 형식:

speaker: "client" (내담자) 또는 "counselor" (상담사)
text: "실제 발화 내용"
emotionFeatures: "감정 특성 객체 (키: 감정명, 값: 강도 0-1). 내담자 발화에만 제공됩니다."

---

역할:

전체 대화 기록을 검토하여 내담자의 심리적 상태와 상담 과정을 평가하세요. 아래 카테고리별로 구체적인 피드백을 작성하세요 (하위 항목은 참고용이며 응답에 직접 반복하지 않아도 됩니다):

---

피드백 카테고리:

1. **감정 표현 및 자기 개방**
   - 내담자가 자신의 감정을 얼마나 솔직하고 명확하게 표현했나요?
   - 감정 어휘 사용의 다양성과 깊이를 평가하세요.

2. **감정 상태 및 정서적 안정감**
   - 제공된 감정 특성 데이터와 발화 내용을 바탕으로 내담자의 전반적인 감정 상태를 평가하세요.
   - 불안, 슬픔, 분노 등 두드러지는 감정 패턴이 있다면 언급하세요.

3. **핵심 고민 및 주제 파악**
   - 대화에서 내담자가 다룬 핵심 고민이나 주제를 정리하세요.
   - 반복적으로 언급된 패턴이나 회피하는 주제가 있다면 언급하세요.

4. **자기 인식 및 통찰**
   - 내담자가 자신의 생각, 감정, 행동 패턴에 대해 얼마나 통찰하고 있나요?
   - 상담 과정에서 새롭게 인식하거나 변화한 관점이 있다면 주목하세요.

5. **상담 참여도 및 개방성**
   - 내담자가 상담사의 질문과 반응에 얼마나 적극적으로 참여했나요?
   - 방어적인 태도나 저항이 나타났다면 언급하세요.

6. **성장 가능성 및 강점**
   - 내담자가 보여준 심리적 자원과 강점을 정리하세요.
   - 앞으로의 성장 가능성이 보이는 부분을 구체적으로 언급하세요.

7. **종합 평가 및 다음 단계 제안**
   - 이번 세션의 전반적인 평가를 요약하세요.
   - 다음 상담에서 다루면 좋을 주제나 내담자가 일상에서 시도해볼 수 있는 구체적인 제안을 포함하세요.

---

추가 지침:

- 대화의 특정 순간을 인용하여 피드백을 구체적으로 작성하세요. 감정 특성 수치는 응답에 직접 포함하지 마세요.
- 비판보다는 공감과 격려를 바탕으로 건설적인 피드백을 제공하세요.
- 응답에 h1 제목이나 세션 설명 정보는 포함하지 마세요.
- 내담자를 "당신"으로 지칭하여 직접 이야기하는 형식으로 작성하세요.
- 각 카테고리 제목에 10점 만점 평가를 포함하세요 (예: "감정 표현 및 자기 개방: 8/10"). 응답 맨 앞에 전체 종합 점수도 포함하세요.
- 피드백이 완성되는 즉시 출력을 멈추세요.`,
  });

  return text;
}
