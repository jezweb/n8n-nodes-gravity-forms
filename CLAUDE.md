# CLAUDE.md - AI Assistant Development Guide

This document provides context and guidance for AI assistants (particularly Claude) working on the n8n-nodes-gravity-forms project.

## Project Overview

This is an n8n community node for integrating Gravity Forms (WordPress plugin) with n8n workflow automation. The node uses the Gravity Forms REST API v2 to manage forms and entries.

**Package Name**: `@jezweb/n8n-nodes-gravity-forms`
**Current Version**: 0.2.1
**Author**: Jeremy Dawes (jeremy@jezweb.net)

## Key Technical Details

### API Response Format
**Important**: Gravity Forms API returns forms as an **object** (not an array):
```json
{
  "1": { "id": "1", "title": "Contact Form", "entries": "5" },
  "2": { "id": "2", "title": "Survey", "entries": "10" }
}
```
This requires `Object.values()` conversion in the `getForms` loadOptions method.

### Project Structure
```
n8n-nodes-gravity-forms/
├── nodes/
│   └── GravityForms/
│       ├── GravityForms.node.ts         # Main node implementation
│       ├── GravityForms.node.json       # Node metadata
│       ├── GenericFunctions.ts          # API request handlers
│       ├── gravityForms.svg             # Node icon
│       └── operations/
│           ├── FormOperations.ts        # Form CRUD operations
│           └── EntryOperations.ts        # Entry CRUD operations
├── credentials/
│   └── GravityFormsApi.credentials.ts   # Credential definitions
└── package.json
```

## Recent Improvements (v0.2.x)

### v0.2.1 - Dynamic Form Loading Fix
- **Issue**: Forms weren't loading in dropdowns
- **Root Cause**: API returns object, not array
- **Solution**: Added `Object.values()` conversion
- **Better Error Handling**: Shows error messages in dropdown

### v0.2.0 - User Experience Improvements
- **Dynamic Dropdowns**: `loadOptionsMethod` for forms and fields
- **URL Normalization**: Auto-adds `/wp-json/gf/v2` to WordPress URLs
- **Credential Testing**: Added test method to verify connection
- **Field Builder**: Visual field selection for entries

## Common Development Tasks

### Testing Locally
```bash
# Build the node
npm run build

# Link for local testing
npm link
cd /path/to/n8n
npm link @jezweb/n8n-nodes-gravity-forms

# Or use n8n CLI
npx @n8n/node-cli dev
```

### Publishing Updates
```bash
# 1. Update version in package.json
# 2. Build and test
npm run build
npm run lint

# 3. Publish to npm
npm publish
```

### Adding New Features

When adding operations or fields:
1. Update operation definitions in `/operations/` files
2. Add handler logic in main node file
3. For dynamic options, add methods to `loadOptions`
4. Ensure AI compatibility with `$fromAI()` expressions

## Key Patterns

### LoadOptions Implementation
```typescript
async getForms(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
    const response = await makeGravityFormsApiRequest.call(this, 'GET', '/forms');
    // Convert object to array - critical for Gravity Forms API
    const forms = Object.values(response);
    return forms.map((form: any) => ({
        name: `${form.title} (ID: ${form.id})`,
        value: form.id.toString(),
    }));
}
```

### Error Handling in Dropdowns
Instead of returning empty arrays, provide helpful messages:
```typescript
return [{
    name: 'Error: Failed to load forms. Check credentials.',
    value: '',
}];
```

### Authentication Handling
- Supports both Basic Auth and OAuth 1.0a
- URL normalization happens in `makeGravityFormsApiRequest`
- Credentials test uses expression to normalize URL

## Common Issues & Solutions

### Issue: Forms not loading
**Check**:
1. API returns object, not array
2. Credentials are correct
3. API is enabled in WordPress
4. User has `gravityforms_edit_forms` capability

### Issue: Field mapping errors
**Solution**: Ensure field IDs are converted to strings

### Issue: Authentication failures
**Check**:
1. Consumer key/secret are correct
2. OAuth tokens (if using OAuth)
3. Base URL includes or excludes `/wp-json/gf/v2` appropriately

## n8n Node Requirements

### Linting Rules
- Display names must be title case
- Options need specific descriptions for expressions
- Collections must be alphabetically sorted
- Default limit for "Get Many" should be 50

### TypeScript Patterns
```typescript
import { ILoadOptionsFunctions } from 'n8n-workflow';
// Not IExecuteFunctions for loadOptions methods
```

## Testing Checklist

Before publishing:
- [ ] Build succeeds: `npm run build`
- [ ] Linting passes: `npm run lint`
- [ ] Credentials test works
- [ ] Forms load in dropdown
- [ ] Fields load when form selected
- [ ] Entry creation works
- [ ] AI tool compatibility verified

## Future Improvements

Consider adding:
- Webhook trigger for form submissions
- File upload support
- Conditional logic handling
- Form validation before submission
- Bulk operations
- Export/import functionality

## Support & Resources

- [Gravity Forms REST API v2 Docs](https://docs.gravityforms.com/rest-api-v2/)
- [n8n Node Development](https://docs.n8n.io/integrations/creating-nodes/)
- [GitHub Issues](https://github.com/jezweb/n8n-nodes-gravity-forms/issues)