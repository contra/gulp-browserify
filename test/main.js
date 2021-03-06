var gulp = require('gulp');
var gulpB = require('../');
var expect = require('chai').expect;
var es = require('event-stream');
var path = require('path');
var browserify = require('browserify');

var postdata;

describe('gulp-browserify', function() {
	var testFile = path.join(__dirname, './test.js');
	var fileContents;

	beforeEach(function(done) {
		gulp.src(testFile)
			.pipe(gulpB())
			.on('postbundle', function(data) {
				postdata = data;
			})
			.pipe(es.map(function(file){
				fileContents = file.contents;
				done();
			}));
	});

	it('should return a buffer', function(done) {
		expect(fileContents).to.be.an.instanceof(Buffer);
		done();
	});
	
	it('should bundle modules', function(done) {
		var b = browserify();
		var chunk = '';
		b.add(testFile);
		b.bundle().on('data', function(data) {
			chunk += data;
		}).on('end', function() {
			expect(fileContents.toString()).to.equal(chunk);
			done();
		});
	});


	it('should emit postbundle event', function(done) {
		expect(fileContents.toString()).to.equal(postdata);
		done();
	});

	it('should use the gulp version of the file', function(done) {
		gulp.src(testFile)
			.pipe(es.map(function(file, cb) {
				file.contents = new Buffer('var abc=123;');
				cb(null, file);
			}))
			.pipe(gulpB())
			.pipe(es.map(function(file) {
				expect(file.contents.toString()).to.not.equal(fileContents.toString());
				expect(file.contents.toString()).to.match(/var abc=123;/);
				done();
			}));
	});
});

