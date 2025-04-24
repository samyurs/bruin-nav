# 🐻 bruin-nav

**BruinNav** is a mobile app designed to help Bruins navigate, understand, and connect with UCLA's complex and historic campus.

Through an interactive, user-friendly map, students can easily locate buildings, restrooms, water fountains, printers, and study spots with a smart search function. Tapping on any building reveals detailed information like hours of operation, floor plans, and departments housed inside, along with all available amenities.

BruinNav features **Community Notes**, a student-powered section where users can share tips on navigating tricky hallways, finding shortcuts, reporting elevator outages, and more. Notes can be upvoted or downvoted to prioritize the most helpful information.

---

## HOW TO START ON VSCode

### 📱 Frontend

1. **Clone the GitHub repo**
```bash
git clone https://github.com/samyurs/bruin-nav.git
cd bruin-nav/Frontend
```

2. **Install Node Modules and iOS Pods**
```bash
npm install
cd ios
pod install
cd ..
```
3. **Make sure you already have a simulator set up. For example the one I used was in XCode.**
   
<img width="840" alt="image" src="https://github.com/user-attachments/assets/afee28fe-6054-42d3-ba85-4b7b05090af7" />

<img width="840" alt="image" src="https://github.com/user-attachments/assets/c01e7df8-3575-4dad-ab82-045821160d1b" />

4. **Start the App.**
In one terminal tab:
```bash
npx react-native start --reset-cache
```

In another terminal tab:

```bash
npx react-native run-ios
```

## ⚠️ COMPLETE BACKEND SETUP BEFORE TRYING TO DO ANYTHING!
### You may need to refresh or reopen the app after.
### App Screenshots
Once the app opens it should start on this page:

<img width="362" alt="image" src="https://github.com/user-attachments/assets/4c0e9c9a-0560-4266-9c7b-990573f28fde" />

After you create an account, it will automatically take you to the login page:

<img width="362" alt="image" src="https://github.com/user-attachments/assets/a4daf4c6-25b9-498d-9633-d23a36e0f8ce" />

If your credentials match a user that you have registered, it will take you to a homepage that looks like this:

<img width="362" alt="image" src="https://github.com/user-attachments/assets/6587b547-e29b-40d7-bb26-bc946e935cb5" />


### Backend
1. **Make sure to edit the .env file with your credentials. Follow the template given inside the file.**

2. **Then run the following commands**
```bash
cd bruin-nav/Backend
npm install dotenv
npm install bcryptjs
```

3. **Then you can start the server**
```bash
node server.js
```

4. **It should output the following if you connected properly**
```bash
Server running on port 5050
MongoDB connected
```

5. **Everytime you register or login, your console in the terminal where MondoDB is connected would output something like this**

POST /api/users/register

POST /api/users/login

POST /api/users/login

POST /api/users/register

POST /api/users/register

POST /api/users/register

POST /api/users/register

POST /api/users/login

POST /api/users/login

POST /api/users/login

POST /api/users/register

POST /api/users/login

<img width="584" alt="image" src="https://github.com/user-attachments/assets/684eb7d9-25cd-4227-832b-2e48cf4ca1f0" />

6. **You can use postman.com to test if your backend is connected if you're unsure. I've attatched screenshot examples of what the header, body, and request should look like.**
   
<img width="1000" alt="image" src="https://github.com/user-attachments/assets/579354b1-1bfd-457a-9283-a250f3e10d95" />

<img width="1000" alt="image" src="https://github.com/user-attachments/assets/133a48f7-604e-4466-93c2-2124483f7262" />

