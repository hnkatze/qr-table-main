# Build Verification Rule

## MANDATORY: Verify Before Committing

**NEVER commit code changes without verifying that the project compiles first.**

### Workflow
1. Make changes
2. Run the build/compile command to verify no errors
3. Fix any errors found
4. THEN commit

### When to verify
- After ANY code refactoring (renames, restructuring, import changes)
- After modifying TypeScript files
- After adding/removing dependencies or imports
- After file renames that affect import paths

### How to verify
- Ask the user to run the build command (e.g., `ng build`, `npm run build`)
- Or if the user has explicitly allowed it, run it yourself
- Do NOT assume changes are correct just because the pattern is mechanical

### Why
Mechanical refactors (file renames, class renames, import updates) are error-prone:
- Import paths may not be fully updated
- Class name conflicts with interfaces/types
- Removing CommonModule may break pipes (SlicePipe, DecimalPipe, etc.)
- Export names may not match between files

**One build check catches all of these. Skipping it means compounding errors across multiple commits.**
