# Javascript + NodeJs + Docker + Integration with Redis Docker-compose

### Create An Image 
`docker build -t yogeshnm/javascript-util .`  

### Push The Image Docker Hub
#### Login to Dockerhub
1. `docker login`
2. `docker push yogeshnm/javascript-util`
 
**Note:** yogeshnm is the dockerhub user name

### Run Docker Image 
`docker run -it -p 8070:8095 yogeshnm/javascript-util`

**Note:** 8095 is your application's port, port mapped to 8070 on the localhost

**Access** `http://localhost:8097/info`

### Docker Compose 
Use docker compose to integrate the application with redis, both running in a separate container
Docker compose sets up all container in the same network 
the container can access access other services using names from docker-compose file

`docker-compose up`

To rebuild and start the containers, use 

`docker-compose up --build`

**Access Application here**
http://localhost:8075/visits

refresh the page, see the count going up