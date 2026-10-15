import os
import json
from groq import Groq

# استيراد الأدوات
try:
    from tools import tools_schema, calculate_calories, send_lead_notification
except ImportError:
    tools_schema = []
    def calculate_calories(**kwargs): return "Tools module missing"
    def send_lead_notification(**kwargs): return "Tools module missing"

def run_agent(user_message: str, history: list = None):
    if history is None:
        history = []

    # مفتاح الـ API الخاص بك
    api_key = os.getenv("GROQ_API_KEY")
    
    try:
        clean_key = api_key.encode("ascii", "ignore").decode("ascii")
        client = Groq(api_key=clean_key)
        
        # 1. إعداد الـ System Prompt المتخصص في الكاليستثنكس
        system_prompt = (
            "أنت مساعد ذكي متخصص في رياضة الكاليستثنكس (Calisthenics Assistant).\n"
            "مهمتك تقديم نصائح تدريبية، خطط رياضية، وحساب السعرات الحرارية بدقة.\n"
            "قم بتقسيم التمارين دائماً حسب المستويات (مبتدئ، متوسط، متقدم)، "
            "واستعمل الأداة المناسبة عند طلب حساب السعرات الحرارية أو إرسال الإشعارات."
        )

        messages = [{"role": "system", "content": system_prompt}]
        
        # 2. دمج سجل المحادثات السابقة (تفعيل الذاكرة)
        for msg in history:
            messages.append(msg)
            
        # 3. إضافة رسالة المستخدم الجديدة
        messages.append({"role": "user", "content": user_message})

        # إرسال الطلب إلى Groq
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=messages,
            tools=tools_schema if tools_schema else None,
            tool_choice="auto" if tools_schema else None
        )

        response_message = response.choices[0].message

        # التعامل مع استدعاء الأدوات (Tools)
        if hasattr(response_message, 'tool_calls') and response_message.tool_calls:
            tool_call = response_message.tool_calls[0]
            func_name = tool_call.function.name
            args = json.loads(tool_call.function.arguments)

            if func_name == "calculate_calories":
                result = calculate_calories(**args)
            elif func_name == "send_lead_notification":
                result = send_lead_notification(**args)
            else:
                result = "أداة غير معروفة"
                
            return f"تم تنفيذ الأداة بنجاح: {result}"

        return response_message.content

    except Exception as e:
        return f"Groq Error: {str(e)}"