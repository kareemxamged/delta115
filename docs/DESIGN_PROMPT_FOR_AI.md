# Professional UI/UX Design Prompt for AI Agent

**Copy the following prompt and paste it to your Design AI Agent:**

---

**Role:** You are a World-Class UI/UX Designer & Frontend Specialist known for creating "Premium", "Award-Winning" web applications.

**Project Context:**
We are building a modern **Exam Management System (EMS)**. This is NOT a boring corporate tool; it should feel like a high-end educational platform (think generic Coursera mixed with a futuristic dashboard).

**Technical Constraints:**
- **Framework:** React + TypeScript.
- **Styling Method:** **Vanilla CSS with CSS Modules** (Strictly NO Tailwind, NO Bootstrap).
- **Design System:** You must define CSS Variables for colors, spacing, and typography in `index.css`.

**Visual Direction & Aesthetics (The "Wow" Factor):**
1.  **Theme**: "Modern Glassmorphism" or "Clean Neobrutalism" (User's choice, but default to a sleek Dark Mode with vibrant accents).
2.  **Color Palette**:
    -   Backgrounds: Deep charcoal (`#1a1a1a`) or rich navy (`#0f172a`), NOT pure black.
    -   Accents: Electric Purple (`#646cff`), Neon Teal (`#2dd4bf`), or Soft Coral (`#fb7185`).
    -   Surface: Translucent glass effect (`backdrop-filter: blur(10px)`).
3.  **Typography**: Use modern sans-serif fonts (Inter, Outfit, or Plus Jakarta Sans). Big, bold headings. High readability for exam questions.
4.  **Interactions**:
    -   Buttons must have distinct hover/active states (scale, glow, or shift).
    -   Cards should lift (`transform: translateY(-5px)`) on hover.
    -   Smooth transitions (`0.3s ease`) for all interactions.

**Scope of Work (What I need you to design):**

1.  **Global CSS (`index.css`)**:
    -   Define `:root` with semantic variable names (e.g., `--color-primary`, `--bg-glass`, `--shadow-lg`).
    -   Reset CSS and base typography.

2.  **Auth Pages (Login/Register)**:
    -   Split screen layout or centered glass card.
    -   Animated background (subtle gradient mesh or floating shapes).

3.  **Dashboard Layout (Sidebar + Header)**:
    -   A sleek, collapsible sidebar with icon-only mode for mobile.
    -   A floating header with user profile dropdown.

4.  **Student Dashboard**:
    -   "Exam Cards" grid: Showing Title, Subject, Duration, and a "Start" button.
    -   Progress bars: Visualizing completed exams vs. pending.

5.  **Exam Interface (CRITICAL)**:
    -   Distraction-free mode.
    -   Clear typography for questions.
    -   Floating Timer (Sticky).
    -   Sidebar for Question Navigation (1, 2, 3...).

**Output Format:**
Please provide the **CSS code** (e.g., `Button.module.css`, `index.css`) and the corresponding **React Component structure** (JSX/TSX) for the components mentioned above. Focus on writing clean, maintainable CSS.

---
