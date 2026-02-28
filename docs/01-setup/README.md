# Phase 1: Setup & Infrastructure

## 🎯 الهدف
إعداد بيئة التطوير الأساسية والبنية التحتية للمشروع، بما في ذلك ربط الواجهة الأمامية (React) مع قاعدة البيانات (Supabase).

## ✅ المتطلبات
- Node.js & npm مثبتة.
- حساب ومشروع نشط على Supabase.

## 📝 الخطوات المنفذة

### 1. إعداد المشروع (Project Initialization)
- تم إنشاء مشروع Vite React + TypeScript.
- تم تنظيف الملفات الافتراضية.
- إعداد `eslint` و `typescript` configurations بشكل صحيح.

### 2. هيكلية المشروع (Directory Structure)
تم إنشاء الهيكلية التالية:
- `src/services`: لخدمات الاتصال الخارجي (Supabase).
- `docs/`: للتوثيق المستمر.
- `supabase/`: لملفات القاعدة البيانات.

### 3. ربط Supabase
- تثبيت مكتبة `@supabase/supabase-js`.
- إنشاء ملف `.env` للمتغيرات البيئية.
- إنشاء `src/services/supabase.ts` كـ (Singleton Client).

### 4. قاعدة البيانات (Database)
- تم تصميم `profiles` table لربط المستخدمين ببيانات إضافية.
- تم تعريف `app_role` للتحكم في الصلاحيات (admin, teacher, student).

## 📁 الملفات المضافة
| الملف | الوصف |
|-------|-------|
| `src/services/supabase.ts` | عميل الاتصال بقاعدة البيانات |
| `.env` | مفاتيح الاتصال (غير مرفوع على git) |
| `supabase/migrations/initial_schema.sql` | كود SQL لإنشاء الجداول |

## 🧪 كيفية الاختبار
1. تأكد من وجود ملف `.env`.
2. شغل الأمر `npm run dev`.
3. افتح المتصفح وتأكد من عدم وجود أخطاء في الـ Console.
