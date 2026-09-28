SHELL := /bin/bash

API_DIR := ../hmpps-community-support-api

.PHONY: types-local
types-local:
	@types_file=server/@types/communitySupportApi/imported/index.d.ts; \
	current_branch=$$(git rev-parse --abbrev-ref HEAD); \
	if [ "$$current_branch" = "main" ]; then \
		echo "On main - pulling latest..."; \
		git pull; \
	fi; \
	echo "Starting the Community Support API locally (logs will stream below)..."; \
	set -m; \
	(cd $(API_DIR) && make local) & \
	api_pid=$$!; \
	echo "Waiting for the API to become available at http://localhost:8080..."; \
	waited=0; \
	until curl -sf http://localhost:8080/v3/api-docs > /dev/null 2>&1; do \
		waited=$$((waited + 2)); \
		if [ "$$waited" -ge 300 ]; then \
			echo "Timed out waiting for the API to become available after 5 minutes."; \
			kill -- -$$api_pid 2>/dev/null || kill $$api_pid 2>/dev/null || true; \
			(cd $(API_DIR) && make local-down); \
			exit 1; \
		fi; \
		sleep 2; \
	done; \
	echo "API is ready - generating types..."; \
	./script/generateApiTypes/communitySupportApiTypes --local; \
	echo "Stopping the API process..."; \
	kill -- -$$api_pid 2>/dev/null || kill $$api_pid 2>/dev/null || true; \
	echo "Shutting down docker compose services..."; \
	(cd $(API_DIR) && make local-down); \
	if git diff --quiet -- "$$types_file"; then \
		echo "No changes to types - nothing to commit."; \
	else \
		if [ "$$current_branch" = "main" ]; then \
			rand=$$(LC_ALL=C tr -dc 'a-z' < /dev/urandom | head -c 4); \
			echo "Types changed while on main - switching to a new branch..."; \
			git switch -C "no-ticket/$$(date +%Y-%m-%d)-api-types-$$rand"; \
		fi; \
		echo "Committing generated types..."; \
		git add "$$types_file"; \
		git commit -m "chore: api types"; \
		git push; \
	fi
