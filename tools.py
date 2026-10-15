import json

def calculate_calories(weight_kg: float, height_cm: float, age: int, gender: str) -> str:
    """حساب الاحتياج اليومي من السعرات الحرارية."""
    if gender.lower() == "male":
        bmr = 88.362 + (13.397 * weight_kg) + (4.799 * height_cm) - (5.677 * age)
    else:
        bmr = 447.593 + (9.247 * weight_kg) + (3.098 * height_cm) - (4.330 * age)
    
    daily_calories = round(bmr * 1.55)
    return json.dumps({
        "bmr": round(bmr),
        "recommended_daily_calories": daily_calories
    })

def send_lead_notification(client_name: str, email: str, interest: str) -> str:
    """تسجيل بيانات العميل المهتم بطلب خدمة."""
    return json.dumps({
        "status": "success",
        "message": f"تم تسجيل بيانات العميل {client_name} بنجاح."
    })

tools_schema = [
    {
        "type": "function",
        "function": {
            "name": "calculate_calories",
            "description": "حساب احتياج السعرات الحرارية اليومي لشخص بناءً على الوزن والارتفاع والعمر والجنس.",
            "parameters": {
                "type": "object",
                "properties": {
                    "weight_kg": {"type": "number", "description": "الوزن بالكيلوغرام"},
                    "height_cm": {"type": "number", "description": "الطول بالسنتيمتر"},
                    "age": {"type": "integer", "description": "العمر بالسنوات"},
                    "gender": {"type": "string", "enum": ["male", "female"], "description": "الجنس"}
                },
                "required": ["weight_kg", "height_cm", "age", "gender"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "send_lead_notification",
            "description": "تسجيل بيانات عميل مهتم بطلب خدمة أو استشارة.",
            "parameters": {
                "type": "object",
                "properties": {
                    "client_name": {"type": "string", "description": "اسم العميل"},
                    "email": {"type": "string", "description": "البريد الإلكتروني للعميل"},
                    "interest": {"type": "string", "description": "الخدمة المهتم بها"}
                },
                "required": ["client_name", "email", "interest"]
            }
        }
    }
]