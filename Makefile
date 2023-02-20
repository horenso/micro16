PWD = $(shell pwd)
UID = $(shell id -u)

start: build-base
	docker run \
		--interactive --tty \
		--publish 5000:5000 \
		--volume ${PWD}:/app \
		--rm \
		micro16-app-base

host: build-full \
	docker run \
		--rm \
		--network=npm-network \
		micro16-app-full .

test: build-test
	docker run \
		--interactive --tty \
		--publish 5000:5000 \
		--volume ${PWD}:/app \
		--rm \
		micro16-app-test

bash: build-base
	docker run \
		--interactive --tty \
		--entrypoint bash \
		--volume ${PWD}:/app \
		--user ${UID}:${UID} \
		--rm \
		micro16-app-base

build-base:
	docker build --target base --tag micro16-app-base .

build-test:
	docker build --target test --tag micro16-app-test .

build-full:
	docker build --target full --tag micro16-app-full .

test: