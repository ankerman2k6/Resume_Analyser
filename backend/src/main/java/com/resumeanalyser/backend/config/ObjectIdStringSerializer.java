package com.resumeanalyser.backend.config;

import org.bson.types.ObjectId;

import tools.jackson.core.JsonGenerator;
import tools.jackson.databind.SerializationContext;
import tools.jackson.databind.ValueSerializer;

public class ObjectIdStringSerializer extends ValueSerializer<ObjectId> {

    @Override
    public void serialize(
            ObjectId value,
            JsonGenerator gen,
            SerializationContext context
    ) {

        gen.writeString(value.toHexString());
    }
}