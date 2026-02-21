## Task Management App – Next.js + Supabase

Simple task management web app with email/password auth and user‑specific tasks, built with **Next.js (App Router) + Supabase + Tailwind CSS**.

This README is written as a **step‑by‑step guide** you can follow to (re)build the project from scratch and also as documentation for the assignment form.

---

## 1. Tech Stack

- **Frontend**: Next.js (React, App Router, JavaScript)
- **Styling**: Tailwind CSS
- **Backend (BaaS)**: Supabase
  - **Auth**: Supabase Auth (email + password)
  - **Database**: Supabase Postgres
- **Deployment**: Vercel (recommended)

---

## 2. Features (Assignment Mapping)

- **Authentication**
  - Email + password **signup** and **login** using Supabase Auth.
  - Only authenticated users can access the task dashboard.

- **Task Management (CRUD)**
  - **Create** a task: title, description, due date.
  - **Update** a task.
  - **Delete** a task.
  - Users see **only their own tasks** (row‑level security in Supabase).imp

- **Task Status + Filters**
  - Each task has a status: `Todo`, `In Progress`, `Done`.
  - Filter tasks by status.
  - Sort tasks by due date (ascending / descending).

---

## 3. High‑Level Architecture

- **Next.js App Router** (in `app/`):
  - `app/layout.js`: Root layout and global styles.
  - `app/login/page.js`: Login / signup page using Supabase Auth.
  - `app/tasks/page.js`: Authenticated task dashboard (CRUD + filters + sorting).
  - `app/page.js`: Landing page; can redirect to `/login` or `/tasks` based on auth state.

- **Supabase client**:
  - `lib/supabase.js`: Creates and exports a Supabase client using keys from `.env.local`.

- **Database**:
  - `tasks` table in Supabase Postgres with a `user_id` foreign key that links each task to the authenticated user.
  - Row‑level security ensures users only access their own rows.

---

## 4. Step‑by‑Step Implementation Guide

### Step 1 – Prerequisites

- **Install Node.js** (LTS).
- **Install pnpm / npm / yarn** (any one).
- Have a **Supabase account** (`https://supabase.com`).
- (Optional) **Vercel account** for deployment.

---

### Step 2 – Create Next.js Project

From the `f:\Task_management` folder:

```bash
npx create-next-app@latest task_app
# or
pnpm create next-app task_app
```

When prompted, you can choose:
- TypeScript: **No** (this repo uses JavaScript), or **Yes** if you prefer TS.
- Tailwind: either **Yes** in the wizard, or add Tailwind manually in Step 3.

Go into the project:

```bash
cd task_app
```

---

### Step 3 – Setup Tailwind CSS

If Tailwind was not added by the Next.js wizard, install and configure it:

```bash
pnpm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Update `tailwind.config` content paths:

```js
content: [
  "./app/**/*.{js,ts,jsx,tsx}",
  "./components/**/*.{js,ts,jsx,tsx}",
]
```

In `app/globals.css` make sure Tailwind base layers are imported (already present in this project):

```css
@import "tailwindcss";
```

You can now use Tailwind classes in any component.

---

### Step 4 – Create Supabase Project & Env Variables

1. Go to Supabase dashboard → **New project**.
2. Copy:
   - **Project URL**
   - **anon public key**
3. In the Next.js project root, create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

> **Note**: `NEXT_PUBLIC_` prefix allows using these in the browser for the Supabase client.

---

### Step 5 – Supabase Client (`lib/supabase.js`)

Create `lib/supabase.js`:

```js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

This is imported in pages like `app/login/page.js` for auth and in `app/tasks/page.js` for CRUD.

> In this repo, the login page already imports `supabase` from `@/lib/supabase`, so this file must exist for the app to run.

---

### Step 6 – Authentication Page (`app/login/page.js`)

The login page is a **client component** that handles:
- Email/password input.
- `signInWithPassword` for login.
- `signUp` for registration.

Basic flow:
- User enters email + password.
- Click **Login** → `supabase.auth.signInWithPassword({ email, password })`.
- Click **Sign Up** → `supabase.auth.signUp({ email, password })`.
- On success, redirect to `/tasks`.

