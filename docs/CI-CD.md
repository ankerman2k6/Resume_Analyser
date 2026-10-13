# CI/CD: Resume Analyser

## Repository and deployment model

The frontend is Vite/React (output `dist`), with `test: vitest run`. Initially it had no test files; authentication API regression tests were added. Nginx preserves `/api` when proxying to `http://backend:8080`, and supports React Router fallback. Registration now uses an absolute `/api/auth/register` URL from nested browser routes.

The backend is Spring Boot 4.1.1 / Java 21. Its actual Mongo property is `spring.mongodb.uri`, so Compose's `SPRING_MONGODB_URI` is correct. Maven Wrapper requests Maven 3.9.16. Docker builds use Maven 3.9 / Temurin JDK 21 and Temurin JRE 21. Tests run before image builds; only the subsequent image packaging step uses `-DskipTests`.

No `mongo-init` or business seed data existed. The new MongoDB 8.0 image contains one initialization script creating `cv_screening` and an initialization marker, **not a populated application database**. The official entrypoint executes it only for an empty `/data/db` volume. Existing databases are not reseeded.

Compose uses project `resume_analyser`, volume `resume_analyser_mongo-data`, and external network `resume-network`. Keep the project name unchanged across builds so deployments reuse the same volume. Do not use `down -v`, volume prune, or container prune. The pre-existing standalone `mongodb` container uses separate anonymous volumes; they are untouched. Its data is not automatically migrated into the new Compose volume. Arrange an explicit backup/migration before production if that data is required. Check port 27017 and fixed container names for conflicts before deploying.

The pipeline deploys to the Docker daemon configured **on the selected Jenkins agent**. Configure a single eligible Linux agent for this job (`agent any` is retained as requested). Do not let builds move between different deployment daemons. `DEPLOY_HOST` controls the URLs printed to users; it does not select a remote deployment host. Use one deployment job and preserve its build-number history: resetting BUILD_NUMBER or sharing these tags across multiple jobs can overwrite tags.

## Pipeline stages

1. **Checkout Source**: disables implicit SCM checkout, checks out exactly `backend/hr-dashboard`, and generates `v0.BUILD_NUMBER` and `v0.BUILD_NUMBER-<12-character-commit>`. Verifies Node 20, Java 21, Docker daemon access, and Compose `--wait-timeout` support.
2. **Test Code**: runs frontend `npm ci` / `npm test` and backend `chmod +x ./mvnw` followed by `./mvnw -B test` in parallel. Test failures stop the pipeline. JUnit reports are archived. Existing Mongo integration tests are opt-in via `RESUME_TEST_MONGO_URI`; without it six integration tests are skipped by their existing annotation. Unit tests still run. Frontend uses `--passWithNoTests` to permit an empty test suite; actual failing tests still fail the stage. For integration tests use a dedicated disposable Mongo instance and the required URI `mongodb://127.0.0.1:<port>/resume_analyser_test`, never an application database.
3. **Build & Push Docker Images**: builds contexts `./frontend`, `./backend`, `./mongo-init` before pushing any image. Publishes both tags for all three images. Uses credential `dockerhub-credentials` and `--password-stdin`; temporary Docker login files are deleted after use. Registry pushes are not atomic; a push failure can leave a subset of tags, but deployment does not proceed.
4. **Deploy Docker Compose**: writes image names and commit version to `.env`, injects the runtime JWT secret, validates Compose without printing secrets, creates `resume-network` only if absent, pulls the exact version, and runs `up -d --no-build --force-recreate --wait --wait-timeout 180`. Mongo ping, backend `/actuator/health` (including Mongo connectivity), and Nginx `/healthz` must pass. Failure marks the pipeline FAILED and archives status/logs. No automatic rollback is implemented; partial deployments require operator inspection.

## Jenkins setup

Observed locally: Jenkins runs in container `jenkins` (`jenkins/jenkins:lts`), accessible at `http://localhost:5000`. It has Java 21 and `sh`. NodeJS plugin and a tool named `node20` configured to install Node 20.20.2 exist. Pipeline, Declarative Pipeline, Git, GitHub, Credentials Binding, JUnit and Timestamper plugin files exist; their active runtime status has not been verified. Docker CLI, Node on the container PATH and Docker socket mounts are absent. Only `jenkins_home` is mounted. No permissions or mounts were changed.

