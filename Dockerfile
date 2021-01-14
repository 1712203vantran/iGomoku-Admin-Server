FROM node:14

WORKDIR /server

COPY . /server

RUN npm install

CMD ["npm", "start"]