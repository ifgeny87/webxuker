#!/bin/bash -e
cd $(dirname "$0")/../../..

compose() {
	echo "RUN: $@"
	docker compose -f env/development/xukercli/docker-compose.yaml -p xukercli $@
}

compose rm -s -f -v
compose up -d
docker exec -ti xukercli-ubuntu-1 bash
