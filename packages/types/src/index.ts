// ─── Task State Machine ──────────────────────────────────────────────────────

export type TaskState =
  | 'CREATED'
  | 'PLANNING'
  | 'AWAITING_APPROVAL'
  | 'CODING'
  | 'REVIEWING'
  | 'COMMITTING'
  | 'BUILDING'
  | 'DEPLOYING'
  | 'COMPLETED'
  | 'PAUSED'
  | 'CANCELLED'
  | 'FAILED'
  | 'TIMED_OUT'

export type TaskEvent =
  | 'analyze_request'
  | 'plan_ready'
  | 'user_approved'
  | 'user_rejected'
  | 'code_ready'
  | 'review_passed'
  | 'review_failed'
  | 'commit_success'
  | 'commit_fail'
  | 'build_success'
  | 'build_fail'
  | 'deploy_success'
  | 'deploy_fail'
  | 'user_pause'
  | 'user_resume'
  | 'user_cancel'
  | 'timeout'

export const TERMINAL_STATES: ReadonlySet<TaskState> = new Set([
  'COMPLETED',
  'CANCELLED',
  'FAILED',
  'TIMED_OUT',
])

export const MAX_TASK_RETRIES = 3
export const MAX_REVIEWER_ITERATIONS = 2
export const MAX_FILE_MODIFICATIONS = 20
export const TASK_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

// ─── Error Classification ─────────────────────────────────────────────────────

export type ErrorType = 'syntax' | 'dependency' | 'type' | 'logic' | 'env' | 'unknown'

export interface FixAttempt {
  attempt: number
  errorType: ErrorType
  errorMessage: string
  filesModified: string[]
  result: 'success' | 'fail'
  timestamp: string
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  githubId: string
  githubUsername: string
  createdAt: string
  updatedAt: string
}

// ─── Project ──────────────────────────────────────────────────────────────────

export type ProjectFramework = 'react' | 'nextjs' | 'nodejs'

export interface Project {
  id: string
  userId: string
  name: string
  description: string | null
  framework: ProjectFramework
  repositoryId: string | null
  createdAt: string
  updatedAt: string
}

// ─── Repository ───────────────────────────────────────────────────────────────

export interface Repository {
  id: string
  projectId: string
  owner: string
  name: string
  fullName: string
  defaultBranch: string
  url: string
  createdAt: string
  updatedAt: string
}

// ─── Conversation & Messages ──────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  createdAt: string
}

export interface Conversation {
  id: string
  projectId: string
  userId: string
  createdAt: string
  updatedAt: string
}

// ─── Task ─────────────────────────────────────────────────────────────────────

export interface TaskPlanStep {
  index: number
  description: string
  estimatedFiles: string[]
  status: 'pending' | 'in_progress' | 'done' | 'skipped'
}

export interface TaskPlan {
  summary: string
  steps: TaskPlanStep[]
  estimatedFileCount: number
}

export interface Task {
  id: string
  projectId: string
  conversationId: string
  instruction: string
  plan: TaskPlan | null
  state: TaskState
  prevState: TaskState | null
  retryCount: number
  maxRetries: number
  fixHistory: FixAttempt[]
  tokenUsed: number
  costUsd: number
  startedAt: string | null
  pausedAt: string | null
  completedAt: string | null
  timeoutAt: string | null
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}

export interface TaskStateTransition {
  id: string
  taskId: string
  fromState: TaskState | null
  toState: TaskState
  event: TaskEvent
  metadata: Record<string, unknown> | null
  createdAt: string
}

// ─── Build & Deployment ───────────────────────────────────────────────────────

export type BuildStatus = 'pending' | 'running' | 'success' | 'failure'
export type DeploymentStatus = 'pending' | 'building' | 'ready' | 'error' | 'cancelled'
export type DeploymentEnvironment = 'preview' | 'production'

export interface Build {
  id: string
  taskId: string
  repositoryId: string
  commitSha: string
  status: BuildStatus
  logsUrl: string | null
  errorSummary: string | null
  durationMs: number | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
}

export interface Deployment {
  id: string
  taskId: string
  buildId: string
  environment: DeploymentEnvironment
  status: DeploymentStatus
  previewUrl: string | null
  productionUrl: string | null
  vercelDeploymentId: string | null
  createdAt: string
  updatedAt: string
}

// ─── Agent Log ────────────────────────────────────────────────────────────────

export type AgentLogLevel = 'info' | 'warn' | 'error' | 'debug'
export type AgentName = 'orchestrator' | 'planner' | 'coder' | 'reviewer' | 'debugger'

export interface AgentLog {
  id: string
  taskId: string
  agent: AgentName
  level: AgentLogLevel
  message: string
  metadata: Record<string, unknown> | null
  createdAt: string
}

// ─── Cost Tracking ────────────────────────────────────────────────────────────

export interface CostRecord {
  id: string
  taskId: string
  agent: AgentName
  model: string
  inputTokens: number
  outputTokens: number
  costUsd: number
  createdAt: string
}

// ─── API Response Envelope ────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError
