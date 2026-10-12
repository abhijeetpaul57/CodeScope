const mongoose = require('mongoose');
const Project = require('../models/Project');
const Module = require('../models/Module');
const Dependency = require('../models/Dependency');
const fallbackStore = require('../services/fallbackStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

const getProjects = async (req, res) => {
  try {
    if (isDbConnected()) {
      const projects = await Project.find({ user: req.user._id });
      return res.json(projects);
    } else {
      const projects = await fallbackStore.getProjectsByUser(req.user._id);
      return res.json(projects);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    if (isDbConnected()) {
      const project = await Project.findById(req.params.id);
      if (!project || project.user.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: 'Project not found' });
      }
      return res.json(project);
    } else {
      const project = await fallbackStore.getProjectById(req.params.id);
      if (!project || project.user.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: 'Project not found' });
      }
      return res.json(project);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, description, repositoryUrl, language, buildSystem } = req.body;
    if (isDbConnected()) {
      const project = await Project.create({
        name,
        description,
        repositoryUrl,
        language,
        buildSystem,
        user: req.user._id,
      });
      return res.status(201).json(project);
    } else {
      const project = await fallbackStore.createProject({
        name,
        description,
        repositoryUrl,
        language,
        buildSystem,
        user: req.user._id,
      });
      return res.status(201).json(project);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    if (isDbConnected()) {
      const project = await Project.findById(req.params.id);
      if (!project || project.user.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: 'Project not found' });
      }

      Object.assign(project, req.body);
      const updatedProject = await project.save();
      return res.json(updatedProject);
    } else {
      const project = await fallbackStore.updateProject(req.params.id, req.body);
      if (!project || project.user.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: 'Project not found' });
      }
      return res.json(project);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    if (isDbConnected()) {
      const project = await Project.findById(req.params.id);
      if (!project || project.user.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: 'Project not found' });
      }

      await Project.deleteOne({ _id: project._id });
      await Module.deleteMany({ projectId: project._id });
      await Dependency.deleteMany({ projectId: project._id });
      return res.json({ message: 'Project removed' });
    } else {
      const project = await fallbackStore.deleteProject(req.params.id);
      if (!project || project.user.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: 'Project not found' });
      }
      return res.json({ message: 'Project removed' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const seedDemoProject = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const project = await fallbackStore.seedEcommerceProject(req.user._id);
      return res.status(201).json({ message: 'Demo project seeded', project });
    }

    const project = await Project.create({
      name: `E-commerce Platform (${Date.now()})`,
      description: 'Microservices based e-commerce app',
      user: req.user._id,
      moduleCount: 12,
      dependencyCount: 18,
    });

    const modulesData = [
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

    const createdModules = await Module.insertMany(
      modulesData.map((m) => ({ ...m, projectId: project._id }))
    );

    const m = {};
    createdModules.forEach(mod => { m[mod.name] = mod._id; });

    const dependencies = [
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

    await Dependency.insertMany(
      dependencies.map((d) => ({
        projectId: project._id,
        sourceModuleId: m[d.s],
        targetModuleId: m[d.t],
      }))
    );

    return res.status(201).json({ message: 'Demo project seeded', project });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const seedFinanceDemoProject = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const project = await fallbackStore.seedFinanceProject(req.user._id);
      return res.status(201).json({ message: 'Finance demo project seeded', project });
    }

    const project = await Project.create({
      name: `FinTech Core (${Date.now()})`,
      description: 'Distributed ledger and payment processing',
      user: req.user._id,
      moduleCount: 10,
      dependencyCount: 12,
    });

    const modulesData = [
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

    const createdModules = await Module.insertMany(
      modulesData.map((m) => ({ ...m, projectId: project._id }))
    );

    const m = {};
    createdModules.forEach(mod => { m[mod.name] = mod._id; });

    const dependencies = [
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

    await Dependency.insertMany(
      dependencies.map((d) => ({
        projectId: project._id,
        sourceModuleId: m[d.s],
        targetModuleId: m[d.t],
      }))
    );

    return res.status(201).json({ message: 'Finance demo project seeded', project });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  seedDemoProject,
  seedFinanceDemoProject,
};
