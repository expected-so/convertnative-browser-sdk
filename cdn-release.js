const AWS = require('aws-sdk')
const fs = require('node:fs')
const packageJson = require('./package.json')

AWS.config.update({
	region: 'eu-west-1',
	credentials: new AWS.Credentials(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY),
})

async function run() {
	const majorVersion = packageJson.version.split('.')[0]
	const s3 = new AWS.S3({apiVersion: '2006-03-01'})
	const folder = `sdks/browser/v${majorVersion}`
	const filesToInvalidate = []
	for (const fileName of ['browser.js', 'browser.js.map', 'service-worker.js', 'service-worker.js.map']) {
		const key = `${folder}/${fileName}`
		console.log(`uploading ${key}...`)
		await s3.upload({
			Bucket: process.env.BUCKET_NAME,
			Key: key,
			Body: fs.createReadStream(`./dist/${fileName}`),
			ACL: 'public-read',
			ContentType: fileName.endsWith('.js.map') ? 'application/json' : 'application/javascript',
		}).promise()
		filesToInvalidate.push(key)
	}

	const cloudfront = new AWS.CloudFront()
	console.log('invalidating cache...')
	await cloudfront.createInvalidation({
		DistributionId: process.env.DISTRIBUTION_ID,
		InvalidationBatch: {
			CallerReference: Date.now().toString(),
			Paths: {
				Quantity: filesToInvalidate.length,
				Items: filesToInvalidate.map(key => `/${key}`),
			},
		},
	}).promise()
}

run().catch((error) => {
	console.error(error)
	process.exit(1)
})
