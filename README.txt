
==============================================================================
              TaskFlow - TEAM TASK MANAGEMENT WEB APPLICATION
==============================================================================

  Live Demo   : https://TaskFlow-e3ex.onrender.com
  GitHub Repo : https://github.com/ajayrao3/TaskFlow
  Author      : Ajay

  A full-stack collaborative task management platform where teams can
  create projects, assign tasks, and track progress in real-time.
  Built with a modern Neobrutalist (Soft UI) design system.


==============================================================================
  1. TECH STACK
==============================================================================

  Frontend        :  React 19  |  TypeScript  |  Vite  |  Tailwind CSS v4
  UI Library      :  shadcn/ui  |  Lucide Icons  |  Material Symbols
  Backend         :  Node.js  |  Express.js
  Database        :  PostgreSQL (hosted on Neon Cloud)
  Authentication  :  JWT (JSON Web Tokens) + bcrypt password hashing
  Typography      :  Space Grotesk (Google Fonts)
  Design System   :  Neobrutalist UI (warm cream + sage green palette)
  Deployment      :  Render (Web Service)


==============================================================================
  2. HOW THE APPLICATION WORKS
==============================================================================

  The application follows a standard client-server architecture:

  BROWSER (React SPA)
      |
      |--- Axios HTTP client (with JWT token in headers)
      |
  EXPRESS.JS SERVER (REST API)
      |
      |--- Routes: /api/auth, /api/projects, /api/tasks, etc.
      |--- Middleware: JWT verification on protected routes
      |
  POSTGRESQL DATABASE (Neon Cloud)
      |
      |--- 7 tables: users, projects, project_members, tasks,
      |               comments, subtasks, activity_log

  Step-by-step flow:

  1. User opens the app in browser -> React SPA loads
  2. User signs up or logs in -> Backend validates credentials
  3. On success, server returns a JWT token
  4. Frontend stores the token in localStorage
  5. Every subsequent API request includes the token in headers
  6. Backend middleware verifies the token before processing
  7. If token is expired/invalid -> user is redirected to login
  8. In production, Express serves both API and React static files


==============================================================================
  3. CORE FEATURES
==============================================================================

  3.1  USER AUTHENTICATION
  -------------------------
  - Signup with Name, Email, and Password
  - Passwords are hashed using bcrypt (12 salt rounds)
  - Login returns a signed JWT token (valid for 24 hours)
  - Every protected API route requires a valid JWT
  - Automatic logout when token expires (via Axios 401 interceptor)

  Authentication Flow:

      User enters email + password
          |
          v
      POST /api/auth/login
          |
          v
      Backend looks up user by email in database
          |
          v
      bcrypt.compare(entered_password, stored_hash)
          |
          +--- Mismatch --> Return "Invalid credentials" error
          |
          +--- Match --> Sign JWT with user ID
                  |
                  v
              Return { token, user } to frontend
                  |
                  v
              Frontend stores token in localStorage
                  |
                  v
              Redirect to Dashboard


  3.2  PROJECT MANAGEMENT
  -------------------------
  - Create new projects (creator becomes Admin automatically)
  - Two roles: Admin and Member
  - Admins can invite members by email
  - Admins can remove members from projects
  - Admins can delete entire projects
  - Members can view projects they belong to

  Role Permissions:

      ADMIN can:                      MEMBER can:
      - Create/delete projects        - View project details
      - Invite/remove members         - View all tasks
      - Create/edit/delete tasks      - Update own task status
      - Assign tasks to anyone        - Add comments on tasks
      - Export CSV                     - Manage subtasks
      - View activity log             - View activity log

  Invite Flow:

      Admin enters member's email
          |
          v
      Backend searches users table for that email
          |
          +--- User NOT found --> Error: "No user with that email"
          |                       (they must sign up first)
          |
          +--- User found --> Insert into project_members table
                  |
                  v
              Log activity: "Invited [name] as [role]"
                  |
                  v
              Member now sees the project in their list


  3.3  TASK MANAGEMENT (KANBAN BOARD)
  -------------------------------------
  - Create tasks with Title, Description, Due Date, and Priority
  - Assign tasks to specific team members
  - Drag-and-drop tasks between columns on the Kanban board
  - Three status columns: To Do | In Progress | Done
  - Three priority levels: Low | Medium | High
  - Real-time search by task title
  - Filter tasks by priority level

  Task Status Flow:

      [Task Created] --> TO DO --> IN PROGRESS --> DONE
                          ^            |            |
                          |            v            |
                          +--- (move back) <--------+

  Each task card displays:
  - Task title and description preview
  - Assigned member avatar
  - Priority badge (color-coded)
  - Due date with urgency indicators
  - Comment count
  - Subtask progress (e.g., 2/5)
  - "LATE" badge if overdue


  3.4  DASHBOARD
  ----------------
  - KPI Cards: Total Tasks, Completed, Overdue
  - Donut Chart: Visual breakdown (To Do / In Progress / Done)
  - My Tasks: Personal task list with priority and due dates
  - Team Workload: Per-user progress bars showing completion %
  - Overdue Tasks: Flagged list with warning indicators


