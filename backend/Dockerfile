
FROM python:3.13-slim-bookworm

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip

RUN pip install --no-cache-dir -r requirements.txt

ARG USER_NAME=agenton

RUN groupadd --gid 10001 ${USER_NAME}  \
    && useradd --uid 10001 --gid ${USER_NAME} --shell /bin/bash --create-home ${USER_NAME}

WORKDIR /home/${USER_NAME}/app
RUN chown ${USER_NAME}:${USER_NAME} /home/${USER_NAME}/app

COPY --chown=${USER_NAME}:${USER_NAME} . .

EXPOSE 80/tcp

USER 10001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
