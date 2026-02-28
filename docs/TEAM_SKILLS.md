# متطلبات المهارات والتقنيات لكل عضو في الفريق

## 🛠️ تقنيات أساسية للجميع (Must Have)
قبل التخصص، يجب على كل أعضاء الفريق إتقان التالي:
- **React**: Hooks (`useState`, `useEffect`, `useContext`), Custom Hooks.
- **TypeScript**: Basics, Interfaces, Props validation.
- **Git**: Branching, Pull Requests, Merge Conflict resolution.
- **CSS Modules**: تنسيق المكونات بشكل معزول.

---

## 👨‍💻 المطور 1: Frontend Lead (البنية والأساسية)
يحتاج لخبرة أعمق في هيكلية المشروع.
- **React Router v6**: التعامل مع الـ Loaders, Actions, Protected Routes.
- **Context API / Redux**: لإدارة حالة التطبيق العالمية (Authentication State).
- **Architecture**: كيفية تنظيم المجلدات وكتابة كود قابل لإعادة الاستخدام.
- **UI/UX Principles**: فهم مبادئ التصميم لعمل Design System متناسق.

## 👨‍💻 المطور 2: Student Module (واجهة الطالب والامتحان)
يحتاج لمهارات في التعامل مع الوقت والتفاعل اللحظي.
- **React Rendering Optimization**: `useMemo`, `useCallback` (مهم جداً لعدم تعليق الامتحان).
- **Browser Storage**: `localStorage` / `sessionStorage` لحفظ الإجابات مؤقتاً.
- **Timers Logic**: التعامل مع `setInterval` بدقة لعمل المؤقت التنازلي.
- **Security Basics**: منع الطالب من الغش (مثل منع النسخ واللصق أو كشف تغيير التبويب).

## 👨‍💻 المطور 3: Teacher Module (بناء الامتحانات)
يحتاج لمهارات عالية في النماذج (Forms).
- **React Hook Form**: مكتبة قوية لإدارة النماذج المعقدة والديناميكية.
- **Zod / Yup**: للتحقق من صحة البيانات (Validation) قبل إرسالها.
- **Dynamic Inputs**: كيفية إضافة حقول أسئلة وحذفها ديناميكياً (Field Arrays).
- **Rich Text Editors**: دمج محرر نصوص للأسئلة المنسقة (اختياري).

## 👨‍💻 المطور 4: Admin & Data (الإحصائيات والبيانات)
يحتاج لمهارات عرض البيانات.
- **Data Visualization Libs**: مثل `Recharts` أو `Chart.js` لعمل الرسوم البيانية.
- **Table Management**: عمل جداول تقبل الفرز (Sorting) والبحث (Filtering) والترقيم (Pagination).
- **Export Libraries**: مكتبات مثل `jspdf` أو `xlsx` لتصدير التقارير.
- **React Skeleton**: عرض شاشات التحميل بشكل احترافي.

## 👨‍💻 المطور 5: Backend & Supabase
يحتاج لمهارات الـ Backend وقواعد البيانات.
- **PostgreSQL**: فهم العلاقات (One-to-Many, Many-to-Many).
- **Supabase Features**:
  - **RLS (Row Level Security)**: أهم مهارة لحماية البيانات.
  - **Database Triggers & Functions**: كود SQL يعمل تلقائياً.
- **Advanced TypeScript**: كتابة المولدات (Generics) لاستنتاج أنواع البيانات من الداتابيس تلقائياً (`SupabaseGeneratedTypes`).

---

## 📚 مصادر تعلم مقترحة (Learning Path)
1. **للفريق كله**: قراءة "React Beta Docs" الرسمية.
2. **للمطور 3 (Forms)**: فيديو شرح `React Hook Form` مع `Zod`.
3. **للمطور 4 (Graphs)**: تجربة مكتبة `Recharts`.
4. **للمطور 5 (Database)**: قراءة توثيق `Supabase Auth` و `RLS`.
