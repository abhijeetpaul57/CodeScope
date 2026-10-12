require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Module = require('../models/Module');
const Dependency = require('../models/Dependency');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/codescope');
    console.log('MongoDB connected for seeding');

    await User.deleteMany();
    await Project.deleteMany();
    await Module.deleteMany();
    await Dependency.deleteMany();

    const user = await User.create({
      name: 'Demo User',
      email: 'demo@codescope.io',
      password: 'password123', // will be hashed
    });

    const project = await Project.create({
      name: 'E-commerce Platform',
      description: 'Microservices based e-commerce app',
      user: user._id,
      moduleCount: 12,
      dependencyCount: 18,
    });

    const modulesData = [
      { name: 'API Gateway', path: 'src/api', type: 'service' }, // 0
      { name: 'Auth', path: 'src/auth', type: 'service' }, // 1
      { name: 'User', path: 'src/user', type: 'service' }, // 2
      { name: 'Payment', path: 'src/payment', type: 'service' }, // 3
      { name: 'Product', path: 'src/product', type: 'service' }, // 4
      { name: 'Order', path: 'src/order', type: 'service' }, // 5
      { name: 'Inventory', path: 'src/inventory', type: 'service' }, // 6
      { name: 'Database', path: 'src/db', type: 'core' }, // 7
      { name: 'Cache', path: 'src/cache', type: 'core' }, // 8
      { name: 'Logger', path: 'src/logger', type: 'core' }, // 9
      { name: 'Config', path: 'src/config', type: 'core' }, // 10
      { name: 'Email', path: 'src/email', type: 'service' }, // 11
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

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
