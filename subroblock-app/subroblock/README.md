# SubroBlock

SubroBlock is an online consortium that maintains blockchain infrastructure for the insurance industry's subrogation process. This Web 3.0 platform fosters trust and information sharing among participants, enabling direct interaction between companies for faster claims settlement.

The platform allows larger companies to maintain their own blockchain node(s), enhancing network resilience and providing direct access to blockchain transaction history. This access is crucial for training AI negotiation models, empowering participants with advanced tools for claims resolution.

Smaller companies benefit by accessing blockchain data and pre-trained AI negotiator models without the need to maintain their own blockchain node. This democratization of access ensures that all participants, regardless of size, can leverage blockchain technology and AI in their claims handling processes.

## Installation

To install the project, follow these steps:

1. Install Django dependencies:
```sh
pip install -r requirements.txt
```
2. Install React dependencies:
```sh
cd ./subroblock-app/subroblock/client
npm install
```
3. Migrate Django models to create a SQLite database:
```sh
python manage.py migrate
```
4. Create a superuser to log into the Django admin page
```sh
python manage.py createsuperuser
```
*You will need this account for the next step*


Access the Django admin page at `http://localhost:8000/api/admin`

5. Create groups for each user instance
- admin
- arbitrator
- org_root
- org_user

![DjangoAdminPage](../media/Django%20Admin%20Page.png)

![DjangoAdminPage](../media/Django%20Admin%20Groups.png)


## Usage

To run the app, use the following commands:
```bash
python manage.py runserver
```

Run React: 

*In a separate terminal*
```sh
cd subroblock-app/subroblock/client
npm start
```

Access the app at `http://localhost:3000`

## Project Structure
```
subroblock-app/
├── subroblock/
│   ├── client/ <------ react app
│   │   ├── src/
│   │   ├── package.json
│   │   ├── ...
│   ├── nginx/
│   ├── settings.py
│   ├── urls.py
│   ├── ...
├── user_dashboard/
│   ├── views.py
│   ├── models.py
│   ├── urls.py
│   ├── ...
├── manage.py
├── requirements.txt <------ Django libraries
├── ...
```

### The project consists of two main directories:

subroblock: Contains the nginx config, Django settings, and React client source files.
user_dashboard: Contains the main functions and endpoints of the application.

## Contributing

All source code is hosted on GitHub.
Pull requests require approval before merging.
Create a branch from the dev branch and name it based on the feature you are working on.

## Contact

For questions or feedback, contact John at john@subroblock.com or through Slack.

