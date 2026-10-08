-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TaskState" AS ENUM ('CREATED', 'PLANNING', 'AWAITING_APPROVAL', 'CODING', 'REVIEWING', 'COMMITTING', 'BUILDING', 'DEPLOYING', 'COMPLETED', 'PAUSED', 'CANCELLED', 'FAILED', 'TIMED_OUT');

-- CreateEnum
CREATE TYPE "TaskEvent" AS ENUM ('analyze_request', 'plan_ready', 'user_approved', 'user_rejected', 'code_ready', 'review_passed', 'review_failed', 'commit_success', 'commit_fail', 'build_success', 'build_fail', 'deploy_success', 'deploy_fail', 'user_pause', 'user_resume', 'user_cancel', 'timeout');

-- CreateEnum
CREATE TYPE "ProjectFramework" AS ENUM ('react', 'nextjs', 'nodejs');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('user', 'assistant', 'system');

-- CreateEnum
CREATE TYPE "BuildStatus" AS ENUM ('pending', 'running', 'success', 'failure');

-- CreateEnum
CREATE TYPE "DeploymentStatus" AS ENUM ('pending', 'building', 'ready', 'error', 'cancelled');

-- CreateEnum
CREATE TYPE "DeploymentEnvironment" AS ENUM ('preview', 'production');

-- CreateEnum
CREATE TYPE "AgentName" AS ENUM ('orchestrator', 'planner', 'coder', 'reviewer', 'debugger');

-- CreateEnum
CREATE TYPE "AgentLogLevel" AS ENUM ('info', 'warn', 'error', 'debug');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "githubId" TEXT NOT NULL,
    "githubUsername" TEXT NOT NULL,
    "githubToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "defaultFramework" "ProjectFramework" NOT NULL DEFAULT 'nextjs',
    "autoDeployPreview" BOOLEAN NOT NULL DEFAULT true,
    "requireDeployApproval" BOOLEAN NOT NULL DEFAULT true,
    "maxRetriesOverride" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "framework" "ProjectFramework" NOT NULL DEFAULT 'nextjs',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repositories" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "defaultBranch" TEXT NOT NULL DEFAULT 'main',
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repositories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "instruction" TEXT NOT NULL,
    "plan" JSONB,
    "state" "TaskState" NOT NULL DEFAULT 'CREATED',
    "prevState" "TaskState",
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "fixHistory" JSONB NOT NULL DEFAULT '[]',
    "tokenUsed" INTEGER NOT NULL DEFAULT 0,
    "costUsd" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "pausedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "timeoutAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_state_transitions" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "fromState" "TaskState",
    "toState" "TaskState" NOT NULL,
    "event" "TaskEvent" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_state_transitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_steps" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_snapshots" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "contentBefore" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_contexts" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "agent" "AgentName" NOT NULL,
    "contextJson" JSONB NOT NULL,
    "tokenCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_contexts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "builds" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "commitSha" TEXT NOT NULL,
    "status" "BuildStatus" NOT NULL DEFAULT 'pending',
    "logsUrl" TEXT,
    "errorSummary" TEXT,
    "durationMs" INTEGER,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "builds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deployments" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "buildId" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "environment" "DeploymentEnvironment" NOT NULL,
    "status" "DeploymentStatus" NOT NULL DEFAULT 'pending',
    "previewUrl" TEXT,
    "productionUrl" TEXT,
    "vercelDeploymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deployments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_logs" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "agent" "AgentName" NOT NULL,
    "level" "AgentLogLevel" NOT NULL DEFAULT 'info',
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_records" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "agent" "AgentName" NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "costUsd" DECIMAL(10,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cost_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_githubId_key" ON "users"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "users_githubUsername_key" ON "users"("githubUsername");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "repositories_projectId_key" ON "repositories"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "repositories_fullName_key" ON "repositories"("fullName");

-- CreateIndex
CREATE INDEX "task_state_transitions_taskId_idx" ON "task_state_transitions"("taskId");

-- CreateIndex
CREATE INDEX "file_snapshots_taskId_idx" ON "file_snapshots"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "agent_contexts_taskId_agent_key" ON "agent_contexts"("taskId", "agent");

-- CreateIndex
CREATE INDEX "agent_logs_taskId_createdAt_idx" ON "agent_logs"("taskId", "createdAt");

-- CreateIndex
CREATE INDEX "cost_records_taskId_idx" ON "cost_records"("taskId");

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_state_transitions" ADD CONSTRAINT "task_state_transitions_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_steps" ADD CONSTRAINT "task_steps_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_snapshots" ADD CONSTRAINT "file_snapshots_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_contexts" ADD CONSTRAINT "agent_contexts_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "builds" ADD CONSTRAINT "builds_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "builds" ADD CONSTRAINT "builds_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "builds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_logs" ADD CONSTRAINT "agent_logs_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_records" ADD CONSTRAINT "cost_records_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

