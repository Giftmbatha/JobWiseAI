package com.jobwiseai.jobwiseai_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        // Ensure API paths are handled correctly
        configurer.setUseTrailingSlashMatch(false);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Since we're API-only and Next.js handles frontend,
        // we don't need to serve static resources
        // This prevents conflicts with API routing

        // Only enable H2 console for development
        registry.addResourceHandler("/h2-console/**")
                .addResourceLocations("classpath:/");
    }
}
