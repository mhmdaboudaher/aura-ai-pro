import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const userMessageCounts: Record<string, number> = {};
const MAX_FREE_MESSAGES = 30;

export async function POST(req: Request) {
  try {
    const { messages, userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ result: "يرجى تسجيل الدخول أولاً لاستخدام الذكاء الاصطناعي." }, { status: 401 });
    }

    const currentCount = userMessageCounts[userId] || 0;

    if (currentCount >= MAX_FREE_MESSAGES) {
      return NextResponse.json({ 
        result: "⚠️ لقد استهلكت حدك المجاني المخصص (30 رسالة)." 
      });
    }

    // استخدام موديل openai/gpt-oss-120b
    const cleanMessages = Array.isArray(messages)
      ? messages.map((msg: any) => ({
          role: msg.role || 'user',
          content: msg.content || '',
        }))
      : [];

    const formattedMessages = [
      {
        role: 'system',
        content:
          'You are AURA AI, a helpful assistant. Always respond using clean Markdown or plain text. Never output raw HTML elements.',
      },
      ...cleanMessages,
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: 'openai/gpt-oss-120b',
    });

    const aiReply = chatCompletion.choices[0]?.message?.content || "لم أستطع الحصول على إجابة.";

    userMessageCounts[userId] = currentCount + 1;

    return NextResponse.json({ result: aiReply });

  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء الاتصال بالخدمة المجانية." }, { status: 500 });
  }
}