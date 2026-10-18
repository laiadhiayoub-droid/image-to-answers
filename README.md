# Smart Snippet Analyzer

أريد بناء تطبيق ويب كامل (full‑stack) مستوحى من فكرة أداة Snippai، يكون بمثابة "أداة قص وتحليل ذكية" تعمل من خلال رفع الصور. يجب أن يتميز التطبيق بالميزات التالية:

1.  **رفع الصور ومعالجتها:**

    *   واجهة تسمح للمستخدم برفع صورة من جهازه (JPEG، PNG، أو WebP).

    *   دعم الصور الملتقطة من الشاشة (screenshots) بشكل خاص.

2.  **التحليل والاستخراج باستخدام الذكاء الاصطناعي:**

    *   **استخراج النصوص (OCR):** استخراج كل النصوص من الصورة بدقة عالية، مع الحفاظ على تنسيقها الأصلي كلما أمكن. يجب أن يعمل ذلك بشكل ممتاز مع الأكواد البرمجية والنصوص العادية[reference:3].

    *   **التعرف على الصيغ الرياضية (LaTeX):** الكشف التلقائي عن أي صيغ رياضية في الصورة، وتحويلها إلى كود LaTeX صحيح[reference:4].

    *   **استخراج الجداول:** إذا احتوت الصورة على جدول، يجب تحويله إلى صيغة Markdown أو JSON منظمة.

    *   **تحليل الألوان:** تحديد وإظهار الألوان السائدة في الصورة مع رموز HEX الخاصة بها.

    *   **الوصف التحليلي العام:** تقديم وصف نصي تحليلي لمحتوى الصورة بالكامل (مثل: "هذه الصورة تحتوي على رسم بياني يظهر زيادة في المبيعات..."، أو "هذه لقطة شاشة لكود لغة بايثون...").

3.  **الميزات الإضافية:**

    *   **ترجمة فورية:** زر لترجمة النص المستخرج من الصورة إلى اللغة العربية (أو أي لغة يختارها المستخدم)، باستخدام نموذج ترجمة مدعوم من Lovable[reference:5].

    *   **نسخ وتحميل:** إتاحة نسخ كل نتيجة (نص، كود LaTeX، JSON) بنقرة زر، أو تحميلها كملف.

4.  **التصميم والتجربة:**

    *   تصميم حديث ونظيف (يشبه تصميم أدوات التقطيع الحديثة)، مع ألوان هادئة وخطوط واضحة.

    *   استخدام مكتبة **shadcn/ui** لبناء واجهة المستخدم لضمان التصميم الاحترافي والاستجابة للهواتف[reference:6].

    *   يجب أن يكون التطبيق متجاوبًا بالكامل مع جميع أحجام الشاشات.

    *   يجب أن يعرض نتائج التحليل بشكل منظم في أقسام منفصلة (قسم للنص، قسم للصيغ، قسم للجدول، إلخ).

5.  **التقنيات والتكاملات المطلوبة:**

    *   استخدم **نموذج رؤية حاسوبية (Vision Model)** متقدم، مثل نموذج **GPT‑4V** أو ما يعادله من خلال تكاملات Lovable المدمجة[reference:7]، لتحليل الصور واستخراج البيانات.

    *   استخدام وظيفة **OCR** المضمنة في Lovable لتحسين دقة استخراج النصوص من الصور[reference:8].

    *   استخدام نظام **مصادقة** (مثل Supabase Auth) للسماح للمستخدمين بإنشاء حسابات وحفظ سجل عملياتهم[reference:9].

    *   استخدام قاعدة بيانات **PostgreSQL** (مثل Supabase) لتخزين بيانات المستخدمين وتاريخهم.

يرجى البدء في بناء هذا التطبيق خطوة بخطوة، مع التركيز على جعل الواجهة سهلة الاستخدام ومباشرة، وأن تكون عملية رفع الصورة وعرض النتائج سريعة وسلسة.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://image-to-answers.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8af27224-2e7a-437d-8138-4f2461e80674).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
