---
title: "How to build continuous delivery pipeline for static sites on AWS"
date: 2020-05-03T17:05:37+02:00
comments: true
summary: "By the end of this tutorial we are going to have a static site deployed to AWS, served by CDN and automatically redeployed on source code update."
tags:
- tutorial
- amazon
- aws
- aws-cdk
- jamstack
categories:
- devops
images:
- https://cdn.stencilbot.io/project?w=800&h=400&0.img=https%3A%2F%2Fmpasierbski.com%2Fimages%2Fblog-aws-header-bg.png&1.x=50&1.w=300&1.imgFit=contain&1.img=https%3A%2F%2Fmpasierbski.com%2Fimages%2Faws-cdk-text-logo.png&2.x=360&2.w=370&2.txt=How%20to%20build%20continuous%20delivery%20pipeline%20for%20static%20sites%20on%20AWS&2.color=%233e3838&2.fontSize=40&2.font=Ubuntu%3A700&2.lineH=1.1&2.txtAlign=center&2.valign=middle
---

*This post is a first (hopefully not the last) installment of "DevOps for Frontends" series where I will try to show how to run cloud operations in a maintainable, hassle-free and affordable way.*

---

By the end of this article we are going to have our static site hosted on GitHub deployed to AWS, served by CDN and automatically redeployed on source code update.

We will use the following tools:

- GitHub
- AWS Codebuild
- AWS S3
- AWS Cloudfront
- AWS CDK

## Infrastructure as code

> Infrastructure as Code (IaC) is the management of infrastructure (networks, virtual machines, load balancers, and connection topology) in a descriptive model, using the same versioning as DevOps team uses for source code. Like the principle that the same source code generates the same binary, an IaC model generates the same environment every time it is applied. IaC is a key DevOps practice and is used in conjunction with continuous delivery.

