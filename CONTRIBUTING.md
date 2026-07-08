# Contributing to Samarthdesk AI

Thank you for your interest in contributing to Samarthdesk AI!

## Development Process

### 1. Setup Development Environment

Follow the [SETUP.md](./SETUP.md) guide to set up your local development environment.

### 2. Branch Naming Convention

```
feature/feature-name        # New features
fix/bug-description         # Bug fixes
docs/documentation-update   # Documentation updates
test/test-description       # Adding tests
refactor/refactor-name      # Code refactoring
chore/task-description      # Maintenance tasks
```

### 3. Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add JWT authentication
fix(tickets): resolve ticket creation validation error
docs(readme): update installation instructions
test(users): add user service unit tests
```

### 4. Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier
- Write self-documenting code
- Add comments for complex logic
- Follow existing code patterns

### 5. Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Aim for high test coverage
- Test edge cases

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

### 6. Pull Request Process

1. Fork the repository
2. Create a feature branch from `develop`
3. Make your changes
4. Write/update tests
5. Ensure all tests pass
6. Update documentation if needed
7. Commit your changes with clear messages
8. Push to your fork
9. Open a Pull Request to `develop` branch

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
```

### 7. Code Review

- Be respectful and constructive
- Address all feedback
- Keep discussions focused
- Be open to suggestions

## Development Guidelines

### Backend

**File Structure:**
```
src/
├── config/         # Configuration
├── controllers/    # Route handlers
├── middleware/     # Express middleware
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utilities
└── types/          # TypeScript types
```

**Best Practices:**
- Use dependency injection
- Keep controllers thin
- Put business logic in services
- Use TypeScript strictly
- Handle errors properly
- Validate all inputs
- Use transactions for multi-step operations

### Frontend

**File Structure:**
```
src/
├── components/     # Reusable components
├── pages/          # Page components
├── hooks/          # Custom hooks
├── services/       # API services
├── store/          # State management
├── utils/          # Utilities
└── types/          # TypeScript types
```

**Best Practices:**
- Use functional components with hooks
- Keep components small and focused
- Use TypeScript interfaces
- Implement proper error boundaries
- Use React Query for server state
- Use Zustand for client state
- Follow accessibility guidelines

## Getting Help

- Check existing issues and PRs
- Read the documentation
- Ask questions in discussions
- Join community chat

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
