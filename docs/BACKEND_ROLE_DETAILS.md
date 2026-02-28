# دليل مطور الواجهة الخلفية والربط (Backend & Integration Guide)

## 👤 ملخص الدور
في مشروع يعتمد على **Supabase**، دور الـ Backend يختلف عن المعتاد. أنت لا تبني API تقليدي (Express/Django)، بل أنت **مهندس قواعد بيانات (Database Architect)** و **مطور خدمات (Services Developer)**.

---

## 🏛️ الجزء الأول: مسؤوليات الـ Backend (داخل Supabase)
هذا العمل يتم داخل لوحة تحكم Supabase أو عبر ملفات SQL Migration.

### 1. تصميم قاعدة البيانات (Database Schema)
- **الجداول (Tables)**: إنشاء الجداول بدقة. مثال: جدول `exams`، جدول `questions`، جدول `answers`.
- **العلاقات (Relations)**: ربط الجداول ببعضها (Foreign Keys).
  - *مثال*: كل `question` يجب أن يرتبط بـ `exam_id`.
  - *مثال*: عند حذف امتحان، يجب حذف كل أسئلته تلقائياً (`ON DELETE CASCADE`).
- **أنواع البيانات (Data Types)**: اختيار النوع الصحيح (`UUID` للمعرفات، `JSONB` للإجابات المرنة، `TIMESTAMPTZ` للتواريخ).

### 2. الأمان والصلاحيات (RLS - Row Level Security) 🛡️ **(أهم جزء)**
بما أن Supabase يكشف الداتابيس للفرونت إند، حمايتك هي الـ RLS Policies.
- **مسؤوليتك**: كتابة كود SQL يحدد من يرى ماذا.
  - *السيناريو*: الطالب يجب أن يرى فقط الامتحانات الخاصة بفصله.
  - *الكود*: `CREATE POLICY ... USING (auth.uid() = student_id)`.
  - *الخطر*: إذا نسيت هذا، يمكن لأي طالب استدعاء API لقراءة إجابات الطلاب الآخرين!

### 3. المنطق المعقد (Database Functions)
- **الإجراءات المخزنة (Stored Procedures)**: لكتابة منطق معقد لا يمكن عمله في الفرونت.
  - *مثال*: دالة `calculate_score` تقوم بحساب الدرجة تلقائياً عند تسليم الامتحان لمنع التلاعب في الفرونت إند.

---

## 🔌 الجزء الثاني: مسؤوليات الربط (Frontend Integration)
إذا كنت مسؤولاً عن الربط أيضاً، فهذا يعني أنك ستكتب كود TypeScript داخل مجلد `src/services` في مشروع React.

### 1. إنشاء الـ Types (Type Generation)
- **المهمة**: سحب الـ Types من الداتابيس.
- **الأداة**: استخدام `supabase gen types` لتحويل جداول SQL إلى interfaces في TypeScript.
- **الفائدة**: المطور الآخر (الفرونت) عندما يكتب `user.` سيظهر له الاقتراح `full_name` تلقائياً ولن يخطئ في الكتابة.

### 2. بناء طبقة الخدمات (Service Layer)
المطور 2 (الطالب) والمطور 3 (المدرس) لا يجب أن يكتبوا كود `supabase.from('exams').select()` مباشرة داخل مكوناتهم.
- **دورك**: كتابة "دوال جاهزة" لهم يستخدمونها.
- **أمثلة للدوال التي ستكتبها لهم**:
  ```typescript
  // src/services/examService.ts
  
  // دالة لجلب الامتحانات المتاحة
  export const getAvailableExams = async (studentId: string) => {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('is_published', true);
      
    if (error) throw error;
    return data;
  };

  // دالة لتسليم الإجابات
  export const submitExamAnswer = async (examId: string, answers: any) => {
    // ... logic
  };
  ```

### 3. التعامل مع الأخطاء (Error Handling)
- يجب أن ترجع رسائل خطأ واضحة للمطورين الآخرين ليعرضوها للمستخدم (مثلاً: "انتهى وقت الامتحان").

---

## 🧪 خلاصة: ماذا يحتاج ليتعلم؟
1. **SQL**: لغة التخاطب مع الداتابيس (ننشئ الجداول والسياسات بها).
2. **Supabase Auth & RLS**: فهم كيف يعرف Supabase هوية المستخدم الحالي.
3. **TypeScript**: لتعريف شكل البيانات (Interfaces) التي ستعود من الداتابيس.
4. **Asynchronous JavaScript**: فهم `async/await` و `Promises` بشكل عميق جداً لعمل دوال الربط.
