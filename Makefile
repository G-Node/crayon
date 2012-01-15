JS_COMPILER = uglifyjs

# core files do not need to be fired at domReady
JS_CORE_FILES    = src/core/core.js \
									 lib/domready/domready.js

# ready files need to be fired at domReady
JS_READY_FILES   = 

COMPILATION_UNIT = src/start.js \
									 $(JS_CORE_FILES) \
								   src/end.js \
								   src/domReadyStart.js \
								 	 $(JS_FILES) \
								 	 src/domReadyEnd.js

crayon.js: $(COMPILATION_UNIT)
	cat $(COMPILATION_UNIT) > crayon.js

crayon.min.js: crayon.js
	$(JS_COMPILER) < crayon.js > crayon.min.js

.PHONY: clean
clean:
	rm -rf crayon*.js
