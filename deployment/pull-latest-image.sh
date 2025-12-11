

DOCKER_IMAGE="pechuri/ceg3120-project-4:latest"
DOCKER_CONTAINER="project-5-container"

docker pull "$DOCKER_IMAGE"


if docker ps -a | grep -q "$DOCKER_CONTAINER"; then

    docker stop "$DOCKER_CONTAINER"
    docker rm "$DOCKER_CONTAINER"

fi



docker run -d --restart unless-stopped --name "$DOCKER_CONTAINER" -p 80:80 "$DOCKER_IMAGE"