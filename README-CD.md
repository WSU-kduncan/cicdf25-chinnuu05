

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

For installing the webhook I used `sudo apt-get install webhook`

I verified it installed correctly by running `webhook --version` which outputted:
`webhook version 2.8.0`







Resources Used


https://github.com/adnanh/webhook
    - For installing and configuring the webhook

- https://docs.docker.com/engine/install/ubuntu/
    - To install and setup Docker on the fresh Ec2 instance (Ubuntu 22.04)

- https://docs.docker.com/reference/cli/docker/container/run/
    - I used the Docker docs for referencing the `-it` and `-d` flags


- https://www.gnu.org/software/bash/manual/bash.html
- https://www.w3schools.com/bash/bash_syntax.php
    - Used both these websites for referencing syntax in the bash script