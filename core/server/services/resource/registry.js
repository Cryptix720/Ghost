const Resource = require('./Resource');

// Resources are always present in the system, but they may not have URLs
module.exports.tag = new Resource('tag');
module.exports.author = new Resource('author');
