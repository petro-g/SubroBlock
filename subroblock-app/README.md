# SubroBlock

SubroBlock is an online consortium of participants who jointly maintain the blockchain infrastructure which runs the industry’s subrogation process. This Web 3.0 platform enables participants to build trust and share information in a mutually beneficial way. Instead of sending information to a third party, blockchain participants will interact directly with other companies in order to settle their claims. Larger companies will be able to maintain their own node(s) of the blockchain, thereby making the network more resilient and giving the participants direct access to the blockchain transaction history for training AI negotiation models. Smaller companies will benefit as they will not need to maintain their own blockchain node, but they will still be able to access blockchain data and pre-trained AI negotiator models (trained by others).

# Setting Up Project

## Clone the Project

To clone the project from GitHub, use the following command:


```bash
git clone https://github.com/SubroBlock/subroblock-app
```

It will clone the project into your local machine.

## Setting Up Virtual Environment

It's recommended to use a virtual environment to isolate dependencies for this project. Follow these steps to set up a virtual environment using `virtualenv`:

#### 1. Install `virtualenv` if you haven't already:

```bash
pip install virtualenv
```

#### 2. Create a virtual environment:

```bash
virtualenv venv
```

#### 3. Activate the virtual environment:
- On Windows:
  ```
  venv\Scripts\activate
  ```
- On macOS and Linux:
  ```
  source venv/bin/activate
  ```

## Install Requirements

Once you have activated the virtual environment, navigate to the project directory and install the required dependencies from the `requirements.txt` file:
```bash
pip install -r requirements.txt
```


This command will install all the necessary packages for the project.

## Run the Server Locally

After installing the dependencies, you can run the Django development server locally. Navigate to the project directory where `manage.py` is located and run the following command:

```bash
python manage.py runserver
```

This will start the development server on your local machine. You can access the project by opening a web browser and visiting `http://127.0.0.1:8000/`.


# Setting Up PostgreSQL Database

This section will guide you through the process of setting up a PostgreSQL database for your Django project.

## Installation

If you haven't already installed PostgreSQL on your machine, you can download and install it from the [official PostgreSQL website](https://www.postgresql.org/download/).

Follow the installation instructions provided for your operating system.

## Create a Database
  
Once PostgreSQL is installed, you can create a new database for your Django project.

#### 1. Open a terminal or command prompt.

#### 2. Access the PostgreSQL command line interface by typing:

```bash
psql
```

#### 3. Once you're in the PostgreSQL shell, create a new database by running:
```bash
CREATE DATABASE <database_name>;
```
Replace `<database_name>` with the desired name for your database.

#### 4. Optionally, you can create a new user with privileges for this database:
```bash
GRANT ALL PRIVILEGES ON DATABASE <database_name> TO <username>;
```
Replace `<database_name>` and `<username>` with the appropriate values.

#### 6. Exit the PostgreSQL shell:
```bash
\q
```

## Configuration in Django Settings

After creating the database, you need to configure your Django project to use PostgreSQL.

#### 1. Open your Django project settings file (`settings.py`).

#### 2. Locate the `DATABASES` dictionary and update the configuration to use PostgreSQL:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': '<database_name>',
        'USER': '<username>',
        'PASSWORD': '<password>',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

## Migrating Database Schema
Once you've configured the database settings in your Django project, you need to apply migrations to create the necessary database schema.

Navigate to your Django project directory in the terminal.

Run the following command to apply migrations:

```bash
python manage.py migrate
```
This will create the necessary tables and schema in your PostgreSQL database according to your Django project's models.


## Additional Information

Feel free to explore the project and make any necessary configurations according to your needs. If you encounter any issues or have questions, please refer to the project documentation or reach out to the project maintainers for assistance.