In **Manage Jenkins → Plugins**, verify enabled plugins: Pipeline, Pipeline: Declarative, Git, GitHub, NodeJS, Credentials Binding, JUnit, Timestamper. Docker Pipeline is not needed because this Jenkinsfile uses the CLI.

In **Manage Jenkins → Tools**:

- `node20`: Node.js 20 installation; verify the auto-installer can download it on the agent.
- `jdk21`: JDK 21 installation (or point the installation to the agent's JDK 21). This name is required by the Jenkinsfile and is absent from the local controller's tool configuration. Java 21 on the controller PATH alone does not satisfy a named Jenkins tool.
- Maven Wrapper is preferred. If it is absent, configure Maven 3.9 on the agent PATH; the existing wrapper does not need a Jenkins Maven tool.

Create credentials in the job's scope:

- **Username with password**, ID `dockerhub-credentials`, username `bacdepzaiz7`, password a Docker Hub access token with push/pull rights to all three repositories.
- **Secret text**, ID `resume-jwt-secret`, a stable random JWT signing secret of at least 32 bytes. Keep it stable between deployments to preserve token validity. It overrides the application's existing development value via `JWT_SECRET`; it is not written into `.env` or baked into images.
- For a private GitHub repository, add a Git credential and its `credentialsId` to the explicit `git` step as well as the job SCM settings. No Git credentials are needed for public read access.

The local controller's global credentials file contains IDs `dockerhub-credentials` and `resume-jwt-secret`; their types, job scope and values have not been validated, and their secret values were not printed. Configure a Linux agent with Git, JDK 21, Node tool support, Docker CLI, Compose supporting `up --wait --wait-timeout`, and authorized access to the intended deployment daemon. An agent on the deployment host or a preconfigured remote Docker connection can be used. If Jenkins runs in Docker, an administrator must explicitly decide how to grant daemon access; this change does not mount the Docker socket or enable privileged mode. Ensure paths/network/daemon permissions belong to the intended deployment environment.

Verify **as the Jenkins agent user**, not only as the host administrator:

```sh
git --version
node --version
java -version
sh backend/mvnw --version
docker version
docker compose version
docker compose up --help
docker network inspect resume-network
```

## GitHub webhook and job

Create a regular **Pipeline → Pipeline script from SCM → Git** job:

- Repository: `https://github.com/ankerman2k6/Resume_Analyser.git`
- Branch specifier: `*/backend/hr-dashboard` (keep this spelling)
- Script path: `Jenkinsfile`
- Enable **GitHub hook trigger for GITScm polling** (also declared as `githubPush()` in the pipeline).

The SCM branch also determines which Jenkinsfile Jenkins loads; configure it correctly even though the pipeline explicitly checks out the branch. Run the first build manually after the reviewed changes are pushed by the operator to register pipeline triggers.

Remote branch `backend/hr-dashboard` was checked with `git fetch --no-tags origin backend/hr-dashboard`: it contains frontend/backend Dockerfiles, package/lock files, Maven Wrapper and Compose, but **does not yet contain `mongo-init`**. Commit the complete prepared CI/CD changes, including `mongo-init`, `.env.example`, health configuration and `.gitattributes`, to this branch before running the pipeline. Do not commit `.env` or `ci-artifacts`. This repair did not push Git or trigger a deployment.

In GitHub **Settings → Webhooks → Add webhook**:

- Payload URL: `https://<reachable-jenkins-host>/github-webhook/` (trailing slash).
- Content type: `application/json`.
- Event: push; activate the hook.
- Configure a matching webhook secret in Jenkins's GitHub settings if webhook verification is enabled.

GitHub cannot reach `localhost:5000`; provide a reachable Jenkins URL/reverse proxy. Verify GitHub's recent delivery returns a successful HTTP response and a commit to `backend/hr-dashboard` starts this job. Source links: [Jenkins GitHub plugin](https://plugins.jenkins.io/github/), [Declarative syntax](https://www.jenkins.io/doc/book/pipeline/syntax/).

## Operator commands

For manual validation, copy `.env.example` to `.env`, replace its sample version with a published commit tag, and set a real JWT secret. Jenkins generates `.env` itself and injects the secret from Credentials Binding.

```sh
docker compose --env-file .env config --quiet
docker compose --env-file .env config --images
docker compose --env-file .env ps -a
docker compose --env-file .env images
docker compose --env-file .env logs --tail=200 backend frontend mongodb
docker network inspect resume-network
docker volume inspect resume_analyser_mongo-data
docker inspect --format '{{json .State.Health}}' resume-backend
docker image inspect bacdepzaiz7/resume-backend:<published-tag>
curl -f http://<deployment-host>:8081/actuator/health
curl -f http://<deployment-host>:3000/healthz
```

Manual builds, without push/deployment:

```sh
docker build -t resume-ci-check-frontend:local ./frontend
docker build -t resume-ci-check-backend:local ./backend
docker build -t resume-ci-check-mongodb:local ./mongo-init
```

Frontend URL: `http://<deployment-host>:3000`; API through Nginx: `http://<deployment-host>:3000/api/...`; direct backend: `http://<deployment-host>:8081`. Browser requests use the frontend origin; Docker hostname `backend` appears only inside the proxy configuration.

References: [Compose health/wait behavior](https://docs.docker.com/reference/cli/docker/compose/up/), [healthy dependency ordering](https://docs.docker.com/compose/how-tos/startup-order/), [Spring Boot MongoDB properties](https://docs.spring.io/spring-boot/4.0/appendix/application-properties/).

## Validation on 2026-10-13

- `docker compose --env-file .env.example config --quiet`: passed; image interpolation resolves all three images to the sample commit tag.
- Frontend: `npm ci`, 4 Vitest tests and Vite production build passed locally with Node 24.21.0 / npm 11.19.0. Node 20 image build remains unverified.
- Backend: Maven Wrapper / Java 21 ran 58 tests: 52 passed, 6 existing opt-in Mongo integration tests skipped, no failures/errors. Health regression tests verify HTTP 503 when Mongo is unavailable, no diagnostic detail exposure, and protection of other management endpoints.
- Jenkinsfile compiles with the Jenkins container's Groovy 2.4 compiler. This verifies Groovy syntax only, not Jenkins Declarative validation or a complete pipeline run.
- After the branch/test/Wrapper repair, all six multiline pipeline shell blocks passed Linux `sh -n` in the Jenkins container. Frontend tests passed with `--passWithNoTests`; a filter matching no tests exited with code 0. An anonymous request to Jenkins's Declarative validation endpoint returned HTTP 403, so authenticated Declarative validation remains pending. Use the Jenkins Pipeline linter with an authorized account, then run the job after its tools/agent and complete branch contents are ready.
- The Maven Wrapper passed Linux `sh -n` and an isolated `./mvnw --version` check in the Jenkins container: Maven 3.9.16 / Temurin Java 21.0.12.1. A full Linux Maven test run on the Jenkins agent remains unverified. The earlier successful backend test run used the Windows Maven Wrapper and Java 21.
- Build contexts and COPY sources were checked: frontend includes package manifest/lock, source and Nginx config; backend includes pom and src; Mongo includes its initialization script. All three Docker builds were attempted and failed during base-image metadata retrieval with Docker Hub `TLS handshake timeout`. No complete Docker image or runtime Nginx validation is claimed.
- `git diff --check` and `node --check mongo-init/01-init.js`: passed.
- No GitHub push, Docker Hub push, application deployment, database migration, volume deletion or Jenkins permission change was performed.

Changed/added files: `Jenkinsfile`, `docker-compose.yml`, `.env.example`, `.gitignore`, `.gitattributes`, `README.md`, `docs/CI-CD.md`; `frontend/Dockerfile`, `frontend/.dockerignore`, `frontend/nginx.conf`, `frontend/src/services/authService.js`, `frontend/src/services/authService.test.js`; `backend/Dockerfile`, `backend/.dockerignore`, `backend/pom.xml`, `backend/src/main/resources/application.properties`, `backend/src/main/java/com/resumeanalyser/backend/security/SecurityConfig.java`, `backend/src/test/java/com/resumeanalyser/backend/HealthEndpointTests.java`; `mongo-init/Dockerfile`, `mongo-init/.dockerignore`, `mongo-init/01-init.js`.
