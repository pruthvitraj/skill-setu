// Uses fixed skill queries, no student data, credentials or database writes in output.
const resources = require('../modules/courses/resource-search.service');
(async () => {
  for (const query of ['React', 'SQL', 'Docker']) {
    try {
      const result = await resources.search(query);
      console.log(JSON.stringify({ query, retrieved: true, retrievedAt: result.retrievedAt, items: result.items }));
    } catch (error) {
      console.log(JSON.stringify({ query, retrieved: false, code: error.errorCode || 'RESOURCE_PROVIDER',
        message: error.errorCode ? error.message : 'Resource search check failed.' }));
      process.exitCode = 1;
    }
  }
})();
