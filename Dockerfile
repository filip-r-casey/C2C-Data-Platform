FROM node:18 AS ui-build
WORKDIR /usr/src/app
COPY web-app/ ./web-app/
RUN cd web-app && npm install && npm run build

FROM node:18 AS server-build
WORKDIR /root/
COPY --from=ui-build /usr/src/app/web-app/dist ./web-app/dist
ADD api ./api
RUN cd api && npm install

EXPOSE 8080

CMD ["node", "./api/server.js"]