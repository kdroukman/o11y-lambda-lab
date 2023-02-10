# Observability Lambda Lab

## Pre-Requisites

You should already have the lab content available on your ec2 lab host. You will need to update custom settings to your environment. Please follow the steps bellow to achieve that. 

In Splunk Observability Cloud obtain your Access Token and Realm Values. 

###1. Set Environment Variables

Set the bellow environment variables:
```
export ACCESS_TOKEN=<CHANGE_ME> \
export REALM=<CHANGE_ME> \
export PREFIX=$(hostname)
```

###2. Update Auto-instrumentation template
Update your auto-instrumentation Serverless template. 
```
cat ~/o11y-lambda-lab/auto/serverless_unset.yml | envsubst > ~/o11y-lambda-lab/auto/serverless.yml
```

Examine the output of the updated serverless.yml contents (you may need to scroll up to the relevant section). 
```
cat ~/o11y-lambda-lab/auto/serverless.yml
```

Locate the following section and confirm that the parameters have been set:
```
# USER SET VALUES =====================              
custom: 
  accessToken: <set to your access token>
  realm: <set to your realm>
  prefix: <set to your hostname>
#======================================  
```

###3. Update Manual-instrumentation template
Update your manual-instrumentation Serverless template. 
```
cat ~/o11y-lambda-lab/manual/serverless_unset.yml | envsubst > ~/o11y-lambda-lab/manual/serverless.yml
```

Examine the output of the updated serverless.yml contents (you may need to scroll up to the relevant section). 
```
cat ~/o11y-lambda-lab/manual/serverless.yml
```

Locate the following section and confirm that the parameters have been set:
```
# USER SET VALUES =====================              
custom: 
  accessToken: <set to your access token>
  realm: <set to your realm>
  prefix: <set to your hostname>
#======================================  
```

###4. Set your AWS Credentials:

Add your credntials file and populate it with your provided AWS Access Key ID and AWS Secret Access Key values. 
```
mkdir ~/.aws & vi ~/.aws/credentials
```

In `vi` editor paste the bellow and change to your Access Key values. (Hint: Hit letter `i` to set your Vi editor to Insert/Edit mode)
```
[default]
aws_access_key_id=<CHANGE ME>
aws_secret_access_key=<CHANGE ME>
```

Save your `credentials` file: 
1. Hit `Esc` button to exit Insert mode in your Vi Editor
2. Press column `:` - this will give you access to command prompt within your Vi Editor
3. Key in `wq` and press `Enter`. This will write and quit your Vi Editor. i.e. Save.

Now you are set up and ready for this Lab. 


## Auto-Instrumentation
