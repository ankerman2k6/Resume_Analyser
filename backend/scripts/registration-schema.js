// Run with mongosh against the application's database before starting the new backend.
// Preserve existing validation rules and allow only the fields introduced by onboarding.
const database = db.getSiblingDB("cv_screening");
const additions = {
  users: {
    pendingRegistration: {
      bsonType: ["object", "null"],
      additionalProperties: false,
      properties: {
        fullName: { bsonType: "string" },
        phone: { bsonType: "string" },
        profileId: { bsonType: "objectId" },
        companyId: { bsonType: ["objectId", "null"] },
      },
    },
  },
  companies: {
    status: { bsonType: ["string", "null"] },
    uploadedLogo: {
      bsonType: ["object", "null"],
      additionalProperties: false,
      properties: {
        contentType: { bsonType: "string", enum: ["image/png", "image/jpeg"] },
        bytes: { bsonType: "binData" },
      },
    },
  },
};
for (const [name, properties] of Object.entries(additions)) {
  const collection = database.getCollectionInfos({ name })[0];
  if (!collection) throw new Error(`Missing collection ${name}`);
  const validator = collection.options.validator || {};
  if (!validator.$jsonSchema)
    throw new Error(`Expected $jsonSchema validator on ${name}`);
  const existing = validator.$jsonSchema.properties || {};
  for (const [field, rule] of Object.entries(properties)) {
    if (!(field in existing)) existing[field] = rule;
  }
  validator.$jsonSchema.properties = existing;
  const result = database.runCommand({ collMod: name, validator });
  if (result.ok !== 1) throw new Error(JSON.stringify(result));
  print(`Updated ${name} onboarding schema`);
}
