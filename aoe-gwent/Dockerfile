FROM node:22

WORKDIR /app

COPY . /app

RUN npm install

ENTRYPOINT ["npm", "run", "dev", "--", "--host"]