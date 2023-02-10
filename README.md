# Observability Lambda Lab

## Pre-Requisites

You should already have the lab content available on your ec2 lab host. You will need to update custom settings to your environment. Please follow the steps bellow to achieve that. 

In Splunk Observability Cloud obtain your Access Token and Realm Values. 

Set the bellow environment variables:
```
export ACCESS_TOKEN=<CHANGE_ME> \
export REALM=<CHANGE_ME> \
export PREFIX=$(hostname)
```

Update your auto-instrumentation Serverless template. 
```
cat ~/o11y-lambda-lab/auto/serverless_unset.yml | envsubst > ~/o11y-lambda-lab/auto/serverless.yml \
cat ~/o11y-lambda-lab/auto/serverless.yml
```

Examine the output content and confirm that the following section reflects your set environment variables:
```
```

## Auto-Instrumentation
