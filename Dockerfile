FROM node:latest
WORKDIR src
COPY . /src
RUN npm install
EXPOSE 3000
ENTRYPOINT npm run start:cloud