==============================================================================
  4. EXTRA FEATURES (BEYOND BASIC REQUIREMENTS)
==============================================================================

  These features go above and beyond the standard assignment:

  #    FEATURE                DESCRIPTION
  ---  ---------------------  -----------------------------------------------
   1   Task Comments          Add threaded comments on any task. Shows
                              commenter name, timestamp. Comment count
                              visible on Kanban cards.

   2   Subtasks / Checklist   Break tasks into smaller items. Toggle
                              completion with one click. Progress shown
                              as "done/total" on Kanban cards.

   3   Calendar View          Full monthly calendar grid. Tasks appear
                              on their due dates. Color-coded by priority.
                              Navigate between months. Today highlighted.

   4   Activity Log           Tracks all project actions automatically:
                              task created, status changed, member invited,
                              task deleted. Shows who did what and when.

   5   CSV Export             One-click download of all project tasks as
                              a CSV file. Includes title, description,
                              status, priority, assignee, due date.

   6   Dark Mode              Full dark theme with adjusted clay shadows.
                              Toggle from sidebar. Preference saved in
                              localStorage across sessions.

   7   Neobrutalist UI         Custom design system with soft inner/outer
                              shadows, pill-shaped inputs, raised clay
                              cards, warm cream + sage green palette.
                              Not using any pre-built UI theme.

   8   Role-Based Access      Backend enforces Admin vs Member permissions
                              on every single API endpoint. Not just
                              frontend hiding — actual server-side checks.

   9   Search & Filters       Real-time task search by title on the Kanban
                              board. Filter by priority (High/Medium/Low)
                              with toggle buttons.

  10   Drag & Drop            HTML5 native drag-and-drop for moving tasks
                              between Kanban columns. Visual feedback with
                              pressed drop zones.

  11   Overdue Detection      Automatically flags tasks past their due date.
                              Shows "LATE" badge with pulse animation.
                              Urgent tasks (<=3 days) show countdown.

  12   Team Workload View     Dashboard shows per-user task distribution
                              with visual progress bars. See who has
                              the most work and who's on track.


==============================================================================
  5. COMPLETE USER JOURNEY
==============================================================================

  1. User opens app
         |
  2. Not logged in? --> Login or Signup page
         |
  3. Enter credentials --> JWT token received and stored
         |
  4. Redirected to DASHBOARD
         |
         +---> View KPI cards (Total, Completed, Overdue)
         +---> View donut chart distribution
         +---> View personal task list
         +---> View team workload
         |
  5. Navigate to PROJECTS page
         |
         +---> View all projects (filter: All / Owned / Member)
         +---> Create new project (becomes Admin)
         +---> Click a project card
         |
  6. Enter PROJECT DETAIL (Kanban Board)
         |
         +---> View tasks in 3 columns (To Do | In Progress | Done)
         +---> Drag tasks between columns
         +---> Search tasks by title
         +---> Filter by priority
         +---> Create new task (Admin)
         +---> Invite members (Admin)
         +---> Export as CSV
         +---> View activity log
         |
  7. Click a TASK CARD --> opens Task Detail Modal
         |
         +---> Details tab: Edit title, description, priority,
         |                  status, assignee, due date
         +---> Comments tab: Add/view threaded comments
         +---> Subtasks tab: Add/toggle/delete checklist items
         |
  8. Navigate to CALENDAR page
         |
         +---> View monthly grid with tasks on due dates
         +---> Navigate between months
         +---> Click task to go to its project
         |
  9. Toggle DARK MODE from sidebar
         |
 10. LOGOUT --> clears token, returns to login


==============================================================================
  6. DATABASE SCHEMA
