const mongoose = require('mongoose');
const Module = require('../models/Module');
const Project = require('../models/Project');
const fallbackStore = require('../services/fallbackStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

const getModules = async (req, res) => {
  try {
    if (isDbConnected()) {
      const modules = await Module.find({ projectId: req.params.projectId });
      return res.json(modules);
    } else {
      const modules = await fallbackStore.getModules(req.params.projectId);
      return res.json(modules);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getModuleById = async (req, res) => {
  try {
    if (isDbConnected()) {
      const mod = await Module.findById(req.params.id);
      if (!mod) return res.status(404).json({ message: 'Module not found' });
      return res.json(mod);
    } else {
      const mod = await fallbackStore.getModuleById(req.params.id);
      if (!mod) return res.status(404).json({ message: 'Module not found' });
      return res.json(mod);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createModule = async (req, res) => {
  try {
    if (isDbConnected()) {
      const project = await Project.findById(req.params.projectId);
      if (!project || project.user.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const newModule = await Module.create({
        projectId: req.params.projectId,
        ...req.body,
      });

      project.moduleCount += 1;
      await project.save();

      return res.status(201).json(newModule);
    } else {
      const project = await fallbackStore.getProjectById(req.params.projectId);
      if (!project || project.user.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const newModule = await fallbackStore.createModule({
        projectId: req.params.projectId,
        ...req.body,
      });

      return res.status(201).json(newModule);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteModule = async (req, res) => {
  try {
    if (isDbConnected()) {
      const mod = await Module.findById(req.params.id);
      if (!mod) return res.status(404).json({ message: 'Module not found' });

      const project = await Project.findById(mod.projectId);
      if (project) {
        project.moduleCount -= 1;
        await project.save();
      }

      await Module.deleteOne({ _id: mod._id });
      return res.json({ message: 'Module removed' });
    } else {
      const mod = await fallbackStore.deleteModule(req.params.id);
      if (!mod) return res.status(404).json({ message: 'Module not found' });
      return res.json({ message: 'Module removed' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getModules,
  getModuleById,
  createModule,
  deleteModule,
};
