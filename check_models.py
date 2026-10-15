import os
from groq import Groq

# قراءة المفتاح من ملف البيئة بأمان
api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key)

try:
    # جلب قائمة النماذج المتاحة حالياً
    models = client.models.list()
    print("--- النماذج المتاحة حالياً على حسابك في Groq ---")
    for model in models.data:
        print(f"- {model.id}")
except Exception as e:
    print(f"حدث خطأ أثناء جلب النماذج: {e}")