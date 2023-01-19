PWD = $(shell pwd)
UID = $(shell id -u)

start: build-base
	docker run \
		--interactive --tty \
		--publish 5000:5000 \
		--volume ${PWD}:/app \
		--user ${UID}:${UID} \
		--rm \
		micro16-app-base

bash: build-base
	docker run \
		--interactive --tty \
		--entrypoint bash \
		--user ${UID}:${UID} \
		--rm \
		micro16-app-base

build-base:
	docker build --target base --tag micro16-app-base .

build-full:
	docker build --target full --tag micro16-app-full .

test: