build:
	docker build -t knockoff app

build-compute:
	# cd suborbital && subo compute deploy core --local --dryrun
    # Flaki: I don't think this is actually needed at all anymore
    # as we already have our docker-compose manifest prepared & customized

run-local: build build-compute
	cd suborbital && docker-compose up -d

shutdown:
	cd suborbital && docker-compose down

logs:
	cd suborbital && docker-compose logs -f

reinit: shutdown run-local
	echo 'reinit complete, displaying logs...'
	make logs

test:
	docker build -t knockoff app
	docker run -p 3000:8080 -e SCC_ENV_TOKEN=dummy -it knockoff

testeditor:
	cd app/editor/monaco && node build.js && python3 -m http.server --directory dist
