
![CI/CD Diagram](/project-5-diagram.png)


## Project Overview 

The goal of this project was to setup a CD deployment pipeline so that whenever a new commit is pushed under a tag, or a DockerHub image is pushed, a webhook is sent to our Ec2 instance to then pull the latest image, stop the old container, and finally run the image in a fresh/new container

Basically the premise for this project (and project 4) was setting up a full development to production CI/CD system. Where after making a commit on GitHub and tagging it, everything from a new docker image (using the latest GitHub repo files) to deployment on the Ec2 server is done through an automated system.

The tools used in this project are: 
- DockerHub for the image repository and sending the webhook to our Ec2 server whenever a new Docker image is pushed. 
- Github Actions for building and pushing a new docker image using the latest github repo files whenever a new git tag is created/pushed. 
- Webhook is used to listen for webhook events from DockerHub on the Ec2 instance. 
- Systemctl services are used to start the webhook program with the system and on reboots. 
- AWS Ec2 instances are used to actually host/run the Docker images/containers, and listen to and receive webhook events
- Docker is used to containerize code and run it in isolated containers, and also share it in portable images hosted on DockerHub


## AWS EC2 instance

I created a Ec2 instance with the Ubuntu 22.04 AMI 
AMI ID: `ami-0c398cb65a93047f2` 

I selected t2.medium (2 CPU, 4 GB memory) and 30 GB of volume storage, bc that's what was recommended in the project README 

For the Security Group, I created a new security group with these rules:

- I added a SSH inbound rule for my home IP address, to make sure no one else can SSH/connect to the EC2 instance except for me, from my home network
- I added a HTTP inbound rule for port 80, allowing connections from any IP address. So that anybody can visit the website being served on port 80.
- Lastly, I added a Custom TCP inbound rule for port 9000, to allow TCP connections for the webhook from all IP addresses.

For installing and setting up Docker on Ubuntu, I used the commands below
(All the commands/comments below were taken from the Docker docs, as stated in my resources section)

1. Add Docker's official GPG key:

`sudo apt update`
`sudo apt install ca-certificates curl`
`sudo install -m 0755 -d /etc/apt/keyrings`
`sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc`
`sudo chmod a+r /etc/apt/keyrings/docker.asc`

2. Add the repository to Apt sources:

```
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF
```

`sudo apt update`

3. Install Docker:

`sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin`


4. Start Docker service
After installing Docker, I used these systemctl commands to check if Docker was actually running, and if not start it

`sudo systemctl status docker` - check docker status
`sudo systemctl start docker` - start docker service

5. Confirm Docker is installed and working

I used the command (also taken from the Docker install docs) below to test Docker, by installing the `hello-world` test image and running it

`sudo docker run hello-world` - install and run hello-world image 

After running the hello-world image, I got this message below which verifies Docker was installed correctly and running

```
Hello from Docker!
This message shows that your installation appears to be working correctly.
```


After installing Docker, I pulled my project 4 image from DockerHub with: 
`docker pull pechuri/ceg3120-project-4:latest`

I then ran my image/container with 

`docker run -d --name project-5-container -p 80:80 pechuri/ceg3120-project-4:latest`

The `-d` option runs the container in detached mode, meaning the container is ran in the background so you can keep using your terminal without it being clogged up by info from the container. The `-it` option runs the container in interactive mode, so that you basically get a shell for entering commands into the Docker container, and you can also see the container's logs/information. Once testing is finished, you should use the `-d` flag so you can just let the container run in the background, since you don't need debugging info anymore.


## Bash script

For the bash script, I first set two variables, `DOCKER_IMAGE` and `DOCKER_CONTAINER`, to the `pechuri/ceg3120-project-4:latest` image on DockerHub and the name for the docker container that will be created, I just chose `project-5-container`

Next the bash script pulls the latest `pechuri/ceg3120-project-4` image from my DockerHub (using the `:latest` tag)

Then, the script does `docker ps -a` to list all running docker containers, if the old container with the same name is still running/exists, the bash script will stop and remove it.

