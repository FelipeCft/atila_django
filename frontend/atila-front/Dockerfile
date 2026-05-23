FROM node:18-alpine
WORKDIR /app

RUN apk add --no-cache nginx
RUN mkdir -p /usr/share/nginx/html /run/nginx
RUN rm -f /etc/nginx/http.d/default.conf

COPY nginx.conf /etc/nginx/http.d/default.conf
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 80
CMD sh -c "npm run build && cp -r dist/* /usr/share/nginx/html/ && nginx -g 'daemon off;'"