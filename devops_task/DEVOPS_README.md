DEVOPS_README.md
Overview
This project relays on a Gitlab CI/CD pipeline to ensure code quality and a faster workflow. The basic design is divided into 4 different stages:
  - build
  - static_analysis
  - test
  - deploy
The pipeline provides quick sanity checks, which indicate that different stages are valid after they have changed. 

The CI/CD uses a "On merge to main" trigger, to preclude that newly introducted bugs can be recognized quickly. Furthermore, the 
efficiency of the pipeline is increased because we avoid run the tests every commit. 

1. Build Stage
Purpose:
Ensure the production-ready code still compiles.

Proccess:
  - pending dependencies are installed with npm ci
  - npm run build builts the application
  - in addition the required env for the tmdb database is check (use of a CI variable with masked flag)

2. Static Analysis Stage
Purpose:
Ensures code quality and sets a coding standard

Proccess:
  - npm run lint starts the provided tool to test the code
  - allow_failure: true -> tests the rest of the pipeline without the need of passing the job

3. Test Stage
Purpose:
Run written tests and measure how much of the code the cover.

Proccess:
  - the provided testsuits are executed
  - with jest -> npm test -- --coverage the code coverage percentage is printed to the console

4. Deploy
Purpose:
Deploy production-ready code to a infastructur but in our case it is only a mock.

Additional Stuff:

cache:
  path:
    - node_modules/

This caches the installed dependencies and avoid reinstalling them on every commit, which speeds up the pipeline.

Docker image:
  image:20 -> provides a consistent node.js enviroment

CI variable:
NEXT_PUBLIC_TMDB_API_KEY -> is needed for the build, because of the database accesses.