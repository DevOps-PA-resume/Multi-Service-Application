# Multi-Service-Application

https://roadmap.sh/projects/multiservice-docker

## How to use

### 1 environment

You need to create a .env file at the root of the directory, with the same content as the [env.example](env.example) (you can change the values)

### 2 docker

to run all the services:

```bash
docker compose up
```

the web client is avaible at http://localhost/ by default

only the client is accessible threw a reverse proxy

ps: the code and UI/UX are bad, I just needed some small app for the services. you can check the other projects on my github to see better frontend or backend for more advanced projects.
