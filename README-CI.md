

## Project 4

This project is basically taking a docker image that runs a web server, and setting up a Github Actions CI workflow for it so that everytime a commit is made using a different version tag, the workflow will build a new docker image using the updated repository, and push that image to DockerHub under a new version, using the `major.minor` format for the versioning tags


### Tag versioning
- To see all tags in the repo, you use:
    -`git tag`

- To make a new git tag, you use:
    -`git tag -a v1.0.1 -m "Version message`

- To push a commit under that tag using:
    -`git push origin v1.0.1`,

This then triggers the workflow to build a docker image using the new commit's files, and upload that docker image to DockerHub with the version tag set as `1.0.1`



### Github CI Workflow
The workflow triggers whenever there is a new push to the commit under a tag that follows this format: `"v*.*.*"`
So for example, a commit made under the tag `v1.0.2` would trigger the workflow, `1.0` would the major version and `.2` would be the minor version. So the final DockerHub image tag would be `1.0.2`


The Worfklow first checksout the Github repository, meaning it clones the repo to get the latest commits/files, so everything from the Dockerfile to the web-content.

It then logins into Docker, with `docker login -u DOCKER_USERNAME -p DOCKER_TOKEN` using the DOCKER_USERNAME and DOCKER_TOKEN GitHub secrets.

Finally, the workflow concatenates the version for the image according to what tag the Github commit was made under, so if the commit was pushed under tag `v1.0.1`, the docker image would be tagged with `1.0.1`, or if the user specified `latest`, thge image would be tagged as `latest









