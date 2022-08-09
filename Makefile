build:
	docker build -t knockoff app

build-compute:
	cd suborbital && subo compute deploy core --local --dryrun

run-local: build build-compute
	cd suborbital && docker-compose up -d

shutdown:
	cd suborbital && docker-compose down

test:
	docker build -t knockoff app
	docker run -p 8080:8080 -t knockoff

testeditor:
	cd app/editor/monaco && node build.js && python3 -m http.server --directory dist
