const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// In-memory collections
const users = [];
const projects = [];
const modules = [];
const dependencies = [];
const analyses = [];

// Seed default demo user: demo@codescope.io / password123
const demoUserId = 'demo-user-001';
const demoHashedPassword = bcrypt.hashSync('password123', 10);

users.push({
  _id: demoUserId,
  name: 'Demo User',
  email: 'demo@codescope.io',
  password: demoHashedPassword,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Seed default demo project for demo user
const demoProjectId = 'demo-project-001';
projects.push({
  _id: demoProjectId,
  name: 'E-commerce Platform',
  description: 'Microservices based e-commerce app',
  user: demoUserId,
  moduleCount: 12,
  dependencyCount: 18,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const defaultModules = [
  { name: 'API Gateway', path: 'src/api', type: 'service' },
  { name: 'Auth', path: 'src/auth', type: 'service' },
  { name: 'User', path: 'src/user', type: 'service' },
  { name: 'Payment', path: 'src/payment', type: 'service' },
  { name: 'Product', path: 'src/product', type: 'service' },
  { name: 'Order', path: 'src/order', type: 'service' },
  { name: 'Inventory', path: 'src/inventory', type: 'service' },
  { name: 'Database', path: 'src/db', type: 'core' },
  { name: 'Cache', path: 'src/cache', type: 'core' },
  { name: 'Logger', path: 'src/logger', type: 'core' },
  { name: 'Config', path: 'src/config', type: 'core' },
  { name: 'Email', path: 'src/email', type: 'service' },
];

const moduleMap = {};
defaultModules.forEach((m, idx) => {
  const mId = `mod-00${idx + 1}`;
  moduleMap[m.name] = mId;
  modules.push({
    _id: mId,
    projectId: demoProjectId,
    name: m.name,
    path: m.path,
    type: m.type,
    createdAt: new Date(),
  });
});

const defaultDeps = [
  { s: 'API Gateway', t: 'Auth' },
  { s: 'API Gateway', t: 'Product' },
  { s: 'API Gateway', t: 'Order' },
  { s: 'Auth', t: 'User' },
  { s: 'Auth', t: 'Database' },
  { s: 'Auth', t: 'Cache' },
  { s: 'User', t: 'Database' },
  { s: 'User', t: 'Logger' },
  { s: 'Payment', t: 'Database' },
  { s: 'Payment', t: 'Logger' },
  { s: 'Payment', t: 'Config' },
  { s: 'Product', t: 'Database' },
  { s: 'Product', t: 'Cache' },
  { s: 'Order', t: 'Payment' },
  { s: 'Order', t: 'Inventory' },
  { s: 'Order', t: 'Database' },
  { s: 'Inventory', t: 'Database' },
  { s: 'Email', t: 'Config' },
];

defaultDeps.forEach((d) => {
  dependencies.push({
    _id: uuidv4(),
    projectId: demoProjectId,
    sourceModuleId: moduleMap[d.s],
    targetModuleId: moduleMap[d.t],
    createdAt: new Date(),
  });
});

const fallbackStore = {
  // Users
  findUserByEmail: async (email) => {
    const normalized = email.toLowerCase().trim();
    return users.find((u) => u.email.toLowerCase() === normalized) || null;
  },

  findUserById: async (id) => {
    return users.find((u) => u._id.toString() === id.toString()) || null;
  },

  createUser: async ({ name, email, password }) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = {
      _id: uuidv4(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.push(newUser);
    return newUser;
  },

  validatePassword: async (user, password) => {
    return await bcrypt.compare(password, user.password);
  },

  // Projects
  getProjectsByUser: async (userId) => {
    return projects.filter((p) => p.user.toString() === userId.toString());
  },

  getProjectById: async (projectId) => {
    return projects.find((p) => p._id.toString() === projectId.toString()) || null;
  },

  createProject: async (projectData) => {
    const newProj = {
      _id: uuidv4(),
      ...projectData,
      moduleCount: projectData.moduleCount || 0,
      dependencyCount: projectData.dependencyCount || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    projects.push(newProj);
    return newProj;
  },

  updateProject: async (projectId, updates) => {
    const proj = projects.find((p) => p._id.toString() === projectId.toString());
    if (proj) {
      Object.assign(proj, updates, { updatedAt: new Date() });
      return proj;
    }
    return null;
  },

  deleteProject: async (projectId) => {
    const idx = projects.findIndex((p) => p._id.toString() === projectId.toString());
    if (idx !== -1) {
      const removed = projects.splice(idx, 1)[0];
      // remove associated modules and dependencies
      for (let i = modules.length - 1; i >= 0; i--) {
        if (modules[i].projectId.toString() === projectId.toString()) modules.splice(i, 1);
      }
      for (let i = dependencies.length - 1; i >= 0; i--) {
        if (dependencies[i].projectId.toString() === projectId.toString()) dependencies.splice(i, 1);
      }
      return removed;
    }
    return null;
  },

  seedEcommerceProject: async (userId) => {
    const proj = {
      _id: uuidv4(),
      name: `E-commerce Platform (${Date.now()})`,
      description: 'Microservices based e-commerce app',
      user: userId,
      moduleCount: defaultModules.length,
      dependencyCount: defaultDeps.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    projects.push(proj);

    const mIds = {};
    defaultModules.forEach((m) => {
      const id = uuidv4();
      mIds[m.name] = id;
      modules.push({
        _id: id,
        projectId: proj._id,
        name: m.name,
        path: m.path,
        type: m.type,
        createdAt: new Date(),
      });
    });

    defaultDeps.forEach((d) => {
      dependencies.push({
        _id: uuidv4(),
        projectId: proj._id,
        sourceModuleId: mIds[d.s],
        targetModuleId: mIds[d.t],
        createdAt: new Date(),
      });
    });

    return proj;
  },

  seedFinanceProject: async (userId) => {
    const finModules = [
      { name: 'API Gateway', path: 'src/api', type: 'service' },
      { name: 'Auth', path: 'src/auth', type: 'service' },
      { name: 'User', path: 'src/user', type: 'service' },
      { name: 'Ledger', path: 'src/ledger', type: 'service' },
      { name: 'Transaction', path: 'src/transaction', type: 'service' },
      { name: 'Notification', path: 'src/notification', type: 'service' },
      { name: 'Fraud Detection', path: 'src/fraud', type: 'service' },
      { name: 'Core DB', path: 'src/db', type: 'core' },
      { name: 'Cache', path: 'src/cache', type: 'core' },
      { name: 'Analytics DB', path: 'src/analytics', type: 'core' },
    ];

    const finDeps = [
      { s: 'API Gateway', t: 'Auth' },
      { s: 'API Gateway', t: 'Transaction' },
      { s: 'API Gateway', t: 'Ledger' },
      { s: 'Auth', t: 'User' },
      { s: 'Auth', t: 'Core DB' },
      { s: 'Transaction', t: 'Ledger' },
      { s: 'Transaction', t: 'Fraud Detection' },
      { s: 'Transaction', t: 'Core DB' },
      { s: 'Ledger', t: 'Core DB' },
      { s: 'Fraud Detection', t: 'Analytics DB' },
      { s: 'Notification', t: 'User' },
      { s: 'Auth', t: 'Cache' },
    ];

    const proj = {
      _id: uuidv4(),
      name: `FinTech Core (${Date.now()})`,
      description: 'Distributed ledger and payment processing',
      user: userId,
      moduleCount: finModules.length,
      dependencyCount: finDeps.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    projects.push(proj);

    const mIds = {};
    finModules.forEach((m) => {
      const id = uuidv4();
      mIds[m.name] = id;
      modules.push({
        _id: id,
        projectId: proj._id,
        name: m.name,
        path: m.path,
        type: m.type,
        createdAt: new Date(),
      });
    });

    finDeps.forEach((d) => {
      dependencies.push({
        _id: uuidv4(),
        projectId: proj._id,
        sourceModuleId: mIds[d.s],
        targetModuleId: mIds[d.t],
        createdAt: new Date(),
      });
    });

    return proj;
  },

  // Modules & Dependencies
  getModules: async (projectId) => {
    return modules.filter((m) => m.projectId.toString() === projectId.toString());
  },

  getModuleById: async (moduleId) => {
    return modules.find((m) => m._id.toString() === moduleId.toString()) || null;
  },

  createModule: async (data) => {
    const mod = {
      _id: uuidv4(),
      ...data,
      createdAt: new Date(),
    };
    modules.push(mod);
    const p = projects.find((proj) => proj._id.toString() === data.projectId.toString());
    if (p) p.moduleCount = (p.moduleCount || 0) + 1;
    return mod;
  },

  deleteModule: async (moduleId) => {
    const idx = modules.findIndex((m) => m._id.toString() === moduleId.toString());
    if (idx !== -1) {
      const mod = modules.splice(idx, 1)[0];
      const p = projects.find((proj) => proj._id.toString() === mod.projectId.toString());
      if (p && p.moduleCount > 0) p.moduleCount -= 1;
      return mod;
    }
    return null;
  },

  getDependencies: async (projectId) => {
    return dependencies.filter((d) => d.projectId.toString() === projectId.toString());
  },

  createDependency: async (data) => {
    const dep = {
      _id: uuidv4(),
      ...data,
      createdAt: new Date(),
    };
    dependencies.push(dep);
    const p = projects.find((proj) => proj._id.toString() === data.projectId.toString());
    if (p) p.dependencyCount = (p.dependencyCount || 0) + 1;
    return dep;
  },

  getGraph: async (projectId) => {
    const projModules = modules.filter((m) => m.projectId.toString() === projectId.toString());
    const projDeps = dependencies.filter((d) => d.projectId.toString() === projectId.toString());
    return {
      nodes: projModules.map((m) => ({ id: m._id, label: m.name, type: m.type })),
      edges: projDeps.map((d) => ({ source: d.sourceModuleId, target: d.targetModuleId })),
    };
  },

  // Analysis
  createAnalysis: async (data) => {
    const a = {
      _id: uuidv4(),
      ...data,
      createdAt: new Date(),
    };
    analyses.push(a);
    return a;
  },

  getAnalyses: async (projectId) => {
    return analyses
      .filter((a) => a.projectId.toString() === projectId.toString())
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  getLatestAnalysis: async (projectId) => {
    const list = analyses.filter((a) => a.projectId.toString() === projectId.toString());
    if (list.length === 0) return null;
    return list.sort((a, b) => b.createdAt - a.createdAt)[0];
  },
};

module.exports = fallbackStore;
