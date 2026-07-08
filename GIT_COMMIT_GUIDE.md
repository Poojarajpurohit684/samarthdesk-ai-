# Git Commit Guide

This document provides the commit strategy for the Samarthdesk AI project.

## Initial Setup Commit

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "feat: initial project setup with authentication system

- Setup monorepo structure with npm workspaces
- Configure backend (Express + TypeScript + Prisma)
- Configure frontend (React + Vite + TypeScript + Tailwind)
- Design complete database schema (9 tables)
- Implement Docker development and production setup
- Configure CI/CD with GitHub Actions
- Setup testing infrastructure (Vitest + Playwright)

Backend Features:
- Complete authentication system (JWT + refresh tokens)
- Password hashing with bcrypt
- Role-based access control (CUSTOMER, AGENT, ADMIN)
- Email verification flow (backend ready)
- Password reset flow
- Session management
- Rate limiting and security headers
- Global error handling
- Request validation with Zod
- Logging with Winston

Frontend Features:
- Login and registration pages
- Protected routes with role-based access
- Automatic token refresh
- Form validation with React Hook Form + Zod
- State management with Zustand
- API integration with Axios
- Toast notifications
- Responsive UI with Tailwind CSS

Security:
- JWT authentication
- Password strength requirements
- Rate limiting on auth endpoints
- CORS configuration
- Helmet security headers
- Input validation
- SQL injection protection (Prisma)

Documentation:
- Comprehensive README
- Setup guide
- Quick start guide
- Development roadmap (18 phases)
- Deployment guide (Railway)
- Contributing guidelines
- API documentation

Phase 1: Authentication System - COMPLETE ✅"
```

## Create GitHub Repository

```bash
# Create a new repository on GitHub, then:

# Add remote
git remote add origin https://github.com/yourusername/samarthdesk-ai.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Future Commits

### Feature Commits

```bash
# When adding a new feature
git add .
git commit -m "feat(scope): brief description

Detailed explanation of what was added:
- Feature 1
- Feature 2
- Feature 3

Related to #issue-number"
```

### Bug Fix Commits

```bash
git add .
git commit -m "fix(scope): brief description

What was broken and how it was fixed"
```

### Documentation Commits

```bash
git add .
git commit -m "docs: update documentation

- Updated section 1
- Added section 2"
```

## Branch Strategy

### Main Branches
- `main` - Production-ready code
- `develop` - Development branch

### Feature Branches
```bash
# Create feature branch
git checkout -b feature/user-management

# Work on feature
# ... make changes ...

# Commit changes
git add .
git commit -m "feat(users): implement user CRUD operations"

# Push to remote
git push origin feature/user-management

# Create pull request to develop
```

### Hotfix Branches
```bash
# Create hotfix branch from main
git checkout -b hotfix/critical-bug main

# Fix the issue
# ... make changes ...

# Commit
git add .
git commit -m "fix: resolve critical authentication bug"

# Merge to main and develop
git checkout main
git merge hotfix/critical-bug
git checkout develop
git merge hotfix/critical-bug
```

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements

### Scopes
- `auth` - Authentication
- `users` - User management
- `tickets` - Ticket system
- `ai` - AI features
- `email` - Email system
- `admin` - Admin features
- `frontend` - Frontend changes
- `backend` - Backend changes
- `docker` - Docker configuration
- `ci` - CI/CD changes

### Examples

```bash
# Good commits
git commit -m "feat(auth): implement JWT refresh token rotation"
git commit -m "fix(tickets): resolve pagination bug in ticket list"
git commit -m "docs(api): add API endpoint documentation"
git commit -m "test(auth): add unit tests for auth service"
git commit -m "refactor(users): optimize user query performance"

# Bad commits (avoid these)
git commit -m "update"
git commit -m "fix bug"
git commit -m "changes"
git commit -m "WIP"
```

## Pre-Commit Checklist

Before committing, ensure:

- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] Linting passes
- [ ] No console.log statements (except intentional logging)
- [ ] No commented-out code
- [ ] Environment variables not committed
- [ ] Secrets not exposed
- [ ] Documentation updated if needed

## Running Checks

```bash
# Lint code
npm run lint

# Run tests
npm run test

# Build project
npm run build

# Type check
cd backend && npx tsc --noEmit
cd frontend && npx tsc --noEmit
```

## Phase Completion Commits

When completing a phase:

```bash
git add .
git commit -m "feat(phase-2): complete user management system

Implemented:
- User profile management
- Avatar upload
- User CRUD operations (Admin)
- Role management
- User search and filtering
- User activation/deactivation

Backend:
- User service with business logic
- User controller with endpoints
- User validation schemas
- User routes with RBAC
- Profile update endpoint
- Avatar upload with multer

Frontend:
- Profile page with edit form
- User management dashboard (Admin)
- User list with pagination
- User create/edit modals
- Avatar upload component
- User search and filters

Tests:
- User service unit tests
- User API integration tests
- Frontend component tests

Phase 2: User Management - COMPLETE ✅"
```

## Git Workflow Summary

```bash
# Daily workflow
git checkout develop
git pull origin develop
git checkout -b feature/my-feature
# ... work on feature ...
git add .
git commit -m "feat(scope): implement feature"
git push origin feature/my-feature
# Create PR to develop

# When feature is approved
git checkout develop
git pull origin develop
git merge feature/my-feature
git push origin develop

# When ready for production
git checkout main
git merge develop
git tag v1.0.0
git push origin main --tags
```

## Tags for Releases

```bash
# Create a tag for a release
git tag -a v1.0.0 -m "Release version 1.0.0

Features:
- Complete authentication system
- User management
- Ticket system (basic)
- AI features (summarization)

Phase 1-5 complete"

# Push tags
git push origin --tags
```

## Useful Git Commands

```bash
# View commit history
git log --oneline --graph --all

# View changes
git diff

# Stash changes
git stash
git stash pop

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# View branches
git branch -a

# Delete branch
git branch -d feature/branch-name

# View remote
git remote -v
```

## .gitignore Important Files

Ensure these are in `.gitignore`:

```
node_modules/
.env
.env.local
.env.production
dist/
build/
*.log
.DS_Store
uploads/
coverage/
```

---

**Remember**: Write meaningful commit messages that explain the "why" not just the "what". Future you (and your team) will thank you!
