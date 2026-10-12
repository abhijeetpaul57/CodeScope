# CodeScope — Product Requirements Document & Technical Design

**Project:** CodeScope — Dependency & Build Optimization Platform  
**Stack:** MERN (MongoDB, Express.js, React + JSX, Node.js)  
**Optional:** C++ graph engine for performance/algorithm demonstration

## 1. Final Goal

CodeScope is a developer tool that analyzes software-module dependencies and determines the **smallest safe set of modules that may need to be rebuilt after a change**.

The final product should let a developer:

1. Create/import a software project.
2. Represent modules and dependencies as a directed graph.
3. Visualize that graph interactively.
4. Select one or more changed modules.
5. Find direct and transitive affected modules.
6. Detect circular dependencies.
7. Generate a dependency-aware build order.
8. Show modules that can potentially be skipped.
9. Compare a full-build baseline with the incremental plan.
10. Measure rebuild reduction and build/analysis time.
11. Store projects, analyses, plans, and benchmarks in MongoDB.
12. Export an analysis/build plan.

**Core user question:**

> “I changed module X. Which modules are potentially affected, in what order should they be rebuilt, and how much work can I avoid compared with rebuilding everything?”

---

## 2. Problem

Large projects can contain hundreds or thousands of modules.

Example:

```text
Application
 ├── Auth
 │    └── Database
 ├── Payment
 │    └── Database
 └── Dashboard
      └── Auth
```

If `Database` changes, its impact can propagate through multiple levels.

A full rebuild is safe but can waste time and compute. Checking only direct dependencies misses transitive dependents.

CodeScope performs graph-based impact analysis and creates an incremental rebuild plan.

---

## 3. Core Concept

Model the project as a directed graph:

```text
Module = Node
Dependency = Directed Edge
```

If:

```text
A → B
```

it means **A depends on B**.

For impact analysis, use a reverse graph:

```text
A → B → C → D

Reverse:

D → C → B → A
```

If D changes:

```text
D
↓
C
↓
B
↓
A
```

Affected modules:

```text
D, C, B, A
```

---

## 4. Core Algorithms

### 4.1 BFS/DFS Impact Analysis

Start from every changed module in the reverse dependency graph.

Use a `Set` to prevent duplicates.

Complexity:

```text
O(V + E)
```

where V = modules and E = dependencies.

### 4.2 Cycle Detection

Detect cases such as:

```text
A → B → C → A
```

A cycle prevents a valid topological build order.

Return the cycle path to the UI.

### 4.3 Topological Sort

For:

```text
A → B
B → C
C → D
```

where A depends on B:

```text
D
↓
C
↓
B
↓
A
```

Dependencies must be built before dependents.

Complexity:

```text
O(V + E)
```

### 4.4 Multiple Changed Modules

For changed set:

```text
{D, F}
```

calculate:

```text
Affected(D) ∪ Affected(F)
```

and deduplicate.

---

## 5. Build Strategies

### Full Build

```text
Rebuild every module
```

Baseline strategy.

### Direct-Dependency Strategy

Rebuild changed modules and their direct dependents.

### CodeScope Incremental

Rebuild changed modules plus all transitive affected modules, then topologically order them.

---

## 6. Metrics

Track:

- Total modules
- Total dependencies
- Changed modules
- Directly affected modules
- Transitively affected modules
- Modules rebuilt
- Rebuild reduction %
- Analysis time
- Actual build time, if a real build adapter is available
- Estimated build time
- Cycle count

Rebuild reduction:

```text
(total modules - rebuilt modules)
--------------------------------- × 100
        total modules
```

**Never hardcode benchmark numbers.** Values displayed on the final dashboard must come from actual benchmark/simulation results.

---

## 7. Technology Architecture

```text
React + JSX
      ↓
Express REST API + Socket.IO
      ↓
Node.js Services
      ↓
MongoDB
```

Optional:

```text
Node.js
   ↓
C++ Graph Engine
```

Recommended MVP: implement graph algorithms in Node.js first. Keep an `engineService` interface so C++ can replace/augment the implementation later.

---

