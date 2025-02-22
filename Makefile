REGISTRY=swr.cn-north-4.myhuaweicloud.com
PRODORG=bcp-cloud
NAME=bcp-admin-ui
TAG=$(shell date +%Y%m%d%H%M)
PRODTAG=1.0.0

.PHONY: base prod

base:
	echo building "正在编译打包前端代码..."
	npm install --unsafe-perm=true --allow-root
	rm -rf ./dist/*
	npm run build:stage
	echo building "前端代码打包完毕"

prod: base
	echo building "正在服务器打包${NAME}生产镜像..."
	echo building ${NAME}:master
	docker build -t ${REGISTRY}/${PRODORG}/${NAME}:${PRODTAG} .
	docker tag ${REGISTRY}/${PRODORG}/${NAME}:${PRODTAG} ${REGISTRY}/${PRODORG}/${NAME}:${TAG}
	docker push ${REGISTRY}/${PRODORG}/${NAME}:${TAG}