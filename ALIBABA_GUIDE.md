## 🎯 **Alibaba CMD commands:**

- go to home folder: cd /home
- ls 
- cd (change directory)
- pm2 list (to check process list)
- pm2 stop 0
- pm2 start 0 
- pm2 delete {id number} to delete 
0 is id number shown in list table
if any pull taken in alibaba from github then need to pm2 stop and start manually again

rm -rf directory_name to delete folder in linux

## Alibaba react host process:
assuming ECS instance is created and node and all other dependencies already installed.

Process with public github repo:
1. as already have instance created with linux os and have public and private Ip as shared earlier in image.  you can see that image. also created 'security group' for that ECS instance with 3001 port for react enabling ipv4 as react running in port 3001. this enables 
(Allow	TCP	3001/3001	  All IPv4 Addresses (0.0.0.0/0)  {id by alibaba}	 React App)
2. Click on 'connect' option for my instance and sign in.
3. On instance login, There go to 'Terminal' tab and select my 'public ip' then enter password and terminal will get opened.
4. my terminal already has my node running assuming it installed.
5. now in terminal enter 'cd /home'. clone Your react my app which is public repo. 
6. once cloned, move to project folder name that created e.g 'cd KFT-systems-webui ' then do 'npm i --legacy-peer-deps' and get all dependencies. 
7. Do 'npm run build' and my dist folder of build also got created.
6. Now see 'pm2 list', then do 'pm2 start', "npm run start" --name "KFT-systems-webui" then do 'pm2 save' then did 'pm2 startup'

## The application will run in public ID of alibaba ECS: http://8.218.174.70:3001


1. Check What's Running on Port 3001
First, let's verify if your app is actually running on port 3001:

bash (This means inside cmd prompt of ECS instance after you connect to terminal)
# Check if port 3001 is listening
netstat -tulpn | grep :3001

# Alternative check
ss -tulpn | grep :3001

# Check pm2 status
pm2 status

# Check the logs of your app
pm2 logs KFT-systems-webui
2. Check Your Vite Configuration
Your Vite config might not be binding to the correct interface. Make sure it's configured to listen on all interfaces (0.0.0.0):

bash
# Check your vite.config.ts
cat vite.config.ts
It should include:

typescript
server: {
  host: '0.0.0.0',
  port: 3001,
}
3. Check Firewall Settings
Even though you opened port 3001 in the security group, check the local firewall:

bash
# Check firewall status (if using firewalld)
systemctl status firewalld

# If active, check opened ports
firewall-cmd --list-ports

# If needed, open port 3001
firewall-cmd --add-port=3001/tcp --permanent
firewall-cmd --reload

# Start with a proper ecosystem file
pm2 init
This will create an ecosystem.config.js file. Edit it:

javascript
module.exports = {
  apps: [{
    name: "KFT-systems-webui",
    script: "npm",
    args: "start", // this is 'start' as preview is in 'npm start' you can see this in package json
    cwd: "/home/KFT-systems-webui",
    env: {
      NODE_ENV: "production",
      HOST: "0.0.0.0",
      PORT: 3001
    }
  }]
}

bash
pm2 start ecosystem.config.js
pm2 save


## -----------Setting Up SSH Keys for Private Repo (Option 1)-----------------------
Now, let me explain how to set up SSH keys for a private GitHub repo, step by step:

Step 1: Generate SSH Key on Your ECS Instance
bash
# SSH into your instance (as you did before)
ssh -i your-key.pem root@8.218.174.70

# Generate a new SSH key pair
ssh-keygen -t ed25519 -C "ecs-deployment-key"

# Press Enter to accept default location (/root/.ssh/id_ed25519)
# Press Enter twice for no passphrase (or set one if preferred)
Step 2: View and Copy the Public Key
bash
# Display the public key
cat ~/.ssh/id_ed25519.pub

# Copy the entire output (it starts with ssh-ed25519 and ends with your email)
Step 3: Add the Key to GitHub
Go to your GitHub repository

Click on "Settings" → "Deploy keys"

Click "Add deploy key"

Paste your public key in the "Key" field

Give it a title (e.g., "ECS Deployment Key")

Check "Allow write access" if you need to push from the server

Click "Add key"

Step 4: Test the SSH Connection
bash
# Test the SSH connection to GitHub
ssh -T git@github.com

# You should see: "Hi username! You've successfully authenticated..."
Step 5: Clone Your Private Repository
bash
# Navigate to your home directory
cd /home

# Remove the old public repo (if needed)
rm -rf KFT-systems-webui

# Clone your private repo using SSH
git clone git@github.com:your-username/your-private-repo.git KFT-systems-webui

# Navigate to your app directory
cd KFT-systems-webui

# Install dependencies
npm install --legacy-peer-deps

# Build your React app
npm run build
Step 6: Set Up Deployment with PM2
Create a proper PM2 configuration:

bash
# Create ecosystem file
pm2 init
Edit the generated ecosystem.config.js:

javascript
module.exports = {
  apps: [{
    name: "KFT-systems-webui",
    script: "npm",
    args: "start",
    cwd: "/home/KFT-systems-webui",
    env: {
      NODE_ENV: "production",
      HOST: "0.0.0.0",
      PORT: 3001
    }
  }]
}
Start your application:

bash
# Start with pm2
pm2 start ecosystem.config.js

# Save the process list
pm2 save

# Set up startup script
pm2 startup