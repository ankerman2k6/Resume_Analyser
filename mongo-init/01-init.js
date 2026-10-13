// Runs only when the official MongoDB entrypoint initializes an empty volume.
// No business seed data exists in this repository.
db = db.getSiblingDB('cv_screening');
db.createCollection('_initialization');
db._initialization.insertOne({ initializedAt: new Date(), source: 'docker-entrypoint' });
