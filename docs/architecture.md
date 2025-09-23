# Gravity Forms n8n Node Architecture

## Goals
- Add a community node package that exposes Gravity Forms REST API v2 to n8n workflows.
- Support both workflow actions and AI agent tooling in n8n (tool + MCP trigger compatibility).
- Provide extendable structure for additional Gravity Forms resources in future iterations.

## Package Layout
```
n8n-nodes-gravity-forms/
  package.json
  tsconfig.json
  src/
    credentials/
      GravityFormsApi.credentials.ts
    nodes/
      GravityForms/
        GravityForms.node.ts
        GravityForms.descriptions.ts (resource + operation definitions)
        helpers/
          GenericFunctions.ts
      GravityFormsTrigger/
        GravityFormsTrigger.node.ts
  README.md
```

## Authentication
- Gravity Forms REST API v2 uses Basic authentication with a consumer key & secret.
- Credentials collect `baseUrl`, `consumerKey`, and `consumerSecret`.
- Requests sign the `Authorization` header manually with `Basic <base64(key:secret)>` via the shared helper.

## Workflow Node Design (`GravityForms`)
- `resource` collection: `form`, `entry` (extensible for `feed`, `field`, etc.).
- Operations:
  - `form.getAll` → `GET /forms`
  - `form.get` → `GET /forms/{id}`
  - `form.create` → `POST /forms`
  - `entry.getAll` → `GET /entries`
  - `entry.get` → `GET /entries/{id}`
  - `entry.create` → `POST /forms/{formId}/submissions`
  - `entry.delete` → `DELETE /entries/{id}`
- Pagination handled with `page` / `per_page` query params; iterate if `returnAll` flag enabled.
- All operations expose JSON input/output; dynamic fields map to Gravity Forms schema.

## Trigger / MCP Tooling Strategy
- Add polling trigger node that can emit new or updated entries for selected forms.
- Trigger will poll `GET /entries` using `?search` filters and store last seen `date_created` & `id` in `staticData` for idempotency.
- For MCP (Managed Control Plane) & AI Agent compatibility:
  - Annotate node with `codex` metadata to mark as tool (`codex: { categories: ['AI', 'Tool'], resources: ... }`).
  - Expose simplified tool actions (`getForm`, `createEntry`, `listEntries`) via `description.properties` in `AI` operation group.
  - Ensure node implements `httpRequest` helpers that accept `rawParameters` for agent-driven prompts.

## Error Handling & UX
- Standardized error responses via helper wrapping `ApiRequest` to include detailed Gravity Forms error messages.
- Use `displayOptions` to show relevant fields per operation.
- Validate base URL by trimming trailing slashes.
- Provide `Simplify` option for entry submissions to flatten nested data.

## Testing & Tooling
- Include `npm run lint`, `npm run build`, and optionally `npm run test` (placeholder) scripts.
- Rely on `tsc` for type-check.
- Manual testing in n8n recommended due to API authentication requirements.
