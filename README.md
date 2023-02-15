# Observability Lambda Lab

## Pre-Requisites

You should already have the lab content available on your ec2 lab host. You will need to update custom settings to your environment. Please follow the steps bellow to achieve that. 

In Splunk Observability Cloud obtain your Access Token and Realm Values. 

### 1. Set Environment Variables

Set the bellow environment variables:
```
export ACCESS_TOKEN=<CHANGE_ME> \
export REALM=<CHANGE_ME> \
export PREFIX=$(hostname)
```

### 2. Update Auto-instrumentation template
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

### 3. Update Manual-instrumentation template
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

### 4. Set your AWS Credentials:

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

Navigate to the `auto` directory that contains auto-instrumentation code. 
```
cd ~/o11y-lambda-lab/auto
```

Inspect the contents of the files in this directory. 
Take a look at the `serverless.yml` template. 
```
cat serverless.yml
```

1. Can you identify which AWS entities are being created by this template?
2. Can you identify where OpenTelemetry instrumentation is being set up?
3. Can you determine which instrumentation information is being provided by the Environment Variables?

```
cat handler.js
```

1. Can you identify the code for producer function?
2. Can you identify the code for consumer function?

### Deploy your Lambdas

Run the following command to deploy your Lambda Functions:
```
serverless deploy
```

This command will follow the instructions in your `serverless.yml` template to create your Lambda functions and your Kinesis stream. 
Expected output:
```
Deploying hostname-lambda-lab to stage dev (us-east-1)
...
...
endpoint: POST - https://randomstring.execute-api.us-east-1.amazonaws.com/dev/producer
functions:
  producer: hostname-lambda-lab-dev-producer (1.6 kB)
  consumer: hostname-lambda-lab-dev-consumer (1.6 kB)
```

Check the details of your serverless functions:
```
serverless info
```

### Send some Traffic

Copy the value of your endpoint and use `curl` to send a payload to your producer function. Note that the flat `-d` is followed by your payload. Try changing the value of `name` to your name.

```
curl -d "{ 'name': 'CHANGE_ME', 'superpower': 'CHANGE_ME' }" CHANGE_TO_YOUR_PRODUCER_ENDPOINT
```

You should see the following output if your message is successful:
```
{"message":"Message planced in the Event Stream: hostname-eventSteam"}
```

To generate more load, resent that messate 5 or more time now. You should keep seeing a success message after each send. 

Now check the lambda logs output.

#### Producer function logs:
```
serverless logs -f producer
```

#### Consumer function logs:
```
serverless logs -f producer
```

Examine the logs carefully. Do you see OpenTelemetry being loaded? Look out for lines with `splunk-extension-wrapper`.

### Find your Lambda data in Splunk APM

Now it's time to check how your Lambda traffic has been captured in Splunk APM. 

Navigate to your Lab Organisation at [https://app.us1.signalfx.com]

Select APM from the Main Menu and then select your APM Environment. Your APM environment should be in the format `$(hostname)-lambda-lab` where the hostname value is a four letter name of your lab host. (Check it by looking at your command prompt, or by running `echo $(hostname)`)

![image](https://user-images.githubusercontent.com/5187861/218997315-e3e5f6e1-fd7f-4267-8113-79ca748b9d77.png)

You should see your lambda function and Kinesis service show up in the map. 

Go to Explore the service map for a better view. 

![image](https://user-images.githubusercontent.com/5187861/219001784-a25e7c9f-981d-49b9-b6df-f39d2bff0975.png)

You should be able to see the `producer-lambda` and the call it is making to `Kinesis` service.
![image](https://user-images.githubusercontent.com/5187861/219001985-fbf431ac-010a-4b1b-a9b0-3bad6825c5b6.png)

What about your `consumer-lambda`? Where is it?

Click into *Traces* and examine one of the traces generated. 
![image](https://user-images.githubusercontent.com/5187861/219002535-d11afd2f-9134-4e1b-87fb-f3af47969372.png)

We can see the `producer-lambda` placing a Record on the Kinesis stream. But we can't see the `consumer-function` fetching it. 

This is because the *Context* is not being propagated. 
Our Distributed Trace stops at *Kinesis* and we can't see any further. 

Not yet...

Let's see how we fix this in the next section of this lab. 










