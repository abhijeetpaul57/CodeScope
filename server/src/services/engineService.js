const { execFile } = require('child_process');
const path = require('path');

const ENGINE_PATH = path.join(__dirname, '..', '..', '..', 'engine', 'src', 'GraphEngine.exe');

const analyzeImpact = (graphData) => {
  return new Promise((resolve, reject) => {
    const child = execFile(ENGINE_PATH, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        console.error('Engine error:', error);
        return reject(error);
      }
      if (stderr) {
        console.error('Engine stderr:', stderr);
      }
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (e) {
        reject(new Error('Failed to parse engine output: ' + e.message));
      }
    });

    // Write JSON payload to stdin
    child.stdin.write(JSON.stringify(graphData));
    child.stdin.end();
  });
};

module.exports = {
  analyzeImpact,
};
