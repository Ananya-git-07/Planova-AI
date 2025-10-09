const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 3600 });

console.log('Cache service initialized.');

module.exports = cache;