# 第一阶段：构建
FROM node:20-alpine AS build
WORKDIR /app

# 利用 Docker layer 缓存：先复制依赖清单，再安装
COPY package.json package-lock.json ./
ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npm ci --ignore-scripts

# 复制源码并构建
COPY . .
RUN npm run build:prod

# 第二阶段：生产环境
FROM nginx:1.25-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
