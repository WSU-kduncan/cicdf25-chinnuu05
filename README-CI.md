

![Workflow Diagram](/diagram.png)

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

Then the workflow concatenates the version for the Docker image according to what tag the Github commit was made under and puts it into the `version_info` variable so it can be used in the next step in the workflow. So if the commit was pushed under tag `v1.0.1`, the docker image would be tagged with `1.0.1`. If the Github tag is the latest version, then the workflow will automatically assign the `latest` tag to the Docker image

Finally, the last step of the workflow builds the docker image, which has its tags and labels set using the `version_info` variable from the previous step, using the Dockerfile that was cloned in checkout. It pushes it to DockerHub, and the workflow is finished.

if this project was copied to another repository you have to change the docker image name to your own DockerHub username/image name

You also have to update the GitHub secrets, so `DOCKER_USERNAME` and `DOCKER_TOKEN` to your own docker username and PAT token. 

Everything else stays the same, as long as the actual file/folder structure is unchanged. But obv if the Dockerfile is moved you would alsp update the path to it in `file:` in the .yml file




[Dockerbuild.yml workflow file](.github/workflows/dockerbuild.yml)


### Testing workflow

[My DockerHub repository](https://hub.docker.com/r/pechuri/ceg3120-project-4)

I tested that my workflow worked successfully by verifying that the Dockerhub image was built using the right files/code from the respective Github commit. 

So I basically just made a change to the website, made a new version tag, `git tag -a v1.0.8 -m "Edited website`
and then pushed that commit under the tag. `git push origin v1.0.8` 

And to verify the workflow built the Docker image using the correct commit's files, I ran the Docker image for that version tag on my computer and verified the changes I made appeared on the website.

I pulled the specific Docker image that was uploaded by the workflow like this: 
`docker pull pechuri/ceg3120-project-4:1.0.8`

Then I ran it and confirmed the changes I made to the website appeared with:
`docker run -d -p 8080:80 pechuri/ceg3120-project-4:1.0.8`




### Works cited
- https://docs.github.com/en/actions
- https://docs.docker.com/reference/dockerfile/
- https://www.cloudbees.com/blog/yaml-tutorial-everything-you-need-get-started
- https://mermaid.js.org/intro/syntax-reference.html