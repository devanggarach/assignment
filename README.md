1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

node version: 20.8.0
npm version: 10.1.0

npm i
npm run start:dev [development]

npm run build && npm run start:prod [production]

postman colletion were added in repo
examples were added

First to signup, Login

once user is login they can create cronjob
schedule can take '1m', '2m', '1h', 'weekly', 'monthly',...

added Rate limit on each route current setup is base on on Normal, medium and high

setup .env file
PORT=3000
AUTH_SECRET=#abcxyz
