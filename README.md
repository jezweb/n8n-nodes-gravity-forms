# n8n-nodes-gravity-forms

[![npm version](https://badge.fury.io/js/%40jezweb%2Fn8n-nodes-gravity-forms.svg)](https://www.npmjs.com/package/@jezweb/n8n-nodes-gravity-forms)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This is an n8n community node that lets you interact with [Gravity Forms](https://www.gravityforms.com/) in your n8n workflows.

Gravity Forms is a powerful WordPress plugin for creating advanced forms. This node allows you to manage forms and entries through the Gravity Forms REST API v2.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Features

✨ **New in v0.6.1:**
- ⭐ **Required Field Indicators**: Visual indicators (★) show which fields are mandatory in dropdowns

✨ **v0.6.0:**
- 📁 **File Upload Support**: Upload files via URLs (S3, Google Drive, etc.)
- 🔄 **Enhanced Error Handling**: Friendly error messages with retry logic
- 🌐 **URL File Fetching**: Download and upload files from any public URL

✨ **Recent Updates (v0.5.0):**
- 🎯 **Visual Search Builder**: Filter entries without writing JSON
- 📅 **Date Range Filtering**: Quick presets and custom date ranges
- 📧 **Send Notifications**: Trigger form notifications programmatically

✨ **Recent Features:**
- 🎉 **Trigger Node**: Watch for new or updated entries (v0.4.0)
- ✨ **Form Submission**: Submit forms with full validation (v0.4.0)
- 🤖 **AI Tool Compatible**: Works with n8n AI Agent nodes (v0.3.0+)

✨ **Core Features:**
- 🔄 **Dynamic Form Selection**: Browse and select forms from dropdowns instead of typing IDs
- 🎯 **Smart Field Mapping**: Visual field selection when creating entries
- 🔗 **Auto URL Completion**: Just enter your WordPress URL - API path added automatically
- ✅ **Credential Testing**: Test your connection before use

## Installation

### Community Node (Recommended)

1. Go to **Settings > Community Nodes** in your n8n instance
2. Select **Install**
3. Enter `@jezweb/n8n-nodes-gravity-forms` in the npm package name field
4. Click **Install**

### Manual Installation

```bash
npm install @jezweb/n8n-nodes-gravity-forms
```

## Nodes

### Gravity Forms Node (Regular)
Perform operations on forms and entries:

#### Forms
- **Get**: Retrieve a specific form by ID
- **Get Many**: Retrieve multiple forms
- **Create**: Create a new form
- **Update**: Update an existing form
- **Delete**: Delete a form

#### Entries
- **Get**: Retrieve a specific entry by ID
- **Get Many**: Retrieve multiple entries with filtering options
- **Create**: Create a new entry (direct creation)
- **Submit**: Submit a form with validation (new in v0.4.0)
- **Update**: Update an existing entry
- **Delete**: Delete an entry

### Gravity Forms Trigger Node
Start workflows when events occur:

- **New Entry**: Trigger when a new form entry is submitted
- **Updated Entry**: Trigger when an entry is updated
- **Modes**: Choose between polling (check regularly) or webhook (instant)
- **Filtering**: Filter by specific form or watch all forms
- **Status Filter**: Watch only active, spam, trash, or all entries

## Credentials

To use this node, you need to configure Gravity Forms API credentials:

1. **WordPress Site URL**: Your WordPress site URL (e.g., `https://your-site.com`)
   - The API path `/wp-json/gf/v2` is added automatically
2. **Authentication Method**: Choose between Basic Auth or OAuth 1.0a
3. **Consumer Key**: Your Gravity Forms API consumer key
4. **Consumer Secret**: Your Gravity Forms API consumer secret
5. For OAuth: **Token** and **Token Secret** (optional)

### Setting up Gravity Forms API

1. Install and activate the Gravity Forms plugin on your WordPress site
2. Go to **Forms > Settings > REST API** in your WordPress admin
3. Enable the REST API
4. Create API keys (consumer key and consumer secret)
5. Configure the credentials in n8n
6. Use the **Test Connection** button to verify your setup

## AI Tool Compatibility

This node is fully compatible with n8n's AI Agent nodes and can be used as an AI tool. The node includes `usableAsTool: true` making it appear in AI tool lists automatically.

### Setup Requirements

**Important**: For community nodes to work as AI tools, you must set this environment variable in your n8n instance:
```bash
N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
```

### Features for AI Usage

- ✅ All fields support `$fromAI()` expressions for dynamic parameter population
- ✅ Appears in AI Agent tool lists when environment variable is set
- ✅ Can be connected to AI Agent's `ai_tool` port
- ✅ Works with MCP trigger nodes

### Using with AI Agents

1. **Set the environment variable** (see above)
2. Add the **AI Agent** node to your workflow
3. Add the **Gravity Forms** node to your workflow
4. Connect Gravity Forms to the AI Agent's **ai_tool** port
5. Configure the tool name and description in the AI Agent settings
6. The AI can now:
   - Submit form entries based on AI-extracted data
   - Retrieve and process form submissions
   - Manage forms dynamically
   - Query entry data based on natural language requests

### Example AI Tool Configuration

In the AI Agent node settings:
- **Tool Name**: "Gravity Forms Manager"
- **Tool Description**: "Manages WordPress Gravity Forms. Can create, read, update, and delete forms and entries. Use this to submit form data, retrieve submissions, or manage form configurations."

## Example Workflows

### Watch for New Form Submissions
```
1. Gravity Forms Trigger (New Entry) → 2. Process Entry Data → 3. Send to CRM → 4. Send Email Notification
```

### Submit Form with Validation
```
1. Webhook Trigger → 2. Gravity Forms (Submit) → 3. Check Validation → 4. Return Response
```

### AI-Powered Form Submission
```
1. Webhook Trigger → 2. AI Agent (with Gravity Forms tool) → 3. Submit Form → 4. Respond to Webhook
```

### File Upload from Cloud Storage
```
1. Get File URL from S3/Google Drive → 2. Gravity Forms (Create Entry with File) → 3. Send Confirmation
```

### Process Updated Entries
```
1. Gravity Forms Trigger (Updated Entry) → 2. Get Full Entry → 3. Compare Changes → 4. Update Database
```

## File Upload Support

The node supports file uploads to Gravity Forms file fields in two ways:

### URL-based uploads (Recommended)
- Provide a public URL to the file (S3, Google Drive, Dropbox, etc.)
- The node will validate the URL is accessible
- The URL is sent directly to Gravity Forms

### Binary data uploads
- For entry creation: Files are encoded and sent with the entry
- For form submission: Currently requires URL (binary not yet supported)

### Example Usage
When creating an entry with a file upload field:
1. Select the file upload field from the dropdown
2. Choose "URL" as the file source
3. Provide the file URL (e.g., `https://example-bucket.s3.amazonaws.com/document.pdf`)

The node automatically handles:
- URL validation
- File accessibility checks
- Proper field mapping

## Resources

- [Gravity Forms Documentation](https://docs.gravityforms.com/)
- [Gravity Forms REST API v2](https://docs.gravityforms.com/rest-api-v2/)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)

## Troubleshooting

### Forms not loading in dropdown?

1. **Check credentials**: Use the Test Connection button
2. **Verify API is enabled**: Go to Forms > Settings > REST API in WordPress
3. **Check permissions**: Ensure your API key has the `gravityforms_edit_forms` capability
4. **URL format**: The node automatically adds `/wp-json/gf/v2` to your WordPress URL
5. **Update the node**: Make sure you have version 0.2.1 or later

### Common Issues

- **"No Forms Found"**: Check that you have forms created in Gravity Forms and API access is enabled
- **Authentication errors**: Verify your consumer key and secret are correct
- **CORS errors**: Ensure your WordPress site allows API access from your n8n instance

## Development

```bash
# Install dependencies
npm install

# Build the node
npm run build

# Run in development mode
npm run dev

# Run linter
npm run lint

# Run linter and fix issues
npm run lintfix
```

## Testing

To test this node locally:

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the node
4. Run `npm link` to link the node locally
5. In your n8n directory, run `npm link n8n-nodes-gravity-forms`
6. Restart n8n

## License

[MIT](https://github.com/jezweb/n8n-nodes-gravity-forms/blob/master/LICENSE.md)

## Author

Jeremy Dawes (jeremy@jezweb.net)
