import toml

# Load configuration
config = toml.load("config/sys.config.toml")

# Access the values
ACCESS_TOKEN_EXPIRE_MINUTES = config["auth"]["access_token_expire_minutes"]
SECRET_KEY = config["auth"]["secret_key"]
ALGORITHM = config["auth"]["algorithm"]