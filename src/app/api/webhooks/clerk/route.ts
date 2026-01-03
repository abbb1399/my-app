import { deleteUser, upsertUser } from "@/features/users/db";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const event = await verifyWebhook(request);

    switch (event.type) {
      case "user.created":
      case "user.updated":
        const clerkData = event.data;
        const email = clerkData.email_addresses.find(
          (e) => e.id === clerkData.primary_email_address_id
        )?.email_address;

        if (email == null) {
          return new Response("이메일을 찾을수 없습니다.", { status: 400 });
        }

        await upsertUser({
          id: clerkData.id,
          email,
          name: `${clerkData.first_name} ${clerkData.last_name}`,
          imageUrl: clerkData.image_url,
          createdAt: new Date(clerkData.created_at),
          updatedAt: new Date(clerkData.updated_at),
        });
        break;

      case "user.deleted":
        if (event.data.id == null) {
          return new Response("유저 아이디를 찾을수 없습니다.", {
            status: 400,
          });
        }

        await deleteUser(event.data.id);
        break;
    }
  } catch {
    return new Response("유저 아이디를 찾을수 없습니다.", { status: 400 });
  }

  return new Response("웹훅 성공", { status: 200 });
}
