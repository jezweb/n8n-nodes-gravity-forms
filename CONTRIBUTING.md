# Contributing to n8n-nodes-gravity-forms

Thank you for your interest in contributing to the n8n Gravity Forms node! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our code of conduct:
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Accept feedback gracefully

## How to Contribute

### Reporting Issues

Before creating an issue:
1. Check existing [issues](https://github.com/jezweb/n8n-nodes-gravity-forms/issues) to avoid duplicates
2. Use the search feature to see if your issue has been discussed

When creating an issue, include:
- Node version number
- n8n version
- WordPress and Gravity Forms versions
- Steps to reproduce the issue
- Expected vs actual behavior
- Error messages or screenshots

### Suggesting Features

1. Check if the feature has already been requested
2. Open a new issue with the "enhancement" label
3. Clearly describe the use case and benefits
4. Consider if it aligns with Gravity Forms API capabilities

### Pull Requests

#### Setup Development Environment

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/n8n-nodes-gravity-forms.git
cd n8n-nodes-gravity-forms
```

3. Install dependencies:
```bash
npm install
```

4. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```

#### Development Workflow

1. Make your changes following our coding standards
2. Test your changes locally:
```bash
# Build the node
npm run build

# Run linting
npm run lint

# Fix linting issues
npm run lintfix
```

3. Test with n8n:
```bash
# Link the node locally
npm link

# In your n8n directory
npm link @jezweb/n8n-nodes-gravity-forms

# Or use n8n CLI for development
npx @n8n/node-cli dev
```

#### Coding Standards

##### TypeScript
- Use TypeScript for all code
- Follow existing code patterns
- Add proper types, avoid `any` when possible
- Use meaningful variable and function names

##### n8n Node Standards
- Display names must be in Title Case
- Use proper descriptions for dynamic options
- Collections must be alphabetically sorted
- Default limit for "Get Many" operations: 50
- Support both regular use and AI tool compatibility

##### File Structure
```typescript
// Import order
import { n8n-workflow types } from 'n8n-workflow';
import { local modules } from './local';
import { external packages } from 'package';

// Main implementation
export class NodeName implements INodeType {
    // ...
}
```

##### Error Handling
- Always use try/catch blocks in operations
- Provide helpful error messages
- Support `continueOnFail` option
- Return error details in loadOptions dropdowns

#### Testing Requirements

Before submitting:
- [ ] All existing tests pass
- [ ] New features have test coverage
- [ ] Manual testing completed:
  - [ ] Credentials test works
  - [ ] Forms load in dropdown
  - [ ] Fields load when form selected
  - [ ] CRUD operations work correctly
  - [ ] AI tool compatibility verified

#### Commit Messages

Follow conventional commits:
```
feat: add new operation for form duplication
fix: handle empty form response correctly
docs: update README with new features
refactor: simplify authentication logic
test: add tests for entry creation
```

#### Submitting Pull Request

1. Push your branch to your fork
2. Create a pull request to `main` branch
3. Fill out the PR template:
   - Description of changes
   - Related issue numbers
   - Testing performed
   - Screenshots if applicable

4. Wait for review and address feedback

### Documentation

When adding features:
1. Update README.md with new operations/features
2. Add entries to CHANGELOG.md (unreleased section)
3. Update CLAUDE.md if changing core patterns
4. Include JSDoc comments for new functions

## Project Structure

```
nodes/
  GravityForms/
    GravityForms.node.ts       # Main node logic
    GenericFunctions.ts        # API helpers
    operations/                # Operation definitions
credentials/
  GravityFormsApi.credentials.ts  # Credential schema
```

## API Guidelines

### Gravity Forms API Specifics
- API returns forms as objects (not arrays)
- Use `Object.values()` for conversion
- Handle both Basic Auth and OAuth 1.0a
- Check for various response formats

### LoadOptions Pattern
```typescript
async getItems(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
    try {
        const response = await makeGravityFormsApiRequest.call(this, 'GET', '/endpoint');
        // Handle response format variations
        const items = Array.isArray(response) ? response : Object.values(response);
        return items.map(item => ({
            name: `${item.title} (ID: ${item.id})`,
            value: item.id.toString(),
        }));
    } catch (error) {
        return [{
            name: `Error: ${error.message}`,
            value: '',
        }];
    }
}
```

## Release Process

Maintainers will:
1. Update version in package.json
2. Update CHANGELOG.md
3. Create git tag
4. Build and test
5. Publish to npm
6. Create GitHub release

## Questions?

- Open an issue for questions
- Contact: jeremy@jezweb.net
- Check existing documentation and issues first

## License

By contributing, you agree that your contributions will be licensed under the MIT License.