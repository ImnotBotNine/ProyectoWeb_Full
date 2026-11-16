FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
EXPOSE 5173
# --host permite abrir Vite desde fuera del contenedor
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