You can extend the existing file with redirects and error handling, for example:
- Show error messages using `useState`.
- After successful login, use `router.push("/tasks")`.

**Authentication flow (for the README / form):**
1. User visits `/login`.
2. If they don’t have an account, they click **Sign Up** which calls `supabase.auth.signUp`.
3. For login, `supabase.auth.signInWithPassword` creates a session and stores it in Supabase’s auth system.
4. On protected pages (like `/tasks`), the app checks `supabase.auth.getUser()`:
   - If a user exists, allow access.
   - If not, redirect to `/login`.

---

### Step 7 – Database Schema in Supabase

Create a `tasks` table in Supabase with the following columns:

- **id**: `uuid`, primary key, default `uuid_generate_v4()`.
- **user_id**: `uuid`, references `auth.users.id` (foreign key).
- **title**: `text`, not null.
- **description**: `text`, nullable.
- **status**: `text`, not null, default `'Todo'`. (Allowed: `'Todo'`, `'In Progress'`, `'Done'`).
- **due_date**: `date`, nullable.
- **created_at**: `timestamp` with time zone, default `now()`.

**Row Level Security (RLS)**

Enable RLS on `tasks` and add policies:

- **Policy: Insert own tasks**
  - `with check (auth.uid() = user_id)`
- **Policy: Select own tasks**
  - `using (auth.uid() = user_id)`
- **Policy: Update own tasks**
  - `using (auth.uid() = user_id)`
- **Policy: Delete own tasks**
  - `using (auth.uid() = user_id)`

This ensures each user can only see and modify **their** tasks.

**How tasks are linked to users:**
- When inserting a task, the app sends `user_id = currentUser.id`.
- All queries filter by `user_id = auth.uid()` or `user_id = currentUser.id`.

---

### Step 8 – Task Dashboard (`app/tasks/page.js`)

Create a client component that:
- Fetches the current authenticated user.
- Loads that user’s tasks from Supabase.
- Renders a form and table / list for CRUD.

**Core logic outline:**

- **State:**
  - `tasks`: list of tasks.
  - `statusFilter`: `"All" | "Todo" | "In Progress" | "Done"`.
  - `sortOrder`: `"asc" | "desc"`.
  - `form` state: `title`, `description`, `dueDate`, `status`.
  - `editingTaskId` (optional) to switch between create/update modes.

- **On mount (`useEffect`)**:
  1. Call `supabase.auth.getUser()`.
  2. If no user → redirect to `/login`.
  3. If user exists → call `supabase.from("tasks").select("*").eq("user_id", user.id)` and store the result in `tasks`.

- **Create task:**
  - On submit, call:
    ```js
    supabase.from("tasks").insert({
      user_id: user.id,
      title,
      description,
      status,
      due_date: dueDate,
    });
    ```
  - Refresh tasks list from Supabase.

- **Update task:**
  - When clicking “Edit”, load the task values into the form and set `editingTaskId`.
  - On submit (in edit mode), call:
    ```js
    supabase.from("tasks")
      .update({ title, description, status, due_date: dueDate })
      .eq("id", editingTaskId);
    ```
  - Refresh tasks list and clear `editingTaskId`.

- **Delete task:**
  - On “Delete” click:
    ```js
    supabase.from("tasks")
      .delete()
      .eq("id", id);
    ```
  - Refresh tasks list.

---

### Step 9 – Status Filter + Due Date Sorting (Logic)

- **Filter by status:**
  - UI: a `<select>` with `All`, `Todo`, `In Progress`, `Done`.
  - Logic in React:
    ```js
    const visibleTasks = tasks
      .filter(task =>
        statusFilter === "All" ? true : task.status === statusFilter
      )
      .sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return sortOrder === "asc"
          ? new Date(a.due_date) - new Date(b.due_date)
          : new Date(b.due_date) - new Date(a.due_date);
      });
    ```

- **Sort by due date:**
  - UI: a toggle or select for `"Oldest first"` / `"Newest first"`.
  - Change `sortOrder` state based on user selection.

For the Loom video, call out:
- Where `statusFilter` and `sortOrder` are stored.
- How `visibleTasks` is computed from `tasks` using filter + sort.

