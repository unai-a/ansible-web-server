string readmeContent = @"
# Ansible Web Server Setup

This repository contains Ansible automation scripts for setting up a basic web server with Nginx, PHP, and deploying a website. The goal is to automate the process of configuring a server for hosting a website.

## Prerequisites

Before running the Ansible playbook, ensure that you have:
- Ansible installed on the machine where you will run the playbook.
- SSH access to the target machine (can be localhost if you are setting up the server on the same machine).

## Usage

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/ansible-web-server.git
    ```
   ```bash
   cd ansible-web-server
    ```
   ```bash
   ansible-playbook -i inventory.ini web_server_setup.yml
    ```
