import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // التأكد من وجود المصفوفة بشكل صحيح لتجنب خطأ not iterable
    const messages = Array.isArray(body.messages) ? body.messages : [];

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'مفتاح GROQ_API_KEY غير معرف في ملف .env.local' },
        { status: 500 }
      );
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'أنت مساعد ذكاء اصطناعي احترافي يدعى AURA AI PRO. أجب بدقة واستخدم تنسيق Markdown وSyntax Highlighting للأكواد والجداول عند الحاجة.',
        },
        ...messages,
      ],
      model: 'openai/gpt-oss-120b',
      temperature: 0.7,
      max_tokens: 2048,
    });

    const responseContent = completion.choices[0]?.message?.content || 'لم يتم استلام إجابة.';

    return NextResponse.json({ result: responseContent });
  } catch (error: any) {
    console.error('Groq API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'حدث خطأ أثناء جلب الإجابة من السيرفر.' },
      { status: 500 }
    );
  }
}