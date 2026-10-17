import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. التأكد من وجود المصفوفة
    const rawMessages = Array.isArray(body.messages) ? body.messages : [];

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'مفتاح GROQ_API_KEY غير معرف في بيئة العمل.' },
        { status: 500 }
      );
    }

    // 2. اقتطاع سجل الرسائل (إرسال آخر 8 رسائل فقط لمنع تجاوز سقف الحجم 413)
    const recentMessages = rawMessages.slice(-8);

    // 3. تحديد أقصى عدد أحرف للرسالة الواحدة لحماية الـ API
    const sanitizedMessages = recentMessages.map((msg: { role: string; content: string }) => ({
      role: msg.role,
      content: typeof msg.content === 'string' ? msg.content.slice(0, 3000) : msg.content,
    }));

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'أنت مساعد ذكاء اصطناعي احترافي يدعى AURA AI PRO. أجب بدقة واستخدم تنسيق Markdown وSyntax Highlighting للأكواد والجداول عند الحاجة.',
        },
        ...sanitizedMessages,
      ],
      model: 'openai/gpt-oss-120b',
      temperature: 0.7,
      max_tokens: 1500, // تقليل القليل لضمان عدم تجاوز السقف
    });

    const responseContent = completion.choices[0]?.message?.content || 'لم يتم استلام إجابة.';

    return NextResponse.json({ result: responseContent });
  } catch (error: any) {
    console.error('Groq API Error:', error);

    // معالجة خاصة لخطأ تجاوز الحجم 413
    if (error?.status === 413 || error?.message?.includes('413')) {
      return NextResponse.json(
        { error: 'حجم المحادثة كبير جداً. تم الوصول للحد الأقصى، يرجى بدء محادثة جديدة.' },
        { status: 413 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'حدث خطأ أثناء جلب الإجابة من السيرفر.' },
      { status: 500 }
    );
  }
}