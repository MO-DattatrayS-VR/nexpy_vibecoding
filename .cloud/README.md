# .cloud — Internal Development AI Agents

This folder hosts the internal AI agent infrastructure for the **nexpy** project — a full-stack application built with **FastAPI** (Python backend) and **Next.js 14** (frontend), backed by **MongoDB** and **Redis**, all containerized with **Docker**.

These agents are designed to help developers automate repetitive tasks, enforce conventions, and accelerate development — without leaving the codebase.

---

## Folder Structure

```
.cloud/
├── agents/          # AI agent definitions (what the agent does and how)
├── commands/        # Reusable automation commands (scaffolding, running tasks)
├── skills/          # Domain knowledge files (patterns, conventions, examples)
├── config.json      # Global configuration for agents and project paths
└── README.md        # This file
```

---

## Agents

Agents are AI-powered automation units with a specific role. Each agent is defined in `.cloud/agents/` as a `.agent.md` file.

| Agent | File | Purpose |
|---|---|---|
| Code Generator | `agents/code-generator.agent.md` | Scaffolds new backend routers and frontend pages following project conventions |
| Codebase Analyzer | `agents/codebase-analyzer.agent.md` | Analyzes code quality, dependencies, and architectural issues |
| Doc Writer | `agents/doc-writer.agent.md` | Generates docstrings, README sections, and API documentation |
| Test Generator | `agents/test-generator.agent.md` | Creates unit and integration tests based on existing route/component patterns |

---

## Commands

Commands are parameterized automation scripts described in `.cloud/commands/`. Each command file defines its inputs, outputs, and the exact steps to execute.

| Command | File | Purpose |
|---|---|---|
| Scaffold Router | `commands/scaffold-router.md` | Creates a new FastAPI router with boilerplate |
| Scaffold Page | `commands/scaffold-page.md` | Creates a new Next.js page and matching section component |
| Run Tests | `commands/run-tests.md` | Runs the backend test suite |
| Docker Dev | `commands/docker-dev.md` | Starts the full development environment via Docker Compose |

---

## Skills

Skills are knowledge files that agents and commands reference to stay aligned with project patterns and conventions.

| Skill | File | Covers |
|---|---|---|
| FastAPI Patterns | `skills/fastapi-patterns.md` | Router structure, auth, async DB access, error handling |
| Next.js Patterns | `skills/nextjs-patterns.md` | Pages, sections, API calls, React Query, MUI usage |
| MongoDB Patterns | `skills/mongodb-patterns.md` | Motor async client usage, query conventions, index creation |

---

## Configuration

`config.json` is the central configuration file. It describes:
- The project stack (framework, language, databases)
- Which agents, commands, and skills are registered
- Key file paths within the monorepo
- Project-wide conventions (e.g. async-first, JWT auth, bcrypt hashing)

Agents and commands read from this file to resolve paths and behaviors dynamically.

---

## How to Use

### Invoke an agent
Open the agent definition file in `.cloud/agents/` and follow the **Invocation** section. Agents can be used directly via GitHub Copilot Chat or any compatible AI assistant.

**Example — generate a new router:**
```
@agent code-generator scaffold a new router for "notifications" with GET and POST endpoints
```

### Run a command
Open the command definition in `.cloud/commands/` and follow the steps listed. Most commands can be copy-pasted directly into the terminal.

**Example — scaffold a new page:**
```
command: scaffold-page
input:
  name: notifications
  route: /notifications
```

### Reference a skill
Skills are used internally by agents but can also be read directly for onboarding or code review.

---

## Adding a New Agent

1. Create a new file in `.cloud/agents/` named `<your-agent>.agent.md`.
2. Use the following frontmatter:

```yaml
---
name: your-agent-name
description: One-sentence description of what this agent does.
version: 1.0.0
applyTo: "**"
---
```

3. Fill in the **Purpose**, **Inputs**, **Steps**, and **Example** sections (see existing agents for reference).
4. Register the agent name in `.cloud/config.json` under `agents.available`.

---

## Adding a New Command

1. Create a new file in `.cloud/commands/` named `<your-command>.md`.
2. Define: Purpose, Parameters, Steps, Example, and Expected Output.
3. Register the command name in `.cloud/config.json` under `commands.available`.

---

## Adding a New Skill

1. Create a new file in `.cloud/skills/` named `<your-skill>.md`.
2. Include: Overview, Patterns with code examples, and Anti-patterns.
3. Register the skill name in `.cloud/config.json` under `skills.available`.