Finally, the bash script runs the pulled image in detached mode with `--restart unless-stopped`, so that the container automatically restarts incase of any crashes or interruptions. The `-p 80:80` option exposes port 80 on the host computer and maps to port 80 inside the container, and then finally the `--name` flag just gives the docker container the name `project-5-container`


I did `chmod +x deployment/pull-latest-image.sh` on the bash script so I can actually run it

And then finally I ran it with `bash deployment/pull-latest-image.sh`

I made sure it actually worked by running `docker ps -a` and making sure a new docker container with the name `project-5-container` was created just a few seconds ago, and is actually running

So since the old container created much longer is gone, and a new container created just a couplle seconds ago is running, that's how I knew the bash script worked as intended.

[Link to bash script](/deployment/pull-latest-image.sh)


## Webhook

I installed the webhook library with `sudo apt-get install webhook`

I verified it installed correctly by running `webhook --version` which outputted:
`webhook version 2.8.0`

The [webhook definition file](/deployment/hooks.json) basically starts off with an `id` JSON key, which is used to tell webhook which hook to trigger when you make a HTTP request. The next JSON key is the `execute-command`, this is the path to the bash file to execute when the webhook is triggered. Next is the `response-message` key, this is the response string/message shown to whoever sent the HTTP request after the webhook triggers. Next is the `command-working-directory` key, which just tells the webhook program what working directory to run the `execute-command` file in. 

Finally the last key is a `trigger-rule` dict, which holds a list of criteria to tell the webhook when to actually trigger. The criteria is in the `match` key's dict, this dict specifies the rules to match each webhook request to. The first matching rule is a `type` param which is set to `value`, basically telling the webhook to just match each request with this value. Next is the actual `value` param which is just set to a string, I chose `dogsarecool`. Finally the last JSON key is `parameter`, which is a dict that holds two keys- `source` and `name`. `Source` tells webhook where the value I picked earlier will actually be in the HTTP request, so either the URL or the payload. I picked `url`, so that tells webhook that the value I chose (`dogsarecool`) will be in a GET query param from the HTTP request. The other key in parameter, `name`, is just the name of the GET request's query parameter that the specified value will be in, so I chose to call it `token`.

I started the webhook program to listen for HTTP requests with `webhook -hooks ~/deployment/hooks.json -hotreload -verbose`
After starting the webhook programs with the hooks.json file, it showed me this output: 
```
[webhook] 2025/12/11 03:44:05 attempting to load hooks from /home/ubuntu/deployment/hooks.json
[webhook] 2025/12/11 03:44:05 found 1 hook(s) in file
[webhook] 2025/12/11 03:44:05   loaded: deploy-image-webhook
```
Which shows that it found the hooks.json file and loaded my `deploy-image-webhook` hook from the file