## 8. Project Structure

```text
codescope/
├── client/
│   └── src/
│       ├── components/
│       │   ├── layout/
│       │   ├── dashboard/
│       │   ├── graph/
│       │   ├── analysis/
│       │   ├── build/
│       │   ├── benchmark/
│       │   └── common/
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Projects.jsx
│       │   ├── ProjectDetails.jsx
│       │   ├── DependencyGraph.jsx
│       │   ├── ImpactAnalysis.jsx
│       │   ├── BuildPlan.jsx
│       │   ├── Benchmarks.jsx
│       │   └── Settings.jsx
│       ├── services/
│       │   ├── api.js
│       │   └── socket.js
│       ├── context/
│       │   ├── ProjectContext.jsx
│       │   └── AnalysisContext.jsx
│       ├── hooks/
│       │   ├── useGraph.js
│       │   ├── useAnalysis.js
│       │   └── useSocket.js
│       ├── data/
│       │   └── mockData.js
│       ├── styles/
│       │   └── global.css
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   └── src/
│       ├── config/db.js
│       ├── models/
│       │   ├── Project.js
│       │   ├── Module.js
│       │   ├── Dependency.js
│       │   ├── Analysis.js
│       │   ├── BuildPlan.js
│       │   └── Benchmark.js
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       ├── middleware/
│       ├── sockets/
│       ├── utils/
│       ├── app.js
│       └── server.js
│
├── engine/                 # optional C++
│   ├── src/
│   └── CMakeLists.txt
│
└── README.md
```

---

# 9. MongoDB Models

## Project