---

### Step 10 – UI & Tailwind Styling

- **Layout:**
  - Full‑screen centered auth card for `/login`.
  - For `/tasks`, a responsive layout with:
    - Header (app title + Logout button).
    - Task creation / edit form.
    - Task list (table or cards).

- **Tailwind examples:**
  - Container: `className="max-w-3xl mx-auto px-4 py-8 space-y-6"`.
  - Button: `className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"`.
  - Inputs: `className="w-full rounded border px-3 py-2 text-sm"`.

The goal is a **clean, readable** UI, not fancy design.

---

### Step 11 – Protecting Routes

For a simple implementation:

- In `/tasks` page:
  - On mount, call `supabase.auth.getUser()`.
  - If there is no user, redirect to `/login`.

Optionally, you can use `middleware.ts` + Supabase auth helpers to protect routes on the server, but for this assignment a **client‑side check** is acceptable and easier to understand.

---

### Step 12 – Home Page (`app/page.js`)

- Minimal behavior:
  - If user is logged in, redirect to `/tasks`.
  - If not logged in, redirect to `/login` or show a hero with a “Get Started” button to `/login`.

The current `Home` component just shows “Hello World”; you can replace it with a redirect or a simple landing page.

---

### Step 13 – Deployment to Vercel

1. Push your code to a GitHub repository.
2. Go to Vercel → **New Project** → Import GitHub repo.
3. In Vercel **Project Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.

After deploy:
- Test `/login` and `/tasks`.
- Confirm that tasks are separated per user (log in with two different accounts).

---

## 5. Assignment README Points

- **Tech stack**: Listed in section 1.
- **Authentication flow**: Described in sections 6 and 11.
- **Database structure**:
  - One main table: `tasks`.
  - Columns: `id`, `user_id`, `title`, `description`, `status`, `due_date`, `created_at`.
  - RLS policies ensure only owners can access their rows.
- **How tasks are linked to users**:
  - `user_id` column references `auth.users.id`.
  - On every insert and query, the app uses the currently logged‑in user’s `id`.

---

## 6. Assumptions (for the form)

- Users will authenticate only via **email + password** (no social logins).
- Tasks do not need attachments or subtasks; each task is a simple record.
- Time zones are not critical; due dates are stored as simple dates.
- Only basic validation is required (e.g., title not empty).
- A client‑side route guard is sufficient for this assignment.

---

## 7. Written Questions – Suggested Answers

### Q1: What was the hardest part of this assignment and why?

**Suggested angle:**
- Managing the **interaction between auth and database security**:
  - Understanding how Supabase Auth sessions work in the browser.
  - Correctly using `user.id` as `user_id` when inserting tasks.
  - Configuring RLS policies so users can only see their own tasks.
- This part is harder than UI because small mistakes in RLS or filtering can either break the app or leak data across users.

### Q2: If this app had 10,000 users, what would you improve first?

**Suggested points:**
- **Performance:**
  - Add pagination or infinite scrolling to the tasks list instead of loading all tasks at once.
  - Add indexes on `user_id` and `due_date` in the database.
- **UX & Structure:**
  - Add loading states and optimistic UI updates for CRUD.
  - Improve error handling and logging.
- **Security & Architecture:**
  - Move more logic to server components / route handlers when needed.
  - Strengthen auth checks with server‑side middleware.

---

## 8. Loom Video Checklist

When recording your 3–5 minute Loom:

- **Show Auth Flow**
  - Go to `/login`.
  - Sign up a new user.
  - Log in and land on `/tasks`.

- **Show User‑Specific Tasks**
  - Create a few tasks.
  - Log out and log in as another user; show that this user sees a **different** task list.

- **Show Status / Sort / Filter Logic**
  - Change statuses between `Todo`, `In Progress`, `Done`.
  - Use the status filter dropdown.
  - Toggle due date sort order.

- **Explain One Bug You Faced**
  - Example: RLS misconfigured so tasks didn’t load.
  - Explain what you saw, how you debugged it, and how you fixed it.

This README plus the implemented code should give you everything needed to fill out the Google Form and explain your solution confidently.

