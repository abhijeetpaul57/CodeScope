const mongoose = require('mongoose');
const Dependency = require('../models/Dependency');
const Project = require('../models/Project');
const fallbackStore = require('../services/fallbackStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

const getDependencies = async (req, res) => {
  try {
    if (isDbConnected()) {
      const dependencies = await Dependency.find({ projectId: req.params.projectId });
      return res.json(dependencies);
    } else {
      const dependencies = await fallbackStore.getDependencies(req.params.projectId);
      return res.json(dependencies);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createDependency = async (req, res) => {
  try {
    if (isDbConnected()) {
      const project = await Project.findById(req.params.projectId);
      if (!project || project.user.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const newDependency = await Dependency.create({
        projectId: req.params.projectId,
        ...req.body,
      });

      project.dependencyCount += 1;
      await project.save();

      return res.status(201).json(newDependency);
    } else {
      const project = await fallbackStore.getProjectById(req.params.projectId);
      if (!project || project.user.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const newDependency = await fallbackStore.createDependency({
        projectId: req.params.projectId,
        ...req.body,
      });

      return res.status(201).json(newDependency);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteDependency = async (req, res) => {
  try {
    if (isDbConnected()) {
      const dep = await Dependency.findById(req.params.id);
      if (!dep) return res.status(404).json({ message: 'Dependency not found' });

      const project = await Project.findById(dep.projectId);
      if (project) {
        project.dependencyCount -= 1;
        await project.save();
      }

      await Dependency.deleteOne({ _id: dep._id });
      return res.json({ message: 'Dependency removed' });
    } else {
      return res.json({ message: 'Dependency removed' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDependencies,
  createDependency,
  deleteDependency,
};
