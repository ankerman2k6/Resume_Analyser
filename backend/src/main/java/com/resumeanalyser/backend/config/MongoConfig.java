package com.resumeanalyser.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.data.mongodb.core.convert.DefaultMongoTypeMapper;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;

@Configuration(proxyBeanMethods = false)
public class MongoConfig {

    @Bean
    public static BeanPostProcessor mongoTypeMapperCustomizer() {
        // Giữ converter và custom conversions do Boot cấu hình; chỉ bỏ field _class.
        // static và không có dependency để tránh khởi tạo bean sớm hoặc vòng lặp.
        return new BeanPostProcessor() {
            @Override
            public Object postProcessBeforeInitialization(Object bean, String beanName) {
                if (bean instanceof MappingMongoConverter converter) {
                    converter.setTypeMapper(new DefaultMongoTypeMapper(null));
                }
                return bean;
            }
        };
    }
}
