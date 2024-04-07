# Steps to run this project

1. Run `npm i` command
2. Clone the `.env.example` file into .env and fill the environment variables
3. Run `npm run dev:start` command

## Deploy on development environment

`npm run deploy:dev`

## Deploy on production environment

`npm run deploy:prod`

## To stop all the processes running on server

`pm2 stop all`

## To check the status of running processes

`pm2 status`

## To check logs

`pm2 log`

## Access and error log files are present at

`project-dir/logs/[prpeleaf|masai]-access.log`

`project-dir/logs/[prpeleaf|masai]-error.log`
