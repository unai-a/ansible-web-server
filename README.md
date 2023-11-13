Ansible Web Server Setup
This repository contains Ansible automation scripts for setting up a basic web server with Nginx, PHP, and deploying a website. The goal is to automate the process of configuring a server for hosting a website.

Prerequisites
Before running the Ansible playbook, ensure that you have:

Ansible installed on the machine where you will run the playbook.
SSH access to the target machine (can be localhost if you are setting up the server on the same machine).
Usage
Clone the repository:

bash
Copy code
git clone https://github.com/your-username/ansible-web-server.git
Navigate to the project directory:

bash
Copy code
cd ansible-web-server
Edit the inventory.ini file to specify your target machine(s).

Run the Ansible playbook:

bash
Copy code
ansible-playbook -i inventory.ini web_server_setup.yml
Access your website through the web server's address.

Customization
Customize the website files in the website/ directory according to your needs.
Adjust variables and configurations in the playbook and templates as necessary.
Feel free to contribute to or open issues in this repository.
