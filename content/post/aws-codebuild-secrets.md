---
title: "How to handle secrets in AWS Codebuild"
date: 2020-05-23T10:06:26+02:00
summary: "Where to store passwords, tokens, credentials and other sensitive data? How to make it available for Codebuild project?"
tags:
- aws
- amazon
categories:
- devops
comments: true
images:
- https://cdn.stencilbot.io/project?w=800&h=400&0.img=https%3A%2F%2Fmpasierbski.com%2Fimages%2Fblog-aws-header-bg.png&1.x=50&1.w=300&1.imgFit=contain&1.img=https%3A%2F%2Fmpasierbski.com%2Fimages%2Faws-cdk-text-logo.png&2.x=360&2.w=370&2.txt=How%20to%20handle%20secrets%20in%20AWS%20Codebuild&2.color=%233e3838&2.fontSize=40&2.font=Ubuntu%3A700&2.lineH=1.1&2.txtAlign=center&2.valign=middle
---

## Problem

You have a CodeBuild project that build you static site from headless CMS and you need the access token to call the API. You are smart enough to know that hardcoding it directly in source code is not a good idea.

- Where to store this token?
- How to make it available to CodeBuild project?
- How to protect it from people that should not have access to it?

## Environment variables

You could set secrets as environment variables directly in CodeBuild. This works but has couple downsides:

- anyone who has access to this build project can see environment variables for each build, i.e. read secrets
- anyone who has access to this build project can change environment variables, i.e. write secrets

## Secrets manger

AWS has a service to securely store passwords, tokens, credentials or any other sensitive data - [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/). Fortunately Secrets Manager integrates seamlessly with CodeBuild through a `buildspec` file.

Values from Secrets Manager can be mapped out to environment variables that will be available through all build project phases. 

```yaml
env:
  secrets-manager:
    ENV_VARIABLE_NAME: secrets-name-or-arn:key
```

CodeBuild can also resolve `secret-name-or-arn` from environment variable passed to build projects itself, which come in very handy when working with IaC (Infrastructure as code) library, like [terraform](https://www.terraform.io/) or [aws-cdk](https://docs.aws.amazon.com/cdk/latest/guide/home.html).

```go
resource "aws_secretsmanager_secret" "secrets" {
  name = "some-name"
}

resource "aws_codebuild_project" "build" {
  environment {
    environment_variable {
      name  = "SECRETS_ID"
      value = "${aws_secretsmanager_secret.secrets.arn}"
    }
  }
}
```

Here is a sample `buildspec` file:

```yaml
version: 0.2

env:
  secrets-manager:
    NPM_REGISTRY_TOKEN: $SECRETS_ID:NPM_REGISTRY_TOKEN
    SUPER_SECRET_PASSWORD: arn:aws:secretsmanager:eu-west-1:123456789:secret:secrets-name:PASSWORD
    OTHER_SECRET_PASSWORD: secrets-name:OTHER_PASSWORD

phases:
  install:
    runtime-versions:
      nodejs: 10
    commands:
      - npm install
  build:
    commands:
      - npm run build
```

For more details about `buildspec` check [official documentation](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html#secrets-manager-build-spec).

__NOTE:__ Of course IAM role associated with CodeBuild project has to have [sufficient permissions to access secrets](https://docs.aws.amazon.com/mediaconnect/latest/ug/iam-policy-examples-asm-secrets.html)