*source: [https://docs.microsoft.com/en-us/azure/devops/learn/what-is-infrastructure-as-code](https://docs.microsoft.com/en-us/azure/devops/learn/what-is-infrastructure-as-code)*

Through out this tutorial we will be using [AWS Cloud Development Kit (AWS-CDK)](https://docs.aws.amazon.com/cdk/latest/guide/home.html) - very handy tool to manage AWS infrastructure. Make sure to have it installed, this [getting started guide](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html) details how to get up and running with it.

## Hosting files

We will use [Amazon Simple Storage System (S3)](https://aws.amazon.com/s3/) to store our static files.

S3 is an object store with great scalability and performance. It is also super cheap, $0.023 GB/month for first 50TB of data.

```javascript
const hostBucket = new s3.Bucket(this, 'app-static');
```
*source: [https://github.com/pasierb/aws-static-site-hosting-and-continuous-delivery-example/blob/master/lib/app-stack.js#L16](https://github.com/pasierb/aws-static-site-hosting-and-continuous-delivery-example/blob/master/lib/app-stack.js#L16)*

## CDN

Although S3 bucket can be used to [host static website](https://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html) on it's own there are couple reasons not to do that:

- content will be served from the region the bucket is hosted in
- it's more expensive than Cloudfront to transfer data to the internet
- it's pretty limited in configuration options

[AWS Cloudfront](https://aws.amazon.com/cloudfront/?nc=sn&loc=1) on the other hand is made to serve content, it's a content delivery network (CDN). In a nutshell it brings content closer (geographically) to the end-user effectively lowering latency. It has tons of configuration options and integrates greatly with S3 (and other AWS services).

We will set our S3 bucket as an origin source, a place from Cloudfron distribution get the content if it's not present in it's cache.

```javascript
new cloudfront.CloudFrontWebDistribution(this, 'app-distribution', {
  originConfigs: [
    {
      // ...
      s3OriginSource: {
        // set our bucket as source
        s3BucketSource: hostBucket
      }
      // ...
    }
  ]
});
```

Our bucket, by default, is private so nobody unauthorized can get objects straight from it. We have explicitly allow our Cloudfront distribution to get objects from the bucket. Luckily AWS-CDK makes it as easy as one line.

```javascript
new cloudfront.CloudFrontWebDistribution(this, 'app-distribution', {
  originConfigs: [
    {
      // ...
      s3OriginSource: {
        s3BucketSource: hostBucket,
        // allow Cloudfront to get objects from the bucket
        originAccessIdentity: new cloudfront.OriginAccessIdentity(this, 'app-access-identity')
      }
      // ...
    }
  ]
});
```

Full configuration of Cloudfront distribution looks as follows:

```javascript
new cloudfront.CloudFrontWebDistribution(this, 'app-distribution', {
  originConfigs: [
    {
      behaviors: [
        {
          isDefaultBehavior: true,
          // respond to HEAD and GET methods
          allowedMethods: cloudfront.CloudFrontAllowedMethods.GET_HEAD
        }
      ],
      s3OriginSource: {
        // set our bucket as source
        s3BucketSource: hostBucket,
        // allow Cloudfront to get objects from the bucket
        originAccessIdentity: new cloudfront.OriginAccessIdentity(this, 'app-access-identity')
      }
    }
  ]
});
```
*source: [https://github.com/pasierb/aws-static-site-hosting-and-continuous-delivery-example/blob/master/lib/app-stack.js#L39](https://github.com/pasierb/aws-static-site-hosting-and-continuous-delivery-example/blob/master/lib/app-stack.js#L39)*

## Continuous delivery

Technically we could just drag-and-drop static files to S3 bucket through AWS Console by hand, but it's not very practical - [AWS Codebuild](https://aws.amazon.com/codebuild/) is a tool that can use to automate this process.

Codebuild is also a very cost-efficient tool, it's charging $0.005 per build minute (for smallest instance type, which is more than enough most of the time).

First we need to create `buildspec` file which describes how to build our project.

```yaml
# ci/codebuild.yml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 10
  build:
    commands:
      # run your webpack/parcel/rollup bundler
      - npm run build

artifacts:
  # define output directory
  base-directory: public
  files:
    # use all files under base-directory
    - '**/*'
```

Then we need a Codebuild project that will run when we push changes to the `master` branch.


```javascript
const deployBuild = new codebuild.Project(this, 'app-build', {
  // specify where to look for build instructions
  buildSpec: codebuild.BuildSpec.fromSourceFilename('ci/buildspec.yml'),
  // define source code location
  source: codebuild.Source.gitHub({
    owner: 'pasierb',
    repo: 'aws-static-site-hosting-and-continuous-delivery-example',
    webhookFilters: [
      // trigger Codebuild project on PUSH to master branch
      codebuild.FilterGroup
        .inEventOf(codebuild.EventAction.PUSH)
        .andHeadRefIs('^refs/heads/master$')
    ]
  }),
  environment: {
    buildImage: codebuild.LinuxBuildImage.STANDARD_3_0,
  },
  // set our bucket as a target location for build artifacts
  artifacts: codebuild.Artifacts.s3({
    bucket: hostBucket,
    // put artifacts directly in the root of the bucket
    packageZip: false,
    encryption: false,
    includeBuildId: false,
    name: '.',
  })
});
```
*source: [https://github.com/pasierb/aws-static-site-hosting-and-continuous-delivery-example/blob/master/lib/app-stack.js#L18](https://github.com/pasierb/aws-static-site-hosting-and-continuous-delivery-example/blob/master/lib/app-stack.js#L18)*

## Conclusion

This simple setup is something that you can take to the production environment with confidence.

It's worth to mention that even though it is very cheap to maintain, there are completely free, fully managed solutions that can do the same (and more!) - [Netlify](https://www.netlify.com/) ❤️ - I think it's good to know how it works under the hood and it is actually really easy to implement.

A full sample project can be found at [https://github.com/pasierb/aws-static-site-hosting-and-continuous-delivery-example](https://github.com/pasierb/aws-static-site-hosting-and-continuous-delivery-example)

