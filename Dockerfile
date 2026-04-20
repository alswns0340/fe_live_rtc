FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
# 빌드(npm run build) 과정을 빼고 바로 dev로 실행
CMD ["npm", "run", "dev"]