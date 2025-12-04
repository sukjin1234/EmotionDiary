package com.example.emotiondiary.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/resources/**")
                .addResourceLocations("classpath:/static/");
        
        // 이미지 파일 접근을 위한 경로 매핑
        // 개발 환경과 운영 환경 모두 지원: 파일 시스템 경로 우선, 없으면 클래스패스 경로
        String projectRoot = System.getProperty("user.dir");
        File imagesDirectory = new File(projectRoot, 
            "src" + File.separator + "main" + File.separator + "resources" + 
            File.separator + "static" + File.separator + "images");
        
        // 절대 경로를 얻고 URL 형식으로 변환
        String absolutePath = imagesDirectory.getAbsolutePath();
        String fileUrlPath = "file:" + absolutePath.replace("\\", "/");
        if (!fileUrlPath.endsWith("/")) {
            fileUrlPath += "/";
        }
        
        // 파일 시스템 경로와 클래스패스 경로 모두 매핑 (파일 시스템 경로 우선)
        registry.addResourceHandler("/images/**")
                .addResourceLocations(fileUrlPath, "classpath:/static/images/");
    }
}

