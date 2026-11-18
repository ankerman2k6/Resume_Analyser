// Run with mongosh against cv_screening. Preserves existing validation rules.
const database = db.getSiblingDB("cv_screening");
const options = database.getCollectionInfos({ name: "companies" })[0]?.options;
if (!options?.validator?.$jsonSchema)
  throw new Error("companies JSON schema not found");
const validator = options.validator;
validator.$jsonSchema.properties.status = {
  bsonType: "string",
  enum: ["incheck", "failed", "passed"],
};
const result = database.runCommand({
  collMod: "companies",
  validator,
  validationLevel: options.validationLevel || "strict",
  validationAction: options.validationAction || "error",
});
if (!result.ok) throw new Error(JSON.stringify(result));
print("companies.status validator updated; existing records unchanged.");