==============================================================================

  TABLE: users
  --------------------------------------------------
  Column          Type           Constraints
  id              UUID           PRIMARY KEY
  name            VARCHAR        NOT NULL
  email           VARCHAR        UNIQUE, NOT NULL
  password_hash   VARCHAR        NOT NULL
  created_at      TIMESTAMP      DEFAULT now()

  TABLE: projects
  --------------------------------------------------
  Column          Type           Constraints
  id              UUID           PRIMARY KEY
  name            VARCHAR        NOT NULL
  description     TEXT
  owner_id        UUID           REFERENCES users(id)
  created_at      TIMESTAMP      DEFAULT now()

  TABLE: project_members
  --------------------------------------------------
  Column          Type           Constraints
  project_id      UUID           REFERENCES projects(id)
  user_id         UUID           REFERENCES users(id)
  role            VARCHAR        DEFAULT 'member'
  joined_at       TIMESTAMP      DEFAULT now()
  PRIMARY KEY     (project_id, user_id)

  TABLE: tasks
  --------------------------------------------------
  Column          Type           Constraints
  id              UUID           PRIMARY KEY
  project_id      UUID           REFERENCES projects(id)
  title           VARCHAR        NOT NULL
  description     TEXT
  status          VARCHAR        DEFAULT 'todo'
  priority        VARCHAR        DEFAULT 'medium'
  assigned_to     UUID           REFERENCES users(id)
  created_by      UUID           REFERENCES users(id)
  due_date        DATE
  created_at      TIMESTAMP      DEFAULT now()

  TABLE: comments
  --------------------------------------------------
  Column          Type           Constraints
  id              UUID           PRIMARY KEY
  task_id         UUID           REFERENCES tasks(id)
  user_id         UUID           REFERENCES users(id)
  content         TEXT           NOT NULL
  created_at      TIMESTAMP      DEFAULT now()

  TABLE: subtasks
  --------------------------------------------------
  Column          Type           Constraints
  id              UUID           PRIMARY KEY
  task_id         UUID           REFERENCES tasks(id)
  title           VARCHAR        NOT NULL
  completed       BOOLEAN        DEFAULT false
  created_at      TIMESTAMP      DEFAULT now()

  TABLE: activity_log
  --------------------------------------------------
  Column          Type           Constraints
  id              UUID           PRIMARY KEY
  project_id      UUID           REFERENCES projects(id)
  user_id         UUID           REFERENCES users(id)
  action          VARCHAR        NOT NULL
  details         TEXT
  created_at      TIMESTAMP      DEFAULT now()

  RELATIONSHIPS:
  - users        1 ---> many  projects         (owner)
  - users        1 ---> many  project_members  (membership)
  - projects     1 ---> many  project_members  (has members)
  - projects     1 ---> many  tasks            (contains)
  - users        1 ---> many  tasks            (assigned to)
  - tasks        1 ---> many  comments         (has comments)
  - tasks        1 ---> many  subtasks         (has subtasks)
  - projects     1 ---> many  activity_log     (logs actions)


==============================================================================
  7. API ENDPOINTS (20+ routes)
==============================================================================

  AUTHENTICATION
  -----------------------------------------------------------------------
  POST   /api/auth/signup              Register a new user       [Public]
  POST   /api/auth/login               Login, returns JWT        [Public]
  GET    /api/auth/me                  Get current user profile  [Auth]

  PROJECTS
  -----------------------------------------------------------------------
  GET    /api/projects                 List user's projects      [Auth]
  POST   /api/projects                 Create new project        [Auth]
  GET    /api/projects/:id             Get project + members     [Auth]
  DELETE /api/projects/:id             Delete project            [Admin]
  POST   /api/projects/:id/members     Invite member by email    [Admin]
  DELETE /api/projects/:id/members/:uid Remove member            [Admin]
  GET    /api/projects/:id/export      Export tasks as CSV       [Auth]

  TASKS
  -----------------------------------------------------------------------
  GET    /api/tasks?project_id=xxx     List tasks in project     [Auth]
  POST   /api/tasks                    Create new task           [Auth]
  PUT    /api/tasks/:id                Update task details       [Auth]
  PATCH  /api/tasks/:id/status         Change task status        [Auth]
  DELETE /api/tasks/:id                Delete task               [Admin]

  COMMENTS
  -----------------------------------------------------------------------
  GET    /api/comments?task_id=xxx     Get task comments         [Auth]
  POST   /api/comments                 Add a comment             [Auth]

  SUBTASKS
  -----------------------------------------------------------------------
  GET    /api/subtasks?task_id=xxx     Get task subtasks         [Auth]
  POST   /api/subtasks                 Create subtask            [Auth]
  PATCH  /api/subtasks/:id             Toggle completion         [Auth]
  DELETE /api/subtasks/:id             Delete subtask            [Auth]

  DASHBOARD & ACTIVITY
  -----------------------------------------------------------------------
  GET    /api/dashboard                Get KPI metrics           [Auth]
  GET    /api/activity?project_id=xxx  Get project activity log  [Auth]


