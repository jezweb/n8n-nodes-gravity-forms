# n8n-nodes-gforms-api

WordPress Gravity Forms REST API community node for n8n. This package provides integration with Gravity Forms operations for workflows, AI agents (tool mode), and a polling trigger for new entries.

## Features
- Forms: list, fetch, and create forms via the REST API.
- Entries: list, retrieve, create, and delete submissions, including pagination helpers.
- Tool actions: condensed operations optimised for n8n AI agents (summaries, quick submissions, entry search).
- Trigger: poll for new Gravity Forms submissions with stateful checkpointing.

## Prerequisites
- Gravity Forms REST API enabled with a Consumer Key & Secret.
- Base URL pointing to your WordPress site (e.g. `https://example.com/wp-json/gf/v2`).
- n8n 1.2+ recommended.

## Installation
Inside your n8n community nodes projects folder:

```bash
npm install n8n-nodes-gforms-api
```

Or clone this repository and run:

```bash
npm install
npm run build
```

Then copy the resulting package to your n8n environment and add it under **Settings → Community Nodes**.

## Usage
1. Create a new credential of type **GForms API Authentication** providing your base URL, consumer key, and consumer secret.
2. Add the **GForms API** workflow node to access form or entry resources. Choose the resource and operation, then set any additional filters or payload JSON.
3. To expose functionality to AI agents, switch the resource to **Tool Action** and pick one of the prebuilt operations tailored for conversational tools.
4. Use **GForms API Trigger** to start workflows on new submissions. Configure the form ID (optional) and polling interval.

## Development
```bash
npm install
npm run build
```

## TODO
- Additional resources (feeds, notifications, results API).
- Richer AI tool metadata once n8n exposes formal tooling schemas.
- Unit tests with mocked Gravity Forms responses.
