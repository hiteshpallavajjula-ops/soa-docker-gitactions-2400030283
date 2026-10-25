
package com.klef.soa.exam.configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Conference Hall CRUD API")
                        .version("1.0")
                        .description(
                            "REST API for adding, displaying, and deleting conference halls"
                        ));
    }
}
