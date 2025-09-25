# Changelog

All notable changes to the n8n-nodes-gravity-forms project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2025-09-25

### Added
- 🎉 **Gravity Forms Trigger Node**: New trigger node for webhook and polling modes
  - Poll for new or updated entries at regular intervals
  - Webhook support for instant notifications
  - Filter by form ID and entry status
  - Choose between getting all entry data or just IDs
- ✨ **Form Submission Operation**: New "Submit" operation for entries
  - Submit forms with full validation
  - Handles multi-page forms
  - Returns validation errors and confirmation messages
  - Supports both UI field mapping and JSON input

### Changed
- Enhanced GenericFunctions to support IPollFunctions and IWebhookFunctions
- Updated TypeScript types for better trigger node support

### Technical
- Added `GravityFormsTrigger.node.ts` for event-driven workflows
- Extended makeGravityFormsApiRequest to work with poll and webhook functions
- Submission endpoint uses `/forms/{id}/submissions` for proper validation

## [0.3.0] - 2025-09-25

### Added
- 🤖 **AI Tool Compatibility**: Node now appears in AI Agent tool lists with `usableAsTool: true`
- 🔧 TypeScript compatibility for `usableAsTool` property with `@ts-ignore` comment
- 📚 Documentation for AI Agent and MCP trigger usage

### Technical
- Added `usableAsTool: true` property to node description
- Community nodes require `N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true` environment variable

## [0.2.1] - 2025-09-25

### Fixed
- 🐛 Fixed form loading in dropdowns - properly handles Gravity Forms API object response format
- 🐛 Convert API response objects to arrays using `Object.values()`
- 💬 Improved error messages shown directly in dropdown when loading fails
- 💬 Better user feedback for empty results and connection issues

### Changed
- Enhanced error handling in `loadOptions` methods
- Display names now follow n8n title case conventions

## [0.2.0] - 2025-09-24

### Added
- 🎯 **Dynamic Form Selection**: Forms now load in dropdown menus
- 🎯 **Dynamic Field Selection**: Form fields load based on selected form
- 🔗 **URL Auto-completion**: Automatically adds `/wp-json/gf/v2` to WordPress URLs
- ✅ **Credential Testing**: Test connection button in credentials
- 📝 **Field Builder UI**: Visual field mapping for entry creation using fixedCollection

### Changed
- Credential field renamed from "Base URL" to "WordPress Site URL" for clarity
- Updated all field descriptions to support expressions
- Improved TypeScript types for `ILoadOptionsFunctions`

### Technical
- Added `normalizeBaseUrl()` function in GenericFunctions.ts
- Implemented `loadOptionsMethod` for dynamic data
- Added `loadOptionsDependsOn` for dependent dropdowns

## [0.1.0] - 2025-09-24

### Added
- 🎉 Initial release
- Basic CRUD operations for Forms
- Basic CRUD operations for Entries
- Support for Basic Auth and OAuth 1.0a authentication
- AI Tool compatibility with `$fromAI()` expressions
- Pagination support for list operations
- Error handling with continue on fail

### Features
#### Forms Resource
- Get form by ID
- Get all forms
- Create new form
- Update existing form
- Delete form

#### Entries Resource
- Get entry by ID
- Get all entries with filters
- Create new entry
- Update existing entry
- Delete entry

### Technical
- Built with n8n-nodes-starter template
- TypeScript implementation
- Follows n8n node development standards
- Includes comprehensive linting

## Development Notes

### Version Guidelines
- **Patch (0.0.x)**: Bug fixes, documentation updates
- **Minor (0.x.0)**: New features, non-breaking changes
- **Major (x.0.0)**: Breaking changes (not yet reached)

### Publishing Checklist
1. Update version in package.json
2. Update CHANGELOG.md
3. Run `npm run build`
4. Run `npm run lint`
5. Test locally
6. Publish with `npm publish`

## Links
- [npm Package](https://www.npmjs.com/package/@jezweb/n8n-nodes-gravity-forms)
- [GitHub Repository](https://github.com/jezweb/n8n-nodes-gravity-forms)
- [Report Issues](https://github.com/jezweb/n8n-nodes-gravity-forms/issues)