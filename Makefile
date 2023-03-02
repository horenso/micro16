PWD = $(shell pwd)
UID = $(shell id -u)

start-dev: build-base
	docker run \
		--interactive --tty \
		--publish 5000:5000 \
		--volume ${PWD}:/app \
		--rm \
		--detach \
		--name micro16-dev \
		micro16-app-base

stop-dev:
	docker stop micro16-dev

host: build-full
	docker stop micro16
	docker run \
		--rm \
		--network=npm-network \
		--name micro16 \
		--detach \
		micro16-app-full .

test: build-test
	docker run \
		--interactive --tty \
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
