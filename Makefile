JS_COMPILER = uglifyjs

COMPILATION_UNIT = src/start.js \
									 src/core/core.js \
								   src/end.js \
								   src/domReadyStart.js \
									 src/core/init.js \
									 src/plot/plot.js \
								 	 src/domReadyEnd.js

crayon.js: $(COMPILATION_UNIT)
	cat $(COMPILATION_UNIT) > crayon.js

crayon.min.js: crayon.js
	$(JS_COMPILER) < crayon.js > crayon.min.js

.PHONY: clean
clean:
	rm -rf crayon*.js
