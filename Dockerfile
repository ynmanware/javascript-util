
FROM node:alpine

# necessary to not messaup the root folder str
WORKDIR /app

# this step is required to avoid running `npm i` cmd on all changes except `package.json` file
# apparantly all commands use the cached version unless there is any changes on the files/cmd above that line
COPY package.json .

RUN npm i

# copy all files from local machine to the container
COPY . .

CMD ["npm", "start"]