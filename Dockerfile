# 第二阶段：生产环境
FROM nginx:1.25-alpine
# 复制自定义配置
COPY nginx.conf /etc/nginx/nginx.conf
# 复制构建产物
COPY dist /usr/share/nginx/html
# 暴露端口
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]