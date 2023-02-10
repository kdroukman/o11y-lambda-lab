const { Kinesis } = require("aws-sdk");
const { v4: uuidv4 } = require('uuid');
const otelapi  = require('@opentelemetry/api');
const otelcore = require('@opentelemetry/core');

const kinesis = new Kinesis({
  apiVersion: '2013-12-02',
});


const producer = async( event ) => {
	let statusCode = 200;
	let message;

	if (!event.body) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: "No message body found",
			}),
		};
	}

	const streamName = process.env.KINESIS_STREAM;

	// OpenTelemetry Manual Instrumentation added
	const activeSpan = otelapi.trace.getSpan(otelapi.context.active());
	const propagator = new otelcore.W3CTraceContextPropagator();
	let carrier = {};
	propagator.inject(otelapi.trace.setSpanContext(otelapi.ROOT_CONTEXT, activeSpan.spanContext()),
        	carrier,
        	otelapi.defaultTextMapSetter
        );
	const data = "{\"tracecontext\": " + JSON.stringify(carrier) + ", \"record\":" + event.body + "}";
	console.log(`Record with Trace Context added: 
	             ${data}`);
	// ------------------------------------------
	

	try {
		await kinesis.putRecord({
			StreamName: streamName,
			PartitionKey: uuidv4(),
			Data: data,
		}).promise();
		message = "Message planced in the Event Stream: " + streamName;
	} catch ( error ) {
		console.log(error);
		message = error;
		statusCode = 500;
	}

	return {
		statusCode,
		body: JSON.stringify({
			message,
		}),
	};
};

const consumer = function( event, context ){
	try{
		for( const record of event.Records ) {
			const payload = record.kinesis;
			const message = Buffer.from(payload.data, 'base64').toString();


			// OpenTelemetry Manual Instrumentation added
			const carrier = JSON.parse( message ).tracecontext;
			const propagator = new otelcore.W3CTraceContextPropagator();
			const parentContext = propagator.extract(otelapi.ROOT_CONTEXT, carrier, otelapi.defaultTextMapGetter);
			const tracer = otelapi.trace.getTracer(process.env.OTEL_SERVICE_NAME);
                        const span = tracer.startSpan("Kinesis.getRecord", undefined, parentContext);
			 
			span.setAttribute("span.kind", "server");
			const body = JSON.parse( message ).record;
			if (body.name) {
				span.setAttribute("my-custom-tag", "Hi, " + body.name + "!");
			}

			//-------------------------------------------


			console.log(
        			`Kinesis Message:
          			partition key: ${payload.partitionKey}
          			sequence number: ${payload.sequenceNumber}
          			kinesis schema version: ${payload.kinesisSchemaVersion}
          			data: ${message}
        			`);
			
  			// End the manually created span
			span.end();
			// -----------------------------
		}
	} catch ( error ) {
		console.log(error);
	}
};

module.exports = {
	producer,
	consumer,
};


