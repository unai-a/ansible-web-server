# Ansible Web Server Setup

This repository contains Ansible automation scripts for setting up a basic web server with Nginx, PHP, and deploying a website. The goal is to automate the process of configuring a server for hosting a website.

## Prerequisites

Before running the Ansible playbook, ensure that you have:
- Ansible installed on the machine where you will run the playbook.
- SSH access to the target machine (can be localhost if you are setting up the server on the same machine).

## Install Ansible
```bash
sudo apt update
```
```bash
sudo apt install ansible
```

## Check Ansible version
```bash
ansible --version
```

## Generate SSH key if not already done
```bash
ssh-keygen -t rsa -b 4096
```

## Copy SSH key to target machine (replace 'your_username' and 'your_server_ip' with actual values)
```bash
ssh-copy-id your_username@your_server_ip
```

## Test SSH connection to ensure access is set up
```bash
ssh your_username@your_server_ip
```

## Usage

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/ansible-web-server.git
    ```
2. Edit the inventory.ini file to specify your target machine(s).:
   
3. Run the Ansible playbook:
   ```bash
   ansible-playbook -i inventory.ini web_server_setup.yml
    ```
## Customization

   1. Customize the website files in the website/ directory according to your needs.
      
   3. Adjust variables and configurations in the playbook and templates as necessary.
      
   5. Go to the inventory.ini and read the commented lines to undestand in accordance to your config
   Feel free to contribute to or open issues in this repository.
