# Exam Result — Logic

## Data Flow

```
useParams(:id)
  → examService.getSubmissionResult(examId)
    → supabase.from('submissions').eq('exam_id').eq('student_id')
    → supabase.from('exams')
    → supabase.from('questions')
  → setResult(ExamResultData)
  → render components
```

## Breakdown Computation (examService)

```
questions.reduce → typeMap { MCQ, True/False, Essay, Code }
  per type:
    total++, totalScore += q.marks
    if mcq/true_false and answered:
      normalize answer: "B. text".split('.')[0].trim()
      if match correct_answer: correct++, score += marks
    else (essay/code): score = 0, pending = true
  → perfLabel(pct, isPending)
```

## Gauge Math

```
CIRCUM = 2 * π * 45 = 282.74
strokeDashoffset = CIRCUM * (1 - percentage / 100)
// 7%  → offset = 263  → tiny visible arc ✓
// 100% → offset = 0   → full ring       ✓
```

## ComparisonChart

Horizontal bars: `width = ${pct}%`, `minWidth: 28px` so 0% score is always visible. Tick marks at 25/50/75%.
