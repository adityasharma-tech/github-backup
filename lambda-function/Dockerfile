FROM public.ecr.aws/lambda/nodejs:22

RUN dnf install -y git
RUN dnf install -y zip

COPY ./dist/handler.js .

CMD ["./dist/handler.gitBackup"]
