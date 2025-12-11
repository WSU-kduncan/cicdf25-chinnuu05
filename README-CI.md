

![Workflow Diagram](/diagram.png)


### Resources Used


- https://github.com/actions/checkout
    - Used this resource to clone/pull the Github repo's latest files using `actions/checkout@v4` 


- https://docs.docker.com/build/ci/github-actions/annotations/
- https://github.com/docker/metadata-action
    - Used these two resources for generating the metadata for the Docker image (setting the Docker image's version from the git tag version), using `docker/metadata-action@v5`
    - Learned how to use the `tags` field to concenate the version together from the git tag and pass that metadata to the Docker image



- https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images#publishing-images-to-docker-hub
    - Used resource for loggng into DockerHub (`docker/login-action@` action for logging in)
    - Learned how to pass the GitHub Secrets (`DOCKER_USERNAME` and `DOCKER_TOKEN`) into the login action


- https://github.com/docker/build-push-action
- https://github.com/marketplace/actions/build-and-push-docker-images
    - Used this resource for building the Docker image using the generated version metadata, and finally pushing it to DockerHub (`docker/build-push-action@v6` for building/pushing to DockerHub).
    - Learned how to pass the git tag version from the metadata-action step to the final `tags` and `labels` for the pushed Docker image
    - Learned how to build the Docker image using `with: ` to specify location of Dockerfile, set the `context: .` and the `tags: ` and `labels: ` 
   

- https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
    - Used this resource for making the workflow trigger when a commit is pushed under a tag with the `"v*.*.*"` format


- https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
    - Used this for general syntax for creating my [dockerbuild.yml](.github/workflows/dockerbuild.yml) workflow file.
    - Provided me information on the YAML syntax the workflow should follow, a description of each field in the workflow (`name`, `on`, etc.) and activity/event filters I needed for this project like `push:` and `tags:`


- https://github.com/docker/metadata-action#examples
- https://docs.docker.com/build/ci/github-actions/
    - Resource I used for the general Workflow base, I used the example fields like `on`, `jobs`, `name`, `steps`, etc. 



My .yml file uses four actions: `actions/checkout@v4`, `docker/login-action@v3`, and `docker/metadata-action@v5`, and finally `docker/build-push-action@v6`. I adapted the base of the workflow found in the Github Actions documentation example links (found above) into my own workflow for this project. 

`actions/checkout@v4` is used to clone the repo, `docker/login-action@v3` is used to login to DockerHub using the GitHub secrets (DOCKER_USERNAME and DOCKER_PASSWWORD), `docker/metadata-action@v5` is used to generate the metadata (image version) for the Docker image, and finally `docker/build-push-action@v6` builds and pushes the Docker image to DockerHub

My .yml file starts with a `on: push: tags: "v*.*.*"`, so that any time a Github commit is pushed under a tag following this format: `v*.*.*`, my workflow will trigger


My workflow's general structure is based on the [Github Actions documentation](https://github.com/docker/metadata-action#examples) I used, I took parts of each action and modified them for this project. I linked each of the documentation code I used above in this project to build by [dockerbuild.yml](.github/workflows/dockerbuild.yml) file

I implemented the semantic versioning by following the Github actions syntax docs examples and adapting it to this project, I basically just used the docs for the `docker/metadata-actions` action to generate the tag/version metadata for the Docker image, save the version tags in the `version_info` variable, and finally use pass the version_info into the labels/tags of the Docker image that is built and pushed using the final `docker/build-push-action@v6` action 







### Other Used Resources
- https://docs.github.com/en/actions/how-tos/write-workflows/use-workflow-templates
- https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run
- https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-
- https://docs.github.com/en/actions/reference/workflows-and-actions/contexts
- https://docs.github.com/en/actions/how-tos/write-workflows
- https://docs.docker.com/reference/dockerfile/
- https://www.cloudbees.com/blog/yaml-tutorial-everything-you-need-get-started
- https://mermaid.js.org/intro/syntax-reference.html




## Project 4



This project is basically taking a docker image that runs a web server, and setting up a Github Actions CI workflow for it so that everytime a tag is pushed, the workflow will build a new docker image using the updated repository, and push that image to DockerHub under a new version, using a version format based on the pushed tag

Docker/DockerHub, Github Actions, and Git tags are all used in this project. 



### Dockerfile

The [Dockerfile](/Dockerfile) is built off the `httpd:2.4` image and just copies all the website contents in [web-content](/web-content/)
to the apache web server's public directory.

The [web-content](/web-content/) contains the HTML, CSS, and JS files that will be served through the Apachae web server. So the main [index.html](/web-content/index.html) page is what users see when they access the [website on port 8080](https://localhost:8080). 

Then there's some subpages in the /pages folder, that load [CSS](/web-content/style.css) and [javascript](/web-content/script.js) for each HTML page.


To build the Docker image you do:
`docker build -t pechuri/ceg3120-project-4:1.0.8 .`

Each docker image has to have a tag before its uploaded to DockerHub, so it must me either marked as `latest` or some version (like `1.0.8`)

Where `1.0.8` is the specified version, or you can do `latest` to mark it as the latest version

Finally, to run the container you do:
`docker run -d -p 8080:80 pechuri/ceg3120-project-4:1.0.8`
Basically just specify the image name and the version of the image you want to run, then the webserver will be accessibl on port 8080

You can check that the website being hosted through the Docker container is actually reachable, by doing `curl http://localhost:80`, if the website's content is shown in the response then that means the container is serving the website successfully







### Github Secrets
I created a personal access token to login with in the CLI by going to the Docker website, Docker Home -> Settings -> Personal access tokens and clicking generate new token. I selected Read & Write scope to be able to push the image (R&W is the best suited for this project). I noted down the PAT token because I need it to set the GitHub Secret.

Then, to actually login in with CLI I ran: docker login, and entered the personal access token I created

To create the GitHub repository's secrets I went to the repository's Settings -> Secrets and Variables -> Actions then I clicked on "New repository secret"

I did this twice, creating a `DOCKER_TOKEN` and `DOCKER_USERNAME` secret, and entered the PAT from earlier for the token and my dockerhub username.


### GitHub Actions Workflow

The workflow triggers on any commit to the repository's main branch 

This workflow basically just took whatever was the latest commit to the repo, built an image from it, and uploaded it to DockerHub under the `latest` tag

First it checkouts the repository, which just clones the repo so we can use the repo's files

Then it logins to DockerHub, it uses the DOCKER_USERNAME and DOCKER_TOKEN secrets set in the GitHub Actioins secrets settings
`docker login -u DOCKER_USERNAME -p DOCKER_TOKEN` 

Finally, The docker image is built and then always pushed with the latest tag, since there's no tag versioning system yet. It just takes the latest commit and creates the latest docker image for it and uploads it to DockerHub under the `latest` version tag

if this project was copied to another repository you have to change the docker image name to your own DockerHub username/image name

You also have to update the GitHub secrets, so `DOCKER_USERNAME` and `DOCKER_TOKEN` to your own docker username and PAT token. 


[Dockerbuild.yml workflow file](.github/workflows/dockerbuild.yml)



### Tag versioning Workflow
- To see all tags in the repo, you use:
    -`git tag`

- To make a new git tag, you use:
    -`git tag -a v1.0.1 -m "Version message`

- To push the tag use:
    -`git push origin v1.0.1`,

This then triggers the workflow to build a docker image using the new commit's files, and upload that docker image to DockerHub with the version tag set as `1.0.1`



### Github CI Workflow
The workflow triggers whenever there is a new tag that has been pushed that follows this format: `"v*.*.*"`
So for example, pushing a tag like v1.0.2 triggers the workflow. 1 would be the major version, 0 is the minor version, and 2 is the patch version. The workflow will push DockerHub tags for `latest`, `1`, and `1.0`


The Worfklow first checksout the Github repository, meaning it clones the repo to get the latest commits/files, so everything from the Dockerfile to the web-content.

It then logins into Docker, with `docker login -u DOCKER_USERNAME -p DOCKER_TOKEN` using the DOCKER_USERNAME and DOCKER_TOKEN GitHub secrets.

Then the workflow concatenates the version for the Docker image according to what tag was pushed and puts it into the `version_info` variable so it can be used in the next step in the workflow. So if the tag pushed was `v1.0.1`, the docker image would be tagged with `1.0.1`. If the Github tag is the latest version, then the workflow will automatically assign the `latest` tag to the Docker image

Finally, the last step of the workflow builds the docker image, which has its tags and labels set using the `version_info` variable from the previous step, using the Dockerfile that was cloned in checkout. It pushes it to DockerHub, and the workflow is finished.

if this project was copied to another repository you have to change the docker image name to your own DockerHub username/image name

You also have to update the GitHub secrets, so `DOCKER_USERNAME` and `DOCKER_TOKEN` to your own docker username and PAT token. 

Everything else stays the same, as long as the actual file/folder structure is unchanged. But obv if the Dockerfile is moved you would alsp update the path to it in `file:` in the .yml file




[Dockerbuild.yml workflow file](.github/workflows/dockerbuild.yml)


### Testing workflow

[My DockerHub repository](https://hub.docker.com/r/pechuri/ceg3120-project-4)

I tested that my workflow worked successfully by verifying that the Dockerhub image was built using the right files/code from the respective Github commit. 

So I basically just made a change to the website, made a new version tag, `git tag -a v1.0.8 -m "Edited website`
and then pushed that tag. `git push origin v1.0.8` 

And to verify the workflow built the Docker image using the correct commit's files, I ran the Docker image for that version tag on my computer and verified the changes I made appeared on the website.

I pulled the specific Docker image that was uploaded by the workflow like this: 
`docker pull pechuri/ceg3120-project-4:1.0.8`

Then I ran it and confirmed the changes I made to the website appeared with:
`docker run -d -p 8080:80 pechuri/ceg3120-project-4:1.0.8`




