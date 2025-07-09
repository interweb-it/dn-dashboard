# @dn/common

This package contains shared TypeScript types, interfaces, and utilities for the DN Dashboard monorepo. It is intended to be imported by backend, frontend, and worker packages to ensure type consistency across the project.

## Usage

1. Build the package:

   ```sh
   yarn workspace @dn/common build
   # or, from the common directory:
   yarn build
   ```

2. Add to your package's dependencies (in package.json):

   ```json
   "dependencies": {
     "@dn/common": "file:../common"
   }
   ```

3. Import types or utilities:

   ```ts
   import { INode, ICohortData } from '@dn/common/dn';
   ```

## Structure
- `dn/` - Node and cohort types
- `substrate-telemetry/` - Telemetry-related types and helpers
- `types.ts` - Other shared types

## Building

Run `yarn build` in this directory to generate output in `dist/` (if needed for consumers). 