You can view logs using the command above, but I also found that you can view logs through `journalctl -u webhook`
(I found this command from [this GitHub issue discussion](https://github.com/adnanh/webhook/issues/177))

So with all these values/rules set, this is the HTTP request I used to trigger the webhook 
`curl "http://54.157.240.121:9000/hooks/deploy-image-webhook?token=dogsaresupercool"`

In this HTTP request, I used a GET query param (because I set `source` to `url`) called `token` because that's what I specified in the `name` parameter key. 

To make sure the webhook worked correctly after being triggered, I just ran `docker ps -a` and made sure that a new docker container with the name `project-5-container` was created right after triggering the webhook. So basically look for `Created: Less than a second ago` with the right contaienr name


[Link to webhook definition file](/deployment/hooks.json)



The first `[Unit]` section of the webhhook service file just contains the name and startup options for the service, so in this the service is started after the network is running

Next, the `[Service]` section contains the executable to start (`/usr/bin/webhook`) and the path to the webhook configuration file, `-hooks /home/ubuntu/deployment/hooks.json`

The `WorkingDirectory` is also set in the service section, it tells the service what directory to execute commands in (so in this case `~/deployment`)

It also contains which `User` to start the service under, and a `Restart` option set to always, to make the service restart by default.

Finally, in the `[Install]` section, the `WantedBy` starts the service automatically whenever the system boots on.


I enabled the webhook service using:
`sudo systemctl enable webhook`

I started it using:
`sudo systemctl start webhook`

And made sure it was running with:
`sudo systemctl status webhook`

I checked that the webhook service was actually capturing payloads and executing the bash script by doing 
`journalctl -u webhook -f` 

And then I sent a http request to the webhook, and I saw it pop up in the log in realtime. so I knew it was woking. But I also checked with `docker ps -a` just to make sure the docker contianer was being removed and created again each time I triggered the webhook. 


[Link to webhook service file](/deployment/webhook.service)


## DockerHub Payload Sender 

I chose sending the webhook through DockerHub whenever a new image is pushed, because we already have GitHub actions configured to build a new docker image and push it to DockerHub. So I thought it just made the most sense to have the webhook payload sent to the AWS Ec2 instance from DockerHub whenever a new image is pushed from GitHub actions. This way there's a clear flow in our CI/CD pipeline: Github Action -> DockerHub -> Production Ec2 Server.

I enabled webhooks on my DockerHub repository by first going to the DockerHub repo, then clicking "Webhooks"
I then created a new webhook, I copied the public IP from the Ec2 instance, and then pasted this URL into the new webhook's URL on DockerHub:
`http://54.157.240.121:9000/hooks/deploy-image-webhook?token=dogsaresupercool`

So now whenever a new tag is created and pushed to GitHub for the commits under it, the GitHub actions workflow will build and push a new Docker image to DockerHub using the latest repo files.

After the new image is pushed to Docker, DockerHub will then trigger a HTTP call to the webhook URL I specified (port 9000 on the EC2 instance). FInally, the webhook listening on the EC2 server will receive the webhook event from DockerHub, and it will fetch the latest Docker image that uploaded and run it a new container after deleting the old container. 

I verified successful payload delivery by running `journalctl -u webhook -f` and watching the event sent from DockerHub trigger my webhook in realtime, I also ran `docker ps -a` to make sure that a new docker container was created just then with the name I specified in my [bash file](/deployment/pull-latest-image.sh)

I also validated that my webhook only triggers from DockerHub by only giving DockerHub the specific token value my webhook requires (token set in the [webhook config file](/deployment/hooks.json)). But I also just kept the logs open and verified that as soon as I pushed my `git tag`, that soon after the new image was pushed to DockerHub, my webhook got an event. 

I also noted down the IP that my webhook logs showed the request was sent from, `52.204.103.25:30244`. This isn't my home IP addresses IP, or my Ec2 instance's IP address, I ran a whois lookup which showed it belongs to Amazon / another Ec2 instance. So this is probably DockerHub's Ec2 server which this IP belongs to.




## Resources Used


https://github.com/adnanh/webhook
    - For installing and configuring the webhook on the AWS Ec2 instance. 

- https://docs.docker.com/engine/install/ubuntu/
    - To install and setup Docker on the fresh Ec2 instance (Ubuntu 22.04)

- https://docs.docker.com/reference/cli/docker/container/run/
    - I used the Docker docs for referencing the `-it` and `-d` flags. 

- https://github.com/adnanh/webhook/blob/master/docs/Hook-Definition.md
    - Documentation I used for making the webhook configuration file. Learned what each JSON key did and how the webhook program used it to match webhook http requests. 

- https://www.gnu.org/software/bash/manual/bash.html
- https://www.w3schools.com/bash/bash_syntax.php
    - Used both these websites for referencing syntax in the bash script

- https://github.com/adnanh/webhook/issues/177
    - Found the `journalctl -u webhook` command from the GitHub issue above

- https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html
    - Used this resource for creating the [webhook.service systemctl service file](/deployment/webhook.service). I learned how to make the service file by reading what each field/property does and looking at example systemctl service files. 

- https://mermaid.live
    - Used to create the diagram