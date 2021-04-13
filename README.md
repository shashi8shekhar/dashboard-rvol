https://user-images.githubusercontent.com/3517062/114493081-78473900-9c37-11eb-9524-dee797ed383c.jpg


==========================================

Install Docker

https://docs.docker.com/docker-for-mac/install/

https://docs.docker.com/docker-for-windows/install/

==========================================

The following set of commands will download and install the dashboard along with all its dependencies:

git clone https://github.com/shashi8shekhar/dashboard-rvol.git

cd dashboard-rvol

docker-compose build

docker-compose up -d

==========================================

Access Client Dashboard on local system

http://localhost:3000

Access DB on local system

http://localhost:8080/

==========================================

Stop Application

docker-compose stop

==========================================

Check Logs

docker-compose logs server

docker-compose logs client


==========================================