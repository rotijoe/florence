# Florence Developer Handbook

Welcome to the Florence developer documentation. This handbook helps you understand the architecture, conventions, and workflows so you can contribute effectively.

## Start Here

1. **New to the project?** Read the [root README](../../README.md) for a high-level overview.
2. **Working on the API?** See [API Documentation](./api/README.md).
3. **Working on the web app?** See [Web Documentation](./web/README.md).
4. **Working with the database?** See [Database & Packages](./packages/PRISMA_WORKFLOW.md).
5. **Security & compliance?** See [Data Compliance](./compliance/document_data_compliance.md).

## Documentation Structure

```
about_project/
├── README.md (this file)
├── api/          # API endpoints, testing, conventions
├── web/          # Web routes, UI flows, components
├── packages/     # Database, Prisma, shared packages
├── compliance/   # Security, GDPR, data protection
└── [workflows]   # Linting, typechecking, setup
```

## Key Principles

### Source of Truth

- **Code is the source of truth.** Documentation should match what the code actually does.
- When code and docs disagree, update the docs (unless the code is clearly wrong/insecure).
- Link to code files rather than duplicating implementation details.

### Documentation Conventions

- **Keep it concise.** Focus on what developers need to know to work effectively.
- **Use diagrams** (Mermaid) where they clarify boundaries, flows, or architecture.
- **Update docs** when you change behavior, add endpoints, or modify routes.
- **Remove outdated docs** rather than leaving stale information.

### When to Update Docs

- Adding/modifying API endpoints → Update [`api/ENDPOINTS.md`](./api/ENDPOINTS.md)
- Changing web routes → Update [`web/`](./web/) docs
- Modifying database schema → Update [`packages/PRISMA_WORKFLOW.md`](./packages/PRISMA_WORKFLOW.md)
- Security/auth changes → Update [`compliance/`](./compliance/) docs

## Quick Links

### Architecture & Design

- [System Architecture](../../README.md#architecture-overview) - High-level system diagram
- [API Request Pipeline](./api/ENDPOINTS.md#request-pipeline) - How requests flow through middleware
- [Data Model](./packages/PRISMA_WORKFLOW.md) - Database schema and relationships

### Development Workflows

- [Prisma Workflow](./packages/PRISMA_WORKFLOW.md) - Schema changes, migrations, seeding
- [Linting](./LINTING.md) - ESLint + Prettier configuration
- [Type Checking](./TYPECHECK_SETUP.md) - TypeScript setup

### API Reference

- [API Endpoints](./api/ENDPOINTS.md) - Complete endpoint reference
- [API Testing](./api/TEST_API.md) - How to test API endpoints

### Web Reference

- [Web Routes](./web/) - Route structure and page components
- [Event Lifecycle](./web/) - Creating, editing, deleting events
- [Document Upload](./web/UPLOAD_DOCUMENT_FLOW.md) - File upload flow

### Security & Compliance

- [Data Compliance](./compliance/document_data_compliance.md) - Security, GDPR, data protection

## Contributing

When adding or modifying features:

1. **Update relevant docs** as you code (don't leave it for later).
2. **Add diagrams** if they clarify complex flows or architecture.
3. **Link to code** rather than duplicating implementation details.
4. **Remove outdated docs** if they're no longer relevant.

## Questions?

- Check the relevant section above.
- Look at the code (it's the source of truth).
- Ask in team discussions if something is unclear.