==============================================================================
  8. SETUP & RUN LOCALLY
==============================================================================

  Prerequisites:
  - Node.js version 18 or higher
  - PostgreSQL database (or free Neon account: https://neon.tech)

  Step 1: Clone
      git clone https://github.com/ajayrao3/TaskFlow.git
      cd TaskFlow

  Step 2: Setup Database
      psql YOUR_DATABASE_URL -f backend/schema.sql

  Step 3: Backend
      cd backend
      npm install
      Create .env file with:
          DATABASE_URL=your_postgresql_connection_string
          JWT_SECRET=your_secret_key
          PORT=5000
          FRONTEND_URL=http://localhost:5173

  Step 4: Frontend
      cd frontend
      npm install
      Create .env file with:
          VITE_API_URL=http://localhost:5000

  Step 5: Run
      Terminal 1:  cd backend  &&  npm run dev
      Terminal 2:  cd frontend &&  npm run dev
      Open http://localhost:5173


==============================================================================
  9. DEPLOYMENT (RENDER)
==============================================================================

  Deployed at: https://TaskFlow-e3ex.onrender.com

  Platform    : Render (Free Tier Web Service)
  Build Cmd   : cd frontend && npm install && npm run build &&
                cd ../backend && npm install
  Start Cmd   : cd backend && node server.js
  Strategy    : Single-service deployment. Express serves both
                the REST API and the React static build files.

  Environment Variables:
      DATABASE_URL   =  PostgreSQL connection string
      JWT_SECRET     =  Secret key for JWT signing
      NODE_ENV       =  production
      FRONTEND_URL   =  * (or your Render URL)


==============================================================================
  10. FOLDER STRUCTURE
==============================================================================

  TaskFlow/
  |
  |-- backend/
  |   |-- middleware/
  |   |   |-- auth.js               (JWT verification middleware)
  |   |-- routes/
  |   |   |-- auth.js               (Signup, Login, Me)
  |   |   |-- projects.js           (CRUD + members + CSV export)
  |   |   |-- tasks.js              (CRUD + status change)
  |   |   |-- dashboard.js          (KPI metrics aggregation)
  |   |   |-- comments.js           (Task comments CRUD)
  |   |   |-- subtasks.js           (Subtasks CRUD + toggle)
  |   |   |-- activity.js           (Activity log queries)
  |   |-- db.js                     (PostgreSQL connection pool)
  |   |-- schema.sql                (Full database schema)
  |   |-- server.js                 (Express server + static serving)
  |   |-- package.json
  |
  |-- frontend/
  |   |-- src/
  |   |   |-- api/
  |   |   |   |-- axios.ts          (Axios instance + JWT interceptor)
  |   |   |-- components/
  |   |   |   |-- SideNavBar.tsx     (Sidebar navigation)
  |   |   |   |-- TopAppBar.tsx      (Top header bar)
  |   |   |   |-- TaskEditModal.tsx  (Task detail modal with tabs)
  |   |   |   |-- Toast.tsx          (Toast notification system)
  |   |   |   |-- ui/               (shadcn/ui components)
  |   |   |-- context/
  |   |   |   |-- AuthContext.tsx    (Authentication state)
  |   |   |   |-- ThemeContext.tsx   (Dark mode state)
  |   |   |-- pages/
  |   |   |   |-- Login.tsx          (Login page)
  |   |   |   |-- Signup.tsx         (Registration page)
  |   |   |   |-- Dashboard.tsx      (Dashboard with metrics)
  |   |   |   |-- Projects.tsx       (Project listing)
  |   |   |   |-- ProjectDetail.tsx  (Kanban board)
  |   |   |   |-- CalendarView.tsx   (Monthly calendar)
  |   |   |-- index.css             (Neobrutalist design tokens)
  |   |   |-- App.tsx               (Routes + layout)
  |   |   |-- main.tsx              (Entry point)
  |   |-- index.html
  |   |-- package.json
  |
  |-- screenshots/                   (App screenshots for README)
  |-- README.md                      (GitHub documentation)
  |-- README.txt                     (Plain text version)
  |-- package.json                   (Root build scripts)


==============================================================================
                          LICENSE: ISC - Ajay
==============================================================================


