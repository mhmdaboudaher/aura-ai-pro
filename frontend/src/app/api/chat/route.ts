import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// تحديد الحد الأقصى لطول الرسالة لمنع استهلاك الـ Tokens الزائد
const MAX_MESSAGE_LENGTH = 2000;

export async function POST(req: Request) {
  try {
    // 1. استخراج الـ userId الآمن والموثوق من Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول (Unauthorized)' },
        { status: 401 }
      );
    }

    // 2. قراءة المدخلات
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'بيانات المدخلات غير صالحة' },
        { status: 400 }
      );
    }

    // 3. التحقق من الرسالة الأخيرة وحجمها (Input Sanitization)
    const lastMessage = messages[messages.length - 1];
    
    if (!lastMessage || typeof lastMessage.content !== 'string') {
      return NextResponse.json(
        { error: 'محتوى الرسالة غير صالح' },
        { status: 400 }
      );
    }

    if (lastMessage.content.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `عفواً، الرسالة طويلة جداً. الحد الأقصى هو ${MAX_MESSAGE_LENGTH} حرف.` },
        { status: 400 }
      );
    }

    // 4. إرسال الطلب لـ Groq API بأمان
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama3-8b-8192',
    });

    const responseContent = chatCompletion.choices[0]?.message?.content || '';

    return NextResponse.json({ result: responseContent });

  } catch (error) {
    console.error('[CHAT_API_ERROR]', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
}
