const { Kinesis } = require("aws-sdk");
const { v4: uuidv4 } = require('uuid');

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

	try {
		await kinesis.putRecord({
			StreamName: streamName,
			PartitionKey: uuidv4(),
			Data: event.body,
		}).promise();

		message = "Message placed in the Event Stream: " + streamName;
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

			console.log(
        			`Kinesis Message:
          			partition key: ${payload.partitionKey}
          			sequence number: ${payload.sequenceNumber}
          			kinesis schema version: ${payload.kinesisSchemaVersion}
          			data: ${message}
        			`);
		}
	} catch ( error ) {
		console.log(error);
	}
};

module.exports = {
	producer,
	consumer,
};