```js
{
  name: String,
  description: String,
  repositoryUrl: String,
  language: String,
  buildSystem: String,
  moduleCount: Number,
  dependencyCount: Number,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Module

```js
{
  projectId: ObjectId,
  name: String,
  path: String,
  type: String,
  version: String,
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

## Dependency

```js
{
  projectId: ObjectId,
  sourceModuleId: ObjectId,
  targetModuleId: ObjectId,
  dependencyType: String,
  metadata: Object,
  createdAt: Date
}
```

`sourceModule` depends on `targetModule`.

Recommended indexes:

```text
projectId + sourceModuleId
projectId + targetModuleId
```

## Analysis

```js
{
  projectId: ObjectId,
  changedModules: [ObjectId],
  affectedModules: [ObjectId],
  directlyAffectedModules: [ObjectId],
  transitivelyAffectedModules: [ObjectId],
  buildOrder: [ObjectId],
  cycleDetected: Boolean,
  cycles: [[ObjectId]],
  totalModules: Number,
  affectedCount: Number,
  rebuildReductionPercent: Number,
  analysisTimeMs: Number,
  algorithm: String,
  createdAt: Date
}
```

## BuildPlan

```js
{
  projectId: ObjectId,
  analysisId: ObjectId,
  strategy: String,
  steps: [
    {
      order: Number,
      moduleId: ObjectId,
      reason: String,
      dependenciesSatisfied: Boolean
    }
  ],
  totalModules: Number,
  totalSteps: Number,
  estimatedBuildTimeMs: Number,
  createdAt: Date
}
```

## Benchmark

```js
{
  projectId: ObjectId,
  analysisId: ObjectId,
  baseline: {
    strategy: String,
    modulesBuilt: Number,
    buildTimeMs: Number
  },
  optimized: {
    strategy: String,
    modulesBuilt: Number,
    buildTimeMs: Number
  },
  metrics: {
    moduleReductionPercent: Number,
    buildTimeReductionPercent: Number,
    analysisTimeMs: Number
  },
  environment: {
    platform: String,
    nodeVersion: String
  },
  createdAt: Date
}
```

---

# 10. REST API Routes

Base path:

```text
/api
```

## Health

```text
GET /api/health
```

## Projects

```text
POST   /api/projects
GET    /api/projects
GET    /api/projects/:projectId
PUT    /api/projects/:projectId
DELETE /api/projects/:projectId
```

## Modules

```text
POST   /api/projects/:projectId/modules
GET    /api/projects/:projectId/modules
GET    /api/modules/:moduleId
PUT    /api/modules/:moduleId
DELETE /api/modules/:moduleId
```

## Dependencies

```text
POST   /api/projects/:projectId/dependencies
GET    /api/projects/:projectId/dependencies
DELETE /api/dependencies/:dependencyId
```

## Graph

```text
GET /api/projects/:projectId/graph
GET /api/projects/:projectId/graph/forward
GET /api/projects/:projectId/graph/reverse
```

Graph response:

```json
{
  "nodes": [
    { "id": "A", "label": "Auth" }
  ],
  "edges": [
    { "source": "A", "target": "Database" }
  ]
}
```

## Impact Analysis

```text
POST /api/projects/:projectId/analyze-impact
```

Input:

```json
{
  "changedModules": ["moduleId1"]
}
```

Response:

```json
{
  "analysisId": "analysis123",
  "affectedModules": ["moduleId1", "moduleId2"],
  "buildOrder": ["moduleId1", "moduleId2"],
  "cycleDetected": false,
  "analysisTimeMs": 2.8,
  "rebuildReductionPercent": 88
}
```

## Analysis History

```text
GET    /api/projects/:projectId/analyses
GET    /api/analyses/:analysisId
DELETE /api/analyses/:analysisId
```

## Build Plan

```text
POST /api/projects/:projectId/build-plan
GET  /api/analyses/:analysisId/build-plan
```

## Benchmark

```text
POST /api/projects/:projectId/benchmarks
GET  /api/projects/:projectId/benchmarks
GET  /api/benchmarks/:benchmarkId
```

## Export

```text
GET /api/analyses/:analysisId/export
```

Support JSON and CSV.

---

# 11. Socket.IO Events

Optional but recommended for long analyses.

Client → server:

```text
analysis:start
analysis:cancel
benchmark:start
```

Server → client:

```text
analysis:started
analysis:progress
analysis:completed
analysis:error

benchmark:started
benchmark:progress
benchmark:completed
```

Use rooms:

```text
analysis:<analysisId>
benchmark:<benchmarkId>
```

---

# 12. Backend Layers

## Routes

Map HTTP endpoints to controllers.

## Controllers

Validate input, call services, return responses.

## graphService

- Load project graph
- Construct forward graph
- Construct reverse graph
- Validate graph

## impactAnalysisService

- Receive changed modules
- Traverse reverse graph
- Find direct/transitive dependents
- Detect cycles
- Measure analysis time
- Persist result

## buildPlanService

- Take affected set
- Topologically sort
- Generate build order
- Explain inclusion reason

## benchmarkService

- Run baseline
- Run optimized plan
- Measure metrics
- Calculate improvements
- Persist benchmark

## engineService

Expose an implementation-independent interface:

```text
analyzeImpact()
detectCycles()
topologicalSort()
```

Implementation can be:

```text
NodeGraphEngine
```

or:

```text
CppGraphEngine
```

---

# 13. Optional C++ Engine

If used:

```text
engine/
├── src/
│   ├── main.cpp
│   ├── Graph.cpp
│   ├── Graph.h
│   ├── ImpactAnalyzer.cpp
│   ├── ImpactAnalyzer.h
│   ├── TopologicalSort.cpp
│   ├── TopologicalSort.h
│   ├── CycleDetector.cpp
│   └── CycleDetector.h
└── CMakeLists.txt
```

Input:

```json
{
  "modules": ["A", "B", "C", "D"],
  "dependencies": [
    ["A", "B"],
    ["B", "C"],
    ["C", "D"]
  ],
  "changedModules": ["D"]
}
```

Output:

```json
{
  "affectedModules": ["D", "C", "B", "A"],
  "buildOrder": ["D", "C", "B", "A"],
  "cycleDetected": false
}
```

Node should communicate with the executable using a controlled process interface such as `spawn`/`execFile`. Never concatenate unsanitized user input into shell commands.

---

# 14. React UI

## Main navigation

```text
CodeScope

Dashboard
Projects
Dependency Graph
Impact Analysis
Build Plan
Benchmarks
Settings
```

## Dashboard

KPI cards:

```text
Total Modules
Dependencies
Affected Modules
Potential Rebuild Reduction
```

Main sections:

- Interactive dependency graph
- Latest analysis
- Recent projects
- Latest benchmark
- Build-plan status

## Dependency Graph

Features:

- zoom
- pan
- search
- node selection
- dependency highlighting
- dependent highlighting
- affected-node highlighting
- cycle highlighting
- filter by module type

## Impact Analysis

User selects:

```text
Changed Module:
[ database ]
```

Click:

```text
ANALYZE IMPACT
```

Show:

```text
Changed: 1
Directly affected: 4
Transitively affected: 8
Total affected: 12
Cycle detected: NO
Potential rebuild reduction: 88%
```

Table:

```text
Module      Relationship       Reason
database    Changed            Direct change
auth        Direct             Depends on database
payment     Direct             Depends on database
dashboard   Transitive         Depends on auth
```

## Build Plan

Show:

```text
Recommended Build Order

1. database
2. auth
3. payment
4. dashboard
5. api
```

For each step:

- order
- module
- dependencies
- reason
- status

## Benchmark

Compare:

```text
                    Full Build    CodeScope
Modules Built          100            12
Build Time             180s           52s
Reduction                —            71%
```

Use actual measured values in the final version.

---

# 15. Project Creation

Form:

```text
Project Name
Description
Language
Build System
Repository URL

[CREATE PROJECT]
```

After creation:

```text
Project created successfully.
Add modules and dependencies.
```

---

# 16. Module Management

Table:

```text
Module       Path          Dependencies   Dependents
Auth         src/auth      3              5
Database     src/db        0              12
Payment      src/payment   2              3
```

Actions:

- Add
- Edit
- Delete
- Analyze impact
- View graph

---

# 17. Data Import

MVP: support JSON import.

```json
{
  "modules": [
    {"name": "A"},
    {"name": "B"}
  ],
  "dependencies": [
    {"source": "A", "target": "B"}
  ]
}
```

Post-MVP:

- Git repository import
- package manifests
- source-code dependency extraction
- build-system adapters

---

# 18. Validation

### Project

- name required
- reasonable length limit

### Module

- project required
- name required
- unique within project

### Dependency

- source required
- target required
- source != target
- both modules belong to project
- duplicate edge rejected

### Analysis

- at least one changed module
- modules must exist
- project must have graph data

---

# 19. Security

- Validate all request bodies.
- Sanitize input.
- Never build shell commands from user strings.
- Use `spawn`/`execFile` with controlled arguments if C++ is invoked.
- Restrict CORS.
- Store secrets only in environment variables.
- Never expose MongoDB credentials.
- Add authentication before public deployment.
- Rate-limit expensive analysis/benchmark endpoints.

---

# 20. Edge Cases

### Single module

```text
A
```

Changing A:

```text
Affected = A
```

### Deep chain

```text
A → B → C → D → E
```

Changing E affects all five.

### Diamond

```text
    A
   /   B   C
   \ /
    D
```

Changing D affects:

```text
D, B, C, A
```

without duplicates.

### Cycle

```text
A → B → C → A
```

Report the cycle.

### Disconnected graph

```text
A → B

C → D
```

Changing A must not affect C/D.

### Multiple changes

```text
Changed = A, D
```

Return the union of both impact sets.

---

# 21. Testing

## Unit

Test:

- graph construction
- reverse graph
- BFS
- DFS
- cycle detection
- topological sort
- multiple changed modules
- disconnected components
- duplicate dependencies

## Integration

Test:

```text
API
 ↓
Service
 ↓
Graph Engine
 ↓
MongoDB
```

## UI

Test:

- project creation
- graph rendering
- module selection
- analysis
- build plan
- benchmark page
- loading/error states

---

# 22. Performance

Use adjacency lists.

Avoid database queries inside graph traversal.

Load graph once per analysis.

Use:

```text
Map
Set
Queue
```

for efficient lookup and traversal.

Target graph analysis:

```text
O(V + E)
```

For larger projects consider:

- graph caching
- incremental graph updates
- worker processes
- C++ engine
- background jobs

---

# 23. Development Roadmap

### Phase 1 — Graph Engine

1. Module model
2. Dependency model
3. Forward graph
4. Reverse graph
5. BFS/DFS
6. Cycle detection
7. Topological sorting

### Phase 2 — Backend

1. Express
2. MongoDB
3. Mongoose models
4. Project APIs
5. Module APIs
6. Dependency APIs
7. Graph API
8. Analysis API
9. Build-plan API
10. Benchmark API

### Phase 3 — Frontend

1. Layout
2. Dashboard
3. Projects
4. Graph visualization
5. Impact analysis
6. Build plan
7. Benchmarks

### Phase 4 — Integration

```text
React
 ↓
Express
 ↓
Graph Service
 ↓
MongoDB
```

### Phase 5 — Optional C++

Only after the Node implementation works.

### Phase 6 — Benchmarking

Use reproducible graphs/workloads and measure actual results.

---

# 24. Definition of Done

- [ ] Project creation works.
- [ ] Modules can be added.
- [ ] Dependencies can be added.
- [ ] Dependency graph is visualized.
- [ ] Reverse dependency graph works.
- [ ] BFS/DFS impact analysis works.
- [ ] Multiple changed modules work.
- [ ] Cycles are detected.
- [ ] Topological build order is generated.
- [ ] Affected modules are highlighted.
- [ ] Full-build and incremental plans are comparable.
- [ ] Metrics are calculated dynamically.
- [ ] Analyses are persisted in MongoDB.
- [ ] Benchmarks are persisted.
- [ ] React communicates with Express.
- [ ] Loading/error/empty states work.
- [ ] Demo works from start to finish.
- [ ] Performance claims are based on measured data.

---

# 25. Final Interview Demo

Use this flow:

1. Open CodeScope.
2. Open a project containing a realistic dependency graph.
3. Show the graph.
4. Select `database`.
5. Say: “Suppose this module has changed.”
6. Run impact analysis.
7. Show direct and transitive dependents.
8. Highlight affected nodes.
9. Show cycle status.
10. Generate build order.
11. Explain topological sorting.
12. Compare full build vs CodeScope incremental build.
13. Show measured module/build-time reduction.
14. Open analysis history.
15. Export the build plan.

---

# 26. Strong Interview Explanation

> “CodeScope is a dependency and build optimization platform for large software projects. I model modules and their dependencies as a directed graph. When a developer changes a module, I use a reverse dependency graph and BFS/DFS to identify all direct and transitive dependents. I then detect cycles and use topological sorting to generate a valid incremental build order. The React dashboard visualizes the dependency graph and impact, while Express and MongoDB handle the application layer and persistence. Finally, I compare the incremental plan against a full-build baseline using actual measured metrics such as modules rebuilt, analysis time, and build time.”

---

# 27. Major Engineering Challenges

### 1. Transitive impact

A module can indirectly affect many modules.

**Solution:** reverse graph + BFS/DFS.

### 2. Correct build ordering

Dependencies must be built before dependents.

**Solution:** topological sorting.

### 3. Cycles

Cycles prevent valid topological ordering.

**Solution:** cycle detection and clear cycle reporting.

### 4. Fair benchmarking

Strategies must receive the same graph and changed modules.

**Solution:** reproducible input and stored analysis IDs/configuration.

### 5. Large graph performance

Repeated traversal and database calls can become expensive.

**Solution:** adjacency lists, Maps/Sets, single graph load, caching where necessary.

### 6. Understandable visualization

Large dependency graphs can become unreadable.

**Solution:** search, filtering, highlighting, zooming, and focused impact views.

---

# 28. Success Criteria

An interviewer should be able to understand the product in under two minutes:

```text
“I changed this module.”
        ↓
“Here are all affected modules.”
        ↓
“Here is why they are affected.”
        ↓
“Here is the correct build order.”
        ↓
“Here is what can potentially be skipped.”
        ↓
“Here is the measured improvement.”
```

**Core principle: correctness first, optimization second, impressive numbers third.**
